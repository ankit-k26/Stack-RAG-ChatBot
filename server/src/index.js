import express from 'express'
import cors from 'cors'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import { config } from './config.js'
import { connectDB } from './lib/db.js'
import { sessionRouter } from './routes/session.js'
import { uploadRouter } from './routes/upload.js'
import { chatRouter } from './routes/chat.js'
import { authRouter } from './routes/auth.js'

await connectDB()

const app = express()
app.set('trust proxy', 1)

app.use(cors({
  origin: config.clientOrigin,
  credentials: true // needed so the login session cookie is sent/received
}));
app.use(express.json())

// Login sessions (stored in MongoDB) — separate from the in-memory chat
// sessionStore used for per-conversation document/history state.
app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: config.mongo.uri }),
  cookie: {
    httpOnly: true,
    maxAge: config.session.maxAgeMs,
    sameSite: 'none',
    secure: true, // set true in production (requires HTTPS)
  },
}))

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRouter)
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
  console.log(`  Gemini:  ${config.gemini.chatModel} / ${config.gemini.embedModel}`)
  console.log(`  Qdrant:  ${config.qdrant.url}`)
})
