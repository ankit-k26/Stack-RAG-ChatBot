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
        Upload documents and ask questions about them — that part is coming soon. For now, say
        hello and try out the chat.
      </p>
    </div>
  )
}

export default function ChatMessages({ messages }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  if (messages.length === 0) {
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
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
