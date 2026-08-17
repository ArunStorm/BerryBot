package com.berrybot.interview.service;

import com.berrybot.interview.api.QuestionResponse;
import com.berrybot.interview.domain.Difficulty;
import com.berrybot.interview.domain.InterviewQuestion;
import com.berrybot.interview.repository.InterviewQuestionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InterviewQuestionService {

    private final InterviewQuestionRepository repository;

    public InterviewQuestionService(InterviewQuestionRepository repository) {
        this.repository = repository;
    }

    public List<QuestionResponse> findQuestions(String topic, Difficulty difficulty, int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 50));
        List<InterviewQuestion> questions = topic == null || topic.isBlank()
                ? repository.findAll()
                : difficulty == null
                    ? repository.findByTopicIgnoreCase(topic)
                    : repository.findByTopicIgnoreCaseAndDifficulty(topic, difficulty);

        return questions.stream()
                .limit(safeLimit)
                .map(QuestionResponse::from)
                .toList();
    }
}
