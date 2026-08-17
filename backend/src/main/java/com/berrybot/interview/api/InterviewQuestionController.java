package com.berrybot.interview.api;

import com.berrybot.config.ApiResponse;
import com.berrybot.interview.domain.Difficulty;
import com.berrybot.interview.service.InterviewQuestionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/questions")
public class InterviewQuestionController {

    private final InterviewQuestionService service;

    public InterviewQuestionController(InterviewQuestionService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<List<QuestionResponse>> getQuestions(
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.success("Interview questions retrieved", service.findQuestions(topic, difficulty, limit));
    }
}
