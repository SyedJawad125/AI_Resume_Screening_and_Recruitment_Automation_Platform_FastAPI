# AI Document Processing System

FastAPI + PostgreSQL/pgvector + LangGraph + Groq — Production-ready RAG document intelligence platform.

## Quick Start

```bash
# 1. Clone and setup
cp .env.example .env
# Fill in GROQ_API_KEY in .env

# 2. Start Docker services
docker-compose up --build -d

# 3. Initialize database (run once)
docker exec ai_doc_api python init_db.py
docker exec ai_doc_api python add_permissions.py
docker exec ai_doc_api python populate.py

# 4. Open API docs
# http://localhost:8000/api/docs
```

## Default Login
```
Email:    admin@documentai.com
Password: Admin@123456
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register |
| POST | /api/v1/auth/login | Login → tokens |
| POST | /api/v1/auth/refresh | Refresh access token |
| POST | /api/v1/auth/logout | Logout |
| POST | /api/v1/auth/forgot-password | Send OTP |
| POST | /api/v1/auth/verify-otp | Verify OTP |
| POST | /api/v1/auth/reset-password | Reset password |
| POST | /api/v1/auth/change-password | Change password |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/documents/upload | Upload PDF |
| GET | /api/v1/documents/ | List documents |
| GET | /api/v1/documents/{id} | Document detail |
| GET | /api/v1/documents/{id}/status | Processing status |
| DELETE | /api/v1/documents/{id} | Delete document |
| POST | /api/v1/documents/{id}/summary | AI summary |
| GET | /api/v1/documents/{id}/report | Download PDF report |

### AI Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/search | Vector similarity search |
| POST | /api/v1/chat | RAG Q&A (auto mode) |
| POST | /api/v1/chat/agent | Force LangGraph CRAG agent |
| POST | /api/v1/chat/simple | Force simple RAG |
| POST | /api/v1/chat/ask | Multi-tool document agent |
| POST | /api/v1/extraction/{id} | Extract structured fields |
| GET | /api/v1/reports/{id} | Download PDF report |

## Architecture

```
Upload → Extract Text (PyMuPDF) → OCR if needed (Tesseract)
       → Chunk (LangChain RecursiveCharacterTextSplitter)
       → Embed (sentence-transformers/all-MiniLM-L6-v2)
       → Store (PostgreSQL + pgvector)

Query  → Embed → pgvector search → LangGraph CRAG Agent
       → Grade docs → Rewrite query if poor → Re-retrieve
       → Generate answer (Groq llama-3.1-8b-instant)
       → Citations with page numbers
```

## Tech Stack
- **FastAPI** — async REST API
- **PostgreSQL + pgvector** — vector similarity search
- **LangChain** — LCEL chains, prompt templates
- **LangGraph** — stateful CRAG agent
- **Groq** — fast LLM inference (llama-3.1-8b-instant)
- **sentence-transformers** — local embeddings (no API cost)
- **PyMuPDF** — PDF text extraction
- **Tesseract** — OCR for scanned PDFs
- **ReportLab** — PDF report generation
- **Alembic** — database migrations
- **Docker** — containerized deployment