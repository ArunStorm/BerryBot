package com.berrybot.interview.api;

public record AnswerResponse(
        int score,
        String feedback,
        String adaptiveFollowUp,
        boolean interviewCompleted,
        SessionQuestionResponse nextQuestion
) {
}
