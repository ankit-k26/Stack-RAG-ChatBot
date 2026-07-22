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

  ollama: {
    host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
    chatModel: process.env.OLLAMA_CHAT_MODEL || 'gemma4:31b-cloud',
    embedModel: process.env.OLLAMA_EMBED_MODEL || 'qwen3-embedding:0.6b',
  },

  qdrant: {
    url: process.env.QDRANT_URL || 'http://127.0.0.1:8333',
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
}
