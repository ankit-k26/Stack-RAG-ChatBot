export function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated. Please log in.' })
  }
  next()
}

export function requireAdmin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated. Please log in.' })
  }
  if (!req.session.isAdmin) {
    return res.status(403).json({ error: 'Admin access required.' })
  }
  next()
}
