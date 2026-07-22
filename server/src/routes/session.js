import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getOrCreateSession } from '../lib/sessionStore.js'

export const sessionRouter = Router()

sessionRouter.post('/new', (req, res) => {
  const sessionId = uuidv4()
  getOrCreateSession(sessionId)
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
