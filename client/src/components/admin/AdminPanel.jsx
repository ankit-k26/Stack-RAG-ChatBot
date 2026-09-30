import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldIcon, XIcon, UsersIcon, MessageSquareIcon, CalendarIcon, Loader2Icon, RefreshCwIcon, UserIcon, GhostIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Badge from '../ui/Badge.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function fetchAdmin(path, options = {}) {
  const res = await fetch(`${API_URL}/api/admin${path}`, { ...options, credentials: 'include' })
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    throw new Error(errData.error || 'Failed to fetch admin data')
  }
  return res.json()
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="admin-stat-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="admin-stat-label">{label}</span>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: `${color}15`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color,
        }}>
          <Icon size={14} />
        </div>
      </div>
      <span className="admin-stat-value">{value ?? '—'}</span>
    </div>
  )
}

function UsersTab({ users, currentUser, onToggleAdmin }) {
  if (!users?.length) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)' }}>
        <UsersIcon size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
        <p>No registered users yet</p>
      </div>
    )
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th style={{ textAlign: 'right' }}>Requests</th>
            <th>Last Active</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSelf = u.username === currentUser?.username
            return (
              <tr key={u._id}>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 500 }}>{u.username}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{u.email}</span>
                  </div>
                </td>
                <td>
                  <button
                    onClick={() => onToggleAdmin(u._id)}
                    disabled={isSelf}
                    style={{
                      cursor: isSelf ? 'not-allowed' : 'pointer',
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      opacity: isSelf ? 0.6 : 1,
                      fontFamily: 'inherit'
                    }}
                    title={isSelf ? "You cannot change your own role" : `Click to ${u.isAdmin ? 'revoke' : 'grant'} admin access`}
                  >
                    <Badge variant={u.isAdmin ? 'admin' : 'user'}>
                      {u.isAdmin ? 'Admin' : 'User'}
                    </Badge>
                  </button>
                </td>
              <td style={{ textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {u.requestCount}
              </td>
              <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {u.lastActive
                  ? formatDistanceToNow(new Date(u.lastActive), { addSuffix: true })
                  : 'Never'}
              </td>
            </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function GuestsTab({ guests }) {
  if (!guests?.length) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)' }}>
        <GhostIcon size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
        <p>No guest sessions recorded yet</p>
      </div>
    )
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Guest ID</th>
            <th>Type</th>
            <th style={{ textAlign: 'right' }}>Requests</th>
            <th>First Seen</th>
            <th>Last Active</th>
          </tr>
        </thead>
        <tbody>
          {guests.map((g) => (
            <tr key={g._id}>
              <td>
                <span style={{ fontWeight: 500 }}>{g.guestLabel || 'Unknown Guest'}</span>
              </td>
              <td><Badge variant="guest">Guest</Badge></td>
              <td style={{ textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {g.requestCount}
              </td>
              <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {g.firstSeen
                  ? formatDistanceToNow(new Date(g.firstSeen), { addSuffix: true })
                  : '—'}
              </td>
              <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {g.lastActive
                  ? formatDistanceToNow(new Date(g.lastActive), { addSuffix: true })
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AdminPanel({ onClose }) {
  const { user: currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('users')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState(null)
  const [guests, setGuests] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const handleToggleAdmin = async (userId) => {
    try {
      const res = await fetchAdmin(`/users/${userId}/toggle-admin`, { method: 'POST' })
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isAdmin: res.isAdmin } : u))
        )
      }
    } catch (err) {
      alert(err.message)
    }
  }

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const [s, u, g] = await Promise.all([
        fetchAdmin('/stats'),
        fetchAdmin('/users'),
        fetchAdmin('/guests'),
      ])
      setStats(s)
      setUsers(u.users)
      setGuests(g.guests)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          className="admin-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Panel */}
        <motion.aside
          className="admin-panel"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          role="complementary"
          aria-label="Admin panel"
        >
          {/* Header */}
          <div className="admin-header">
            <div className="admin-title">
              <div className="admin-title-icon">
                <ShieldIcon size={16} />
              </div>
              Admin Panel
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                className="icon-btn"
                onClick={load}
                title="Refresh"
                disabled={loading}
              >
                <RefreshCwIcon size={15} style={loading ? { animation: 'spin 0.7s linear infinite' } : undefined} />
              </button>
              <button className="icon-btn" onClick={onClose} aria-label="Close admin panel">
                <XIcon size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="admin-body">
            {loading && !stats ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                <div className="spinner" />
              </div>
            ) : error ? (
              <div style={{ color: 'var(--error)', textAlign: 'center', padding: '40px 0' }}>
                <p>{error}</p>
                <button onClick={load} style={{ marginTop: 12, color: 'var(--accent-blue)', fontSize: 13 }}>
                  Try again
                </button>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="admin-stats-row">
                  <StatCard label="Total Users" value={stats?.totalUsers} icon={UsersIcon} color="var(--accent-blue)" />
                  <StatCard label="Today's Requests" value={stats?.todayRequests} icon={MessageSquareIcon} color="var(--accent-violet)" />
                  <StatCard label="All-Time Requests" value={stats?.totalRequests} icon={CalendarIcon} color="var(--accent-cyan)" />
                </div>

                {/* Tabs */}
                <div className="admin-tabs">
                  <button
                    className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <UserIcon size={13} /> Users ({users?.length ?? 0})
                    </span>
                  </button>
                  <button
                    className={`admin-tab ${activeTab === 'guests' ? 'active' : ''}`}
                    onClick={() => setActiveTab('guests')}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <GhostIcon size={13} /> Guests ({guests?.length ?? 0})
                    </span>
                  </button>
                </div>

                {/* Table */}
                {activeTab === 'users' ? (
                  <UsersTab users={users} currentUser={currentUser} onToggleAdmin={handleToggleAdmin} />
                ) : (
                  <GuestsTab guests={guests} />
                )}
              </>
            )}
          </div>
        </motion.aside>
      </>
    </AnimatePresence>
  )
}
