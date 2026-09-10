<!-- # 🤖 AI Document Processing & RAG System

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_17-pgvector-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-0.3-1C3C3C?style=for-the-badge)
![LangGraph](https://img.shields.io/badge/LangGraph-0.2-FF6B35?style=for-the-badge)
![Groq](https://img.shields.io/badge/Groq-LLM-F55036?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Full-Stack AI Document Intelligence Platform**

Upload PDFs → OCR → Chunk → Embed → pgvector → RAG Q&A → LangGraph Agent → Summary → Extract → Report

[Features](#-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [API Docs](#-api-endpoints) • [Tech Stack](#-tech-stack)

</div>

---

## 📌 About

A **full-stack AI Document Processing and RAG system** with:

- **Backend** — FastAPI + PostgreSQL 17 + pgvector
- **Frontend** — Next.js 15
- **AI Pipeline** — LangChain + LangGraph CRAG Agent + Groq LLM
- **Vector Search** — pgvector with HNSW index
- **Embeddings** — sentence-transformers (local, no API cost)
- **OCR** — Tesseract for scanned PDFs

Upload any PDF → the system automatically extracts text, generates embeddings stored in PostgreSQL via pgvector, and enables intelligent Q&A with page-level citations, AI summaries, structured data extraction, and downloadable PDF reports.

---

## ✨ Features

| Feature | Description | Status |
|---|---|---|
| 📄 PDF Upload | File validation, size check, async background processing | ✅ |
| 🔍 Text Extraction | PyMuPDF for digital PDFs | ✅ |
| 🖼️ OCR | Tesseract + OpenCV for scanned/image PDFs | ✅ |
| ✂️ Smart Chunking | Recursive text splitter with overlap | ✅ |
| 🧠 Embeddings | sentence-transformers/all-MiniLM-L6-v2 (local, 384-dim) | ✅ |
| 🗄️ Vector Store | PostgreSQL 17 + pgvector HNSW index | ✅ |
| 🔎 Semantic Search | Cosine similarity via pgvector | ✅ |
| 💬 RAG Q&A | Context-aware answers with page citations | ✅ |
| 🤖 LangGraph Agent | CRAG — grade docs + rewrite query + re-retrieve | ✅ |
| 🧩 Multi-Tool Agent | Auto-classifies intent → routes to correct tool | ✅ |
| 📝 AI Summary | Hierarchical summarization via Groq LLM | ✅ |
| 📦 Field Extraction | Structured JSON extraction with status | ✅ |
| 📑 PDF Reports | Downloadable reports via ReportLab | ✅ |
| 🔐 JWT Auth | Access + refresh tokens + role-based permissions | ✅ |
| 👥 Multi-tenant | Company-scoped documents and users | ✅ |
| 🌐 Next.js Frontend | Modern React UI | ✅ |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│               Next.js 15 Frontend                │
│         (React, TypeScript, Tailwind)            │
└──────────────────────┬──────────────────────────┘
                       │ REST API
                       ▼
┌─────────────────────────────────────────────────┐
│              FastAPI Backend                     │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │   Auth   │  │Documents │  │  Chat / RAG  │  │
│  │  Routes  │  │  Routes  │  │    Routes    │  │
│  └──────────┘  └──────────┘  └──────┬───────┘  │
│                                     │           │
│  ┌──────────────────────────────────▼────────┐  │
│  │           LangGraph CRAG Agent            │  │
│  │  retrieve → grade → [rewrite] → generate  │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ┌────────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Groq LLM  │  │pgvector  │  │Sentence    │  │
│  │  (Q&A,     │  │(Vector   │  │Transformers│  │
│  │  Summary,  │  │Search)   │  │(Embeddings)│  │
│  │  Extract)  │  └──────────┘  └────────────┘  │
│  └────────────┘                                 │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│          PostgreSQL 17 + pgvector                │
│                                                  │
│  users  roles  companies  documents              │
│  document_pages  document_chunks (VECTOR 384)    │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Document Processing Pipeline

```
PDF Upload
    ↓
Validation (type + size)
    ↓
PyMuPDF Text Extraction
    ↓
Is text sufficient?
   YES → Clean Text
   NO  → Tesseract OCR (with OpenCV preprocessing)
    ↓
Recursive Text Chunking (800 words, 150 overlap)
    ↓
sentence-transformers Embedding (384-dim vectors)
    ↓
Store in PostgreSQL document_chunks (pgvector VECTOR column)
    ↓
Document Status → READY ✅
```

---

## 🧠 LangGraph CRAG Agent

```
User Question
      ↓
  [retrieve]
  pgvector cosine similarity search
      ↓
  [grade_docs]
  Groq LLM grades each chunk for relevance (0-1 score)
      ↓
   Good docs?
   YES ──────────────────────────→ [generate]
   NO  → [rewrite_query]                ↓
         Groq rewrites query     Answer + Page Citations
              ↓
         [retrieve] (2nd attempt)
              ↓
         [generate]
```

---

## 🛠️ Tech Stack

### Backend
| Layer | Technology |
|---|---|
| **Framework** | FastAPI 0.115, Uvicorn, Pydantic v2 |
| **Database** | PostgreSQL 17, pgvector, SQLAlchemy 2.0 async |
| **Migrations** | Alembic |
| **LLM** | Groq API (qwen/qwen3.8-27b) |
| **AI Chains** | LangChain 0.3, LangGraph 0.2 |
| **Embeddings** | sentence-transformers/all-MiniLM-L6-v2 (local) |
| **PDF Parsing** | PyMuPDF (fitz) |
| **OCR** | Tesseract + pytesseract + OpenCV |
| **Reports** | ReportLab |
| **Auth** | JWT (python-jose) + bcrypt |

### Frontend
| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **HTTP Client** | Axios / Fetch API |

---

## 📂 Project Structure

```
project/
│
├── backend/                           ← FastAPI
│   ├── app/
│   │   ├── main.py                    ← FastAPI app
│   │   ├── agents/
│   │   │   ├── rag_agent.py           ← LangGraph CRAG agent
│   │   │   └── document_agent.py      ← Multi-tool agent
│   │   ├── api/v1/
│   │   │   ├── auth.py                ← Login, register, OTP
│   │   │   ├── documents.py           ← Upload, status, summary
│   │   │   ├── chat.py                ← RAG Q&A endpoints
│   │   │   ├── search.py              ← Vector search
│   │   │   ├── extraction.py          ← Field extraction
│   │   │   ├── reports.py             ← PDF report download
│   │   │   └── users.py               ← Users, roles, companies
│   │   ├── core/
│   │   │   ├── config.py              ← All settings from .env
│   │   │   ├── security.py            ← JWT + bcrypt
│   │   │   ├── exceptions.py          ← Custom exceptions
│   │   │   └── langchain_setup.py     ← LangChain init
│   │   ├── models/
│   │   │   ├── user.py                ← User, Role, Company
│   │   │   └── document.py            ← Document, Chunk (pgvector)
│   │   ├── repositories/
│   │   │   ├── document_repository.py
│   │   │   └── user_repository.py
│   │   ├── services/
│   │   │   ├── llm_service.py         ← Groq LLM (async)
│   │   │   ├── embedding_service.py   ← sentence-transformers
│   │   │   ├── vector_search_service.py ← pgvector search
│   │   │   ├── rag_service.py         ← RAG pipeline
│   │   │   ├── summary_service.py     ← Hierarchical summary
│   │   │   ├── extraction_service.py  ← Field extraction
│   │   │   ├── pdf_service.py         ← PyMuPDF
│   │   │   ├── ocr_service.py         ← Tesseract
│   │   │   ├── chunking_service.py    ← Text splitter
│   │   │   └── report_service.py      ← ReportLab
│   │   └── workers/
│   │       └── document_worker.py     ← Async processing pipeline
│   ├── migrations/                    ← Alembic
│   ├── init_db.py                     ← DB init + HNSW index
│   ├── add_permissions.py             ← Seed permissions
│   ├── populate.py                    ← Seed admin + roles
│   ├── requirements.txt
│   └── .env
│
└── frontend/                          ← Next.js 15
    ├── app/
    ├── components/
    ├── lib/
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 17 with pgvector extension
- Groq API key (free at [console.groq.com](https://console.groq.com))
- LangChain API key (free at [smith.langchain.com](https://smith.langchain.com))

### Backend Setup

```bash
cd backend

# Virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — add your API keys

# Database setup
alembic revision --autogenerate -m "initial"
alembic upgrade head

# Seed data
python init_db.py
python add_permissions.py
python populate.py

# Start server
python start.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## ⚙️ Environment Variables

```env
# App
APP_NAME=AI Document Processing System
ENVIRONMENT=development
DEBUG=True
SECRET_KEY=your-secret-key

# Database (PostgreSQL 17)
DATABASE_URL=postgresql+asyncpg://postgres:password@127.0.0.1:5432/your_db
SYNC_DATABASE_URL=postgresql+psycopg2://postgres:password@127.0.0.1:5432/your_db

# Groq LLM — https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=qwen/qwen3.8-27b

# LangChain — https://smith.langchain.com
LANGCHAIN_API_KEY=ls__your_key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=ai-document-processing

# LangGraph Agent
USE_AGENT_MODE=True
MAX_AGENT_ITERATIONS=5
GRADING_THRESHOLD=0.6
ENABLE_QUERY_REWRITE=True

# Embeddings (local — no API key needed)
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDING_DIMENSION=384

# RAG
CHUNK_SIZE=800
CHUNK_OVERLAP=150
TOP_K=5
RELEVANCE_THRESHOLD=0.3
```

---

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Create account |
| POST | `/api/v1/auth/login` | Login → JWT tokens |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout |
| POST | `/api/v1/auth/forgot-password` | Send 6-digit OTP |
| POST | `/api/v1/auth/verify-otp` | Verify OTP |
| POST | `/api/v1/auth/reset-password` | Reset password |
| POST | `/api/v1/auth/change-password` | Change password |

### Documents
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/documents/upload` | Upload PDF |
| GET | `/api/v1/documents/` | List documents |
| GET | `/api/v1/documents/{id}` | Document detail |
| GET | `/api/v1/documents/{id}/status` | Processing status |
| DELETE | `/api/v1/documents/{id}` | Delete document |
| POST | `/api/v1/documents/{id}/summary` | Generate AI summary |

### AI Features
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/search/` | Vector similarity search |
| POST | `/api/v1/chat/` | RAG Q&A (auto mode) |
| POST | `/api/v1/chat/agent` | LangGraph CRAG agent |
| POST | `/api/v1/chat/simple` | Simple RAG (faster) |
| POST | `/api/v1/chat/ask` | Multi-tool agent (auto intent) |
| POST | `/api/v1/extraction/{id}` | Extract JSON fields |
| GET | `/api/v1/reports/{id}` | Download PDF report |

### Users & Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/users/me` | My profile |
| PATCH | `/api/v1/users/me` | Update profile |
| GET | `/api/v1/users/roles/` | List roles |
| POST | `/api/v1/users/roles/` | Create role |
| GET | `/api/v1/users/permissions/` | List permissions |
| GET | `/api/v1/users/companies/` | List companies |

---

## 💡 API Examples

### Upload PDF
```bash
curl -X POST http://localhost:8000/api/v1/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf"
```

### RAG Q&A
```bash
curl -X POST http://localhost:8000/api/v1/chat/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"document_id": "uuid", "question": "What is the main topic?"}'
```

### LangGraph CRAG Agent
```bash
curl -X POST http://localhost:8000/api/v1/chat/agent \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"document_id": "uuid", "question": "What was the revenue in 2025?"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "answer": "The revenue was $14.2M [Page 12]",
    "mode": "crag",
    "iterations": 2,
    "query_rewritten": true,
    "citations": [{"page_number": 12, "similarity": 0.89}]
  }
}
```

### Extract Fields
```bash
curl -X POST http://localhost:8000/api/v1/extraction/uuid \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fields": ["name", "experience", "skills", "email"]}'
```

Response:
```json
{
  "fields": {
    "name":       {"value": "John Doe",   "status": "found"},
    "experience": {"value": "3.5 years",  "status": "found"},
    "skills":     {"value": "Python, FastAPI", "status": "found"},
    "email":      {"value": null,          "status": "not_found"}
  }
}
```

---

## 🗄️ Database Schema

```
companies          users              roles
──────────         ──────────         ──────────
id (UUID) ◄───┐   id (UUID)          id (UUID)
name           │   email              name
slug           └── company_id ──►    code_name
subscription       role_id ──────►   permissions[]
is_active          is_superuser
                   password_hash      permissions
                                      ──────────
documents                             id (UUID)
──────────                            code_name
id (UUID)                             module_name
user_id
company_id         document_chunks
file_path          ──────────────────
status             id (UUID)
page_count         document_id
ai_summary         content (TEXT)
                   embedding VECTOR(384) ← pgvector
                   page_number
                   chunk_index
```

---

## 🔐 Security Features

- JWT access tokens (10hr) + refresh tokens (15 days)
- bcrypt password hashing (12 rounds)
- Role-based permission system (17 permissions)
- Multi-tenant — users only access own company documents
- File type + size validation
- UUID-based safe filenames
- CORS configuration
- Global exception handling

---

## 🧪 Test Credentials

After running `python populate.py`:

```
Email:    superuser@example.com
Password: Admin@1234

Email:    syedjawadali92@gmail.com
Password: Admin@1234
```

API Docs: `http://localhost:8000/api/docs`

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

## 🗺️ Roadmap

- [x] FastAPI + PostgreSQL 17 + pgvector
- [x] PDF extraction + Tesseract OCR
- [x] LangChain chunking + embeddings
- [x] LangGraph CRAG agent
- [x] Multi-tool document agent
- [x] Groq LLM integration
- [x] Semantic search + RAG Q&A
- [x] AI summarization + field extraction
- [x] PDF report generation
- [x] JWT auth + role permissions
- [x] Multi-tenant (Company model)
- [x] Next.js frontend
- [ ] Redis caching
- [ ] Celery background workers
- [ ] Streaming LLM responses
- [ ] Multi-document RAG
- [ ] Conversation memory
- [ ] RAG evaluation dashboard

---

## 👨‍💻 Author

**Syed Jawad Ali**

Python Backend Developer | FastAPI | Django | Generative AI | LLM | RAG Systems

[![GitHub](https://img.shields.io/badge/GitHub-syedjawadali-181717?style=flat&logo=github)](https://github.com/syedjawadali)

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

<div align="center">

⭐ **Star this repo if you find it useful!**

Built with FastAPI + Next.js + LangGraph + Groq + pgvector

</div> -->


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
- Scoring never uses protected characteristics — the matching engine only ever sees `skills`, `experience_years`, `projects`, and embeddings of professional text
