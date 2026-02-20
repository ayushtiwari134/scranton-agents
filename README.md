# Scranton Agents — Multi-Persona Simulation Engine

> **Status:** Fully functional end-to-end system. Actively iterating on orchestration, scaling, and observability.

**Scranton Agents** is a stateful, multi-persona simulation engine built using **LangGraph**, **FastAPI**, **FAISS**, and a Phaser-based interactive frontend. While the subject matter is comedic (*The Office US*), the architecture is engineering-first. This project serves as a reference implementation for building memory-isolated, retrieval-augmented, streaming agent systems with explicit state management and deterministic orchestration.

This system is **inspired by the PhiloAgents architecture**, but independently implemented and extended with production-oriented decisions around RAG ingestion, checkpointed memory, async streaming, and full-stack integration.

---

# System Architecture

Frontend (Phaser Game UI)  
→ WebSocket  
→ FastAPI  
→ LangGraph  
→ Tool Nodes (Retriever)  
→ FAISS Vector Store  
→ LLM (ChatGroq via LiteLLM-compatible interface)  
→ SQLite Checkpointer  
→ Streaming Tokens Back to Client  

---

# Data & RAG Pipeline

The system begins with structured knowledge extraction from *The Office (US)* fandom wiki.

## 1. Web Scraping & Dataset Construction

A hierarchical scraping strategy extracts:

- Season-level tables  
- Episode summaries  
- Quote pages  
- Speaker-attributed dialogue  
- Episode metadata  

The result is a structured dataset containing:

- Season and episode indices  
- Episode titles  
- Character-attributed quotes  
- Scene-level summaries  
- Source URLs for traceability  

---

## 2. Character-Centric Transformation

Rather than storing content episode-wise, all data is restructured around characters.

Each knowledge unit captures:

- What the character said  
- What the character did  
- What happened contextually in the episode  

This enables persona-aware retrieval without heuristic prompt engineering.

All content is transformed into a unified `JSONL` file:

`dunderpedia_character_chunks.jsonl`


Each line represents a deterministic, typed knowledge unit.

---

## 3. Chunking Strategy

Chunks are explicitly typed:

- `quote`
- `action`
- `summary_line`
- `persona_seed`

Rules:

- `quote`, `action`, and `persona_seed` are character-scoped
- `summary_line` is episode-scoped
- Every chunk is episodically grounded
- Metadata is stored alongside embeddings for alignment

This schema-driven chunking ensures precise retrieval and future reranking compatibility.

---

## 4. Embeddings & FAISS Vector Store

The ingestion pipeline:

1. Loads JSONL data  
2. Converts chunks into embedding-ready format  
3. Generates embeddings (local SentenceTransformers fallback supported)  
4. Stores vectors in a persistent FAISS index  
5. Aligns metadata with embeddings  

Build the vector store:

`python -m app.rag.ingest dunderpedia_character_chunks.jsonl`


The FAISS index is stored in the backend directory and used deterministically at runtime.

---

# Multi-Persona Graph Architecture

The backend is orchestrated using **LangGraph**, with an explicit `AgentState` extending `MessagesState`.

### State Structure

- `persona`
- `user_input`
- `messages` (append-only)
- `retrieved_chunks`
- `context_summary`
- `conversation_summary`
- `final_response`

There are no hidden flags, no implicit branching, and no cross-persona memory leakage.

---

## Graph Nodes

- `conversation_node`
- `retrieve_context` (ToolNode)
- `summarize_context_node`

Edges are explicitly defined, including conditional routing to retrieval tools.

Each persona operates within its own thread ID:

`user_id:persona:session_id`


This guarantees strict memory isolation across sessions and characters.

---

# Memory & Persistence

## Short-Term Memory
Maintained through `MessagesState` and append-only conversation history.

## Long-Term Memory
Powered by FAISS retrieval grounded in episodic metadata.

## Transactional Checkpointing
Implemented using: `AsyncSqliteSaver`


All conversational state is persisted atomically to `memory.sqlite`, ensuring:

- Crash safety  
- Resume capability  
- Persona isolation  
- Multi-tenant session support  

---

# Inference Layer

LLM inference is handled through a ChatGroq-compatible interface (LiteLLM-style provider abstraction).

Features:

- Provider agnostic
- Async execution
- Token streaming
- Configurable model switching

Streaming responses are delivered token-by-token over WebSocket.

---

# FastAPI & WebSocket Layer

The backend exposes:
```
POST /chat/
WS /chat/ws
```


The WebSocket endpoint:

- Accepts persona-scoped payloads
- Streams `token` messages
- Emits `done` signals
- Supports concurrent sessions
- Integrates with LangGraph’s async execution

This replaces the initial REPL-based prototype with a production-ready API service.

---

# Frontend (Phaser Game Interface)

The frontend is intentionally lightweight and functions as a simulation interface over the backend.

Features:

- User ID and Session ID capture
- Persona-to-character mapping
- Real-time WebSocket streaming
- Token-by-token response rendering
- ESC to close dialogue
- Space to continue interaction
- WSAD player movement
- Map-based NPC spawning
- Clean background scaling and UI handling

Each character sprite maps to a backend persona:

- `michael`
- `jim`
- `dwight`

---

## Screenshots

### Main Menu

![Main Menu Screenshot](./images/Screenshot%202026-02-19%20at%204.23.01 PM.png)

### In-Game Conversation

![In-Game Screenshot](./images/Screenshot%2026-02-19%20at%204.22.53 PM.png)

---

# Engineering Highlights

- Graph-based orchestration instead of recursive agent loops
- Deterministic state transitions
- Persona-scoped memory isolation
- Structured RAG ingestion pipeline
- Metadata-aligned embeddings
- Async token streaming over WebSockets
- SQLite-backed atomic checkpointing
- Clean separation between semantic state and control flow
- Inspired by PhiloAgents, independently implemented and extended

---

# Quick Start

## Prerequisites

- Python 3.10+
- `uv`
- Node.js (for frontend)

---
# Backend

Go into the backend directory

`cd backend/`

## 1. Install Backend
`uv sync`

---

## 2. Configure Environment
`cp .env.example .env`

Add your API keys.

---

## 3. Build Vector Store
`python -m app.rag.ingest dunderpedia_character_chunks.jsonl`

---

## 4. Run Backend
`python main.py`


---

# Frontend

```
cd frontend
npm install
npm run dev
```

---

# What This Project Demonstrates

- End-to-end RAG system construction  
- Multi-persona graph orchestration  
- Persistent memory isolation  
- Async streaming inference  
- Full-stack multi agent architecture  
- Production-oriented backend design  

This is not a simple chatbot wrapper.

It is a structured, memory-persistent, multi-agent simulation framework.

---

# License

MIT License.

---

<div align="center">
<sub>Built with LangGraph, FastAPI, FAISS, SQLite & Phaser. Inspired by the PhiloAgents course, independently implemented.</sub>
</div>
