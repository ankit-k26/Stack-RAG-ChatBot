/**
 * MessageBubble — Hybrid design:
 *
 * OBSIDIAN GLASS frame (background, avatars, system pills)
 * +
 * DEEP VIOLET TERMINAL bubbles:
 *   • User  → violet-700 filled pill, right-aligned
 *   • AI    → dark bordered card, JetBrains Mono font, left-aligned
 */

/** Avatar shown beside each message */
function Avatar({ role }) {
  if (role === 'user') {
    return (
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                   bg-violet-700/20 text-[11px] font-bold text-violet-500
                   dark:bg-violet-700/25 dark:text-violet-300"
      >
        You
      </div>
    )
  }

  // AI avatar: small teal spark mark in obsidian bubble
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                 border border-black/[0.07] bg-cloud-raised
                 dark:border-white/[0.08] dark:bg-obsidian-bubble"
    >
      <svg viewBox="0 0 20 20" fill="none" className="h-[15px] w-[15px]" aria-hidden="true">
        <path d="M10 2L11.8 8.2L18 10L11.8 11.8L10 18L8.2 11.8L2 10L8.2 8.2L10 2Z" fill="#00C9B1" />
      </svg>
    </div>
  )
}

export default function MessageBubble({ role, content }) {
  const isUser = role === 'user'

  // ── System / status messages ──────────────────────────────────────────────
  if (role === 'system') {
    return (
      <div className="flex justify-center">
        <div className="max-w-[85%] rounded-full bg-accent/[0.08] px-4 py-1.5 text-center text-xs font-medium text-accent/75 dark:bg-accent/[0.06] dark:text-accent/65">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex w-full animate-fadeInUp items-start gap-3 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <Avatar role={role} />

      <div
        className={`max-w-[75%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-[15px] leading-relaxed sm:max-w-[65%]
          ${isUser
            // ── Deep Violet Terminal: violet-700 filled pill ──────────────
            ? 'rounded-tr-sm bg-violet-700 text-white shadow-violet-card'
            // ── Deep Violet Terminal: dark bordered card, mono font ───────
            : 'rounded-tl-sm border border-black/[0.07] bg-cloud-raised font-mono text-[14px] text-obsidian dark:border-white/[0.07] dark:bg-obsidian-bubble dark:text-white/90'
          }`}
      >
        {content}
      </div>
    </div>
  )
}
