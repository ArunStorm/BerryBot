CREATE TABLE interview_sessions (
    id UUID PRIMARY KEY,
    topics VARCHAR(500) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    mode VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    total_questions INTEGER NOT NULL CHECK (total_questions BETWEEN 1 AND 50),
    current_question_index INTEGER NOT NULL CHECK (current_question_index >= 0),
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ
);

CREATE TABLE interview_session_questions (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES interview_questions(id),
    position INTEGER NOT NULL CHECK (position >= 0),
    answer TEXT,
    score INTEGER CHECK (score BETWEEN 0 AND 100),
    feedback TEXT,
    adaptive_follow_up TEXT,
    answered_at TIMESTAMPTZ,
    CONSTRAINT uk_session_question_position UNIQUE (session_id, position),
    CONSTRAINT uk_session_question UNIQUE (session_id, question_id)
);

CREATE INDEX idx_interview_session_questions_session
    ON interview_session_questions (session_id, position);

CREATE INDEX idx_interview_sessions_status
    ON interview_sessions (status);
