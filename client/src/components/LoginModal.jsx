import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginModal({ onClose }) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [identifier, setIdentifier] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(identifier, password)
      } else {
        await register(username, email, password)
      }
      onClose()
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  // Shared input class for all fields
  const inputCls = `w-full rounded-xl border border-black/[0.1] bg-cloud-overlay px-4 py-3 text-sm text-obsidian
                    placeholder:text-obsidian/35 transition-colors duration-150
                    focus:border-accent/45 focus:outline-none focus:ring-1 focus:ring-accent/25
                    dark:border-white/[0.1] dark:bg-obsidian dark:text-white dark:placeholder:text-white/30
                    dark:focus:border-accent/40`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm animate-fadeInUp rounded-2xl border border-black/[0.09] bg-cloud p-6 shadow-lift
                   dark:border-white/[0.1] dark:bg-obsidian-overlay"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-obsidian dark:text-white">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="mt-0.5 text-sm text-obsidian/50 dark:text-white/45">
              {mode === 'login' ? 'Log in to Stacks.' : 'Join Stacks to save your chats.'}
            </p>
          </div>
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                       text-obsidian/40 transition-colors hover:bg-black/[0.06] hover:text-obsidian
                       dark:text-white/35 dark:hover:bg-white/[0.08] dark:hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'login' ? (
            <input
              type="text"
              placeholder="Email or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className={inputCls}
            />
          ) : (
            <>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={inputCls}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputCls}
              />
            </>
          )}

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className={inputCls}
          />

          {error && (
            <p className="rounded-xl bg-red-500/[0.08] px-4 py-2.5 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          {/* Submit — teal accent button */}
          <button
            type="submit"
            disabled={submitting}
            className="mt-1 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-obsidian
                       transition-all duration-150 hover:bg-accent-dim hover:shadow-teal-glow
                       active:scale-[0.98] disabled:opacity-60"
          >
            {submitting
              ? 'Please wait…'
              : mode === 'login'
              ? 'Log in'
              : 'Create account'}
          </button>
        </form>

        {/* ── Mode switch ── */}
        <p className="mt-4 text-center text-sm text-obsidian/50 dark:text-white/40">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError('')
            }}
            className="font-semibold text-accent hover:underline"
          >
            {mode === 'login' ? 'Register' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}
