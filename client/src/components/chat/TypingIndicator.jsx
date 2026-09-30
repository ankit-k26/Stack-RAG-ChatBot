export default function TypingIndicator() {
  return (
    <div className="message-row" aria-live="polite" aria-label="Assistant is typing">
      <div className="message-avatar assistant">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div className="message-content">
        <div className="message-bubble assistant" style={{ display: 'inline-block', padding: '12px 16px' }}>
          <div className="typing-indicator">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        </div>
      </div>
    </div>
  )
}
