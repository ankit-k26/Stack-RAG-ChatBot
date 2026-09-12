import 'dotenv/config'

function int(value, fallback) {
  const n = parseInt(value, 10)
  return Number.isFinite(n) ? n : fallback
}

function float(value, fallback) {
  const n = parseFloat(value)
  return Number.isFinite(n) ? n : fallback
}

export const config = {
  port: int(process.env.PORT, 3001),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',

  // ── Gemini API (replaces local Ollama) ──────────────────────────────────
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    // gemini-2.0-flash: fast, generous free quota, great for RAG
    chatModel: process.env.GEMINI_CHAT_MODEL || 'gemini-2.0-flash',
    // text-embedding-004: 768-dim vectors, ideal for retrieval tasks
    embedModel: process.env.GEMINI_EMBED_MODEL || 'text-embedding-004',
  },

  qdrant: {
    url: process.env.QDRANT_URL || 'http://127.0.0.1:6333',
    apiKey: process.env.QDRANT_API_KEY || undefined,
    collectionPrefix: process.env.QDRANT_COLLECTION_PREFIX || 'stacks_session_',
  },

  retrieval: {
    chunkSize: int(process.env.CHUNK_SIZE, 1200),
    chunkOverlap: int(process.env.CHUNK_OVERLAP, 150),
    topK: int(process.env.TOP_K, 5),
    scoreThreshold: float(process.env.SCORE_THRESHOLD, 0.45),
  },

  upload: {
    maxUploadMb: int(process.env.MAX_UPLOAD_MB, 20),
  },

  mongo: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stacks_rag',
  },

  session: {
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    maxAgeMs: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
}
