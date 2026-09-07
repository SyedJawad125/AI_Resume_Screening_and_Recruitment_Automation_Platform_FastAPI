<!-- # 🤖 AI Document Processing & RAG System

A production-style **AI Document Processing and Retrieval-Augmented Generation (RAG) system** built with **FastAPI, PostgreSQL, pgvector, LangChain, Groq, OCR, SentenceTransformers, and Docker**.

The system allows users to upload PDF documents, automatically extract text, perform OCR on scanned documents, generate embeddings, store them in PostgreSQL using pgvector, perform semantic search, ask questions using RAG, generate AI summaries, extract structured JSON data, provide source citations, and download generated reports.

This project is designed as both a **real-world AI backend application** and an **interview preparation project** for Python, FastAPI, Backend, Generative AI, LLM, RAG, Vector Database, and AI Engineering roles.

---

## 🚀 Key Features

* 📄 PDF document upload
* 🔍 Automatic PDF text extraction
* 🖼️ OCR for scanned/image-based PDFs
* ✂️ Intelligent document chunking
* 🧠 Embedding generation using SentenceTransformers
* 🗄️ PostgreSQL database
* 🔢 pgvector for vector similarity search
* 🔗 LangChain-based RAG pipeline
* 🤖 Groq LLM integration
* 🔎 Semantic document search
* 💬 Context-aware question answering
* 📚 Source/page-level citations
* 📝 AI document summarization
* 📦 Structured JSON extraction
* 📑 Downloadable PDF reports
* 🔐 JWT authentication and authorization
* ⚡ Asynchronous document processing
* 🐳 Docker and Docker Compose
* 🧪 Pytest-based testing
* 📊 RAG evaluation
* 📝 Structured logging
* 🛡️ Production-oriented error handling

---

## 🏗️ Architecture

```text
                         ┌─────────────────────┐
                         │       Client        │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      FastAPI        │
                         │     REST APIs       │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
       │ PDF / OCR   │       │ PostgreSQL  │       │   Groq LLM  │
       │ Processing  │       │ + pgvector  │       │             │
       └──────┬──────┘       └──────┬──────┘       └──────┬──────┘
              │                     │                     │
              ▼                     ▼                     │
       ┌─────────────┐       ┌─────────────┐              │
       │  Chunking   │       │  Embeddings │              │
       └──────┬──────┘       └──────┬──────┘              │
              │                     │                     │
              └──────────────┬──────┘                     │
                             ▼                            │
                    ┌─────────────────┐                   │
                    │    LangChain    │◄──────────────────┘
                    │   RAG Pipeline  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Answer + Sources│
                    │   + Citations   │
                    └─────────────────┘
```

---

## 🔄 Document Processing Pipeline

```text
PDF Upload
     │
     ▼
File Validation
     │
     ▼
PDF Text Extraction
     │
     ▼
Is sufficient text available?
     │
   ┌─┴─────────────┐
   │               │
  YES              NO
   │               │
   │               ▼
   │              OCR
   │               │
   └───────┬───────┘
           ▼
      Text Cleaning
           │
           ▼
       Chunking
           │
           ▼
     Embeddings
           │
           ▼
 PostgreSQL + pgvector
           │
           ▼
     Document READY
```

---

# 🧠 RAG Pipeline

The question-answering pipeline works as follows:

```text
User Question
      │
      ▼
Query Embedding
      │
      ▼
pgvector Similarity Search
      │
      ▼
Top-K Relevant Chunks
      │
      ▼
LangChain RAG Pipeline
      │
      ▼
Context Construction
      │
      ▼
Groq LLM
      │
      ▼
Generated Answer
      │
      ▼
Source Citations
```

The system is designed to answer questions using retrieved document context rather than allowing the LLM to freely generate unsupported information.

---

# 🛠️ Technology Stack

## Backend

* Python 3.12+
* FastAPI
* Pydantic
* SQLAlchemy 2.0
* Alembic
* Uvicorn

## Database

* PostgreSQL
* pgvector

## AI / LLM

* Groq
* LangChain
* SentenceTransformers
* `all-MiniLM-L6-v2`

## Document Processing

* PyMuPDF
* Tesseract OCR
* Pillow
* OpenCV

## Infrastructure

* Docker
* Docker Compose

## Testing

* Pytest
* FastAPI TestClient

---

# 📂 Project Structure

```text
ai-document-processing/
│
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py
│   │       ├── documents.py
│   │       ├── search.py
│   │       ├── chat.py
│   │       ├── extraction.py
│   │       └── reports.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── exceptions.py
│   │
│   ├── db/
│   │   ├── database.py
│   │   └── session.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── document.py
│   │   ├── document_page.py
│   │   └── document_chunk.py
│   │
│   ├── schemas/
│   │   ├── document.py
│   │   ├── search.py
│   │   ├── chat.py
│   │   └── extraction.py
│   │
│   ├── repositories/
│   │   ├── document_repository.py
│   │   └── chunk_repository.py
│   │
│   ├── services/
│   │   ├── pdf_service.py
│   │   ├── ocr_service.py
│   │   ├── chunking_service.py
│   │   ├── embedding_service.py
│   │   ├── vector_search_service.py
│   │   ├── rag_service.py
│   │   ├── llm_service.py
│   │   ├── summary_service.py
│   │   ├── extraction_service.py
│   │   └── report_service.py
│   │
│   └── workers/
│       └── document_worker.py
│
├── migrations/
│
├── tests/
│   ├── test_documents.py
│   ├── test_search.py
│   ├── test_rag.py
│   └── test_extraction.py
│
├── uploads/
├── reports/
│
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .env.example
├── alembic.ini
├── README.md
└── .gitignore
```

---

# 📋 Core Features

## 1. PDF Upload

Endpoint:

```http
POST /api/v1/documents/upload
```

The API:

1. Validates the PDF.
2. Checks file size.
3. Generates a document ID.
4. Stores document metadata.
5. Saves the file.
6. Starts document processing.
7. Returns the processing status.

Example:

```json
{
    "document_id": "uuid",
    "filename": "annual_report.pdf",
    "status": "processing"
}
```

---

# 2. PDF Text Extraction

Text-based PDFs are processed using **PyMuPDF**.

The extracted content retains page information so that the RAG system can later generate page-level citations.

---

# 3. OCR

Scanned PDFs are automatically detected when insufficient text is extracted.

```text
Scanned PDF
     ↓
PDF → Images
     ↓
Tesseract OCR
     ↓
Extracted Text
     ↓
Page Metadata
```

Each page stores:

```json
{
    "page": 4,
    "extraction_method": "ocr"
}
```

---

# 4. Document Chunking

Documents are divided into smaller chunks before embedding.

Example configuration:

```text
chunk_size = 800
chunk_overlap = 150
```

Each chunk maintains metadata:

```json
{
    "document_id": "...",
    "page_number": 5,
    "chunk_index": 12
}
```

---

# 5. Embeddings

Embeddings are generated using:

```text
sentence-transformers/all-MiniLM-L6-v2
```

The resulting vectors are stored in PostgreSQL using pgvector.

```text
Document Chunk
      ↓
SentenceTransformer
      ↓
384-dimensional Embedding
      ↓
PostgreSQL + pgvector
```

---

# 6. Semantic Search

Endpoint:

```http
POST /api/v1/search
```

Example request:

```json
{
    "query": "What are the company's revenue figures?",
    "document_id": "uuid",
    "top_k": 5
}
```

The system:

```text
Query
 ↓
Embedding
 ↓
pgvector
 ↓
Similarity Search
 ↓
Top-K Chunks
```

---

# 7. RAG Question Answering

Endpoint:

```http
POST /api/v1/chat
```

Example:

```json
{
    "document_id": "uuid",
    "question": "What was the company's revenue in 2025?"
}
```

The RAG system retrieves relevant document chunks and passes them through the LangChain pipeline to the Groq LLM.

The model is instructed to:

* Answer only from retrieved context.
* Avoid unsupported information.
* Say when the information cannot be found.
* Provide source citations.
* Include page numbers where available.

---

# 8. LangChain Integration

LangChain is used as the orchestration layer for the LLM/RAG workflow.

Example conceptual flow:

```text
Retriever
    ↓
Retrieved Documents
    ↓
Prompt Template
    ↓
Groq Chat Model
    ↓
Structured / Natural Language Response
```

LangChain helps organize:

* Document retrieval
* Prompt construction
* LLM invocation
* RAG chains
* Structured output
* Prompt templates

The underlying vector database remains **PostgreSQL + pgvector**.

---

# 9. Source Citations

Every RAG response should contain source information.

Example:

```text
The company's revenue increased by 18% in 2025.

[Source: annual_report.pdf, Page 12]
```

Internally:

```json
{
    "citation_id": 1,
    "document_id": "...",
    "chunk_id": "...",
    "page_number": 12,
    "filename": "annual_report.pdf"
}
```

The system should only generate citations from chunks actually retrieved during the RAG process.

---

# 10. AI Document Summary

Endpoint:

```http
POST /api/v1/documents/{document_id}/summary
```

The generated summary contains:

* Executive Summary
* Key Points
* Important Facts
* Important Numbers
* Risks / Issues
* Conclusion

For large documents:

```text
Document
    ↓
Chunks
    ↓
Individual Summaries
    ↓
Combined Summary
    ↓
Final AI Summary
```

This avoids unnecessarily sending the entire document to the LLM.

---

# 11. Structured JSON Extraction

Endpoint:

```http
POST /api/v1/documents/{document_id}/extract
```

Example request:

```json
{
    "fields": [
        "company_name",
        "revenue",
        "employees",
        "founded_year",
        "headquarters"
    ]
}
```

Example response:

```json
{
    "company_name": "Example Corp",
    "revenue": "$14.2 million",
    "employees": 350,
    "founded_year": 2018,
    "headquarters": "New York"
}
```

The output is validated using **Pydantic**.

The system should distinguish between:

```text
FOUND
NOT_FOUND
UNCERTAIN
```

Missing information should not be fabricated by the LLM.

---

# 12. PDF Report Generation

Endpoint:

```http
GET /api/v1/documents/{document_id}/report
```

The generated report can contain:

```text
Document Information
        ↓
Executive Summary
        ↓
Extracted Information
        ↓
Important Findings
        ↓
Questions & Answers
        ↓
Source Citations
        ↓
Processing Information
```

---

# 🔐 Authentication & Security

The application includes production-oriented security practices:

* JWT authentication
* Password hashing
* User authorization
* User-specific documents
* File type validation
* File size validation
* Safe filenames
* Path traversal protection
* Environment-based secrets
* CORS configuration
* Request validation
* Global exception handling

Users should only be able to access their own documents.

---

# 🗄️ Database Design

### Users

```text
users
├── id
├── email
├── password_hash
├── created_at
└── updated_at
```

### Documents

```text
documents
├── id
├── user_id
├── filename
├── file_path
├── file_size
├── mime_type
├── status
├── processing_error
├── created_at
└── updated_at
```

### Document Pages

```text
document_pages
├── id
├── document_id
├── page_number
├── text
├── extraction_method
└── created_at
```

### Document Chunks

```text
document_chunks
├── id
├── document_id
├── page_id
├── chunk_index
├── content
├── embedding
├── metadata
└── created_at
```

The `embedding` column uses pgvector.

---

# 🐳 Docker

The application is containerized using Docker.

Main services:

```text
┌─────────────────────┐
│       FastAPI       │
│        API          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     PostgreSQL      │
│      + pgvector     │
└─────────────────────┘
```

Groq is accessed through its API.

---

# ⚙️ Environment Variables

Create a `.env` file:

```env
APP_NAME=AI Document Processing System
ENVIRONMENT=development

DATABASE_URL=postgresql+psycopg://postgres:postgres@db:5432/document_ai

GROQ_API_KEY=your_groq_api_key

LLM_MODEL=your_groq_model

EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

UPLOAD_DIR=uploads
REPORT_DIR=reports

MAX_FILE_SIZE_MB=20
TOP_K=5
CHUNK_SIZE=800
CHUNK_OVERLAP=150
```

**Never commit your real `GROQ_API_KEY` to GitHub.**

Add `.env` to `.gitignore`.

---

# ▶️ Running the Project

## 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-document-processing-rag.git

cd ai-document-processing-rag
```

## 2. Create Environment File

```bash
cp .env.example .env
```

Add your Groq API key:

```env
GROQ_API_KEY=your_api_key
```

## 3. Start Docker

```bash
docker compose up --build
```

## 4. API Documentation

Once the application is running:

```text
http://localhost:8000/docs
```

FastAPI automatically provides interactive Swagger API documentation.

---

# 🧪 Testing

Run:

```bash
pytest
```

Tests cover:

### Unit Tests

* PDF extraction
* OCR detection
* Chunking
* Embedding generation
* Citation creation
* JSON validation

### API Tests

* Authentication
* PDF upload
* Document retrieval
* Search
* Chat
* Summary
* Extraction
* Report generation

### RAG Tests

```text
Question
   ↓
Retrieval
   ↓
Context
   ↓
LLM
   ↓
Answer
   ↓
Citation
```

Also test questions whose answers do not exist in the uploaded document.

Expected behavior:

```text
I could not find this information in the provided document.
```

---

# 📊 RAG Evaluation

The project includes a foundation for evaluating RAG performance.

## Retrieval Metrics

* Recall@K
* Precision@K
* MRR

## Generation Metrics

* Faithfulness
* Answer Relevance
* Citation Correctness

Example evaluation record:

```json
{
    "question": "What was revenue in 2025?",
    "expected_page": 12,
    "expected_answer": "$14.2 million"
}
```

---

# ⚡ Performance & Scalability

The system is designed with scalability in mind.

### Large Documents

Use background processing instead of blocking the upload request.

### Embeddings

Generate embeddings in batches.

### Vector Search

Use pgvector indexes for efficient similarity search.

### LLM Context

Only send relevant retrieved chunks to the LLM.

### Database

Use appropriate PostgreSQL indexes.

### Caching

Redis can be introduced for frequently repeated queries.

### Workers

Celery can be introduced for large-scale document processing.

---

# 📈 Future Improvements

Planned advanced features:

* [ ] Hybrid Search
* [ ] BM25 + Vector Search
* [ ] Cross-Encoder Reranking
* [ ] Query Rewriting
* [ ] Multi-Query Retrieval
* [ ] Metadata Filtering
* [ ] Conversation Memory
* [ ] Streaming LLM Responses
* [ ] Redis Caching
* [ ] Celery Workers
* [ ] API Rate Limiting
* [ ] Observability
* [ ] RAG Evaluation Dashboard
* [ ] Advanced hallucination detection
* [ ] Multi-document RAG

---

# 🎯 Interview Preparation

This project is specifically designed to prepare for **AI Backend / Generative AI / LLM Engineer / Python Backend Engineer** interviews.

## FastAPI

* Why FastAPI?
* Async vs synchronous programming?
* Dependency Injection?
* Pydantic validation?
* Middleware?
* Background tasks?
* API versioning?

## PostgreSQL

* Why PostgreSQL?
* Relational vs NoSQL databases?
* Transactions?
* Indexes?
* Relationships?
* Connection pooling?

## pgvector

* What is vector search?
* How does cosine similarity work?
* What is an embedding?
* HNSW vs IVFFlat?
* Why pgvector instead of FAISS?
* How does vector indexing improve retrieval?

## RAG

* What is RAG?
* Why do we chunk documents?
* How do you select chunk size?
* What is chunk overlap?
* How are embeddings generated?
* How does semantic search work?
* How do you reduce hallucinations?
* How do you evaluate RAG?

## LangChain

* Why use LangChain?
* What problem does LangChain solve?
* What is a Retriever?
* What is a PromptTemplate?
* What is an LLM chain?
* How does a RAG chain work?
* When would you avoid LangChain and implement the pipeline directly?

## OCR

* When do you need OCR?
* How can you detect scanned PDFs?
* What are OCR limitations?
* How can OCR accuracy be improved?

## LLM / Groq

* Why Groq?
* What is LLM inference?
* What is temperature?
* What is a context window?
* How do you handle LLM failures?
* How do you validate structured LLM output?
* How do you reduce LLM costs?

## System Design

* How would you process 10,000 PDFs?
* How would you handle concurrent uploads?
* How would you scale the RAG system?
* How would you secure user documents?
* How would you monitor the system?
* How would you handle failed document processing?
* How would you reduce latency?

---

# 📚 Learning Objectives

By completing this project, you will gain practical experience with:

```text
Python
  ↓
FastAPI
  ↓
REST API Design
  ↓
PostgreSQL
  ↓
pgvector
  ↓
Embeddings
  ↓
OCR
  ↓
Document Processing
  ↓
LangChain
  ↓
RAG
  ↓
Groq LLM
  ↓
Structured Output
  ↓
Citations
  ↓
AI Evaluation
  ↓
Docker
  ↓
Production Architecture
```

---

# 🗺️ Development Roadmap

### Phase 1 — Infrastructure

* FastAPI
* Docker
* PostgreSQL
* pgvector

### Phase 2 — Database

* SQLAlchemy
* Alembic
* Database models

### Phase 3 — Document Upload

* PDF upload
* Validation
* Metadata

### Phase 4 — Document Processing

* PyMuPDF
* OCR
* Text cleaning

### Phase 5 — Chunking

* Chunking strategy
* Metadata preservation

### Phase 6 — Embeddings

* SentenceTransformers
* pgvector storage

### Phase 7 — Search

* Vector similarity
* Top-K retrieval

### Phase 8 — LLM

* Groq
* LangChain
* Prompt templates

### Phase 9 — RAG

* Retriever
* Context construction
* Answer generation

### Phase 10 — Citations

* Page-level sources
* Citation validation

### Phase 11 — Summarization

* Chunk summaries
* Hierarchical summarization

### Phase 12 — Structured Extraction

* JSON output
* Pydantic validation

### Phase 13 — Reports

* PDF report generation

### Phase 14 — Security

* JWT
* Authorization
* File security

### Phase 15 — Testing

* Unit tests
* API tests
* RAG tests

### Phase 16 — Evaluation

* Retrieval metrics
* Generation metrics
* Citation evaluation

### Phase 17 — Production

* Logging
* Error handling
* Docker optimization
* Background workers

### Phase 18 — Advanced RAG

* Hybrid search
* Reranking
* Query rewriting
* Multi-query retrieval

---

# 👨‍💻 Author

**Syed Jawad Ali**

Python Backend Developer | FastAPI | Django | Generative AI | LLM | RAG

---

# ⭐ Project Purpose

This project is built to demonstrate practical experience in:

**Backend Engineering + Generative AI + RAG + LLM Applications + Vector Search + Document Intelligence**

It is intentionally designed as a production-style learning project rather than a simple tutorial application. -->





















<!-- # 🤖 AI Document Processing & RAG System

<div align="center">

![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-0.3-1C3C3C?style=for-the-badge&logo=chainlink&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-0.4-FF6B35?style=for-the-badge)
![Groq](https://img.shields.io/badge/Groq-LLaMA_3.1-F55036?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**Production-style AI Document Intelligence Platform**

Upload PDFs → Extract Text → OCR → Chunk → Embed → RAG Q&A → Summarize → Extract → Report

[Features](#-key-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [API Docs](#-api-endpoints) • [Tech Stack](#-tech-stack)

</div>

---

## 📌 About

A **production-style AI Document Processing and RAG (Retrieval-Augmented Generation) system** built with FastAPI, PostgreSQL + pgvector, LangChain, LangGraph, Groq LLM, OCR, and SentenceTransformers.

The system lets users upload PDF documents, automatically extracts and processes text (including OCR for scanned documents), generates semantic embeddings stored in PostgreSQL using pgvector, and enables intelligent question answering with page-level citations, AI summaries, structured data extraction, and downloadable PDF reports.

Built as both a **real-world AI backend application** and an **interview preparation project** for Python Backend, FastAPI, Generative AI, LLM, RAG, and AI Engineering roles.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📄 PDF Upload | File validation, size check, async processing |
| 🔍 Text Extraction | PyMuPDF for text-based PDFs |
| 🖼️ OCR | Tesseract for scanned/image-based PDFs |
| ✂️ Smart Chunking | LangChain RecursiveCharacterTextSplitter with overlap |
| 🧠 Embeddings | sentence-transformers/all-MiniLM-L6-v2 (384-dim, local) |
| 🗄️ Vector Store | PostgreSQL + pgvector with HNSW index |
| 🔗 RAG Pipeline | LangChain LCEL chains + LangGraph CRAG agent |
| 🤖 LLM | Groq API (llama-3.1-8b-instant) — fast inference |
| 🔎 Semantic Search | Cosine similarity via pgvector |
| 💬 Q&A | Context-aware answers with page citations |
| 📝 Summarization | Hierarchical AI summarization |
| 📦 Extraction | Structured JSON field extraction with Pydantic |
| 📑 Reports | Downloadable PDF reports via ReportLab |
| 🔐 Auth | JWT authentication + role-based permissions |
| ⚡ Async | FastAPI BackgroundTasks for non-blocking processing |
| 🐳 Docker | Full Docker + Docker Compose setup |

---

## 🏗️ Architecture

```
                      ┌─────────────────────┐
                      │        Client        │
                      └──────────┬──────────┘
                                 │  REST API
                                 ▼
                      ┌─────────────────────┐
                      │       FastAPI        │
                      │  (Async REST APIs)   │
                      └──────────┬──────────┘
                                 │
          ┌──────────────────────┼────────────────────┐
          │                      │                    │
          ▼                      ▼                    ▼
  ┌──────────────┐      ┌──────────────┐     ┌──────────────┐
  │  PDF / OCR   │      │  PostgreSQL  │     │   Groq LLM   │
  │  Processing  │      │  + pgvector  │     │  (LangChain) │
  └──────┬───────┘      └──────┬───────┘     └──────┬───────┘
         │                     │                    │
         ▼                     ▼                    │
  ┌──────────────┐      ┌──────────────┐            │
  │   Chunking   │      │  Embeddings  │            │
  │  (LangChain) │      │    stored    │            │
  └──────┬───────┘      └──────┬───────┘            │
         │                     │                    │
         └──────────┬──────────┘                    │
                    ▼                               │
          ┌──────────────────┐                      │
          │    LangGraph     │◄─────────────────────┘
          │   CRAG Agent     │
          │ retrieve → grade │
          │ rewrite → answer │
          └────────┬─────────┘
                   ▼
          ┌──────────────────┐
          │  Answer          │
          │  + Citations     │
          │  + Page Numbers  │
          └──────────────────┘
```

---

## 🔄 Document Processing Pipeline

```
PDF Upload
     │
     ▼
File Validation (type + size)
     │
     ▼
PDF Text Extraction (PyMuPDF)
     │
     ▼
Is text sufficient? (>50 chars/page)
     │
  ┌──┴─────────────┐
  YES               NO
  │                 │
  │                 ▼
  │           OCR (Tesseract)
  │           Image preprocessing
  │           Text extraction
  │                 │
  └──────┬──────────┘
         ▼
    Text Cleaning
         │
         ▼
    LangChain Chunking
    (size=800, overlap=150)
         │
         ▼
    Embedding Generation
    (all-MiniLM-L6-v2)
         │
         ▼
    PostgreSQL + pgvector
    (HNSW index)
         │
         ▼
    Document → READY ✅
```

---

## 🧠 LangGraph CRAG Agent

```
User Question
      │
      ▼
  [retrieve]
  pgvector search
      │
      ▼
  [grade_docs]
  LLM grades each chunk
  for relevance (0-1 score)
      │
   ┌──┴──────────────┐
Good docs          Poor docs
   │                  │
   │              [rewrite_query]
   │              LLM rewrites
   │              for better search
   │                  │
   │              [retrieve]
   │              second attempt
   │                  │
   └──────┬───────────┘
          ▼
     [generate]
     Build context
     Groq LLM
     Answer + Citations
          │
          ▼
    Final Response
    + Page Citations
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **API Framework** | FastAPI 0.115, Uvicorn, Pydantic v2 |
| **Database** | PostgreSQL 16, pgvector, SQLAlchemy 2.0 async |
| **Migrations** | Alembic |
| **LLM** | Groq API (llama-3.1-8b-instant) |
| **AI Orchestration** | LangChain 0.3, LangGraph 0.4 |
| **Embeddings** | sentence-transformers/all-MiniLM-L6-v2 (local) |
| **PDF Extraction** | PyMuPDF (fitz) |
| **OCR** | Tesseract + pytesseract + OpenCV |
| **Report Generation** | ReportLab |
| **Auth** | JWT (python-jose) + bcrypt |
| **Infrastructure** | Docker, Docker Compose |
| **Testing** | Pytest, pytest-asyncio |

---

## 📂 Project Structure

```
backend/
│
├── app/
│   ├── main.py                        ← FastAPI app entry point
│   │
│   ├── agents/
│   │   ├── rag_agent.py               ← LangGraph CRAG agent
│   │   └── document_agent.py          ← Multi-tool document agent
│   │
│   ├── api/v1/
│   │   ├── auth.py                    ← Register, login, OTP, reset
│   │   ├── documents.py               ← Upload, list, status, delete
│   │   ├── search.py                  ← Vector similarity search
│   │   ├── chat.py                    ← RAG Q&A + agent endpoints
│   │   ├── extraction.py              ← Structured JSON extraction
│   │   ├── reports.py                 ← PDF report download
│   │   └── users.py                   ← Users, roles, permissions
│   │
│   ├── core/
│   │   ├── config.py                  ← All settings from .env
│   │   ├── security.py                ← JWT + password hashing
│   │   ├── exceptions.py              ← Custom exceptions + handlers
│   │   ├── langchain_setup.py         ← LangChain/Groq singletons
│   │   └── logging.py                 ← Structured logging
│   │
│   ├── db/
│   │   └── database.py                ← Async SQLAlchemy engine
│   │
│   ├── models/
│   │   ├── user.py                    ← User, Role, Permission, Company
│   │   ├── document.py                ← Document, Page, Chunk (pgvector)
│   │   ├── associations.py            ← Many-to-many tables
│   │   └── mixins.py                  ← UUID, timestamp, soft-delete
│   │
│   ├── schemas/
│   │   ├── auth.py                    ← Login, register, OTP schemas
│   │   ├── document.py                ← Upload, search, chat schemas
│   │   ├── user.py                    ← User, role, company schemas
│   │   └── base.py                    ← Base response schemas
│   │
│   ├── repositories/
│   │   ├── document_repository.py     ← Document DB queries
│   │   └── user_repository.py         ← User/role/company queries
│   │
│   ├── services/
│   │   ├── pdf_service.py             ← PyMuPDF text extraction
│   │   ├── ocr_service.py             ← Tesseract OCR
│   │   ├── chunking_service.py        ← LangChain text splitter
│   │   ├── embedding_service.py       ← sentence-transformers
│   │   ├── vector_search_service.py   ← pgvector cosine search
│   │   ├── llm_service.py             ← LangChain LCEL chains
│   │   ├── rag_service.py             ← RAG pipeline orchestrator
│   │   ├── summary_service.py         ← Hierarchical summarization
│   │   ├── extraction_service.py      ← Structured field extraction
│   │   ├── report_service.py          ← ReportLab PDF generation
│   │   └── auth_service.py            ← Auth business logic
│   │
│   ├── dependencies/
│   │   ├── auth.py                    ← get_current_user
│   │   └── permission.py              ← require_permission()
│   │
│   ├── utils/
│   │   ├── response.py                ← success_response helper
│   │   └── file_utils.py              ← File validation utilities
│   │
│   └── workers/
│       └── document_worker.py         ← Async processing pipeline
│
├── migrations/                        ← Alembic migration files
├── tests/                             ← Pytest test suite
├── uploads/                           ← Uploaded PDF files
├── reports/                           ← Generated PDF reports
│
├── init_db.py                         ← DB init + HNSW index
├── add_permissions.py                 ← Seed permission codes
├── populate.py                        ← Seed admin user + roles
├── start.py                           ← Dev/prod server launcher
│
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .env.example
├── alembic.ini
└── .gitignore
```

---

## 🚀 Quick Start

### With Docker

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/ai-document-processing.git
cd ai-document-processing

# 2. Setup environment
cp .env.example .env
# Edit .env → add your GROQ_API_KEY

# 3. Start services
docker compose up --build

# 4. Initialize database (run once)
docker exec ai_doc_api python init_db.py
docker exec ai_doc_api python add_permissions.py
docker exec ai_doc_api python populate.py

# 5. Open API docs
# http://localhost:8000/api/docs
```

### Without Docker (Local)

```bash
# 1. Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Setup PostgreSQL
# Create database: document_ai
# Run: CREATE EXTENSION IF NOT EXISTS vector;

# 4. Update .env
# Set POSTGRES_HOST=localhost

# 5. Run migrations
alembic revision --autogenerate -m "initial"
alembic upgrade head

# 6. Seed database
python init_db.py
python add_permissions.py
python populate.py

# 7. Start server
python start.py
```

**Default login after populate.py:**
```
Email:    admin@documentai.com
Password: Admin@123456
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
| POST | `/api/v1/documents/upload` | Upload PDF (async processing) |
| GET | `/api/v1/documents/` | List documents |
| GET | `/api/v1/documents/{id}` | Document detail |
| GET | `/api/v1/documents/{id}/status` | Processing status + progress |
| DELETE | `/api/v1/documents/{id}` | Soft delete |
| POST | `/api/v1/documents/{id}/summary` | Generate AI summary |

### AI Features
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/search/` | Vector similarity search |
| POST | `/api/v1/chat/` | RAG Q&A (auto mode) |
| POST | `/api/v1/chat/agent` | LangGraph CRAG agent (grade + rewrite) |
| POST | `/api/v1/chat/simple` | Simple RAG (fast) |
| POST | `/api/v1/chat/ask` | Multi-tool agent (auto-classifies intent) |
| POST | `/api/v1/extraction/{id}` | Extract structured JSON fields |
| GET | `/api/v1/reports/{id}` | Download PDF report |

### Users & Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/users/me` | Current user profile |
| PATCH | `/api/v1/users/me` | Update profile |
| GET | `/api/v1/users/permissions/` | List all permissions |
| GET | `/api/v1/users/roles/` | List roles |
| POST | `/api/v1/users/roles/` | Create role |
| GET | `/api/v1/users/companies/` | List companies |
| POST | `/api/v1/users/companies/` | Create company |

---

## 💡 API Examples

### Upload a PDF
```bash
curl -X POST http://localhost:8000/api/v1/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@report.pdf"
```

### Ask a Question (CRAG Agent)
```bash
curl -X POST http://localhost:8000/api/v1/chat/agent \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "document_id": "your-doc-uuid",
    "question": "What was the revenue in 2025?",
    "top_k": 5
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "question": "What was the revenue in 2025?",
    "answer": "The revenue in 2025 was $14.2 million. [Page 12]",
    "mode": "crag",
    "iterations": 1,
    "query_rewritten": false,
    "citations": [
      {
        "chunk_id": "uuid",
        "filename": "report.pdf",
        "page_number": 12
      }
    ]
  }
}
```

### Extract Structured Fields
```bash
curl -X POST http://localhost:8000/api/v1/extraction/your-doc-uuid \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": ["company_name", "revenue", "employees", "founded_year"]
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "fields": {
      "company_name": { "value": "Acme Corp",    "status": "found" },
      "revenue":      { "value": "$14.2 million", "status": "found" },
      "employees":    { "value": 350,             "status": "found" },
      "founded_year": { "value": null,            "status": "not_found" }
    }
  }
}
```

---

## ⚙️ Environment Variables

```env
# App
APP_NAME=AI Document Processing System
ENVIRONMENT=development
DEBUG=True
SECRET_KEY=your-random-secret-key

# Database
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/document_ai
SYNC_DATABASE_URL=postgresql+psycopg://postgres:password@localhost:5432/document_ai

# Groq LLM (get free key at console.groq.com)
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant

# Embeddings (local — no API key needed)
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDING_DIMENSION=384

# RAG
CHUNK_SIZE=800
CHUNK_OVERLAP=150
TOP_K=5

# LangGraph Agent
USE_AGENT_MODE=True
MAX_AGENT_ITERATIONS=5
GRADING_THRESHOLD=0.6
ENABLE_QUERY_REWRITE=True
```

---

## 🗄️ Database Schema

```
users              roles              permissions
──────────         ──────────         ───────────
id (UUID)          id (UUID)          id (UUID)
email              name               name
password_hash      code_name          code_name
first_name         description        module_name
last_name          created_at         description
role_id ──────────►
company_id         role_permissions (many-to-many)

companies          documents          document_pages
──────────         ──────────         ──────────────
id (UUID)          id (UUID)          id (UUID)
name               user_id            document_id
slug               filename           page_number
subscription_plan  file_path          text
is_active          file_size          extraction_method
                   status             ocr_confidence
                   progress
                   page_count         document_chunks
                                      ──────────────
                                      id (UUID)
                                      document_id
                                      page_id
                                      chunk_index
                                      content
                                      embedding VECTOR(384) ← pgvector
                                      page_number
                                      metadata (JSON)
```

---

## 🧪 Running Tests

```bash
# Run all tests
pytest

# Run with output
pytest -v

# Run specific test file
pytest tests/test_documents.py -v

# Run with coverage
pytest --cov=app tests/
```

---

## 🔐 Security

- JWT access tokens (10hr) + refresh tokens (15 days)
- bcrypt password hashing
- Role-based permission system
- Users can only access their own documents
- File type + size validation
- Safe filename generation (UUID-based)
- Path traversal protection
- Environment-based secrets (never hardcoded)
- CORS configuration
- Global exception handling with consistent error format

---

## 📊 Alembic Migrations

```bash
# Create new migration after model changes
alembic revision --autogenerate -m "description"

# Apply all migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1

# View history
alembic history

# View current version
alembic current
```

---

## 🎯 Interview Preparation

This project covers the following topics commonly asked in AI/Backend interviews:

**FastAPI:** async vs sync, dependency injection, background tasks, middleware, Pydantic v2

**PostgreSQL:** transactions, indexes, connection pooling, relationships

**pgvector:** cosine similarity, HNSW vs IVFFlat, vector indexing, why not FAISS

**RAG:** chunking strategy, chunk overlap, embedding models, retrieval, hallucination reduction, evaluation

**LangChain:** LCEL chains, prompt templates, retrievers, RAG chains, when to avoid it

**LangGraph:** stateful agents, CRAG, conditional edges, node routing, loops

**OCR:** scanned PDF detection, Tesseract, image preprocessing, accuracy improvement

**Groq:** inference speed, temperature, context window, structured output, error handling

**System Design:** 10,000 PDF processing, concurrent uploads, scaling, caching, monitoring

---

## 🗺️ Roadmap

- [x] FastAPI + PostgreSQL + pgvector
- [x] PDF extraction + OCR pipeline
- [x] LangChain chunking + embeddings
- [x] LangGraph CRAG agent
- [x] Groq LLM integration
- [x] Semantic search + RAG Q&A
- [x] AI summarization + extraction
- [x] PDF report generation
- [x] JWT auth + role permissions
- [x] Docker + Docker Compose
- [ ] Redis caching
- [ ] Celery background workers
- [ ] Hybrid search (BM25 + vector)
- [ ] Cross-encoder reranking
- [ ] Streaming LLM responses
- [ ] RAG evaluation dashboard
- [ ] Multi-document RAG
- [ ] Conversation memory

---

## 👨‍💻 Author

**Syed Jawad Ali**

Python Backend Developer | FastAPI | Django | Generative AI | LLM | RAG Systems

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**⭐ Star this repo if you find it useful!**

Built for learning, interviews, and production AI backend engineering. -->









# 🤖 AI Document Processing & RAG System

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

</div>