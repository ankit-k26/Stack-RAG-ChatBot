import { Router } from 'express'
import { User } from '../models/User.js'
import { RequestLog } from '../models/RequestLog.js'
import { requireAdmin } from '../middleware/auth.js'

export const adminRouter = Router()

// All admin routes require admin auth
adminRouter.use(requireAdmin)

/**
 * GET /api/admin/stats
 * Overview numbers for the dashboard header cards.
 */
adminRouter.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalRequests, todayRequests] = await Promise.all([
      User.countDocuments(),
      RequestLog.countDocuments(),
      RequestLog.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
    ])

    res.json({ totalUsers, totalRequests, todayRequests })
  } catch (err) {
    console.error('Admin stats error:', err)
    res.status(500).json({ error: 'Failed to fetch stats.' })
  }
})

/**
 * GET /api/admin/users
 * List of all registered users with their request counts + last active date.
 */
adminRouter.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-passwordHash -__v').lean()

    // Aggregate request counts per userId in one query
    const counts = await RequestLog.aggregate([
      { $match: { userId: { $ne: null } } },
      {
        $group: {
          _id: '$userId',
          requestCount: { $sum: 1 },
          lastActive: { $max: '$createdAt' },
        },
      },
    ])

    const countMap = {}
    for (const c of counts) {
      countMap[c._id.toString()] = { requestCount: c.requestCount, lastActive: c.lastActive }
    }

    const result = users.map((u) => ({
      ...u,
      requestCount: countMap[u._id.toString()]?.requestCount ?? 0,
      lastActive: countMap[u._id.toString()]?.lastActive ?? null,
    }))

    res.json({ users: result })
  } catch (err) {
    console.error('Admin users error:', err)
    res.status(500).json({ error: 'Failed to fetch users.' })
  }
})

/**
 * GET /api/admin/guests
 * List of guest identities with their request counts + last active.
 */
adminRouter.get('/guests', async (req, res) => {
  try {
    const guests = await RequestLog.aggregate([
      { $match: { userId: null, guestId: { $ne: null } } },
      {
        $group: {
          _id: '$guestId',
          guestLabel: { $first: '$guestLabel' },
          requestCount: { $sum: 1 },
          lastActive: { $max: '$createdAt' },
          firstSeen: { $min: '$createdAt' },
        },
      },
      { $sort: { lastActive: -1 } },
    ])

    res.json({ guests })
  } catch (err) {
    console.error('Admin guests error:', err)
    res.status(500).json({ error: 'Failed to fetch guests.' })
  }
})

/**
 * POST /api/admin/users/:id/toggle-admin
 * Toggles a user's admin status.
 */
adminRouter.post('/users/:id/toggle-admin', async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id)
    if (!targetUser) return res.status(404).json({ error: 'User not found' })

    // Prevent toggling oneself to avoid accidental lockout
    if (targetUser._id.toString() === req.session.userId) {
      return res.status(400).json({ error: 'Cannot toggle your own admin status.' })
    }

    targetUser.isAdmin = !targetUser.isAdmin
    await targetUser.save()

    res.json({ success: true, isAdmin: targetUser.isAdmin })
  } catch (err) {
    console.error('Admin toggle error:', err)
    res.status(500).json({ error: 'Failed to update user.' })
  }
})
