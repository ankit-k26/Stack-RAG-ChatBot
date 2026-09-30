import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import MessageBubble from './MessageBubble.jsx'
import TypingIndicator from './TypingIndicator.jsx'

const SUGGESTIONS = [
  { emoji: '📄', text: 'Summarize the uploaded document' },
  { emoji: '❓', text: 'What are the key findings?' },
  { emoji: '📊', text: 'Extract key statistics or data' },
  { emoji: '💡', text: 'What are the main arguments?' },
]

function WelcomeHero({ onSuggestion, hasDocument }) {
  return (
    <div className="welcome-hero">
      {/* Animated logo mark */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          width: 64, height: 64, borderRadius: 16,
          background: 'var(--accent-gradient)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 60px var(--accent-blue-glow)',
          fontSize: 28, fontWeight: 800, color: 'white',
        }}
      >
        S
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        style={{ textAlign: 'center' }}
      >
        <h1 className="welcome-title">
          {hasDocument ? 'Ready to answer your questions' : 'Welcome to Stacks'}
        </h1>
        <p className="welcome-subtitle">
          {hasDocument
            ? 'Your document is indexed and ready. Ask anything about its contents.'
            : 'Upload a document and interrogate it with AI. Honest answers, grounded in your content.'}
        </p>
      </motion.div>

      {hasDocument && (
        <motion.div
          className="welcome-suggestions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {SUGGESTIONS.map((s) => (
            <button
              key={s.text}
              className="suggestion-card"
              onClick={() => onSuggestion(s.text)}
            >
              <span className="suggestion-card-icon">{s.emoji}</span>
              <span className="suggestion-card-text">{s.text}</span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default function MessageList({ messages, isTyping, onSuggestion, hasDocument }) {
  const bottomRef = useRef(null)
  const isEmpty = messages.length === 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div className="message-list" role="log" aria-label="Chat messages" aria-live="polite">
      {isEmpty ? (
        <WelcomeHero onSuggestion={onSuggestion} hasDocument={hasDocument} />
      ) : (
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <MessageBubble message={msg} />
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>
      )}
      <div ref={bottomRef} style={{ height: 1 }} />
    </div>
  )
}
