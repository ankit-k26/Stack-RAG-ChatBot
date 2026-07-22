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
  const res = await fetch(`${API_URL}/api/session/new`, { method: 'POST' })
  return parseJsonOrThrow(res)
}

export async function getSessionStatus(sessionId) {
  const res = await fetch(`${API_URL}/api/session/${sessionId}/status`)
  return parseJsonOrThrow(res)
}

export async function uploadDocument(sessionId, file) {
  const formData = new FormData()
  formData.append('sessionId', sessionId)
  formData.append('file', file)

  const res = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  })
  return parseJsonOrThrow(res)
}

export async function sendMessage(sessionId, message) {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message }),
  })
  return parseJsonOrThrow(res)
}
