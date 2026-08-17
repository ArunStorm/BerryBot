package com.berrybot.interview.api;

import com.berrybot.interview.domain.Difficulty;
import com.berrybot.interview.domain.InterviewMode;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record StartInterviewRequest(
        @NotEmpty List<String> topics,
        @NotNull Difficulty difficulty,
        @NotNull InterviewMode mode,
        @Min(3) @Max(12) int questionCount
) {
}
