import { GoogleGenAI } from '@google/genai'
import { config } from '../config.js'

// Single SDK client — reused for all requests to avoid re-auth overhead.
const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey })

// ── Model fallback chains ──────────────────────────────────────────────────
//
// When the primary model hits rate limits (429) or capacity issues (503),
// the client automatically retries with the next model in the chain.
// Order: best quality → fastest/cheapest.
//
// Override the primary via GEMINI_CHAT_MODEL / GEMINI_EMBED_MODEL in .env.
// The fallbacks are always the built-in tier list below.

// Ordered by quality → speed/cost. All model IDs are verified stable endpoints
// from the official Gemini API models page (https://ai.google.dev/gemini-api/docs/models).
// gemini-2.0-flash-lite and older aliases are deprecated — do not add them back.
const CHAT_FALLBACK_CHAIN = [
  config.gemini.chatModel,    // Primary — from .env
  'gemini-3.8-flash',         // Latest gen-3 flagship flash
  'gemini-3.7-flash',         // Previous gen-3 flash
  'gemini-3.6-flash',         // Multimodal everyday gen-3
  'gemini-3.5-flash',         // Stable legacy gen-3 flash
  'gemini-3.5-flash-lite',    // Fastest / cheapest gen-3
  'gemini-3.1-flash-lite',    // Rock-solid fallback of last resort
].filter((m, i, arr) => arr.indexOf(m) === i) // deduplicate if .env matches a chain entry

const EMBED_FALLBACK_CHAIN = [
  config.gemini.embedModel,   // Primary — from .env
  'gemini-embedding-001',     // Newer embedding model
  'text-embedding-004',       // Stable pin
].filter((m, i, arr) => arr.indexOf(m) === i)

// ── Retry helper ───────────────────────────────────────────────────────────
//
// Determines whether an error signals transient capacity pressure.
// Covers Gemini API HTTP codes and the SDK's error shapes.

function isOverloaded(err) {
  const status = err?.status ?? err?.httpStatus ?? err?.code
  const msg = (err?.message ?? '').toLowerCase()
  return (
    status === 429 ||                           // rate limit / quota
    status === 503 ||                           // service unavailable
    status === 500 ||                           // occasional server error
    status === 404 ||                           // model deprecated / removed — try next
    msg.includes('rate limit') ||
    msg.includes('quota') ||
    msg.includes('overloaded') ||
    msg.includes('resource exhausted') ||
    msg.includes('unavailable') ||
    msg.includes('no longer available') ||      // Google's deprecation message
    msg.includes('not found')                   // model endpoint gone
  )
}

/**
 * Run `fn(model)` through a fallback chain.
 *
 * On an overload error it immediately tries the next model with no delay —
 * the capacity problem is on the API side, not something a sleep fixes.
 * On the last model it throws so the caller can surface a real error.
 *
 * Logs a one-line warning on each fallback so operators know demand is high.
 *
 * @param {string[]} chain  Ordered list of model IDs to try.
 * @param {(model: string) => Promise<T>} fn  The API call factory.
 * @returns {Promise<T>}
 */
async function withFallback(chain, fn) {
  let lastErr
  for (let i = 0; i < chain.length; i++) {
    const model = chain[i]
    try {
      return await fn(model)
    } catch (err) {
      if (isOverloaded(err) && i < chain.length - 1) {
        console.warn(
          `[gemini] ${model} overloaded (${err?.status ?? err?.code ?? 'err'}) — ` +
          `falling back to ${chain[i + 1]}`
        )
        lastErr = err
        continue
      }
      // Not an overload error, or we've exhausted the chain — propagate immediately.
      throw err
    }
  }
  throw lastErr
}

// ── Message format conversion ──────────────────────────────────────────────
//
// The rest of the app uses an Ollama-style message array:
//   { role: 'system' | 'user' | 'assistant', content: string }
//
// Gemini expects:
//   systemInstruction: string  (separate from the conversation)
//   contents: [{ role: 'user' | 'model', parts: [{ text }] }]

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
 * Send a chat completion request to Gemini with automatic model fallback.
 * Falls back through CHAT_FALLBACK_CHAIN on rate-limit / overload errors.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<string>} the assistant's reply text
 */
export async function chat(messages, preferredModel) {
  const { systemInstruction, contents } = toGemini(messages)

  let chain = CHAT_FALLBACK_CHAIN
  if (preferredModel && preferredModel !== 'auto') {
    chain = [preferredModel, ...CHAT_FALLBACK_CHAIN.filter((m) => m !== preferredModel)]
  }

  return withFallback(chain, (model) =>
    ai.models
      .generateContent({
        model,
        contents,
        config: { systemInstruction },
      })
      .then((r) => r.text)
  )
}

// How many embed requests to fire in parallel per batch.
// Keeps us within free-tier rate limits (15 RPM for text-embedding-004).
const EMBED_CONCURRENCY = 10

/**
 * Embed one or more strings via Gemini with automatic model fallback.
 * Falls back through EMBED_FALLBACK_CHAIN on rate-limit / overload errors.
 *
 * @param {string | string[]} input  A single string or an array of strings.
 * @param {'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY'} taskType
 * @returns {Promise<number[][]>} one 768-dimensional vector per input string
 */
export async function embed(input, taskType = 'RETRIEVAL_DOCUMENT') {
  const inputs = Array.isArray(input) ? input : [input]
  const allVectors = []

  // Process in bounded parallel batches to respect API rate limits.
  for (let i = 0; i < inputs.length; i += EMBED_CONCURRENCY) {
    const batch = inputs.slice(i, i + EMBED_CONCURRENCY)

    const responses = await withFallback(EMBED_FALLBACK_CHAIN, (model) =>
      Promise.all(
        batch.map((text) =>
          ai.models.embedContent({
            model,
            contents: text,
            config: { taskType },
          })
        )
      )
    )

    allVectors.push(...responses.map((r) => r.embeddings[0].values))
  }

  return allVectors
}
