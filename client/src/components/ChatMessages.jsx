import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble.jsx'

/** Glowing teal orb — Obsidian Glass welcome hero */
function WelcomeState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      {/* Teal orb with CSS pulse animation defined in index.css */}
      <div className="relative mb-7">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 animate-orb-pulse">
          <div className="h-8 w-8 rounded-full bg-accent/75" />
        </div>
      </div>

      <h1 className="text-[28px] font-semibold tracking-tight text-obsidian dark:text-white">
        How can I help you today?
      </h1>
      <p className="mt-3 max-w-[380px] text-[15px] leading-relaxed text-obsidian/50 dark:text-white/45">
        Attach a document and ask anything about it — or just start a conversation.
      </p>
    </div>
  )
}

/**
 * Typing indicator — violet dots on a Deep Violet Terminal-style dark card.
 * This bridges the two aesthetics: Obsidian Glass frame, violet terminal feel.
 */
function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      {/* AI avatar orb */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/[0.07] bg-cloud-raised dark:border-white/[0.08] dark:bg-obsidian-bubble">
        <svg viewBox="0 0 20 20" fill="none" className="h-[15px] w-[15px]" aria-hidden="true">
          <path d="M10 2L11.8 8.2L18 10L11.8 11.8L10 18L8.2 11.8L2 10L8.2 8.2L10 2Z" fill="#00C9B1" />
        </svg>
      </div>

      {/* Violet dots on dark card — Deep Violet Terminal influence */}
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-black/[0.06] bg-cloud-raised px-4 py-3 dark:border-white/[0.07] dark:bg-obsidian-bubble">
        <span
          className="h-2 w-2 rounded-full bg-violet-400 animate-dotBounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="h-2 w-2 rounded-full bg-violet-400 animate-dotBounce"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="h-2 w-2 rounded-full bg-violet-400 animate-dotBounce"
          style={{ animationDelay: '300ms' }}
        />
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
