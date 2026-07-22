import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import { sessionRouter } from './routes/session.js'
import { uploadRouter } from './routes/upload.js'
import { chatRouter } from './routes/chat.js'

const app = express()

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true // only needed if you're sending cookies/auth headers
}));
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/api/session', sessionRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/chat', chatRouter)

// Multer and any other unhandled errors land here rather than crashing
// the process or leaking a raw stack trace to the client.
app.use((err, req, res, next) => {
  console.error(err)
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: `That file is larger than the ${config.upload.maxUploadMb}MB limit.`,
    })
  }
  res.status(500).json({ error: 'Something went wrong on the server.' })
})

app.listen(config.port, () => {
  console.log(`Stacks server listening on http://localhost:${config.port}`)
  console.log(`  Ollama:  ${config.ollama.host} (chat: ${config.ollama.chatModel}, embed: ${config.ollama.embedModel})`)
  console.log(`  Qdrant:  ${config.qdrant.url}`)
})
