import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: false }
)

const conversationSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: null }, // set from the first user message
    fileName: { type: String, default: null },
    chunkCount: { type: Number, default: 0 },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true }
)

export const Conversation = mongoose.model('Conversation', conversationSchema)