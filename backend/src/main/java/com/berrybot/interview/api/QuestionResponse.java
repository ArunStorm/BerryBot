package com.berrybot.interview.api;

import com.berrybot.interview.domain.InterviewQuestion;

import java.util.UUID;

public record QuestionResponse(
        UUID id,
        String topic,
        String type,
        String difficulty,
        String prompt,
        String referenceAnswer,
        String evaluationKeywords
) {
    public static QuestionResponse from(InterviewQuestion question) {
        return new QuestionResponse(
                question.getId(),
                question.getTopic(),
                question.getType().name(),
                question.getDifficulty().name(),
                question.getPrompt(),
                question.getReferenceAnswer(),
                question.getEvaluationKeywords()
        );
    }
}
