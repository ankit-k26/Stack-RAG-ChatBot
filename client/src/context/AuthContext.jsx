import { createContext, useContext, useEffect, useState } from 'react'
import { fetchCurrentUser, loginUser, logoutUser, registerUser, updateProfile as updateProfileApi } from '../lib/api.js'

const AuthContext = createContext(null)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if the server just redirected us back after a successful Google OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('auth_success') === '1') {
      // Clean up the URL without a page reload
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchCurrentUser()
      .then(({ user }) => {
        if (!cancelled) setUser(user)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function login(identifier, password) {
    const { user } = await loginUser(identifier, password)
    setUser(user)
    return user
  }

  async function register(username, email, password) {
    const { user } = await registerUser(username, email, password)
    setUser(user)
    return user
  }

  async function logout() {
    await logoutUser()
    setUser(null)
  }

  // Redirect to Google OAuth — the server handles the callback and
  // redirects back to the client with ?auth_success=1
  function loginWithGoogle() {
    window.location.href = `${API_URL}/api/auth/google`
  }

  async function updateProfile(displayName) {
    const { user: updatedUser } = await updateProfileApi(displayName)
    setUser(updatedUser)
    return updatedUser
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginWithGoogle, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
