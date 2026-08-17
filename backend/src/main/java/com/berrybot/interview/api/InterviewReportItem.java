package com.berrybot.interview.api;

import java.util.UUID;

public record InterviewReportItem(
        UUID questionId,
        String topic,
        String question,
        String answer,
        int score,
        String feedback,
        String adaptiveFollowUp
) {
}
