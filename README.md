# Stacks — a document-grounded RAG chatbot

A chatbot that answers questions about a document you upload, and says
so honestly when it can't — either because no document has been
uploaded yet, or because the document doesn't contain the answer.

```
stacks-rag-chatbot/
  client/    React + Vite + Tailwind frontend
  server/    Express backend — Ollama for chat + embeddings, Qdrant for vector search
  docker-compose.yml   spins up Qdrant
```

## How it fits together

1. The client opens a **session** with the server on load. Each session
   holds one uploaded document (if any) and a short rolling chat
   history — no login or persistence across page reloads yet.
2. **Uploading a file** (the clip icon next to the message box) sends it
   to the server, which extracts its text, splits it into overlapping
   chunks, embeds each chunk with `qwen3-embedding:0.6b` via Ollama, and
   stores the vectors in a Qdrant collection scoped to that session.
3. **Sending a message** embeds the question the same way, searches
   that session's Qdrant collection, and hands the model
   (`gemma4:31b-cloud` via Ollama) a system prompt built around what was
   found:
   - no document uploaded at all → told to say so, not invent an answer
   - a document exists but nothing relevant turned up → told to say the
     answer isn't in the document, rather than guess
   - relevant passages were found → told to answer from those passages
     and flag it if they only partially cover the question

All three cases are visible in `server/src/lib/promptBuilder.js`.

## Running it locally

You'll need [Ollama](https://ollama.com) running locally with both
models pulled:

```bash
ollama pull gemma4:31b-cloud
ollama pull qwen3-embedding:0.6b
```

Start Qdrant (or point `QDRANT_URL` at one you already run):

```bash
docker compose up -d
```

Then, in two terminals:

```bash
# terminal 1 — backend
cd server
npm install
cp .env.example .env
npm run dev        # http://localhost:3001

# terminal 2 — frontend
cd client
npm install
npm run dev         # http://localhost:5173
```

Open the frontend URL, attach a document, and ask about it.

## Why Qdrant over MongoDB

Either works for this — Qdrant was the simpler path here since it's a
purpose-built vector database with a single Docker container and a
first-class similarity-search API (`server/src/lib/qdrantClient.js`).
If you'd rather use MongoDB (e.g. Atlas Vector Search, or a self-hosted
instance with a vector index), swap that one file for a Mongo-backed
version of the same four functions (`ensureCollection` /
`recreateCollection`, `upsertChunks`, `search`, `deleteCollectionIfExists`)
— nothing else in `server/` talks to the vector store directly.

## Configuration

All backend settings — model names, Ollama/Qdrant hosts, chunk size,
the retrieval score threshold, upload size limit — live in
`server/.env.example`. Copy it to `.env` and adjust as needed; nothing
is hardcoded elsewhere.

## What's not built yet

- No authentication — the Login button in the sidebar is still UI-only.
- Sessions live in server memory and reset on restart; the sidebar's
  chat history list is still a placeholder, not backed by saved
  conversations.
- One document per session (uploading a new file replaces the last
  one's index rather than combining them).
