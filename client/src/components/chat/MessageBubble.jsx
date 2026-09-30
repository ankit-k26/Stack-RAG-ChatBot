import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAuth } from '../../context/AuthContext.jsx'
import Avatar from '../ui/Avatar.jsx'

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const StacksIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>
)

const MessageBubble = memo(function MessageBubble({ message }) {
  const { user } = useAuth()
  const { role, content, timestamp } = message

  if (role === 'system') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="message-bubble system">{content}</div>
      </div>
    )
  }

  const isUser = role === 'user'

  return (
    <div className={`message-row ${isUser ? 'user' : ''}`}>
      {/* Avatar */}
      <div className={`message-avatar ${isUser ? 'user' : 'assistant'}`}>
        {isUser ? (
          user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="You" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 11, fontWeight: 700 }}>
              {user ? (user.username || 'U').slice(0, 2).toUpperCase() : 'G'}
            </span>
          )
        ) : (
          <StacksIcon />
        )}
      </div>

      {/* Content */}
      <div className="message-content">
        <div className={`message-bubble ${role}`}>
          {role === 'assistant' ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          ) : (
            content
          )}
        </div>
        {timestamp && (
          <p className="message-time">{formatTime(timestamp)}</p>
        )}
      </div>
    </div>
  )
})

export default MessageBubble
