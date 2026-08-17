# 🍓 BerryBot — Professional Mock Interview Platform

BerryBot is a free, professional mock-interview platform for software developers preparing for real technical interviews.

## Product Goal

BerryBot is designed to simulate a real software-company technical interview rather than behave like a generic chatbot.

The platform will support focused interviews across:

- Java
- OOPS Concepts
- Spring Boot
- Microservices
- Programming Round
- React

Candidates select the topics they want to practice before starting an interview.

## Architecture

Version 1 is a **modular monolith** with clear module boundaries so individual capabilities can later evolve into services without premature distributed-system complexity.

### Backend

- Java 17
- Spring Boot 3.x
- Spring Web
- Spring Data JPA / Hibernate
- Spring Security / JWT
- Bean Validation
- PostgreSQL
- Maven
- JUnit 5 / Mockito
- Testcontainers
- Spring Boot Actuator
- OpenAPI / Swagger

### Frontend

- React
- TypeScript
- Vite
- React Router
- Axios
- Modern CSS

### Infrastructure

- Docker
- Docker Compose
- Git / GitHub
- Optional Ollama local LLM

## AI Architecture

BerryBot will not depend on paid AI APIs.

The application will expose an `InterviewAIService` abstraction with:

1. `RuleBasedInterviewAIService` — always available.
2. `LocalLLMInterviewAIService` — optional Ollama integration.

If the local LLM is unavailable, BerryBot falls back automatically to rule-based behavior.

## Interview Intelligence

The interview engine will support:

- Progressive questioning
- Follow-up and challenge questions
- Adaptive difficulty
- Topic mastery
- Project-based questioning
- Production scenarios
- Interview history
- Question rotation and cooldown
- Concept-level duplicate avoidance
- Detailed final report
- Complete question-by-question answers and explanations

BerryBot should feel like a real interview with a senior engineer, not a chat session.

## Development Roadmap

### Phase 1 — Core Product

- Project foundation
- PostgreSQL
- Authentication / JWT
- User profile
- Interview topics
- Question bank
- Interview sessions
- Interview state machine
- Rule-based evaluation
- Final report
- Interview history
- React foundation

### Phase 2 — Interview Intelligence

- Adaptive difficulty
- Follow-ups
- Weak-topic targeting
- Project interviews
- Behavioral interviews
- Question rotation and spaced repetition

### Phase 3 — Local AI

- Ollama
- Local LLM question generation
- Local LLM answer evaluation
- Dynamic follow-up generation

### Phase 4 — Programming Round

- Java-first coding editor
- Secure sandbox execution
- Test cases
- Complexity evaluation

### Phase 5 — Production Engineering

- Docker hardening
- CI/CD
- AWS deployment
- Observability
- Scaling

## Repository Structure

```text
BerryBot/
├── backend/
├── frontend/
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Status

🚧 Phase 1 foundation in progress.
