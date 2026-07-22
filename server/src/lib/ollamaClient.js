import { Ollama } from 'ollama'
import { config } from '../config.js'

// A single configured client, pointed at whatever OLLAMA_HOST is set to.
// Kept thin on purpose — this is the only place that talks to Ollama, so
// swapping models or hosts later only touches this file.
const ollama = new Ollama({ host: config.ollama.host })

/**
 * Send a chat completion request.
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<string>} the assistant's reply text
 */
export async function chat(messages) {
  const response = await ollama.chat({
    model: config.ollama.chatModel,
    messages,
    stream: false,
  })
  return response.message.content
}

/**
 * Embed one or more strings.
 * @param {string | string[]} input
 * @returns {Promise<number[][]>} one embedding vector per input string
 */
export async function embed(input) {
  const response = await ollama.embed({
    model: config.ollama.embedModel,
    input,
  })
  return response.embeddings
}
