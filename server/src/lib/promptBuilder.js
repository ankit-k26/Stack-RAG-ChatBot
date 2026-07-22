const BASE_PERSONA =
  'You are Stacks, a concise, honest assistant that answers questions about a ' +
  "document the user has uploaded. You never invent facts that aren't in the " +
  'context you are given.'

/**
 * No file has been uploaded for this session at all.
 */
function noDocumentSystemPrompt() {
  return (
    `${BASE_PERSONA}\n\n` +
    'No document has been uploaded in this conversation yet. If the user asks ' +
    'a question that depends on a document, tell them plainly that you don\'t ' +
    'have a file to reference and ask them to upload one with the upload ' +
    'button next to the message box. You can still make normal small talk or ' +
    'answer general questions that don\'t require a specific document, but ' +
    'never pretend to have read a file that was not provided.'
  )
}

/**
 * A document exists, but retrieval didn't find anything relevant enough
 * to the current question.
 */
function noRelevantContextSystemPrompt(fileName) {
  return (
    `${BASE_PERSONA}\n\n` +
    `The user has uploaded "${fileName}", but a search over that document found ` +
    "nothing relevant to their latest question. Tell them honestly that you " +
    "couldn't find anything about that in the uploaded document — don't guess " +
    'or fabricate an answer from the document. You may offer a brief general ' +
    "answer if you're confident and clearly label it as not coming from the " +
    'document, or suggest they rephrase the question.'
  )
}

/**
 * A document exists and retrieval found relevant chunks.
 */
function groundedSystemPrompt(fileName, contextChunks) {
  const context = contextChunks
    .map((chunk, i) => `[Excerpt ${i + 1}]\n${chunk}`)
    .join('\n\n')

  return (
    `${BASE_PERSONA}\n\n` +
    `Answer the user's question using the excerpts below, retrieved from the ` +
    `document "${fileName}". If the excerpts only partially answer the ` +
    "question, answer what you can and say what's missing. If they don't " +
    "answer it at all, say you couldn't find that in the document rather " +
    'than guessing.\n\n' +
    `${context}`
  )
}

/**
 * @param {object} params
 * @param {boolean} params.hasDocument
 * @param {string|null} params.fileName
 * @param {Array<{score:number, payload:{text:string}}>} params.matches
 * @param {number} params.scoreThreshold
 * @param {Array<{role:string, content:string}>} params.history
 * @param {string} params.question
 * @returns {{messages: Array<{role:string,content:string}>, contextFound: boolean}}
 */
export function buildChatMessages({ hasDocument, fileName, matches, scoreThreshold, history, question }) {
  let systemPrompt
  let contextFound = false

  if (!hasDocument) {
    systemPrompt = noDocumentSystemPrompt()
  } else {
    const relevant = (matches || []).filter((m) => m.score >= scoreThreshold)
    if (relevant.length === 0) {
      systemPrompt = noRelevantContextSystemPrompt(fileName)
    } else {
      contextFound = true
      systemPrompt = groundedSystemPrompt(
        fileName,
        relevant.map((m) => m.payload.text),
      )
    }
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: question },
  ]

  return { messages, contextFound }
}
