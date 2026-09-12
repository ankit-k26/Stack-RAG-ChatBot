import { GoogleGenAI } from '@google/genai'
import { config } from '../config.js'

// Single SDK client — reused for all requests to avoid re-auth overhead.
const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey })

// ── Message format conversion ─────────────────────────────────────────────
//
// The rest of the app uses an Ollama-style message array:
//   { role: 'system' | 'user' | 'assistant', content: string }
//
// Gemini expects:
//   systemInstruction: string  (separate from the conversation)
//   contents: [{ role: 'user' | 'model', parts: [{ text }] }]
//
function toGemini(messages) {
  let systemInstruction = ''
  const contents = []

  for (const m of messages) {
    if (m.role === 'system') {
      systemInstruction = m.content
    } else {
      contents.push({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })
    }
  }

  return { systemInstruction, contents }
}

/**
 * Send a chat completion request to Gemini.
 * Drop-in replacement for the old ollamaClient.chat().
 *
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<string>} the assistant's reply text
 */
export async function chat(messages) {
  const { systemInstruction, contents } = toGemini(messages)

  const response = await ai.models.generateContent({
    model: config.gemini.chatModel,
    contents,
    config: { systemInstruction },
  })

  return response.text
}

// How many embed requests to fire in parallel per batch.
// Keeps us within free-tier rate limits (15 RPM for text-embedding-004).
// Paid tier has much higher limits — raise this constant if needed.
const EMBED_CONCURRENCY = 10

/**
 * Embed one or more strings via Gemini text-embedding-004.
 * Drop-in replacement for the old ollamaClient.embed().
 *
 * @param {string | string[]} input  A single string or an array of strings.
 * @param {'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY'} taskType
 *   Use RETRIEVAL_QUERY when embedding a user's search question,
 *   RETRIEVAL_DOCUMENT when indexing document chunks (default).
 * @returns {Promise<number[][]>} one 768-dimensional vector per input string
 */
export async function embed(input, taskType = 'RETRIEVAL_DOCUMENT') {
  const inputs = Array.isArray(input) ? input : [input]
  const allVectors = []

  // Process in bounded parallel batches to respect API rate limits.
  for (let i = 0; i < inputs.length; i += EMBED_CONCURRENCY) {
    const batch = inputs.slice(i, i + EMBED_CONCURRENCY)
    const responses = await Promise.all(
      batch.map((text) =>
        ai.models.embedContent({
          model: config.gemini.embedModel,
          contents: text,
          config: { taskType },
        })
      )
    )
    allVectors.push(...responses.map((r) => r.embeddings[0].values))
  }

  return allVectors
}
