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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm animate-fadeInUp rounded-xl2 border border-ink/10 bg-paper p-6
                   shadow-lift dark:border-paper/10 dark:bg-ink-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink dark:text-paper">
          {mode === 'login' ? 'Log in' : 'Create an account'}
        </h2>
        <p className="mt-1 text-sm text-ink/50 dark:text-paper/50">
          {mode === 'login' ? 'Welcome back to Stacks.' : 'Join Stacks to save your chats.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          {mode === 'login' ? (
            <input
              type="text"
              placeholder="Email or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-sm text-ink
                         placeholder:text-ink/35 focus:border-gold focus:outline-none
                         dark:border-paper/15 dark:bg-ink dark:text-paper dark:placeholder:text-paper/35"
            />
          ) : (
            <>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-sm text-ink
                           placeholder:text-ink/35 focus:border-gold focus:outline-none
                           dark:border-paper/15 dark:bg-ink dark:text-paper dark:placeholder:text-paper/35"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-sm text-ink
                           placeholder:text-ink/35 focus:border-gold focus:outline-none
                           dark:border-paper/15 dark:bg-ink dark:text-paper dark:placeholder:text-paper/35"
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
            className="rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-sm text-ink
                       placeholder:text-ink/35 focus:border-gold focus:outline-none
                       dark:border-paper/15 dark:bg-ink dark:text-paper dark:placeholder:text-paper/35"
          />

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 rounded-lg bg-ink px-3 py-2.5 text-sm font-medium text-paper
                       transition-colors duration-150 hover:bg-ink-soft disabled:opacity-60
                       dark:bg-gold-soft dark:text-ink dark:hover:bg-gold"
          >
            {submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-ink/50 dark:text-paper/50">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError('')
            }}
            className="font-medium text-gold-dim hover:underline dark:text-gold-soft"
          >
            {mode === 'login' ? 'Register' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}
