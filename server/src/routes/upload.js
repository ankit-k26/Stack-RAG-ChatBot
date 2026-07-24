import { Router } from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { config } from '../config.js'
import { isSupportedFile, supportedExtensionsLabel, extractText } from '../lib/textExtract.js'
import { chunkText } from '../lib/chunker.js'
import { embed } from '../lib/ollamaClient.js'
import { collectionNameFor, recreateCollection, upsertChunks } from '../lib/qdrantClient.js'
import { setDocument } from '../lib/sessionStore.js'
import { recordUpload } from '../lib/conversationStore.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.upload.maxUploadMb * 1024 * 1024 },
})

export const uploadRouter = Router()

uploadRouter.post('/', upload.single('file'), async (req, res) => {
  const { sessionId } = req.body
  const file = req.file

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' })
  }
  if (!file) {
    return res.status(400).json({ error: 'No file was uploaded' })
  }
  if (!isSupportedFile(file.mimetype)) {
    return res.status(415).json({
      error: `Unsupported file type. Please upload a ${supportedExtensionsLabel()} file.`,
    })
  }

  try {
    const text = await extractText(file.buffer, file.mimetype)
    if (!text) {
      return res.status(422).json({ error: "Couldn't find any readable text in that file." })
    }

    const chunks = chunkText(text, {
      chunkSize: config.retrieval.chunkSize,
      overlap: config.retrieval.chunkOverlap,
    })
    if (chunks.length === 0) {
      return res.status(422).json({ error: "Couldn't find any readable text in that file." })
    }

    const vectors = await embed(chunks)
    const vectorSize = vectors[0]?.length
    if (!vectorSize) {
      throw new Error('Embedding model returned no vector')
    }

    const collectionName = collectionNameFor(sessionId)
    await recreateCollection(collectionName, vectorSize)

    const points = chunks.map((text, i) => ({
      id: uuidv4(),
      vector: vectors[i],
      payload: {
        text,
        chunkIndex: i,
        fileName: file.originalname,
      },
    }))
    await upsertChunks(collectionName, points)

    const session = setDocument(sessionId, {
      fileName: file.originalname,
      chunkCount: chunks.length,
      vectorSize,
    })

    await recordUpload(sessionId, req.session?.userId, {
      fileName: session.fileName,
      chunkCount: session.chunkCount,
    })

    res.json({
      fileName: session.fileName,
      chunkCount: session.chunkCount,
    })
  } catch (err) {
    console.error('Upload failed:', err)
    res.status(502).json({
      error:
        'Could not index that file right now. Make sure Ollama and Qdrant are running and reachable, then try again.',
    })
  }
})