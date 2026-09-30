import mongoose from 'mongoose'

const requestLogSchema = new mongoose.Schema(
  {
    // null for guest sessions
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    // e.g. "Guest 1" — set for anonymous sessions, null for authenticated
    guestLabel: {
      type: String,
      default: null,
    },
    // the ephemeral session/guest cookie ID that ties anonymous requests together
    guestId: {
      type: String,
      default: null,
      index: true,
    },
    sessionId: {
      type: String,
      default: null,
    },
    // 'chat' | 'upload'
    type: {
      type: String,
      enum: ['chat', 'upload'],
      required: true,
    },
  },
  { timestamps: true }
)

export const RequestLog = mongoose.model('RequestLog', requestLogSchema)
