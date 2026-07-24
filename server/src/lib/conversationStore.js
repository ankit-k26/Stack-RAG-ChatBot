import { Conversation } from '../models/Conversation.js'

// All functions are no-ops when userId is falsy, so guest/logged-out
// traffic never touches MongoDB — only the in-memory sessionStore applies.
// A conversation document is only ever created lazily, inside
// recordExchange, the first time a real message is sent.

export async function recordUpload(sessionId, userId, { fileName, chunkCount }) {
  if (!userId) return null
  return Conversation.findOneAndUpdate(
    { sessionId, userId },
    { $set: { fileName, chunkCount } },
    { upsert: true, new: true }
  )
}

export async function recordExchange(sessionId, userId, userMessage, assistantMessage) {
  if (!userId) return null

  const existing = await Conversation.findOne({ sessionId, userId }, { title: 1 })
  const title = existing?.title ?? userMessage.slice(0, 60)

  return Conversation.findOneAndUpdate(
    { sessionId, userId },
    {
      $setOnInsert: { sessionId, userId },
      $set: { title },
      $push: {
        messages: {
          $each: [
            { role: 'user', content: userMessage },
            { role: 'assistant', content: assistantMessage },
          ],
        },
      },
    },
    { upsert: true, new: true }
  )
}

export async function listConversations(userId) {
  if (!userId) return []
  return Conversation.find({ userId })
    .sort({ updatedAt: -1 })
    .select('sessionId title fileName updatedAt createdAt')
}

export async function getConversation(sessionId, userId) {
  if (!userId) return null
  return Conversation.findOne({ sessionId, userId })
}

export async function renameConversation(sessionId, userId, title) {
  if (!userId) return null
  return Conversation.findOneAndUpdate(
    { sessionId, userId },
    { $set: { title } },
    { new: true }
  )
}

export async function deleteConversation(sessionId, userId) {
  if (!userId) return null
  return Conversation.findOneAndDelete({ sessionId, userId })
}