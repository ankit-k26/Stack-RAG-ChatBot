import { useState, useEffect, useRef } from 'react'
import { X, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

function GoogleIcon() {
  return (
    <svg width=16 height=16 viewBox=0 0 18 18 fill=none>
      <path d=M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z fill=#4285F4/>
      <path d=M9 18c2.43 0 4.467-.806 5.956-2.184l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z fill=#34A853/>
      <path d=M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z fill=#FBBC05/>
      <path d=M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z fill=#EA4335/>
    </svg>
  )
}

export default function LoginModal({ onClose }) {
  const { login, register, loginWithGoogle } = useAuth()
  const [mode, setMode] = useState('login')
  const [identifier, setIdentifier] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const firstRef = useRef(null)

  useEffect(() => { setTimeout(() => firstRef.current?.focus(), 60) }, [mode])
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login')
    setError(null); setIdentifier(''); setEmail(''); setUsername(''); setPassword('')
  }

  const submit = async (e) => {
    e.preventDefault(); setError(null); setLoading(true)
    try {
      if (mode === 'login') await login(identifier, password)
      else await register(username, email, password)
      onClose()
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally { setLoading(false) }
  }

  return (
    <div className=modal-backdrop onClick={onClose}>
      <div className=modal-panel onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button className=modal-close onClick={onClose} aria-label=Close><X size={16}/></button>

        {/* Header */}
        <div className=modal-header>
          <div className=modal-logo>
            <svg width=20 height=20 viewBox=0 0 32 32 fill=none>
              <rect x=4 y=20 width=24 height=4 rx=2 fill=#00C9B1 opacity=.5/>
              <rect x=4 y=14 width=24 height=4 rx=2 fill=#00C9B1 opacity=.75/>
              <rect x=4 y=8  width=24 height=4 rx=2 fill=#00C9B1/>
            </svg>
          </div>
          <h2 className=modal-title>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p className=modal-sub>{mode === 'login' ? 'Sign in to access saved conversations' : 'Sign up to save and revisit conversations'}</p>
        </div>

        {/* Google */}
        <button className=google-btn onClick={loginWithGoogle} disabled={loading} type=button>
          <GoogleIcon/> <span>Continue with Google</span>
        </button>

        <div className=modal-divider><span>or</span></div>

        {/* Form */}
        <form onSubmit={submit} noValidate className=modal-form>
          {mode === 'register' && (
            <div className=field>
              <label className=field-label htmlFor=reg-username>Username</label>
              <input id=reg-username className=field-input type=text ref={firstRef}
                value={username} onChange={e => setUsername(e.target.value)}
                placeholder=your_handle autoComplete=username required/>
            </div>
          )}
          <div className=field>
            <label className=field-label htmlFor={mode === 'login' ? 'identifier' : 'reg-email'}>
              {mode === 'login' ? 'Email or username' : 'Email'}
            </label>
            {mode === 'login' ? (
              <input id=identifier className=field-input type=text ref={firstRef}
                value={identifier} onChange={e => setIdentifier(e.target.value)}
                placeholder=you@example.com autoComplete=username required/>
            ) : (
              <input id=reg-email className=field-input type=email
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder=you@example.com autoComplete=email required/>
            )}
          </div>
          <div className=field>
            <label className=field-label htmlFor=password>Password</label>
            <div className=password-wrap>
              <input id=password className=field-input type={showPass ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder=•••••••• autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required minLength={mode === 'register' ? 8 : undefined}/>
              <button type=button className=eye-btn onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}>
                {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
          </div>

          {error && (
            <div className=modal-error><AlertCircle size={13}/><span>{error}</span></div>
          )}

          <button type=submit className=modal-submit disabled={loading}>
            {loading
              ? <Loader2 size={16} className=spin/>
              : <><span>{mode === 'login' ? 'Sign in' : 'Create account'}</span><ArrowRight size={14}/></>
            }
          </button>
        </form>

        <p className=modal-switch>
          {mode === 'login' ? Don't have an account? : 'Already have an account?'}{' '}
          <button type=button className=modal-switch-btn onClick={switchMode}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
