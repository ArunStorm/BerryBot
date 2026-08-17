package com.berrybot.interview.repository;

import com.berrybot.interview.domain.Difficulty;
import com.berrybot.interview.domain.InterviewQuestion;
import com.berrybot.interview.domain.QuestionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, UUID> {
    List<InterviewQuestion> findByTopicIgnoreCaseAndDifficulty(String topic, Difficulty difficulty);
    List<InterviewQuestion> findByTopicIgnoreCase(String topic);
    List<InterviewQuestion> findByTopicInAndDifficulty(List<String> topics, Difficulty difficulty);
    List<InterviewQuestion> findByTopicIn(List<String> topics);
    List<InterviewQuestion> findByTypeAndDifficulty(QuestionType type, Difficulty difficulty);
}
