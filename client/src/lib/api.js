const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function parseJsonOrThrow(response) {
  let body = null
  try {
    body = await response.json()
  } catch {
    // no JSON body — fall through to the generic error below
  }
  if (!response.ok) {
    throw new Error(body?.error || `Request failed with status ${response.status}`)
  }
  return body
}

export async function createSession() {
  const res = await fetch(`${API_URL}/api/session/new`, {
    method: 'POST',
    credentials: 'include',
  })
  return parseJsonOrThrow(res)
}

export async function getSessionStatus(sessionId) {
  const res = await fetch(`${API_URL}/api/session/${sessionId}/status`, {
    credentials: 'include',
  })
  return parseJsonOrThrow(res)
}

export async function uploadDocument(sessionId, file) {
  const formData = new FormData()
  formData.append('sessionId', sessionId)
  formData.append('file', file)

  const res = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  return parseJsonOrThrow(res)
}

export async function sendMessage(sessionId, message) {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message }),
  })
  return parseJsonOrThrow(res)
}

// Only returns data for logged-in users — 401s are treated as "no history"
// rather than an error, since guests simply don't have any.
export async function fetchConversationHistory() {
  const res = await fetch(`${API_URL}/api/session/history`, {
    credentials: 'include',
  })
  if (res.status === 401) return { conversations: [] }
  return parseJsonOrThrow(res)
}

export async function fetchConversation(sessionId) {
  const res = await fetch(`${API_URL}/api/session/history/${sessionId}`, {
    credentials: 'include',
  })
  return parseJsonOrThrow(res)
}

export async function renameConversation(sessionId, title) {
  const res = await fetch(`${API_URL}/api/session/history/${sessionId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  return parseJsonOrThrow(res)
}

export async function deleteConversation(sessionId) {
  const res = await fetch(`${API_URL}/api/session/history/${sessionId}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  return parseJsonOrThrow(res)
}

// --- Auth ---

export async function registerUser(username, email, password) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  })
  return parseJsonOrThrow(res)
}

export async function loginUser(identifier, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  })
  return parseJsonOrThrow(res)
}

export async function logoutUser() {
  const res = await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
  return parseJsonOrThrow(res)
}

export async function fetchCurrentUser() {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    credentials: 'include',
  })
  if (res.status === 401) return { user: null }
  return parseJsonOrThrow(res)
}