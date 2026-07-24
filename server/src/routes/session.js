import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getOrCreateSession } from '../lib/sessionStore.js'
import { listConversations, getConversation, renameConversation, deleteConversation } from '../lib/conversationStore.js'
import { requireAuth } from '../middleware/auth.js'

export const sessionRouter = Router()

sessionRouter.post('/new', (req, res) => {
  const sessionId = uuidv4()
  getOrCreateSession(sessionId)
  // Nothing gets written to Mongo here on purpose — a conversation is only
  // persisted once an actual message is exchanged (see recordExchange in
  // conversationStore.js, called from chat.js). Otherwise every page
  // refresh / new-chat click would create an empty "Untitled chat" entry.
  res.json({ sessionId })
})

sessionRouter.get('/:sessionId/status', (req, res) => {
  const { sessionId } = req.params
  const session = getOrCreateSession(sessionId)
  res.json({
    hasDocument: session.hasDocument,
    fileName: session.fileName,
    chunkCount: session.chunkCount,
  })
})

// Logged-in users only — lists their saved conversations
sessionRouter.get('/history', requireAuth, async (req, res) => {
  const conversations = await listConversations(req.session.userId)
  res.json({ conversations })
})

// Logged-in users only — full messages for one saved conversation
sessionRouter.get('/history/:sessionId', requireAuth, async (req, res) => {
  const conversation = await getConversation(req.params.sessionId, req.session.userId)
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found.' })
  }
  res.json({ conversation })
})

// Logged-in users only — rename a saved conversation
sessionRouter.patch('/history/:sessionId', requireAuth, async (req, res) => {
  const { title } = req.body
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'A title is required.' })
  }
  const conversation = await renameConversation(req.params.sessionId, req.session.userId, title.trim())
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found.' })
  }
  res.json({ conversation })
})

// Logged-in users only — delete a saved conversation
sessionRouter.delete('/history/:sessionId', requireAuth, async (req, res) => {
  const conversation = await deleteConversation(req.params.sessionId, req.session.userId)
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found.' })
  }
  res.json({ ok: true })
})