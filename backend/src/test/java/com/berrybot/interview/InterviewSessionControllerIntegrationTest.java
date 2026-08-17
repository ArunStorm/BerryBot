package com.berrybot.interview;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class InterviewSessionControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldStartInterviewAndAcceptAnswer() throws Exception {
        String startRequest = """
                {
                  "topics": ["Java", "Spring Boot", "Microservices"],
                  "difficulty": "MEDIUM",
                  "mode": "TEXT",
                  "questionCount": 3
                }
                """;

        MvcResult startResult = mockMvc.perform(post("/api/v1/interviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(startRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.sessionId").exists())
                .andExpect(jsonPath("$.data.question.questionId").exists())
                .andReturn();

        String body = startResult.getResponse().getContentAsString();
        String sessionId = com.jayway.jsonpath.JsonPath.read(body, "$.data.sessionId");
        String questionId = com.jayway.jsonpath.JsonPath.read(body, "$.data.question.questionId");

        String answerRequest = """
                {
                  "questionId": "%s",
                  "answer": "I would explain the core concept, thread safety, concurrency, dependency management, transactions and production trade-offs with a concrete example."
                }
                """.formatted(questionId);

        mockMvc.perform(post("/api/v1/interviews/{sessionId}/answers", sessionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(answerRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.score").isNumber())
                .andExpect(jsonPath("$.data.feedback").isString())
                .andExpect(jsonPath("$.data.interviewCompleted").value(false));
    }
}
