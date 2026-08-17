package com.berrybot.interview.repository;

import com.berrybot.interview.domain.Difficulty;
import com.berrybot.interview.domain.InterviewQuestion;
import com.berrybot.interview.domain.QuestionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, UUID> {
    List<InterviewQuestion> findByTopicIgnoreCaseAndDifficulty(String topic, Difficulty difficulty);
    List<InterviewQuestion> findByTopicIgnoreCase(String topic);

    @Query("select q from InterviewQuestion q where q.topic in :topics and q.difficulty = :difficulty and q.id not in (select sq.question.id from InterviewSessionQuestion sq)")
    List<InterviewQuestion> findByTopicInAndDifficulty(@Param("topics") List<String> topics, @Param("difficulty") Difficulty difficulty);

    List<InterviewQuestion> findByTopicIn(List<String> topics);
    List<InterviewQuestion> findByTypeAndDifficulty(QuestionType type, Difficulty difficulty);
}
