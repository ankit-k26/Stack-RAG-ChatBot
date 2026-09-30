import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { MessageSquare, Plus, Trash2, Pencil, Check, X, ChevronDown, LogOut, LogIn, FileText } from 'lucide-react'

const StacksIcon = () => (
  <svg width=22 height=22 viewBox=0 0 32 32 fill=none>
    <rect x=4 y=20 width=24 height=4 rx=2 fill=#00C9B1 opacity=0.5/>
    <rect x=4 y=14 width=24 height=4 rx=2 fill=#00C9B1 opacity=0.75/>
    <rect x=4 y=8  width=24 height=4 rx=2 fill=#00C9B1/>
  </svg>
)

function ConversationItem({ chat, isActive, onSelect, onRename, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(chat.title || 'Untitled')
  const inputRef = useRef(null)

  useEffect(() => { if (editing) inputRef.current?.select() }, [editing])

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== chat.title) onRename(chat.sessionId, trimmed)
    setEditing(false)
  }

  return (
    <div
      className={conv-item}
      onClick={() => !editing && onSelect(chat.sessionId)}
    >
      <FileText size={13} className=conv-icon />
      {editing ? (
        <input
          ref={inputRef}
          className=conv-edit-input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <span className=conv-title>{chat.title || 'Untitled'}</span>
      )}
      <div className=conv-actions onClick={e => e.stopPropagation()}>
        {editing ? (
          <>
            <button onClick={commit} title=Save><Check size={12}/></button>
            <button onClick={() => setEditing(false)} title=Cancel><X size={12}/></button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} title=Rename><Pencil size={12}/></button>
            <button onClick={() => onDelete(chat.sessionId)} title=Delete><Trash2 size={12}/></button>
          </>
        )}
      </div>
    </div>
  )
}

export default function Sidebar({ isOpen, onClose, activeChatId, onSelectChat, onNewChat, history, historyLoading, onRenameChat, onDeleteChat, onOpenLogin, onLogout }) {
  const { user } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const today = history.filter(c => {
    const d = new Date(c.updatedAt || c.createdAt)
    return new Date() - d < 86400000
  })
  const older = history.filter(c => {
    const d = new Date(c.updatedAt || c.createdAt)
    return new Date() - d >= 86400000
  })

  return (
    <>
      {isOpen && <div className=sidebar-overlay onClick={onClose}/>}
      <aside className={sidebar}>
        {/* Logo */}
        <div className=sidebar-logo>
          <StacksIcon/>
          <span className=sidebar-logo-text>Stacks</span>
          <div className=sidebar-logo-badge>RAG</div>
        </div>

        {/* New Chat */}
        <button className=new-chat-btn onClick={() => { onNewChat(); onClose() }}>
          <Plus size={15} strokeWidth={2.5}/>
          <span>New Chat</span>
        </button>

        {/* Conversations */}
        <div className=sidebar-scrollable>
          {historyLoading && (
            <div className=sidebar-loading>
              {[...Array(3)].map((_, i) => <div key={i} className=conv-skeleton/>)}
            </div>
          )}
          {!historyLoading && history.length === 0 && (
            <div className=sidebar-empty>
              <MessageSquare size={20} opacity={.3}/>
              <span>No conversations yet</span>
            </div>
          )}
          {!historyLoading && today.length > 0 && (
            <div className=conv-group>
              <span className=conv-group-label>Today</span>
              {today.map(c => (
                <ConversationItem key={c.sessionId} chat={c} isActive={c.sessionId === activeChatId}
                  onSelect={onSelectChat} onRename={onRenameChat} onDelete={onDeleteChat}/>
              ))}
            </div>
          )}
          {!historyLoading && older.length > 0 && (
            <div className=conv-group>
              <span className=conv-group-label>Previous</span>
              {older.map(c => (
                <ConversationItem key={c.sessionId} chat={c} isActive={c.sessionId === activeChatId}
                  onSelect={onSelectChat} onRename={onRenameChat} onDelete={onDeleteChat}/>
              ))}
            </div>
          )}
        </div>

        {/* User footer */}
        <div className=sidebar-footer>
          {user ? (
            <div className=user-widget onClick={() => setUserMenuOpen(v => !v)}>
              <div className=user-avatar>{user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}</div>
              <div className=user-info>
                <span className=user-name>{user.username || user.displayName || 'User'}</span>
                <span className=user-email>{user.email}</span>
              </div>
              <ChevronDown size={14} className={user-chevron}/>
              {userMenuOpen && (
                <div className=user-menu onClick={e => e.stopPropagation()}>
                  <button className=user-menu-item user-menu-item--danger onClick={() => { setUserMenuOpen(false); onLogout() }}>
                    <LogOut size={13}/> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className=sign-in-btn onClick={onOpenLogin}>
              <LogIn size={14}/>
              <span>Sign in</span>
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
