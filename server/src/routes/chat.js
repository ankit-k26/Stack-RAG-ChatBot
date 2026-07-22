import { Router } from 'express'
import { config } from '../config.js'
import { embed, chat as chatModel } from '../lib/ollamaClient.js'
import { collectionNameFor, search } from '../lib/qdrantClient.js'
import { getOrCreateSession, appendHistory } from '../lib/sessionStore.js'
import { buildChatMessages } from '../lib/promptBuilder.js'

export const chatRouter = Router()

chatRouter.post('/', async (req, res) => {
  const { sessionId, message } = req.body

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' })
  }
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'message is required' })
  }

  const session = getOrCreateSession(sessionId)

  try {
    let matches = []

    if (session.hasDocument) {
      const [queryVector] = await embed(message)
      matches = await search(collectionNameFor(sessionId), queryVector, {
        limit: config.retrieval.topK,
        // Ask Qdrant to only bother returning candidates anywhere close;
        // the real cutoff for "relevant enough" is applied in the prompt
        // builder so we can still tell the user honestly when nothing
        // useful came back.
        scoreThreshold: undefined,
      })
    }

    const { messages, contextFound } = buildChatMessages({
      hasDocument: session.hasDocument,
      fileName: session.fileName,
      matches,
      scoreThreshold: config.retrieval.scoreThreshold,
      history: session.history,
      question: message,
    })

    const reply = await chatModel(messages)

    appendHistory(sessionId, 'user', message)
    appendHistory(sessionId, 'assistant', reply)

    res.json({
      reply,
      hasDocument: session.hasDocument,
      contextFound,
      sources: session.hasDocument
        ? matches
            .filter((m) => m.score >= config.retrieval.scoreThreshold)
            .map((m) => ({ score: m.score, chunkIndex: m.payload.chunkIndex }))
        : [],
    })
  } catch (err) {
    console.error('Chat request failed:', err)
    res.status(502).json({
      error:
        'Could not reach the language model right now. Make sure Ollama is running and try again.',
    })
  }
})
