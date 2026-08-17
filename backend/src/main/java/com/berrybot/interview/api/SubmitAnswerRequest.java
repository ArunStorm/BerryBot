package com.berrybot.interview.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SubmitAnswerRequest(
        @NotNull UUID questionId,
        @NotBlank String answer
) {
}
