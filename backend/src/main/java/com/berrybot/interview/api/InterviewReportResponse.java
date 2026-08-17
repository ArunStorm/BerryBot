package com.berrybot.interview.api;

import java.util.List;
import java.util.UUID;

public record InterviewReportResponse(
        UUID sessionId,
        int overallScore,
        int answeredQuestions,
        List<InterviewReportItem> results
) {
}
