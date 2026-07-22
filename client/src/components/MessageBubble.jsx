function Avatar({ role }) {
  if (role === 'user') {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage/20 text-xs font-semibold text-sage dark:bg-sage/25 dark:text-sage-soft">
        You
      </div>
    )
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-paper dark:bg-gold-soft dark:text-ink">
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path
          d="M4 5.5C4 4.67 4.67 4 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z"
          fill="currentColor"
          opacity="0.9"
        />
        <path d="M13 4h5.5c.83 0 1.5.67 1.5 1.5v13c0 .83-.67 1.5-1.5 1.5H13V4Z" fill="currentColor" opacity="0.55" />
      </svg>
    </div>
  )
}

export default function MessageBubble({ role, content }) {
  const isUser = role === 'user'

  if (role === 'system') {
    return (
      <div className="flex justify-center">
        <div className="max-w-[85%] rounded-full bg-ink/[0.05] px-4 py-1.5 text-center text-xs text-ink/55 dark:bg-paper/[0.08] dark:text-paper/55">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex w-full animate-fadeInUp items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar role={role} />
      <div
        className={`max-w-[75%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed shadow-card
                    sm:max-w-[65%]
                    ${
                      isUser
                        ? 'rounded-tr-sm bg-ink text-paper dark:bg-gold-soft dark:text-ink'
                        : 'dogear rounded-tl-sm bg-white text-ink dark:bg-ink-muted dark:text-paper'
                    }`}
      >
        {content}
      </div>
    </div>
  )
}
