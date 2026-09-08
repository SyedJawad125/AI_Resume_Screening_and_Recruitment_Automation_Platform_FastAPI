# HireMind AI — Backend

AI-Powered Resume Screening & Recruitment Automation Platform (API only — Next.js frontend comes later).

## Stack
FastAPI · SQLAlchemy 2.x (async) · PostgreSQL + pgvector · Alembic · JWT auth · Docker
**AI:** LangChain (structured output via tool-calling, prompt templates, streaming chains) + LangGraph (2 compiled state machines) + langchain-groq (ChatGroq) + Sentence-Transformers + PyMuPDF/Tesseract

## Status: Core platform complete — Auth, Jobs, Resume Pipeline, Matching, Search, Interviews, Async Processing, Evaluation
This build ships a running FastAPI app with:
- Health check (`/api/v1/health`) that verifies DB connectivity
- Full auth flow + dynamic RBAC (`User`, `Role`, `Permission`, `Company`, `UserToken`)
- **Jobs**: create (runs the Job Analysis Agent), list, detail
- **Resume pipeline**: upload → queued instantly → Celery worker runs PyMuPDF extraction → Tesseract OCR fallback → Resume Parser Agent → structured `Candidate` → Sentence-Transformers embedding → pgvector. Poll `GET /api/v1/processing/{resume_id}` for status.
- **LangChain**: every agent (Job Analysis, Resume Parser, Interview Question Generator, Interview Evaluator, and the LangGraph evaluation node) is built as `ChatPromptTemplate | ChatGroq.with_structured_output(PydanticModel)` — forced schema compliance via the model's native tool-calling, not hand-rolled `json.loads()`. See `app/llm/langchain_client.py`.
- **Two LangGraph workflows**: (1) the recruitment scoring graph — `load_data → matching → evidence → evaluation → decision → shortlist/review_reject`; (2) a new RAG chat graph — `retrieve → generate`, exposed via `POST /api/v1/search/chat`.
- **Streaming RAG chat**: `POST /api/v1/search/chat/stream` streams a grounded, candidate-cited answer token-by-token over SSE, built on a real LangChain `Runnable.astream()` — the same `prompt | llm | StrOutputParser()` chain backs both the streaming and non-streaming paths.
- **Matching Engine**: transparent, weighted, reproducible scoring — zero LLM calls in the scoring math itself, unit tested.
- **Evidence retrieval**: grounded verbatim resume excerpts, never LLM-generated.
- **Semantic search** over pgvector + **candidate comparison**.
- **AI Interview System**: Interview Agent generates job-specific questions, candidates submit answers, Evaluation Agent scores across a 5-dimension rubric (technical knowledge, problem solving, communication, role fit, overall) with per-question feedback.
- **Celery + Redis**: resume processing runs in a background worker, not on the request thread — uploads return `202 Accepted` immediately even for large batches.
- **Evaluation framework**: synthetic resume/job datasets, precision/recall/F1 on skill extraction, experience-extraction accuracy with tolerance, latency/token/cost tracking, and a mocked-LLM test suite that verifies the whole metrics pipeline without hitting a paid API.
- Docker Compose (pgvector-enabled Postgres + Redis + backend + Celery worker, all with healthchecks)
- 21 automated tests, all passing without any live external service

**Still open** (by design, not oversight): SSE streaming for a live RAG chat endpoint, rate limiting/observability middleware, and the Next.js frontend. These are smaller, more mechanical additions on top of what's here.

## Getting Started

```bash
cp .env.example .env          # set JWT_SECRET_KEY and GROQ_API_KEY at minimum
docker compose up --build
```

Once containers are healthy, run migrations and seed default roles:

```bash
docker compose exec backend alembic revision --autogenerate -m "init schema"
docker compose exec backend alembic upgrade head
docker compose exec backend python -m scripts.seed_roles
```

API docs: http://localhost:8000/docs · Health: http://localhost:8000/api/v1/health

To run a Celery worker locally without Docker:
```bash
celery -A app.tasks.celery_app worker --loglevel=info --concurrency=4
```

## Testing in Postman — a full walkthrough
1. `POST /api/v1/auth/register` — create an account with `company_name`
2. `POST /api/v1/auth/login` — get `access_token`
3. `POST /api/v1/jobs` — `{"title": "...", "description": "..."}` → structured requirements
4. `POST /api/v1/jobs/{job_id}/resumes` — multipart, field `files` → returns `202` with `resume_id`s immediately
5. `GET /api/v1/processing/{resume_id}` — poll until `status: "completed"`
6. `POST /api/v1/jobs/{job_id}/screen` — runs the LangGraph workflow for every uploaded candidate
7. `GET /api/v1/jobs/{job_id}/candidates` — ranked list with scores
8. `GET /api/v1/candidates/{candidate_id}/score?job_id=...` — full explainable breakdown + evidence
9. `POST /api/v1/interviews` — `{"job_id": "...", "candidate_id": "...", "num_questions": 5}`
10. `POST /api/v1/interviews/{id}/answers` — `{"answers": {"<question_id>": "..."}}`
11. `POST /api/v1/interviews/{id}/evaluate` — 5-dimension technical assessment
12. `POST /api/v1/search/candidates` — `{"query": "candidates with FastAPI and RAG experience"}`
13. `POST /api/v1/candidates/compare` — `{"job_id": "...", "candidate_ids": ["...", "..."]}`

Note: a freshly registered user has no `role_id` and `is_superuser=False`, so
superuser-only routes (`/users/`, `/users/roles/`, `/users/companies/`) will
403 until you flip `is_superuser=True` directly in the DB for your first
account, or assign a seeded `admin` role's id to `role_id`.

## Running Tests
```bash
pip install -r requirements.txt
pytest -v
```
21 tests, all mocked or pure-function — no live Postgres/Redis/LLM required to run the suite.

## Running the Evaluation Report (requires a live GROQ_API_KEY)
```bash
python -m scripts.run_evaluation
```
Writes `evaluation/reports/resume_parsing_report.json` and `job_analysis_report.json` with precision/recall/F1 per dataset item.


## Project Structure
```
hiremind-ai-backend/
├── app/
│   ├── main.py
│   ├── core/                     # config.py, security.py, exceptions.py
│   ├── db/database.py
│   ├── models/                   # user, job, candidate, resume, embedding, application, interview
│   ├── schemas/                  # auth, user, job, candidate, interview
│   ├── repositories/user_repository.py
│   ├── dependencies/auth.py
│   ├── llm/client.py              # provider-agnostic LLM client, retries, structured JSON
│   ├── document_processing/       # extractor.py (PyMuPDF + OCR fallback), ocr.py (swappable)
│   ├── embeddings/service.py      # Sentence-Transformers → pgvector
│   ├── agents/
│   │   ├── job_analysis_agent.py
│   │   ├── resume_parser_agent.py
│   │   ├── interview_agent.py            # question generation
│   │   └── interview_evaluation_agent.py # answer scoring
│   ├── workflows/                 # LangGraph state machine
│   │   ├── state.py               # RecruitmentState TypedDict
│   │   ├── nodes.py               # load_data / matching / evidence / evaluation / decision / shortlist / review_reject
│   │   └── graph.py               # StateGraph wiring + conditional routing
│   ├── tasks/                     # Celery
│   │   ├── celery_app.py
│   │   └── resume_tasks.py
│   ├── evaluation/                # pure metrics — no LLM, no DB
│   │   ├── schemas.py
│   │   └── metrics.py             # precision/recall/F1, experience accuracy, cost estimation
│   ├── services/
│   │   ├── job_service.py / resume_service.py (queue + pipeline split for Celery)
│   │   ├── matching_service.py    # thin wrapper around the LangGraph workflow
│   │   ├── matching_engine.py     # pure scoring math — unit tested
│   │   ├── evidence_service.py / search_service.py / interview_service.py
│   ├── api/v1/
│   │   ├── auth.py / users.py / health.py
│   │   ├── jobs.py / candidates.py / search.py / processing.py / interviews.py
│   └── utils/response.py
├── scripts/
│   ├── seed_roles.py
│   └── run_evaluation.py          # scores agents against evaluation/datasets/, writes reports
├── evaluation/
│   ├── datasets/                  # sample_resumes.json, sample_jobs.json (synthetic)
│   └── reports/                   # generated by run_evaluation.py
├── alembic/ (env.py — async, auto-creates pgvector extension)
├── tests/
│   ├── test_health.py
│   ├── test_matching_engine.py    # pure-function, deterministic
│   └── test_evaluation.py         # mocked-LLM, verifies metrics pipeline
├── requirements.txt / Dockerfile / docker-compose.yml / alembic.ini / .env.example / pytest.ini
```

## Remaining Work
| Item | Notes |
|---|---|
| Rate limiting / structured observability | `slowapi` or a Redis-backed limiter + structured request/LLM-call logging middleware |
| Frontend | Next.js — not started, per your instructions to do backend only for now |

## Design Decisions Worth Knowing for an Interview
- **Scoring is deterministic, not LLM-guessed.** `matching_engine.py` has zero LLM calls. Same inputs always produce the same score (tested in `test_matching_engine.py`).
- **The LangGraph Evaluation node is qualitative-only by construction.** It receives the already-computed matched/missing skills and evidence and is explicitly prompted never to output or imply a numeric score — so even if the LLM misbehaves, it can't override the deterministic score.
- **Evidence is retrieved, never generated.** Keyword search over page-attributed resume text; explicitly returns "Evidence not found in resume." rather than fabricating a plausible sentence.
- **Celery tasks own their own event loop.** `resume_tasks.py` calls `asyncio.run()` inside a sync Celery task rather than trying to share an event loop across tasks — the correct pattern for mixing Celery (sync, process-based) with an async SQLAlchemy/LLM stack.
- **OCR and LLM provider are both swappable via one env var** behind abstract interfaces — no call site elsewhere in the app knows which concrete provider is active.
- **Resume status IS the processing-job tracker.** No separate `processing_jobs` table — a resume's own `status` field (`queued/processing/completed/failed`) covers everything the batch-upload flow needs. Added only if/when something else needs the same tracking (YAGNI over the letter of the original schema list).
- **Evaluation metrics are pure functions, mirroring the matching engine's philosophy** — precision/recall/F1 computed by ordinary set arithmetic, not by asking an LLM to grade another LLM's output.

## Security Notes
- Passwords hashed with bcrypt; JWT access (30 min) + refresh (7 days), refresh tokens stored hashed
- All secrets via environment variables — never committed
- Login lockout after 5 failed attempts; forgot-password never reveals whether an email exists
- Resume content treated as untrusted input: extension/size validated before processing, LLM prompts are extraction-only, structured output is Pydantic-validated before touching Postgres
- Scoring never uses protected characteristics — the matching engine only ever sees `skills`, `experience_years`, `projects`, and embeddings of professional text
