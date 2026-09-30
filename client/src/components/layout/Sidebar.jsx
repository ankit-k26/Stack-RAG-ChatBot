import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon, MessageSquareIcon, Trash2Icon, PencilIcon,
  CheckIcon, XIcon, LogOutIcon, LogInIcon, UserIcon,
  ChevronDownIcon, BookOpenIcon, Layers3Icon,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import Avatar from '../ui/Avatar.jsx'

function ChatItem({ chat, active, onSelect, onRename, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(chat.title || 'Untitled chat')

  const commitRename = () => {
    if (draft.trim()) onRename(chat.sessionId, draft.trim())
    setEditing(false)
  }

  return (
    <div
      className={`sidebar-chat-item ${active ? 'active' : ''}`}
      onClick={() => !editing && onSelect(chat.sessionId)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && !editing && onSelect(chat.sessionId)}
    >
      <MessageSquareIcon size={13} style={{ flexShrink: 0, opacity: 0.5 }} />

      {editing ? (
        <input
          className="sidebar-chat-title"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename()
            if (e.key === 'Escape') setEditing(false)
          }}
          autoFocus
          onClick={(e) => e.stopPropagation()}
          style={{ background: 'none', border: 'none', outline: 'none', color: 'inherit', fontSize: 'inherit', width: '100%' }}
        />
      ) : (
        <span className="sidebar-chat-title truncate">
          {chat.title || 'Untitled chat'}
        </span>
      )}

      <div className="sidebar-chat-actions">
        {editing ? (
          <>
            <button className="sidebar-action-btn" onClick={(e) => { e.stopPropagation(); commitRename() }} title="Save">
              <CheckIcon size={12} />
            </button>
            <button className="sidebar-action-btn" onClick={(e) => { e.stopPropagation(); setEditing(false) }} title="Cancel">
              <XIcon size={12} />
            </button>
          </>
        ) : (
          <>
            <button
              className="sidebar-action-btn"
              onClick={(e) => { e.stopPropagation(); setEditing(true); setDraft(chat.title || 'Untitled chat') }}
              title="Rename"
            >
              <PencilIcon size={12} />
            </button>
            <button
              className="sidebar-action-btn"
              onClick={(e) => { e.stopPropagation(); onDelete(chat.sessionId) }}
              title="Delete"
              style={{ color: 'var(--error)' }}
            >
              <Trash2Icon size={12} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function Sidebar({
  isOpen,
  onClose,
  activeChatId,
  onSelectChat,
  onNewChat,
  history,
  historyLoading,
  onRenameChat,
  onDeleteChat,
  onOpenLogin,
  onLogout,
}) {
  const { user } = useAuth()

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)', zIndex: 40, display: 'none',
            }}
            className="mobile-backdrop"
          />
        )}
      </AnimatePresence>

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">S</div>
          <span className="sidebar-logo-text">Stacks</span>
        </div>

        {/* New Chat */}
        <button className="sidebar-new-chat" onClick={onNewChat}>
          <PlusIcon size={15} />
          New Chat
        </button>

        {/* History */}
        {user && (
          <>
            <p className="sidebar-section-label">Your Chats</p>
            <div className="sidebar-history">
              {historyLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="shimmer" style={{ height: 32, margin: '2px 0', borderRadius: 6 }} />
                ))
              ) : history.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', padding: '8px 12px' }}>
                  No conversations yet
                </p>
              ) : (
                history.map((chat) => (
                  <ChatItem
                    key={chat.sessionId}
                    chat={chat}
                    active={chat.sessionId === activeChatId}
                    onSelect={onSelectChat}
                    onRename={onRenameChat}
                    onDelete={onDeleteChat}
                  />
                ))
              )}
            </div>
          </>
        )}

        {!user && (
          <div style={{ flex: 1 }} />
        )}

        {/* Footer */}
        <div className="sidebar-footer">
          {user ? (
            <div className="sidebar-user-card">
              <Avatar user={user} size="md" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.displayName || user.username}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </p>
              </div>
              <button
                className="icon-btn"
                onClick={onLogout}
                title="Sign out"
                style={{ width: 28, height: 28 }}
              >
                <LogOutIcon size={14} />
              </button>
            </div>
          ) : (
            <button
              className="sidebar-new-chat"
              onClick={onOpenLogin}
              style={{ justifyContent: 'center' }}
            >
              <LogInIcon size={15} />
              Sign in to save chats
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
