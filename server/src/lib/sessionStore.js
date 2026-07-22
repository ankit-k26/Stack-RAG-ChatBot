/**
 * In-memory session state. One entry per browser tab/session:
 *   - hasDocument: whether a file has been uploaded and indexed
 *   - fileName / chunkCount: what's currently indexed, for UI + prompts
 *   - vectorSize: dimension of the embedding model's output, learned on
 *     first embed and reused so we create the Qdrant collection correctly
 *   - history: recent chat turns, used as short conversational context
 *
 * This resets if the server restarts. That's fine for this phase — it's
 * a natural place to swap in a real database (session doc + Mongo/Qdrant
 * metadata) later without touching the routes that use it.
 */
const sessions = new Map()

function createSession() {
  return {
    hasDocument: false,
    fileName: null,
    chunkCount: 0,
    vectorSize: null,
    history: [],
  }
}

export function getOrCreateSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, createSession())
  }
  return sessions.get(sessionId)
}

export function getSession(sessionId) {
  return sessions.get(sessionId) || null
}

export function setDocument(sessionId, { fileName, chunkCount, vectorSize }) {
  const session = getOrCreateSession(sessionId)
  session.hasDocument = true
  session.fileName = fileName
  session.chunkCount = chunkCount
  session.vectorSize = vectorSize
  session.history = []
  return session
}

export function clearDocument(sessionId) {
  const session = getOrCreateSession(sessionId)
  session.hasDocument = false
  session.fileName = null
  session.chunkCount = 0
  session.vectorSize = null
  return session
}

const MAX_HISTORY_TURNS = 6 // user+assistant pairs kept for short-term context

export function appendHistory(sessionId, role, content) {
  const session = getOrCreateSession(sessionId)
  session.history.push({ role, content })
  const maxMessages = MAX_HISTORY_TURNS * 2
  if (session.history.length > maxMessages) {
    session.history = session.history.slice(-maxMessages)
  }
  return session
}
