import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldIcon, LogInIcon, Settings2Icon, ChevronDownIcon, CheckIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import Avatar from '../ui/Avatar.jsx'

const MODELS = [
  { id: 'auto', label: 'Auto (Best Available)' },
  { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash' },
  { id: 'gemini-3.7-flash', label: 'Gemini 3.7 Flash' },
  { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash' },
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
  { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite' },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite' },
]

export default function Topbar({
  onOpenSidebar,
  onOpenLogin,
  onOpenAdmin,
  selectedModel,
  onModelChange,
}) {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedLabel = MODELS.find(m => m.id === selectedModel)?.label || 'Auto'

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-model-badge" style={{ padding: 0, position: 'relative', overflow: 'visible' }} ref={menuRef}>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ 
              display: 'flex', alignItems: 'center', padding: '6px 12px', gap: 8, 
              background: menuOpen ? 'rgba(79, 143, 255, 0.1)' : 'transparent',
              border: 'none', color: menuOpen ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer', outline: 'none', borderRadius: 20,
              transition: 'all 0.2s ease',
              fontFamily: 'inherit'
            }}
          >
            <Settings2Icon size={14} style={{ color: menuOpen ? 'var(--accent-blue)' : 'var(--text-tertiary)' }} />
            <span style={{ fontSize: 13, fontWeight: menuOpen ? 500 : 400 }}>{selectedLabel}</span>
            <ChevronDownIcon size={14} style={{ opacity: 0.5, transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 8,
                  width: 220,
                  background: 'rgba(10, 11, 26, 0.85)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 12,
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(79, 143, 255, 0.1)',
                  padding: 6,
                  zIndex: 50,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2
                }}
              >
                <div style={{ padding: '6px 10px 8px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-tertiary)', fontWeight: 600 }}>
                  Select Model
                </div>
                {MODELS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onModelChange(m.id)
                      setMenuOpen(false)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: selectedModel === m.id ? 'rgba(79, 143, 255, 0.15)' : 'transparent',
                      border: 'none',
                      borderRadius: 8,
                      color: selectedModel === m.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
                      fontSize: 13,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease, color 0.15s ease',
                      fontFamily: 'inherit'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedModel !== m.id) e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                    }}
                    onMouseLeave={(e) => {
                      if (selectedModel !== m.id) e.target.style.background = 'transparent'
                    }}
                  >
                    <span>{m.label}</span>
                    {selectedModel === m.id && <CheckIcon size={14} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="topbar-right">
        {/* Admin button — only shown to admins */}
        {user?.isAdmin && (
          <button
            className="icon-btn admin"
            onClick={onOpenAdmin}
            title="Admin panel"
            aria-label="Open admin panel"
          >
            <ShieldIcon size={18} />
          </button>
        )}

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar user={user} size="sm" />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {user.displayName || user.username}
            </span>
          </div>
        ) : (
          <button
            className="icon-btn"
            onClick={onOpenLogin}
            title="Sign in"
            aria-label="Sign in"
            style={{ display: 'flex', alignItems: 'center', gap: 6, width: 'auto', padding: '0 12px', fontSize: 13, color: 'var(--text-secondary)' }}
          >
            <LogInIcon size={15} />
            Sign in
          </button>
        )}
      </div>
    </header>
  )
}
