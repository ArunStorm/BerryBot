package com.berrybot.interview.api;

import com.berrybot.interview.domain.InterviewSession;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record InterviewSessionResponse(
        UUID sessionId,
        List<String> topics,
        String difficulty,
        String mode,
        String status,
        int totalQuestions,
        int currentQuestion,
        Instant startedAt,
        Instant completedAt,
        SessionQuestionResponse question
) {
    public static InterviewSessionResponse from(InterviewSession session, SessionQuestionResponse question) {
        List<String> topics = session.getTopics().isBlank()
                ? List.of()
                : List.of(session.getTopics().split(","));
        return new InterviewSessionResponse(
                session.getId(), topics, session.getDifficulty().name(), session.getMode().name(),
                session.getStatus().name(), session.getTotalQuestions(), session.getCurrentQuestionIndex() + 1,
                session.getStartedAt(), session.getCompletedAt(), question
        );
    }
}
