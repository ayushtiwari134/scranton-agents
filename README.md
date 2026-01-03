# Scranton Agent — High-Fidelity Persona Simulation Engine

> **Work in Progress:** This project is currently in active development. The backend architecture is being iterated upon daily.

**Scranton Agent** is a deterministic, persona-driven agent backend designed to simulate complex character interactions using **LangGraph** and **LiteLLM**.

While the subject matter is comedic (The Office US), the architecture is strictly engineering-first. This project serves as a reference implementation for building stateful, multi-tenant agent systems where memory isolation, explicit state transitions, and provider agnosticism are paramount.

---

## Project Philosophy

This system is not a chatbot; it is a **simulation engine**. It rejects the common "black box" approach to agent memory in favor of transparent, inspectable state machines.

Inspired by the [PhiloAgents](https://theneuralmaze.substack.com/p/ai-agents-inside-a-videogame) framework, Scranton Agent enforces a strict separation of concerns:
1.  **External Control:** Persona selection is driven by the client/interface, not the LLM.
2.  **Memory Isolation:** Michael Scott’s context window never bleeds into Dwight Schrute’s.
3.  **Atomic Persistence:** State is serialized transactionally, preventing corruption during conversational turns.

---

## Technical Architecture

The system is built on a modern, composable stack designed for observability and extensibility.

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Orchestration** | [LangGraph](https://langchain-ai.github.io/langgraph/) | Cyclic graph execution and explicit state management. |
| **Inference** | [LiteLLM](https://docs.litellm.ai/) | Standardized interface for 100+ LLM providers (OpenAI, Anthropic, Gemini, Ollama). |
| **Embeddings** | LiteLLM / SentenceTransformers | Provider-agnostic embedding layer with optional local fallback for offline ingestion. |
| **Vector Store** | FAISS (local) | Persistent semantic memory for retrieval-augmented generation (RAG). |
| **Persistence** | Custom/JSON | Human-readable, crash-safe checkpointing (will be replaced with SQLite/Postgres soon). |
| **Runtime** | Python 3.11+ | Type-safe implementation using Pydantic models. |

---

## Memory Architecture (Retrieval-Augmented Generation)

In addition to short-term conversational memory, Scranton Agent maintains a **long-term semantic memory layer** built using Retrieval-Augmented Generation (RAG).

Long-term knowledge is:
- Ingested offline from structured episode data
- Chunked into atomic knowledge units (quotes, actions, episode narration)
- Embedded using a provider-agnostic embedding interface
- Stored in a persistent FAISS vector index with aligned metadata
- Retrieved deterministically at query time to ground persona responses

This design ensures factual consistency and character fidelity without polluting the LLM’s active context window.

---

## Key Features

* **Isolated Context Windows:** Complete separation of narrative history between agents.
* **Atomic Checkpointing:** A custom persistence layer that ensures data integrity via atomic writes.
* **Model Agnostic:** Switch between GPT-4o, Claude 3.5 Sonnet, Gemini, or local Llama models via environment variables.
* **Retrieval-Augmented Memory:** Canonical episode knowledge retrieved via vector search rather than heuristic prompting.
* **Offline-Safe Ingestion:** Local embedding fallback allows full ingestion without external API access.
* **Observability Ready:** Explicit graph edges make debugging state transitions trivial compared to standard recursive agent loops.
* **Extensible Roster:** Adding a new employee (e.g., Stanley or Creed) requires only a configuration update.

---

## Quick Start

### Prerequisites

* Python 3.10+
* `uv` (recommended) or `pip`

### 1. Installation

Clone the repository:
git clone https://github.com/ayushtiwari134/scranton-agents
cd scranton-agents

Install dependencies:
uv sync

### 2. Configuration

Create your local environment file by copying the example:
cp .env.example .env

Open `.env` and add your API keys. Thanks to LiteLLM, you can use almost any provider (Gemini, OpenAI, Anthropic, etc.).

### 3. Ingest Long-Term Memory

This builds the persistent FAISS vector store used for retrieval:
python -m app.rag.ingest dunderpedia_character_chunks.jsonl

### 4. Execution

Launch the terminal-based interactive session:
python main.py

**Sample Interaction:**

> **System:** Choose persona (michael / dwight / jim)
> **User:** dwight
> **System:** [Switched to Dwight Schrute]
> **User:** What is the proper way to peel a beet?
> **Dwight:** *[Scoffs]* False. You do not peel a beet. You roast it in its skin to retain the earthy nutrients...

---

## Roadmap & Future Engineering

This project is evolving from a single-threaded REPL into a scalable API service.

* [ ] **Persistence Layer Upgrade:** Migration from JSON to SQLite/PostgreSQL.
* [ ] **RAG Integration:** Ingesting "The Office" scripts into a vector store for factual consistency.
* [ ] **Retrieval Reranking:** Character-aware filtering and reranking of retrieved context.
* [ ] **FastAPI Layer:** Exposing the graph via WebSocket endpoints.
* [ ] **Multi-Agent Debate:** Implementing a router node to allow characters to converse with *each other*.
* [ ] **Observability:** Integration with Langfuse or Opik for trace monitoring.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
<sub>Built using LangGraph & LiteLLM. Inspired by the <a href="https://theneuralmaze.substack.com/p/ai-agents-inside-a-videogame" target="blank">PhiloAgents</a> Course.</sub>
</div>