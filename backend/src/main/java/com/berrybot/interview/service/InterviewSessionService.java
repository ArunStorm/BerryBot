package com.berrybot.interview.service;

import com.berrybot.interview.api.AnswerResponse;
import com.berrybot.interview.api.InterviewReportItem;
import com.berrybot.interview.api.InterviewReportResponse;
import com.berrybot.interview.api.InterviewSessionResponse;
import com.berrybot.interview.api.SessionQuestionResponse;
import com.berrybot.interview.api.StartInterviewRequest;
import com.berrybot.interview.api.SubmitAnswerRequest;
import com.berrybot.interview.domain.Difficulty;
import com.berrybot.interview.domain.InterviewQuestion;
import com.berrybot.interview.domain.InterviewSession;
import com.berrybot.interview.domain.InterviewSessionQuestion;
import com.berrybot.interview.repository.InterviewQuestionRepository;
import com.berrybot.interview.repository.InterviewSessionQuestionRepository;
import com.berrybot.interview.repository.InterviewSessionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.UUID;

@Service
public class InterviewSessionService {

    private final InterviewQuestionRepository questionRepository;
    private final InterviewSessionRepository sessionRepository;
    private final InterviewSessionQuestionRepository sessionQuestionRepository;

    public InterviewSessionService(
            InterviewQuestionRepository questionRepository,
            InterviewSessionRepository sessionRepository,
            InterviewSessionQuestionRepository sessionQuestionRepository) {
        this.questionRepository = questionRepository;
        this.sessionRepository = sessionRepository;
        this.sessionQuestionRepository = sessionQuestionRepository;
    }

    @Transactional
    public InterviewSessionResponse start(StartInterviewRequest request) {
        List<String> topics = request.topics().stream()
                .map(String::trim)
                .filter(topic -> !topic.isBlank())
                .collect(java.util.stream.Collectors.collectingAndThen(
                        java.util.stream.Collectors.toCollection(LinkedHashSet::new), ArrayList::new));

        if (topics.isEmpty()) {
            throw badRequest("At least one interview topic is required");
        }

        List<InterviewQuestion> questions = questionRepository
                .findByTopicInAndDifficulty(topics, request.difficulty());

        if (questions.size() < request.questionCount()) {
            questions = questionRepository.findByTopicIn(topics);
        }

        if (questions.size() < request.questionCount()) {
            throw badRequest("Not enough questions are available for the selected topics");
        }

        Collections.shuffle(questions);
        List<InterviewQuestion> selected = new ArrayList<>(questions.subList(0, request.questionCount()));

        InterviewSession session = sessionRepository.save(new InterviewSession(
                String.join(",", topics), request.difficulty(), request.mode(), selected.size()));

        for (int i = 0; i < selected.size(); i++) {
            sessionQuestionRepository.save(new InterviewSessionQuestion(session, selected.get(i), i));
        }

        return toSessionResponse(session);
    }

    @Transactional(readOnly = true)
    public InterviewSessionResponse getSession(UUID sessionId) {
        InterviewSession session = getSessionOrThrow(sessionId);
        return toSessionResponse(session);
    }

    @Transactional
    public AnswerResponse submitAnswer(UUID sessionId, SubmitAnswerRequest request) {
        InterviewSession session = getSessionOrThrow(sessionId);
        if (!session.getStatus().name().equals("IN_PROGRESS")) {
            throw badRequest("Interview session is no longer active");
        }

        InterviewSessionQuestion sessionQuestion = sessionQuestionRepository
                .findBySessionIdAndQuestionId(sessionId, request.questionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Question does not belong to this interview session"));

        if (sessionQuestion.getPosition() != session.getCurrentQuestionIndex()) {
            throw badRequest("Answer the current interview question before continuing");
        }
        if (sessionQuestion.isAnswered()) {
            throw badRequest("This question has already been answered");
        }

        Evaluation evaluation = evaluate(sessionQuestion.getQuestion(), request.answer());
        sessionQuestion.recordAnswer(request.answer().trim(), evaluation.score(), evaluation.feedback(), evaluation.followUp());
        session.advance();
        sessionQuestionRepository.save(sessionQuestion);
        sessionRepository.save(session);

        SessionQuestionResponse next = session.getStatus().name().equals("IN_PROGRESS")
                ? nextQuestion(session)
                : null;

        return new AnswerResponse(
                evaluation.score(), evaluation.feedback(), evaluation.followUp(),
                session.getStatus().name().equals("COMPLETED"), next);
    }

    @Transactional(readOnly = true)
    public InterviewReportResponse getReport(UUID sessionId) {
        getSessionOrThrow(sessionId);
        List<InterviewSessionQuestion> answered = sessionQuestionRepository
                .findBySessionIdOrderByPosition(sessionId).stream()
                .filter(InterviewSessionQuestion::isAnswered)
                .toList();

        int overallScore = answered.isEmpty()
                ? 0
                : (int) Math.round(answered.stream().mapToInt(InterviewSessionQuestion::getScore).average().orElse(0));

        List<InterviewReportItem> results = answered.stream()
                .map(item -> new InterviewReportItem(
                        item.getQuestion().getId(), item.getQuestion().getTopic(), item.getQuestion().getPrompt(),
                        item.getAnswer(), item.getScore(), item.getFeedback(), item.getAdaptiveFollowUp()))
                .toList();

        return new InterviewReportResponse(sessionId, overallScore, answered.size(), results);
    }

    private InterviewSessionResponse toSessionResponse(InterviewSession session) {
        SessionQuestionResponse current = session.getStatus().name().equals("IN_PROGRESS")
                ? nextQuestion(session)
                : null;
        return InterviewSessionResponse.from(session, current);
    }

    private SessionQuestionResponse nextQuestion(InterviewSession session) {
        return sessionQuestionRepository.findBySessionIdOrderByPosition(session.getId()).stream()
                .filter(item -> item.getPosition() == session.getCurrentQuestionIndex())
                .findFirst()
                .map(item -> SessionQuestionResponse.from(item.getQuestion(), item.getPosition() + 1))
                .orElse(null);
    }

    private InterviewSession getSessionOrThrow(UUID sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Interview session not found"));
    }

    private Evaluation evaluate(InterviewQuestion question, String answer) {
        String normalized = answer.toLowerCase();
        String[] keywords = question.getEvaluationKeywords().toLowerCase().split(",");
        long matched = java.util.Arrays.stream(keywords)
                .map(String::trim)
                .filter(keyword -> !keyword.isBlank())
                .filter(normalized::contains)
                .distinct()
                .count();

        int total = (int) java.util.Arrays.stream(keywords)
                .map(String::trim)
                .filter(keyword -> !keyword.isBlank())
                .distinct()
                .count();

        int score = total == 0 ? 50 : (int) Math.round((matched * 100.0) / total);
        score = Math.max(20, Math.min(100, score));
        if (answer.trim().length() < 25) {
            score = Math.min(score, 45);
        }

        String feedback;
        String followUp;
        if (score >= 80) {
            feedback = "Strong answer. You covered the core concepts. Add trade-offs, failure modes and a production example to make it senior-level.";
            followUp = "Good coverage. Now explain the main trade-off or failure mode you would consider in production.";
        } else if (score >= 60) {
            feedback = "Good direction, but the answer needs more implementation detail, reasoning and trade-offs.";
            followUp = "Can you give a concrete production example and explain why you would choose this approach?";
        } else {
            feedback = "The answer needs more depth. Start with the core concept, explain why it matters, then give an implementation example and failure mode.";
            followUp = "Let's clarify the fundamentals first: what problem does this concept solve, and when would you use it?";
        }

        return new Evaluation(score, feedback, followUp);
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private record Evaluation(int score, String feedback, String followUp) {
    }
}
