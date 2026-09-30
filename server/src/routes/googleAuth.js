import { Router } from 'express'
import passport from 'passport'
import { config } from '../config.js'

// ── Lazy strategy registration ────────────────────────────────────────────────
// Only register the Google strategy when credentials are actually configured.
// Without this guard the server crashes on startup when the env vars are absent.

let strategyRegistered = false

async function ensureStrategy() {
  if (strategyRegistered) return
  if (!config.google.clientId || !config.google.clientSecret) return

  const { Strategy: GoogleStrategy } = await import('passport-google-oauth20')
  const { User } = await import('../models/User.js')

  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase()
          if (!email) return done(null, false, { message: 'No email from Google.' })

          // Find or create the user by googleId or email
          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] })

          if (!user) {
            // New user — generate a unique username
            const base = (profile.displayName || 'user').replace(/\s+/g, '').toLowerCase().slice(0, 20)
            let username = base
            let suffix = 0
            while (await User.findOne({ username })) {
              suffix++
              username = `${base}${suffix}`
            }
            user = new User({
              username,
              email,
              googleId: profile.id,
              displayName: profile.displayName || username,
              avatarUrl: profile.photos?.[0]?.value || null,
              // Sentinel hash — OAuth users have no password
              passwordHash: 'oauth-no-password',
            })
          } else if (!user.googleId) {
            // Existing email-based user linking Google for the first time
            user.googleId = profile.id
            user.avatarUrl = user.avatarUrl || profile.photos?.[0]?.value || null
          }

          await user.save()
          return done(null, user)
        } catch (err) {
          return done(err)
        }
      }
    )
  )

  // Minimal serialize: store just the user id in the session
  passport.serializeUser((user, done) => done(null, user._id.toString()))
  passport.deserializeUser(async (id, done) => {
    try {
      const { User } = await import('../models/User.js')
      const user = await User.findById(id)
      done(null, user)
    } catch (err) {
      done(err)
    }
  })

  strategyRegistered = true
}

// ── Router ────────────────────────────────────────────────────────────────────

export const googleAuthRouter = Router()

// Guard middleware — responds with a clear message when credentials are missing
function requireGoogleConfig(req, res, next) {
  if (!config.google.clientId || !config.google.clientSecret) {
    return res.status(501).json({
      error: 'Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to server/.env',
    })
  }
  next()
}

// Kick off Google OAuth flow
googleAuthRouter.get('/', requireGoogleConfig, async (req, res, next) => {
  await ensureStrategy()
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next)
})

// Google redirects here after user consents
googleAuthRouter.get('/callback', requireGoogleConfig, async (req, res, next) => {
  await ensureStrategy()
  passport.authenticate('google', {
    failureRedirect: `${config.clientOrigin}?auth_error=google_failed`,
    session: false,
  })(req, res, (err) => {
    if (err) return next(err)
    // passport attaches the user to req.user on success
    req.session.userId = req.user._id.toString()
    req.session.isAdmin = req.user.isAdmin
    req.session.save(() => {
      res.redirect(`${config.clientOrigin}?auth_success=1`)
    })
  })
})
