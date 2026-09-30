<div align="center">

<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="8" fill="#080A0E"/>
  <rect x="6" y="18" width="20" height="4" rx="2" fill="#7C3AED" opacity="0.6"/>
  <rect x="6" y="13" width="20" height="4" rx="2" fill="#00E5D0" opacity="0.8"/>
  <rect x="6" y="8" width="20" height="4" rx="2" fill="#00E5D0"/>
</svg>

# Stacks

**A private, document-grounded RAG chatbot.**  
Upload a document. Ask it anything. Get grounded answers — or an honest "I don't know."

[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen?style=flat-square)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Gemini](https://img.shields.io/badge/Gemini%20API-2.0--3.x-4285F4?style=flat-square&logo=google)](https://ai.google.dev)
[![Qdrant](https://img.shields.io/badge/Qdrant-cloud%20%2F%20local-dc244c?style=flat-square)](https://qdrant.tech)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20local-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

</div>

---

## What it does

Stacks lets you interrogate your own documents in a private chat interface. Upload a PDF, DOCX, or plain text file, ask natural-language questions, and get answers drawn directly from the document's content.

- **Honest by default** — if the answer isn't in the document, Stacks says so. It never hallucinates.
- **Guest mode** — works instantly without signing up. Sessions are ephemeral.
- **Conversation history** — sign in to save, rename, and delete past conversations.
- **Google Sign-In** — one-click auth alongside the classic email/password flow.
- **Model fallback** — automatically downgrades to a lighter Gemini model under high demand, so the app stays responsive instead of returning errors.

---

## Tech stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite, vanilla CSS modules, Framer Motion |
| **Backend** | Node.js + Express (ESM), `--watch` dev mode |
| **AI / Embeddings** | Gemini API (`gemini-3.x-flash` + `gemini-embedding-001`) |
| **Vector store** | Qdrant Cloud (or local via Docker) |
| **Database** | MongoDB Atlas (or local) — users + conversation history |
| **Auth** | Email/password (bcrypt + express-session) + Google OAuth 2.0 |

---

## Prerequisites

| Requirement | Notes |
|---|---|
| Node.js ≥ 20 | `node --watch` is used in dev mode |
| [Gemini API key](https://aistudio.google.com/apikey) | Free tier is sufficient to start |
| [Qdrant](https://qdrant.tech) | Cloud (free tier) **or** local via Docker (see below) |
| [MongoDB](https://mongodb.com/atlas) | Atlas free M0 tier **or** local |

---

## Quick start

### 1 — Clone and install

```bash
git clone https://github.com/your-username/stacks-rag-chatbot.git
cd stacks-rag-chatbot

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2 — Configure the server

```bash
cp server/.env.example server/.env
```

Open `server/.env` and fill in:

```env
# Required — get a free key at https://aistudio.google.com/apikey
GEMINI_API_KEY=

# Required — Qdrant Cloud cluster URL + API key
QDRANT_URL=https://your-cluster.cloud.qdrant.io
QDRANT_API_KEY=

# Required — MongoDB connection string
MONGODB_URI=mongodb+srv://...

# Required — generate with: node -e "require('crypto').randomBytes(32).toString('hex')|console.log"
SESSION_SECRET=

# Optional — only needed if you want Google Sign-In
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

### 3 — Start the app

Open two terminals:

```bash
# Terminal 1 — backend (auto-restarts on file changes)
cd server && npm run dev

# Terminal 2 — frontend (Vite HMR)
cd client && npm run dev
```

Open **http://localhost:5173** — you're done.

---

## Running Qdrant locally (Docker)

If you don't want a Qdrant Cloud account, run it locally:

```bash
docker compose up -d
```

Then set in `server/.env`:

```env
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=
```

---

## Google Sign-In setup (optional)

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create an **OAuth 2.0 Client ID** → **Web Application**
3. Add an authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
4. Paste the Client ID and Secret into `server/.env`

Without these values the Google button gracefully returns a `501` — the rest of the app is unaffected.

---

## Model fallback

Stacks uses a **fallback chain** so it stays responsive under Gemini API pressure:

```
Your GEMINI_CHAT_MODEL (primary)
  → gemini-3.8-flash
  → gemini-3.7-flash
  → gemini-3.6-flash
  → gemini-3.5-flash
  → gemini-3.5-flash-lite
  → gemini-3.1-flash-lite  ← last resort
```

A fallback is triggered on **429** (rate limit), **503** (overloaded), or **404** (deprecated model). You'll see a one-line warning in the server log when it kicks in:

```
[gemini] gemini-3.7-flash overloaded (503) — falling back to gemini-3.8-flash
```

---

## API reference

All endpoints are prefixed `/api`.

### Auth — `/api/auth`

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/register` | `{ username, email, password }` | Create a new account |
| `POST` | `/login` | `{ identifier, password }` | Sign in (identifier = email or username) |
| `POST` | `/logout` | — | Sign out, clear session |
| `GET` | `/me` | — | Returns the current user or `null` |

### Google OAuth — `/api/auth/google`

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Redirect to Google consent screen |
| `GET` | `/callback` | OAuth callback — sets session, redirects to client |

### Sessions — `/api/session`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/new` | — | Create a new ephemeral chat session, returns `sessionId` |
| `GET` | `/:sessionId/status` | — | Document status for a session |
| `GET` | `/history` | ✅ | List saved conversations |
| `GET` | `/history/:sessionId` | ✅ | Full message history for one conversation |
| `PATCH` | `/history/:sessionId` | ✅ | Rename a conversation |
| `DELETE` | `/history/:sessionId` | ✅ | Delete a conversation |

### Upload — `/api/upload`

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/` | `multipart/form-data` — `file` + `sessionId` | Index a document (PDF, DOCX, TXT — max 20 MB) |

### Chat — `/api/chat`

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/` | `{ sessionId, message }` | Send a message, returns `{ reply }` |

---

## Project structure

```
stacks-rag-chatbot/
├── client/                   # React + Vite frontend
│   ├── public/               # Static assets (SVG icon, etc.)
│   └── src/
│       ├── components/       # UI components (CSS modules)
│       │   ├── Sidebar.*     # Conversation history sidebar
│       │   ├── ChatPage.*    # Main layout
│       │   ├── ChatMessages.*# Message list + empty state
│       │   ├── MessageBubble.*# Individual messages + code blocks
│       │   ├── ChatInput.*   # Textarea + file upload (drag-and-drop)
│       │   ├── Topbar.*      # Document badge + sign-in button
│       │   ├── LoginModal.*  # Auth modal with Google Sign-In
│       │   └── TypingIndicator.* # Animated 3-dot indicator
│       ├── context/
│       │   └── AuthContext.jsx   # Auth state + loginWithGoogle()
│       ├── lib/
│       │   └── api.js            # Fetch wrappers for all API calls
│       ├── App.jsx               # Root — state, orchestration
│       └── index.css             # Design tokens + global reset
│
├── server/                   # Express backend
│   └── src/
│       ├── routes/
│       │   ├── auth.js           # Email/password auth
│       │   ├── googleAuth.js     # Google OAuth (lazy-init)
│       │   ├── session.js        # Session + history routes
│       │   ├── upload.js         # File upload + Qdrant indexing
│       │   └── chat.js           # RAG query + Gemini generation
│       ├── lib/
│       │   ├── geminiClient.js   # Chat + embed with fallback chain
│       │   ├── qdrantClient.js   # Vector store operations
│       │   ├── promptBuilder.js  # RAG prompt assembly
│       │   ├── conversationStore.js # MongoDB conversation CRUD
│       │   ├── sessionStore.js   # In-memory session state
│       │   ├── chunker.js        # Text → overlapping chunks
│       │   └── textExtract.js    # PDF / DOCX / TXT extraction
│       ├── models/
│       │   └── User.js           # Mongoose schema (+ Google fields)
│       ├── middleware/
│       │   └── auth.js           # requireAuth guard
│       ├── config.js             # Centralised env config
│       └── index.js              # Express app entry point
│
├── docker-compose.yml        # Local Qdrant setup
└── .env.example              # (copy to server/.env)
```

---

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | — | `3001` | Server port |
| `CLIENT_ORIGIN` | — | `http://localhost:5173` | CORS origin |
| `GEMINI_API_KEY` | ✅ | — | Gemini API key |
| `GEMINI_CHAT_MODEL` | — | `gemini-2.0-flash` | Primary chat model |
| `GEMINI_EMBED_MODEL` | — | `text-embedding-004` | Primary embedding model |
| `QDRANT_URL` | ✅ | `http://127.0.0.1:6333` | Qdrant endpoint |
| `QDRANT_API_KEY` | — | — | Qdrant API key (Cloud only) |
| `QDRANT_COLLECTION_PREFIX` | — | `stacks_session_` | Collection name prefix |
| `CHUNK_SIZE` | — | `1200` | Characters per chunk |
| `CHUNK_OVERLAP` | — | `150` | Overlap between chunks |
| `TOP_K` | — | `5` | Chunks retrieved per query |
| `SCORE_THRESHOLD` | — | `0.45` | Minimum similarity score |
| `MAX_UPLOAD_MB` | — | `20` | Upload size limit |
| `MONGODB_URI` | ✅ | `mongodb://localhost/stacks_rag` | MongoDB connection string |
| `SESSION_SECRET` | ✅ | — | Express session secret |
| `GOOGLE_CLIENT_ID` | — | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | — | — | Google OAuth secret |
| `GOOGLE_CALLBACK_URL` | — | `http://localhost:3001/api/auth/google/callback` | OAuth redirect URI |

---

## License

MIT — see [LICENSE](LICENSE).