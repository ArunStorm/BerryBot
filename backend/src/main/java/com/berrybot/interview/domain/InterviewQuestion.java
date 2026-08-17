package com.berrybot.interview.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "interview_questions")
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String topic;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private QuestionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Difficulty difficulty;

    @Column(nullable = false, columnDefinition = "text")
    private String prompt;

    @Column(nullable = false, columnDefinition = "text")
    private String referenceAnswer;

    @Column(nullable = false, columnDefinition = "text")
    private String evaluationKeywords;

    protected InterviewQuestion() {
    }

    public InterviewQuestion(String topic, QuestionType type, Difficulty difficulty,
                             String prompt, String referenceAnswer, String evaluationKeywords) {
        this.topic = topic;
        this.type = type;
        this.difficulty = difficulty;
        this.prompt = prompt;
        this.referenceAnswer = referenceAnswer;
        this.evaluationKeywords = evaluationKeywords;
    }

    public UUID getId() { return id; }
    public String getTopic() { return topic; }
    public QuestionType getType() { return type; }
    public Difficulty getDifficulty() { return difficulty; }
    public String getPrompt() { return prompt; }
    public String getReferenceAnswer() { return referenceAnswer; }
    public String getEvaluationKeywords() { return evaluationKeywords; }
}
