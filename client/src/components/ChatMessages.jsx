import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble.jsx'

function WelcomeState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-paper dark:bg-gold-soft dark:text-ink">
        <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
          <path
            d="M4 5.5C4 4.67 4.67 4 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z"
            fill="currentColor"
            opacity="0.9"
          />
          <path d="M13 4h5.5c.83 0 1.5.67 1.5 1.5v13c0 .83-.67 1.5-1.5 1.5H13V4Z" fill="currentColor" opacity="0.55" />
        </svg>
      </div>
      <h1 className="font-display text-3xl font-medium tracking-tight text-ink dark:text-paper">
        How can I help you today?
      </h1>
      <p className="mt-3 max-w-md text-sm text-ink/55 dark:text-paper/55">
        Attach a document with the clip icon, then ask anything about it. Nothing uploaded yet?
        You can still say hello — I'll just let you know when a question needs a file.
      </p>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-paper dark:bg-gold-soft dark:text-ink">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path d="M4 5.5C4 4.67 4.67 4 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" fill="currentColor" opacity="0.9" />
          <path d="M13 4h5.5c.83 0 1.5.67 1.5 1.5v13c0 .83-.67 1.5-1.5 1.5H13V4Z" fill="currentColor" opacity="0.55" />
        </svg>
      </div>
      <div className="dogear flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-card dark:bg-ink-muted">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40 [animation-delay:-0.3s] dark:bg-paper/40" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40 [animation-delay:-0.15s] dark:bg-paper/40" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40 dark:bg-paper/40" />
      </div>
    </div>
  )
}

export default function ChatMessages({ messages, isTyping }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isTyping])

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex-1 overflow-y-auto">
        <WelcomeState />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6 sm:px-6">
        {messages.map((m) => (
          <MessageBubble key={m.id} role={m.role} content={m.content} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
