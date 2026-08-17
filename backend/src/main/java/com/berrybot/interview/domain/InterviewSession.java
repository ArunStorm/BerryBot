package com.berrybot.interview.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "interview_sessions")
public class InterviewSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 500)
    private String topics;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Difficulty difficulty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InterviewMode mode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InterviewSessionStatus status;

    @Column(nullable = false)
    private int totalQuestions;

    @Column(nullable = false)
    private int currentQuestionIndex;

    @Column(nullable = false)
    private Instant startedAt;

    private Instant completedAt;

    protected InterviewSession() {
    }

    public InterviewSession(String topics, Difficulty difficulty, InterviewMode mode, int totalQuestions) {
        this.topics = topics;
        this.difficulty = difficulty;
        this.mode = mode;
        this.status = InterviewSessionStatus.IN_PROGRESS;
        this.totalQuestions = totalQuestions;
        this.currentQuestionIndex = 0;
        this.startedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getTopics() { return topics; }
    public Difficulty getDifficulty() { return difficulty; }
    public InterviewMode getMode() { return mode; }
    public InterviewSessionStatus getStatus() { return status; }
    public int getTotalQuestions() { return totalQuestions; }
    public int getCurrentQuestionIndex() { return currentQuestionIndex; }
    public Instant getStartedAt() { return startedAt; }
    public Instant getCompletedAt() { return completedAt; }

    public void advance() {
        currentQuestionIndex++;
        if (currentQuestionIndex >= totalQuestions) {
            status = InterviewSessionStatus.COMPLETED;
            completedAt = Instant.now();
        }
    }
}
