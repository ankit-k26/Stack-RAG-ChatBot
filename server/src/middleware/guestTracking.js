import { v4 as uuidv4 } from 'uuid'
import { RequestLog } from '../models/RequestLog.js'

// In-memory map from guestId → "Guest N" label, so labels are stable across
// the lifetime of the server process even without a DB round-trip.
const guestLabelMap = new Map()
let guestCounter = 0

/**
 * Middleware — attaches req.guestId for anonymous sessions.
 * Also exposes req.resolveGuestLabel() to get "Guest N" on demand.
 */
export function guestTrackingMiddleware(req, res, next) {
  // Authenticated users don't need a guest ID
  if (req.session?.userId) {
    req.guestId = null
    return next()
  }

  const COOKIE = 'gx-guest-id'
  let guestId = req.cookies?.[COOKIE]

  if (!guestId) {
    guestId = uuidv4()
    res.cookie(COOKIE, guestId, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  }

  req.guestId = guestId

  if (!guestLabelMap.has(guestId)) {
    guestLabelMap.set(guestId, `Guest ${++guestCounter}`)
  }

  next()
}

/**
 * Record a single request event.
 * Call this from chat.js and upload.js after successful processing.
 */
export async function logRequest(req, type) {
  try {
    const userId = req.session?.userId ?? null
    const guestId = userId ? null : req.guestId
    const guestLabel = userId ? null : (guestLabelMap.get(guestId) ?? null)
    const sessionId = req.body?.sessionId ?? req.params?.sessionId ?? null

    await RequestLog.create({ userId, guestId, guestLabel, sessionId, type })
  } catch (err) {
    // Analytics must never crash the main path
    console.error('[logRequest] failed:', err.message)
  }
}
