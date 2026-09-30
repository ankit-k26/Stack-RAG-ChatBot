import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XIcon, Loader2Icon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AuthModal({ onClose }) {
  const { login, register, loginWithGoogle } = useAuth()
  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' })
  const [regForm, setRegForm] = useState({ username: '', email: '', password: '' })

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      await login(loginForm.identifier, loginForm.password)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      await register(regForm.username, regForm.email, regForm.password)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="modal-box"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Close */}
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <XIcon size={16} />
          </button>

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'var(--accent-gradient)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 800, color: 'white',
              marginBottom: 16, boxShadow: 'var(--shadow-blue)',
            }}>
              S
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
              {tab === 'login' ? 'Welcome back' : 'Create an account'}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {tab === 'login'
                ? 'Sign in to access your conversation history'
                : 'Save your conversations and access them anywhere'}
            </p>
          </div>

          {/* Google */}
          <button className="btn-google" onClick={loginWithGoogle} type="button">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="divider">or</div>

          {/* Tabs */}
          <div className="modal-tabs">
            <button
              className={`modal-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => { setTab('login'); setError(null) }}
            >
              Sign In
            </button>
            <button
              className={`modal-tab ${tab === 'register' ? 'active' : ''}`}
              onClick={() => { setTab('register'); setError(null) }}
            >
              Register
            </button>
          </div>

          {/* Error */}
          {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="form-field">
                <label className="form-label" htmlFor="auth-identifier">Username or Email</label>
                <input
                  id="auth-identifier"
                  className="form-input"
                  type="text"
                  placeholder="john or john@example.com"
                  value={loginForm.identifier}
                  onChange={(e) => setLoginForm(p => ({ ...p, identifier: e.target.value }))}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="auth-password">Password</label>
                <input
                  id="auth-password"
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(p => ({ ...p, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                />
              </div>
              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Loader2Icon size={14} style={{ animation: 'spin 0.7s linear infinite' }} />
                  Signing in…
                </span> : 'Sign In'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister}>
              <div className="form-field">
                <label className="form-label" htmlFor="reg-username">Username</label>
                <input
                  id="reg-username"
                  className="form-input"
                  type="text"
                  placeholder="johndoe"
                  value={regForm.username}
                  onChange={(e) => setRegForm(p => ({ ...p, username: e.target.value }))}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  className="form-input"
                  type="email"
                  placeholder="john@example.com"
                  value={regForm.email}
                  onChange={(e) => setRegForm(p => ({ ...p, email: e.target.value }))}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  className="form-input"
                  type="password"
                  placeholder="At least 8 characters"
                  value={regForm.password}
                  onChange={(e) => setRegForm(p => ({ ...p, password: e.target.value }))}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Loader2Icon size={14} style={{ animation: 'spin 0.7s linear infinite' }} />
                  Creating account…
                </span> : 'Create Account'}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
