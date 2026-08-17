package com.berrybot.interview.repository;

import com.berrybot.interview.domain.InterviewSessionQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InterviewSessionQuestionRepository extends JpaRepository<InterviewSessionQuestion, UUID> {
    List<InterviewSessionQuestion> findBySessionIdOrderByPosition(UUID sessionId);
    Optional<InterviewSessionQuestion> findBySessionIdAndQuestionId(UUID sessionId, UUID questionId);

    @Query("select distinct sq.question.id from InterviewSessionQuestion sq")
    List<UUID> findAllUsedQuestionIds();
}
