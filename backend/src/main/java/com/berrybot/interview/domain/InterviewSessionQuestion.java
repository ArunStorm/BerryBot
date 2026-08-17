package com.berrybot.interview.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "interview_session_questions", uniqueConstraints = {
        @UniqueConstraint(name = "uk_session_question_position", columnNames = {"session_id", "position"}),
        @UniqueConstraint(name = "uk_session_question", columnNames = {"session_id", "question_id"})
})
public class InterviewSessionQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private InterviewSession session;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private InterviewQuestion question;

    @Column(nullable = false)
    private int position;

    @Column(columnDefinition = "text")
    private String answer;

    private Integer score;

    @Column(columnDefinition = "text")
    private String feedback;

    @Column(columnDefinition = "text")
    private String adaptiveFollowUp;

    private Instant answeredAt;

    protected InterviewSessionQuestion() {
    }

    public InterviewSessionQuestion(InterviewSession session, InterviewQuestion question, int position) {
        this.session = session;
        this.question = question;
        this.position = position;
    }

    public UUID getId() { return id; }
    public InterviewSession getSession() { return session; }
    public InterviewQuestion getQuestion() { return question; }
    public int getPosition() { return position; }
    public String getAnswer() { return answer; }
    public Integer getScore() { return score; }
    public String getFeedback() { return feedback; }
    public String getAdaptiveFollowUp() { return adaptiveFollowUp; }
    public Instant getAnsweredAt() { return answeredAt; }

    public boolean isAnswered() { return answeredAt != null; }

    public void recordAnswer(String answer, int score, String feedback, String adaptiveFollowUp) {
        this.answer = answer;
        this.score = score;
        this.feedback = feedback;
        this.adaptiveFollowUp = adaptiveFollowUp;
        this.answeredAt = Instant.now();
    }
}
