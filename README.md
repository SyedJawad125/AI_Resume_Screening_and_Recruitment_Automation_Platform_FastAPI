<!-- # HireMind AI — Backend

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
- **Two LangGraph workflows**: (1) the recruitment scoring graph — `load_data → matching → evidence → evaluation → decision → shortlist/review_reject`; (2) an **agentic RAG graph** — `retrieve → grade → (rewrite_query → retrieve)* → generate` (Corrective RAG pattern), exposed via `POST /api/v1/search/chat`.
- **Agentic RAG + streaming**: retrieval isn't a single pgvector query — an LLM grades whether retrieved candidates actually address the recruiter's question and, if not, rewrites the query and retries (bounded by `MAX_AGENT_ITERATIONS` + `AGENT_TIMEOUT`, toggle off with `USE_AGENT_MODE=false`). `POST /api/v1/search/chat/stream` streams the final grounded answer token-by-token over SSE once retrieval settles, using the same `prompt | llm | StrOutputParser()` chain as the non-streaming path.
- **LangSmith tracing**: set `LANGCHAIN_API_KEY` in `.env` and every agent call, both graphs, and the grading/rewrite loop are automatically traced — wired once in `app/llm/langchain_client.py`, no per-call code.
- **Matching Engine**: transparent, weighted, reproducible scoring — zero LLM calls in the scoring math itself, unit tested.
- **Evidence retrieval**: grounded verbatim resume excerpts, never LLM-generated.
- **Semantic search** over pgvector + **candidate comparison**.
- **AI Interview System**: Interview Agent generates job-specific questions, candidates submit answers, Evaluation Agent scores across a 5-dimension rubric (technical knowledge, problem solving, communication, role fit, overall) with per-question feedback.
- **Celery + Redis**: resume processing runs in a background worker, not on the request thread — uploads return `202 Accepted` immediately even for large batches.
- **Evaluation framework**: synthetic resume/job datasets, precision/recall/F1 on skill extraction, experience-extraction accuracy with tolerance, latency/token/cost tracking, and a mocked-LLM test suite that verifies the whole metrics pipeline without hitting a paid API.
- Docker Compose (pgvector-enabled Postgres + Redis + backend + Celery worker, all with healthchecks)
- 19 automated tests, all passing without any live external service (LLM calls mocked at the LangChain boundary — including the agentic loop's grading/rewriting decisions)

**Still open** (by design, not oversight): rate limiting/observability middleware, and the Next.js frontend.

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
- Scoring never uses protected characteristics — the matching engine only ever sees `skills`, `experience_years`, `projects`, and embeddings of professional text -->






<div align="center">

# 🎯 HireMind AI

### AI-Powered Resume Screening & Recruitment Automation Platform

<em>Upload Resumes → OCR → Parse → Embed → Match → Explain → Interview → Evaluate</em>

<br/>

![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-pgvector-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-0.3-1C3C3C?style=for-the-badge)
![LangGraph](https://img.shields.io/badge/LangGraph-0.2-FF6B35?style=for-the-badge)

![Groq](https://img.shields.io/badge/Groq-LLM-F55036?style=for-the-badge)
![Celery](https://img.shields.io/badge/Celery-Redis-37814A?style=for-the-badge&logo=celery&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-19%20passing-brightgreen?style=for-the-badge&logo=pytest&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<br/>

**A production-style AI recruitment backend — not a "resume in, ChatGPT out" demo.**
Deterministic scoring. Grounded evidence. Self-correcting retrieval. Fully async, fully tested.

<br/>

[✨ Features](#-features) • [🏗️ Architecture](#️-architecture) • [🚀 Quick Start](#-quick-start) • [🌐 API Reference](#-api-reference) • [🧠 Design Notes](#-design-decisions-worth-knowing-for-an-interview)

</div>

<br/>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Architecture](#️-architecture)
- [Resume Processing Pipeline](#-resume-processing-pipeline)
- [Recruitment LangGraph Workflow](#-recruitment-langgraph-workflow)
- [Agentic RAG Search](#-agentic-rag-search-corrective-rag)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#️-environment-variables)
- [API Reference](#-api-reference)
- [API Examples](#-api-examples)
- [Database Schema](#️-database-schema)
- [Security](#-security-features)
- [Test Credentials](#-test-credentials)
- [Design Decisions](#-design-decisions-worth-knowing-for-an-interview)
- [Roadmap](#️-roadmap)

---

## 📌 About

Recruiters receive hundreds of resumes per job. **HireMind AI** automates the screening pipeline end to end while keeping every decision explainable and auditable:

> Recruiter creates a job → **Job Analysis Agent** extracts structured requirements → recruiter uploads resumes → OCR/parsing/embedding run in the background via Celery → a **deterministic weighted matching engine** scores every candidate with cited resume evidence → shortlisted candidates receive AI-generated interview questions → answers are evaluated on a 5-dimension rubric.

Built to demonstrate real AI *system* architecture, not just an LLM API call wrapped in a route:

<table>
<tr>
<td width="50%">

**🧮 Deterministic, not vibes-based**
The matching score is a weighted formula over structured data — zero LLM calls in the scoring path. Same inputs, same score, every time.

</td>
<td width="50%">

**🔎 Self-correcting retrieval**
Search doesn't stop at one vector query. A LangGraph agent grades relevance and rewrites the query when retrieval comes up weak — bounded, never infinite.

</td>
</tr>
<tr>
<td width="50%">

**📎 Evidence, not hallucination**
Every claim about a candidate is grounded in a verbatim resume excerpt. If it's not in the resume, the system says so explicitly.

</td>
<td width="50%">

**⚙️ Non-blocking by design**
Resume uploads return instantly (`202 Accepted`) and process in a Celery worker — a 100-resume batch never ties up the API.

</td>
</tr>
</table>

---

## ✨ Features

| Feature | Description | Status |
|---|---|:---:|
| 📋 Job Analysis Agent | Job description → structured required/preferred skills, weights, experience threshold | ✅ |
| 📄 Resume Upload | Multipart batch upload, validated, queued instantly | ✅ |
| 🔍 Text Extraction | PyMuPDF for digital PDFs + DOCX | ✅ |
| 🖼️ OCR Fallback | Tesseract, auto-triggered per-page for scanned PDFs | ✅ |
| 🧩 Resume Parser Agent | Resume text → structured candidate profile | ✅ |
| 🧠 Embeddings | sentence-transformers, local, 384-dim, zero API cost | ✅ |
| 🗄️ Vector Store | PostgreSQL + pgvector, cosine similarity | ✅ |
| ⚖️ Matching Engine | Deterministic weighted scoring — skills 35% · experience 20% · semantic 20% · projects 15% · preferred 10% | ✅ |
| 🔬 Evidence Retrieval | Grounded verbatim resume excerpts, never hallucinated | ✅ |
| 🤖 Recruitment LangGraph | load_data → matching → evidence → evaluation → decision → shortlist/reject | ✅ |
| 🔎 Agentic RAG Search | Corrective RAG: retrieve → grade → rewrite → retry | ✅ |
| 💬 Streaming Chat | SSE token-by-token grounded candidate Q&A | ✅ |
| 🎤 AI Interview System | Question generation + 5-dimension answer evaluation | ✅ |
| 📊 Evaluation Framework | Precision/recall/F1, mocked-LLM CI tests, synthetic datasets | ✅ |
| ⚙️ Celery + Redis | Non-blocking background resume processing | ✅ |
| 🔐 JWT + RBAC | 23 permissions, 3 roles, superuser bypass, login lockout | ✅ |
| 📡 LangSmith Tracing | Every agent/graph call traced automatically | ✅ |

---

## 🏗️ Architecture

```
┌───────────────────────────────────────────────────┐
│              Next.js Frontend (planned)            │
└──────────────────────┬──────────────────────────────┘
                        │ REST API
                        ▼
┌───────────────────────────────────────────────────┐
│                 FastAPI Backend                    │
│                                                     │
│  ┌────────┐ ┌──────┐ ┌───────────┐ ┌────────────┐  │
│  │  Auth  │ │ Jobs │ │Candidates │ │ Interviews │  │
│  │ Routes │ │Routes│ │  Routes   │ │   Routes   │  │
│  └────────┘ └──┬───┘ └───────────┘ └──────┬─────┘  │
│                │                          │        │
│   ┌────────────▼──────────┐   ┌───────────▼─────┐  │
│   │ Recruitment LangGraph │   │  Interview /    │  │
│   │ load_data→matching→   │   │  Evaluation     │  │
│   │ evidence→evaluation→  │   │  Agents         │  │
│   │ decision→shortlist    │   └─────────────────┘  │
│   └────────────┬──────────┘                        │
│                │                                    │
│   ┌────────────▼──────────┐                         │
│   │  Agentic RAG LangGraph │                        │
│   │  retrieve→grade→       │                        │
│   │  rewrite→retry         │                        │
│   └────────────┬──────────┘                         │
│                │                                    │
│  ┌─────────────▼──┐ ┌──────────┐ ┌───────────────┐  │
│  │   Groq LLM      │ │ pgvector │ │Sentence-      │  │
│  │  (via LangChain,│ │ (Vector  │ │Transformers   │  │
│  │  structured out)│ │  Search) │ │(Embeddings)   │  │
│  └─────────────────┘ └──────────┘ └───────────────┘  │
│                                                       │
│  ┌──────────────────────────────────────────────┐   │
│  │        Celery Worker (Redis broker)           │   │
│  │  resume extraction → OCR → parse → embed      │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────┬────────────────────────────────┘
                        ▼
┌───────────────────────────────────────────────────┐
│           PostgreSQL 16 + pgvector                  │
│                                                     │
│  users  roles  permissions  companies              │
│  jobs  job_requirements  candidates  resumes        │
│  candidate_embeddings (VECTOR 384)  applications    │
│  candidate_scores  interviews  interview_questions  │
│  interview_answers  evaluation_results              │
└───────────────────────────────────────────────────┘
```

---

## 🔄 Resume Processing Pipeline

```
Resume Upload (multipart, batch)
        ↓
Validate (extension + size) → Save to disk → Resume row: QUEUED
        ↓                                          ↓ (202 response — API returns immediately)
        └──────────────► Celery Task (Redis) ◄─────┘
                                ↓
                    PyMuPDF Text Extraction
                                ↓
                    Text sufficient per page?
                       YES → use directly
                       NO  → Tesseract OCR (page-level fallback)
                                ↓
                    Resume Parser Agent (LangChain structured output)
                                ↓
                    Structured Candidate → PostgreSQL
                                ↓
                    Sentence-Transformers Embedding (384-dim)
                                ↓
                    Stored in candidate_embeddings (pgvector)
                                ↓
                    Resume status → COMPLETED ✅
```

---

## 🤖 Recruitment LangGraph Workflow

```
                    START
                      │
                      ▼
               load_data (fetch job requirements, candidate profile, embeddings)
                      │
                      ▼
                  matching (deterministic weighted scoring — zero LLM calls)
                      │
                      ▼
                  evidence (grounded resume excerpt retrieval — zero LLM calls)
                      │
                      ▼
                 evaluation (LLM narrates matched skills — CANNOT set the score)
                      │
                      ▼
                  decision (SHORTLIST / REVIEW / REJECT)
                  /                              \
                 ▼                                ▼
            shortlist                       review_reject
                 \                                /
                  \                              /
                        END
```

## 🔎 Agentic RAG Search (Corrective RAG)

```
Recruiter Query
      │
      ▼
  retrieve ──────────────────────────┐
      │                              │
      ▼                              │
    grade (LLM judges relevance)     │
      │                              │
   ┌──┴───────────────┐              │
   │ relevant enough  │  not relevant, retries remain
   │ OR out of tries  │              │
   ▼                  ▼              │
  END            rewrite_query ──────┘
                 (LLM reformulates, loops back to retrieve)
                       │
                       ▼
              generate (streamed via SSE, grounded + cited)
```

> Bounded by `MAX_AGENT_ITERATIONS` + `AGENT_TIMEOUT`. Toggle off with `USE_AGENT_MODE=false` for a cheaper single-shot fallback.

---

## 🛠️ Tech Stack

<table>
<tr><td><b>Framework</b></td><td>FastAPI 0.115 · Uvicorn · Pydantic v2</td></tr>
<tr><td><b>Database</b></td><td>PostgreSQL 16 · pgvector · SQLAlchemy 2.0 async</td></tr>
<tr><td><b>Migrations</b></td><td>Alembic — async-aware, auto-creates the <code>vector</code> extension</td></tr>
<tr><td><b>LLM</b></td><td>Groq (<code>llama-3.3-70b-versatile</code>), swappable via <code>LLM_PROVIDER</code></td></tr>
<tr><td><b>AI Orchestration</b></td><td>LangChain 0.3 (structured output via tool-calling) + LangGraph 0.2 (2 compiled state machines)</td></tr>
<tr><td><b>Observability</b></td><td>LangSmith tracing (optional, <code>LANGCHAIN_API_KEY</code>)</td></tr>
<tr><td><b>Embeddings</b></td><td>sentence-transformers/all-MiniLM-L6-v2 (local, no API cost)</td></tr>
<tr><td><b>Document Processing</b></td><td>PyMuPDF (fitz) + python-docx</td></tr>
<tr><td><b>OCR</b></td><td>Tesseract + pytesseract, swappable via <code>OCR_PROVIDER</code></td></tr>
<tr><td><b>Background Jobs</b></td><td>Celery + Redis</td></tr>
<tr><td><b>Auth</b></td><td>JWT (python-jose) + bcrypt (passlib)</td></tr>
<tr><td><b>Testing</b></td><td>pytest + pytest-asyncio, mocked at the LangChain boundary</td></tr>
</table>

---

## 📂 Project Structure

<details>
<summary><b>Click to expand full directory tree</b></summary>

```
hiremind-ai-backend/
├── app/
│   ├── main.py
│   ├── core/                     # config.py, security.py, exceptions.py
│   ├── db/database.py
│   ├── models/                   # user, job, candidate, resume, embedding, application, interview
│   ├── schemas/                  # auth, user, job, candidate, interview, workflow
│   ├── repositories/user_repository.py
│   ├── dependencies/auth.py       # get_current_user, require_superuser, require_permission
│   ├── llm/langchain_client.py    # ChatGroq + structured output + LangSmith wiring
│   ├── document_processing/       # extractor.py (PyMuPDF+OCR), ocr.py (swappable)
│   ├── embeddings/service.py      # Sentence-Transformers → pgvector
│   ├── agents/                    # job_analysis, resume_parser, interview, interview_evaluation
│   ├── workflows/                 # graph.py (recruitment), rag_chat_graph.py (agentic RAG)
│   ├── tasks/                     # celery_app.py, resume_tasks.py
│   ├── evaluation/                # schemas.py, metrics.py (precision/recall/F1)
│   ├── services/                  # job, resume, matching_engine, matching, evidence, search, rag_chat, interview
│   ├── api/v1/                    # auth, users, health, jobs, candidates, search, processing, interviews
│   └── utils/response.py
├── scripts/
│   ├── add_permissions.py         # seeds 23 permissions
│   ├── populate.py                # seeds 3 roles + 3 test users
│   └── run_evaluation.py          # scores agents against evaluation/datasets/
├── evaluation/datasets/           # synthetic resumes + jobs
├── alembic/                       # async migrations, auto-creates pgvector extension
├── tests/                         # 19 tests — health, matching engine, evaluation, RAG chat, agentic RAG
├── requirements.txt / Dockerfile / docker-compose.yml / .env.example
└── README.md
```

</details>

---

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- PostgreSQL 16 with pgvector extension
- Redis (or Memurai on Windows)
- Groq API key — free at [console.groq.com](https://console.groq.com/keys)
- LangSmith API key — optional, free at [smith.langchain.com](https://smith.langchain.com)

### 🐳 With Docker

```bash
cp .env.example .env    # set JWT_SECRET_KEY and GROQ_API_KEY
docker compose up --build

docker compose exec backend alembic revision --autogenerate -m "init schema"
docker compose exec backend alembic upgrade head
docker compose exec backend python -m scripts.add_permissions
docker compose exec backend python -m scripts.populate
```

### 💻 Without Docker

```bash
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
cp .env.example .env         # point DATABASE_URL/REDIS_URL at localhost, add GROQ_API_KEY

alembic revision --autogenerate -m "init schema"
alembic upgrade head
python -m scripts.add_permissions
python -m scripts.populate

uvicorn app.main:app --reload --port 8000
# in a second terminal:
celery -A app.tasks.celery_app worker --loglevel=info   # add --pool=solo on Windows
```

📍 API Docs at `http://localhost:8000/docs` · Health check at `http://localhost:8000/api/v1/health`

---

## ⚙️ Environment Variables

<details>
<summary><b>Click to expand full <code>.env</code> reference</b></summary>

```env
# App
APP_NAME=HireMind AI
DEBUG=true
API_V1_PREFIX=/api/v1

# Database
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/hiremind_db

# Redis / Celery
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET_KEY=change-this-to-a-random-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# LLM Provider
LLM_PROVIDER=GROQ
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile

# LangSmith Tracing (optional)
LANGCHAIN_API_KEY=
LANGCHAIN_TRACING_V2=false
LANGCHAIN_PROJECT=hiremind-ai

# Agentic RAG
USE_AGENT_MODE=true
MAX_AGENT_ITERATIONS=3
AGENT_TIMEOUT=120
GRADING_THRESHOLD=0.6
ENABLE_QUERY_REWRITE=true

# Embeddings (local — no API key needed)
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDING_DIM=384

# OCR
OCR_PROVIDER=TESSERACT

# Scoring Weights (must sum to 1.0)
SCORE_WEIGHT_REQUIRED_SKILLS=0.35
SCORE_WEIGHT_EXPERIENCE=0.20
SCORE_WEIGHT_SEMANTIC=0.20
SCORE_WEIGHT_PROJECTS=0.15
SCORE_WEIGHT_PREFERRED_SKILLS=0.10
```

</details>

---

## 🌐 API Reference

<details open>
<summary><b>🔑 Authentication</b></summary>
<br/>

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Create account |
| `POST` | `/api/v1/auth/login` | Login → JWT tokens + role + permissions |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |
| `POST` | `/api/v1/auth/logout` | Revoke refresh tokens |
| `POST` | `/api/v1/auth/forgot-password` | Send 6-digit OTP |
| `POST` | `/api/v1/auth/verify-otp` | Verify OTP → reset token |
| `POST` | `/api/v1/auth/reset-password` | Reset password |
| `POST` | `/api/v1/auth/change-password` | Change password (logged in) |

</details>

<details open>
<summary><b>📋 Jobs</b></summary>
<br/>

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| `POST` | `/api/v1/jobs/` | `can_create_job` | Create job → runs Job Analysis Agent |
| `GET` | `/api/v1/jobs/` | `can_view_jobs` | List jobs |
| `GET` | `/api/v1/jobs/{job_id}` | `can_view_jobs` | Job detail + structured requirements |
| `POST` | `/api/v1/jobs/{job_id}/resumes` | `can_upload_resume` | Batch resume upload (202, queued) |
| `POST` | `/api/v1/jobs/{job_id}/screen` | `can_screen_candidates` | Run LangGraph matching workflow |
| `GET` | `/api/v1/jobs/{job_id}/candidates` | `can_view_candidates` | Ranked, scored candidate list |

</details>

<details open>
<summary><b>👤 Candidates</b></summary>
<br/>

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| `GET` | `/api/v1/candidates/{id}` | `can_view_candidates` | Full candidate profile |
| `GET` | `/api/v1/candidates/{id}/score?job_id=` | `can_view_candidate_score` | Explainable score breakdown + evidence |
| `POST` | `/api/v1/candidates/compare` | `can_compare_candidates` | Side-by-side comparison |

</details>

<details open>
<summary><b>🔎 Search & RAG Chat</b></summary>
<br/>

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| `POST` | `/api/v1/search/candidates` | `can_search_candidates` | Plain pgvector retrieval |
| `POST` | `/api/v1/search/chat` | `can_search_candidates` | Agentic RAG — grounded answer + `retrieval_meta` |
| `POST` | `/api/v1/search/chat/stream` | `can_search_candidates` | Same, streamed via SSE |

</details>

<details open>
<summary><b>🎤 Interviews</b></summary>
<br/>

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| `POST` | `/api/v1/interviews/` | `can_create_interview` | Create interview → generates questions |
| `GET` | `/api/v1/interviews/{id}` | — | Interview detail + questions |
| `POST` | `/api/v1/interviews/{id}/answers` | `can_submit_interview_answers` | Submit candidate answers |
| `POST` | `/api/v1/interviews/{id}/evaluate` | `can_evaluate_interview` | 5-dimension technical assessment |

</details>

<details>
<summary><b>⚙️ Processing & 👥 Admin (click to expand)</b></summary>
<br/>

**Processing**

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/processing/{resume_id}` | Poll async resume pipeline status |

**Users & Admin**

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| `GET` | `/api/v1/users/me` | — | My profile + role + permissions |
| `PATCH` | `/api/v1/users/me` | — | Update profile |
| `GET` | `/api/v1/users/` | `can_view_users` | List users |
| `GET` | `/api/v1/users/{id}` | `can_view_users` | User detail |
| `PATCH` | `/api/v1/users/{id}/block` | `can_block_users` | Block/unblock user |
| `GET` | `/api/v1/users/roles/` | `can_view_roles` | List roles |
| `POST` | `/api/v1/users/roles/` | `can_create_role` | Create role |
| `PATCH` | `/api/v1/users/roles/{id}` | `can_update_role` | Update role |
| `DELETE` | `/api/v1/users/roles/{id}` | `can_delete_role` | Delete role |
| `GET` | `/api/v1/users/permissions/` | — | List all permissions |
| `GET` | `/api/v1/users/companies/` | `can_view_companies` | List companies |
| `POST` | `/api/v1/users/companies/` | `can_manage_companies` | Create company |
| `PATCH` | `/api/v1/users/companies/{id}` | `can_manage_companies` | Update company |
| `DELETE` | `/api/v1/users/companies/{id}` | `can_manage_companies` | Delete company |

**Health**

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | App + DB connectivity check |

</details>

<div align="center">

**34 endpoints total** · Superusers bypass every permission check automatically

</div>

---

## 💡 API Examples

<details>
<summary><b>Create a Job</b> (runs the Job Analysis Agent)</summary>

```bash
curl -X POST http://localhost:8000/api/v1/jobs/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Senior Python AI Engineer", "description": "2+ years Python, FastAPI, PostgreSQL, LLM/RAG required. LangChain, AWS preferred."}'
```
</details>

<details>
<summary><b>Agentic RAG Search</b></summary>

```bash
curl -X POST http://localhost:8000/api/v1/search/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "who has FastAPI and RAG experience?"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "answer": "Jane Doe has direct experience...",
    "sources": [{"name": "Jane Doe", "similarity": 0.87, "matched_evidence": "..."}],
    "retrieval_meta": {"final_query": "...", "iterations_used": 1, "low_confidence": false, "grade_score": 0.85}
  }
}
```
</details>

<details>
<summary><b>Explainable Candidate Score</b></summary>

```bash
curl "http://localhost:8000/api/v1/candidates/{id}/score?job_id={job_id}" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "final_score": 87.3,
  "recommendation": "SHORTLIST",
  "confidence": 0.91,
  "breakdown": {
    "required_skills_score": 100.0,
    "experience_score": 100.0,
    "semantic_score": 82.0,
    "projects_score": 66.7,
    "preferred_skills_score": 50.0
  },
  "matched_required_skills": ["Python", "FastAPI", "PostgreSQL"],
  "missing_required_skills": [],
  "evidence": [
    {"requirement": "FastAPI", "evidence": "Built a FastAPI-based RAG system.", "resume_page": 2}
  ]
}
```
</details>

---

## 🗄️ Database Schema

<details>
<summary><b>Click to expand schema diagram</b></summary>

```
companies          users               roles              permissions
──────────         ──────────          ──────────         ──────────
id (UUID) ◄────┐   id (UUID)           id (UUID)          id (UUID)
name           │   email               name               code_name
slug           └── company_id ──►      code_name ◄─────── module_name
subscription_plan  role_id ──────►     description         (23 seeded)
                   is_superuser        permissions[] ──────────┘

jobs                job_requirements        candidates
──────────          ──────────────────      ──────────────────
id (UUID)           job_id (FK, unique)     id (UUID)
company_id           required_skills[]       skills[]
title                preferred_skills[]      experience_years
description          skill_weights (JSON)    education/work_experience/
status                                        projects (JSONB)

resumes              candidate_embeddings     applications        candidate_scores
──────────           ──────────────────       ──────────────      ──────────────────
id (UUID)            candidate_id (FK)         job_id (FK)         application_id (unique)
candidate_id (FK)    embedding VECTOR(384) ◄── pgvector             final_score
status (queued/      source_text               candidate_id (FK)   recommendation
 processing/                                                        evidence (JSON)
 completed/failed)                                                  weights_used (JSON)

interviews           interview_questions       interview_answers    evaluation_results
──────────           ──────────────────        ──────────────────   ──────────────────
job_id (FK)          interview_id (FK)          question_id (FK,     interview_id (FK, unique)
candidate_id (FK)    question_text              unique)              technical_knowledge
status                                           answer_text          problem_solving/
                                                                       communication/role_fit/overall
```

</details>

---

## 🔐 Security Features

- 🔑 JWT access tokens (30min) + refresh tokens (7 days), refresh tokens stored hashed
- 🔒 bcrypt password hashing (passlib)
- 🛡️ 23-permission RBAC across 3 roles — superusers bypass all checks automatically
- 🚫 Login lockout after 5 failed attempts
- 🕵️ Forgot-password flow never reveals whether an email exists
- 📄 Resume content treated as untrusted input: extension/size validated, LLM prompts are extraction-only, structured output Pydantic-validated before touching Postgres
- ⚖️ Scoring never uses protected characteristics — the matching engine only ever sees `skills`, `experience_years`, `projects`, and text embeddings

---

## 🧪 Test Credentials

After running `python -m scripts.add_permissions` and `python -m scripts.populate`:

| Email | Password | Role |
|---|---|---|
| `admin@hiremind-demo.io` | `Admin@1234` | Superuser — all 23 permissions |
| `recruiter@hiremind-demo.io` | `Admin@1234` | Recruiter |
| `hiringmanager@hiremind-demo.io` | `Admin@1234` | Hiring Manager |

> ⚠️ **Local development only** — change or delete these before any real deployment.

📍 API Docs: `http://localhost:8000/docs`

---

## 📊 Alembic Commands

```bash
alembic revision --autogenerate -m "description"  # new migration
alembic upgrade head                               # apply migrations
alembic downgrade -1                               # rollback one
alembic history                                    # view history
alembic current                                    # current version
```

---

## 🧠 Design Decisions Worth Knowing for an Interview

> 💡 **Scoring is deterministic, not LLM-guessed.** `matching_engine.py` has zero LLM calls. Same inputs always produce the same score (unit tested).

> 💡 **The LangGraph evaluation node is qualitative-only by construction.** It narrates matched/missing skills and is explicitly prompted never to output a numeric score, so it can't override the deterministic matcher.

> 💡 **Evidence is retrieved, never generated.** Keyword search over page-attributed resume text; explicitly returns *"Evidence not found in resume."* rather than fabricating a plausible sentence.

> 💡 **Agentic RAG is bounded, not infinite.** `MAX_AGENT_ITERATIONS` + `AGENT_TIMEOUT` guarantee the grade→rewrite→retry loop terminates and flags `low_confidence` rather than looping forever on an unanswerable query.

> 💡 **Celery tasks own their own event loop.** `resume_tasks.py` calls `asyncio.run()` inside a sync Celery task — the correct pattern for mixing Celery (sync, process-based) with an async SQLAlchemy/LangChain stack.

> 💡 **OCR and LLM provider are both swappable via one env var** behind abstract interfaces — no call site elsewhere in the app knows which concrete provider is active.

---

## 🗺️ Roadmap

- [x] FastAPI + PostgreSQL + pgvector, async throughout
- [x] Job Analysis Agent + Resume Parser Agent (LangChain structured output)
- [x] PyMuPDF extraction + Tesseract OCR fallback
- [x] Sentence-Transformers embeddings + pgvector storage
- [x] Deterministic weighted matching engine + grounded evidence retrieval
- [x] LangGraph recruitment workflow
- [x] Agentic RAG search (CRAG)
- [x] SSE streaming chat
- [x] AI interview system
- [x] Celery + Redis background processing
- [x] JWT auth + granular RBAC
- [x] LangSmith tracing
- [x] Evaluation framework
- [ ] Rate limiting + structured observability middleware
- [ ] Next.js frontend

---

<div align="center">

### 📄 License

MIT License — free to use, modify, and distribute.

<br/>

**Built with FastAPI · LangChain · LangGraph · Groq · pgvector · Celery**

⭐ *If this project helped you understand production AI system design, consider giving it a star.*

</div>