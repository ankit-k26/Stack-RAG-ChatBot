import { Router } from 'express'
import { User } from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'

export const authRouter = Router()

authRouter.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are all required.' })
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' })
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    })
    if (existing) {
      return res.status(409).json({ error: 'Username or email is already taken.' })
    }

    const user = new User({ username, email, password })
    await user.save()

    req.session.userId = user._id.toString()
    req.session.isAdmin = user.isAdmin

    res.status(201).json({ user })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Something went wrong creating your account. Please try again.' })
  }
})

// Accepts either "email" or "username" in the `identifier` field
authRouter.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username/email and password are required.' })
    }

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
    })

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials.' })
    }

    req.session.userId = user._id.toString()
    req.session.isAdmin = user.isAdmin

    res.json({ user })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Something went wrong logging you in. Please try again.' })
  }
})

authRouter.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err)
      return res.status(500).json({ error: 'Could not log out. Please try again.' })
    }
    res.clearCookie('connect.sid')
    res.json({ ok: true })
  })
})

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.session.userId)
  if (!user) {
    return res.status(401).json({ error: 'Session user no longer exists.' })
  }
  res.json({ user })
})
