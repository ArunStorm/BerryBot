package com.berrybot.interview.repository;

import com.berrybot.interview.domain.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface InterviewSessionRepository extends JpaRepository<InterviewSession, UUID> {
}
