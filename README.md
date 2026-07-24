# 📚 Stacks — a document-grounded RAG chatbot

A chatbot that answers questions about a document you upload, and says
so honestly when it can't — either because no document has been
uploaded yet, or because the document doesn't contain the answer.
Log in and it remembers your conversations; skip login and it works
exactly the same, just without saving anything.

<p>
  <img alt="node" src="https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white">
  <img alt="react" src="https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=white">
  <img alt="express" src="https://img.shields.io/badge/backend-Express-000000?logo=express&logoColor=white">
  <img alt="mongodb" src="https://img.shields.io/badge/auth%20%26%20history-MongoDB-47A248?logo=mongodb&logoColor=white">
  <img alt="qdrant" src="https://img.shields.io/badge/vectors-Qdrant-DC244C">
  <img alt="ollama" src="https://img.shields.io/badge/models-Ollama-000000?logo=ollama&logoColor=white">
</p>

---

## Table of contents

- [How it fits together](#how-it-fits-together)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Auth & saved history](#auth--saved-history)
- [Project structure](#project-structure)
- [API reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)

---

## How it fits together

<details open>
<summary><strong>1. Ask something, with or without an account</strong></summary>

<br>

Every browser tab opens a **session** with the server on load. A
session holds one uploaded document (if any) and the running
conversation. If you're logged in, the session is also linked to your
account and saved to MongoDB. If you're not, it lives only in server
memory for that process's lifetime — nothing is written to disk.

</details>

<details>
<summary><strong>2. Upload a document</strong></summary>

<br>

The clip icon next to the message box sends your file to the server,
which:
1. Extracts its text (PDF, DOCX, or plain text)
2. Splits it into overlapping chunks
3. Embeds each chunk with `qwen3-embedding:0.6b` via Ollama
4. Stores the vectors in a Qdrant collection scoped to that session

</details>

<details>
<summary><strong>3. Ask a question</strong></summary>

<br>

Your question gets embedded the same way and used to search that
session's Qdrant collection. The model
(`gemma4:31b-cloud` via Ollama) is then handed a system prompt built
around what was found — see `server/src/lib/promptBuilder.js`:

| Situation | Behavior |
|---|---|
| No document uploaded yet | Told to say so, not invent an answer |
| Document exists, nothing relevant found | Told to say the answer isn't in the document |
| Relevant passages found | Told to answer from those passages, and flag it if they only partially cover the question |

</details>

<details>
<summary><strong>4. Logged in? Everything's saved automatically</strong></summary>

<br>

The moment you send your first message in a session, a `Conversation`
document is created in MongoDB (title auto-set from that first
message). Every exchange after that is appended to it. You can rename
or delete any saved chat from the sidebar. None of this happens for
guests — see [Auth & saved history](#auth--saved-history).

</details>

---

## Quick start

<details>
<summary><strong>Prerequisites</strong></summary>

<br>

- [Ollama](https://ollama.com) running locally, with both models pulled:
  ```bash
  ollama pull gemma4:31b-cloud
  ollama pull qwen3-embedding:0.6b
  ```
- Docker (for Qdrant and, optionally, MongoDB)

</details>

<details>
<summary><strong>1. Start Qdrant</strong></summary>

<br>

```bash
docker compose up -d
```

</details>

<details>
<summary><strong>2. Start MongoDB</strong></summary>

<br>

Don't already have MongoDB running locally? Spin one up:

```bash
docker run -d -p 27017:27017 --name mongo mongo
```

Or point `MONGODB_URI` in `server/.env` at Atlas or any instance you
already run.

</details>

<details>
<summary><strong>3. Backend</strong></summary>

<br>

```bash
cd server
npm install
cp .env.example .env    # then fill in MONGODB_URI / SESSION_SECRET if not using the defaults
npm run dev              # http://localhost:3001
```

</details>

<details>
<summary><strong>4. Frontend</strong></summary>

<br>

```bash
cd client
npm install
npm run dev               # http://localhost:3000
```

</details>

<details>
<summary><strong>5. Try it</strong></summary>

<br>

Open the frontend URL. You can start asking questions right away as a
guest, or register an account from the sidebar's "Log in" button to
have your chats saved and reopenable later.

</details>

---

## Environment variables

All backend settings live in `server/.env` (copy from `server/.env.example`):

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | Backend port | `3001` |
| `CLIENT_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |
| `OLLAMA_HOST` | Ollama server URL | `http://127.0.0.1:11434` |
| `OLLAMA_CHAT_MODEL` | Chat model | `gemma4:31b-cloud` |
| `OLLAMA_EMBED_MODEL` | Embedding model | `qwen3-embedding:0.6b` |
| `QDRANT_URL` | Qdrant server URL | `http://127.0.0.1:8333` |
| `QDRANT_API_KEY` | Qdrant API key, if any | *(empty)* |
| `QDRANT_COLLECTION_PREFIX` | Prefix for per-session collections | `stacks_session_` |
| `CHUNK_SIZE` / `CHUNK_OVERLAP` | Document chunking | `1200` / `150` |
| `TOP_K` / `SCORE_THRESHOLD` | Retrieval tuning | `5` / `0.45` |
| `MAX_UPLOAD_MB` | Upload size limit | `20` |
| `MONGODB_URI` | Mongo connection string (auth + saved chats) | `mongodb://127.0.0.1:27017/stacks_rag` |
| `SESSION_SECRET` | Login session signing secret — **change this** before deploying anywhere real | *(dev placeholder)* |

The frontend needs one variable, in `client/.env`:

| Variable | Purpose | Default |
|---|---|---|
| `VITE_API_URL` | Backend base URL | `http://localhost:3001` |

---

## Auth & saved history

- **Register/log in with either email or username** — one identifier field on login, both collected on registration.
- **Passwords** are hashed with bcrypt (12 salt rounds) before ever touching the database — `server/src/models/User.js`.
- **Sessions** are server-side, stored in MongoDB via `connect-mongo`, delivered as an `httpOnly` cookie — not JWTs.
- **Guest traffic never touches MongoDB.** Every write in `server/src/lib/conversationStore.js` is a no-op unless `req.session.userId` is set. Conversations aren't created eagerly on session start either — only lazily, the moment a real message is exchanged.
- **Logging out** clears the chat on screen immediately and starts a fresh guest session — it doesn't just log you out and leave the old conversation sitting there.
- Every `User` document has an `isAdmin` flag, ready for an admin dashboard — not wired up to any UI yet (see [Roadmap](#roadmap)).

---

## Project structure

```
stacks-rag-chatbot/
├── client/                      React + Vite + Tailwind frontend
│   └── src/
│       ├── components/          Sidebar, ChatPage, LoginModal, ChatHistoryItem, ...
│       ├── context/AuthContext.jsx
│       └── lib/api.js           All backend calls, credentials: 'include' throughout
├── server/                      Express backend
│   └── src/
│       ├── routes/              session.js, upload.js, chat.js, auth.js
│       ├── models/              User.js, Conversation.js
│       ├── middleware/auth.js   requireAuth / requireAdmin
│       └── lib/                 sessionStore.js (in-memory), conversationStore.js (Mongo),
│                                 qdrantClient.js, promptBuilder.js
└── docker-compose.yml           Qdrant
```

---

## API reference

<details>
<summary><strong>Auth — <code>/api/auth</code></strong></summary>

<br>

| Method | Path | Auth | Notes |
|---|---|---|---|
| `POST` | `/register` | — | `{ username, email, password }` |
| `POST` | `/login` | — | `{ identifier, password }` — identifier is email *or* username |
| `POST` | `/logout` | ✓ | Destroys the session |
| `GET` | `/me` | ✓ | Current user |

</details>

<details>
<summary><strong>Session & chat — <code>/api/session</code>, <code>/api/upload</code>, <code>/api/chat</code></strong></summary>

<br>

| Method | Path | Auth | Notes |
|---|---|---|---|
| `POST` | `/session/new` | — | Creates an in-memory session; nothing written to Mongo yet |
| `GET` | `/session/:id/status` | — | Document status for a session |
| `GET` | `/session/history` | ✓ | List your saved conversations |
| `GET` | `/session/history/:id` | ✓ | Full messages for one conversation |
| `PATCH` | `/session/history/:id` | ✓ | Rename — `{ title }` |
| `DELETE` | `/session/history/:id` | ✓ | Delete |
| `POST` | `/upload` | — | Multipart file upload, indexes into Qdrant |
| `POST` | `/chat` | — | `{ sessionId, message }` → `{ reply }` |

</details>

---

## Troubleshooting

<details>
<summary><strong>"Couldn't reach the server to start a session"</strong></summary>

<br>

The frontend can't reach the backend. Check the backend terminal is
actually running and listening (`Stacks server listening on
http://localhost:3001`), and that `VITE_API_URL` in `client/.env`
points at the right port.

</details>

<details>
<summary><strong>CORS errors in the Network tab</strong></summary>

<br>

`server/src/index.js` allows `http://localhost:3000` by default with
`credentials: true`. If your frontend runs on a different port, update
the `cors()` origin to match — and make sure every frontend `fetch`
call includes `credentials: 'include'`, or the session cookie won't be
sent.

</details>

<details>
<summary><strong>Windows: Vite fails with <code>EACCES: permission denied</code></strong></summary>

<br>

This is usually Windows' reserved/excluded port range, not a real
permissions issue. Run Vite on a different port:

```bash
npm run dev -- --port 3000
```

Or check what's excluded:

```powershell
netsh interface ipv4 show excludedportrange protocol=tcp
```

</details>

<details>
<summary><strong>Registration fails with <code>passwordHash: Path 'passwordHash' is required</code></strong></summary>

<br>

Mongoose validates a document *before* running `pre('save')` hooks. If
you ever touch `server/src/models/User.js`, keep the password-hashing
hook on `pre('validate')`, not `pre('save')` — otherwise the hash
never exists yet when the `required` check runs.

</details>

<details>
<summary><strong>MongoDB connection fails on startup</strong></summary>

<br>

The backend calls `connectDB()` before it starts listening and exits
if it can't connect. Confirm Mongo is actually running:

```bash
mongosh --eval "db.runCommand({ ping: 1 })"
```

or start it in Docker:

```bash
docker run -d -p 27017:27017 --name mongo mongo
```

</details>

---

## Roadmap

- [ ] Admin dashboard (list/promote/delete users) — the `isAdmin` field
      already exists on `User`, just not exposed anywhere yet
- [ ] Gate `/upload` and `/chat` behind login, if you want guest access
      removed entirely rather than just unsaved
- [ ] Re-hydrate a session's Qdrant/document state from Mongo when
      reopening an old saved chat after a server restart (currently the
      messages and file name display correctly, but retrieval context
      is only available if the server process hasn't restarted since
      that document was uploaded)
- [ ] Multiple documents per session, instead of one replacing the last