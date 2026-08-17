package com.berrybot.interview.api;

import com.berrybot.config.ApiResponse;
import com.berrybot.interview.service.InterviewSessionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/interviews")
public class InterviewSessionController {

    private final InterviewSessionService service;

    public InterviewSessionController(InterviewSessionService service) {
        this.service = service;
    }

    @PostMapping
    public ApiResponse<InterviewSessionResponse> start(@Valid @RequestBody StartInterviewRequest request) {
        return ApiResponse.success("Interview session started", service.start(request));
    }

    @GetMapping("/{sessionId}")
    public ApiResponse<InterviewSessionResponse> getSession(@PathVariable UUID sessionId) {
        return ApiResponse.success("Interview session retrieved", service.getSession(sessionId));
    }

    @PostMapping("/{sessionId}/answers")
    public ApiResponse<AnswerResponse> submitAnswer(
            @PathVariable UUID sessionId,
            @Valid @RequestBody SubmitAnswerRequest request) {
        return ApiResponse.success("Answer evaluated", service.submitAnswer(sessionId, request));
    }

    @GetMapping("/{sessionId}/report")
    public ApiResponse<InterviewReportResponse> getReport(@PathVariable UUID sessionId) {
        return ApiResponse.success("Interview report retrieved", service.getReport(sessionId));
    }
}
