package com.berrybot.interview.api;

import com.berrybot.interview.domain.InterviewQuestion;

import java.util.UUID;

public record SessionQuestionResponse(
        UUID questionId,
        int position,
        String topic,
        String type,
        String difficulty,
        String prompt
) {
    public static SessionQuestionResponse from(InterviewQuestion question, int position) {
        return new SessionQuestionResponse(
                question.getId(), position, question.getTopic(), question.getType().name(),
                question.getDifficulty().name(), question.getPrompt()
        );
    }
}
