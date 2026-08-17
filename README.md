# BerryBot

BerryBot is a professional mock-interview platform for software engineers.

## Current architecture

```text
React + Vite frontend
        |
        v
Spring Boot 3.5 / Java 17 backend
        |
        +--> Interview Question API
        |
        +--> PostgreSQL
        |
        +--> Flyway migrations
        |
        +--> Spring Security boundary
        |
        +--> Future AI abstraction / Ollama
        |
        +--> Future isolated code runner
```

## Current capabilities

- Topic-driven mock interviews
- Text and browser voice interview modes
- Speech recognition and speech synthesis
- Adaptive follow-up foundation
- Per-question scoring and feedback
- Interview history
- Monaco-based Coding Lab
- PostgreSQL-backed interview question bank
- Flyway schema migrations
- Spring Security boundary
- Swagger/OpenAPI
- Actuator health and metrics
- GitHub Actions backend CI with PostgreSQL

## Local development

Start PostgreSQL and the backend/frontend stack:

```bash
docker compose up --build
```

Backend: `http://localhost:8080`
Frontend: `http://localhost:5173`
Swagger UI: `http://localhost:8080/swagger-ui.html`

Question API example:

```text
GET /api/v1/questions?topic=Java&difficulty=MEDIUM&limit=5
```

The browser experience currently keeps a local question fallback so the frontend remains usable while the backend evolves. The next integration step is to make persistent interview sessions and evaluation APIs the source of truth.
