import { useState } from 'react'

export default function ChatHistoryItem({ title, active = false, onClick, onRename, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(title)

  function startEditing(e) {
    e.stopPropagation()
    setDraft(title)
    setIsEditing(true)
  }

  function commitRename() {
    setIsEditing(false)
    const trimmed = draft.trim()
    if (trimmed && trimmed !== title) {
      onRename?.(trimmed)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      commitRename()
    } else if (e.key === 'Escape') {
      setDraft(title)
      setIsEditing(false)
    }
  }

  function handleDelete(e) {
    e.stopPropagation()
    if (confirm('Delete this chat? This cannot be undone.')) {
      onDelete?.()
    }
  }

  if (isEditing) {
    return (
      <div className="w-full rounded-lg px-2 py-2">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="w-full rounded-lg border border-accent/40 bg-cloud-overlay px-2.5 py-1.5 text-sm
                     text-obsidian focus:outline-none
                     dark:bg-obsidian dark:text-white"
        />
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      title={title}
      className={`group relative flex w-full items-center rounded-lg px-3 py-2 text-left text-sm
                  transition-colors duration-150
                  ${active
                    ? 'bg-accent/[0.09] font-medium text-obsidian dark:bg-accent/[0.08] dark:text-white'
                    : 'text-obsidian/55 hover:bg-black/[0.04] hover:text-obsidian dark:text-white/45 dark:hover:bg-white/[0.05] dark:hover:text-white/80'
                  }`}
    >
      {/* Active state — teal left bar */}
      {active && (
        <span className="absolute left-0 top-1/2 h-[18px] w-0.5 -translate-y-1/2 rounded-r-full bg-accent" />
      )}

      <span className="min-w-0 flex-1 truncate pl-1 pr-2">{title}</span>

      {/* Hover action icons */}
      <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        {/* Rename */}
        <span
          role="button"
          tabIndex={0}
          onClick={startEditing}
          onKeyDown={(e) => e.key === 'Enter' && startEditing(e)}
          aria-label="Rename chat"
          className="rounded-md p-1 text-obsidian/35 hover:bg-black/[0.07] hover:text-obsidian
                     dark:text-white/30 dark:hover:bg-white/[0.1] dark:hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"
            />
          </svg>
        </span>
        {/* Delete */}
        <span
          role="button"
          tabIndex={0}
          onClick={handleDelete}
          onKeyDown={(e) => e.key === 'Enter' && handleDelete(e)}
          aria-label="Delete chat"
          className="rounded-md p-1 text-obsidian/35 hover:bg-red-500/10 hover:text-red-600
                     dark:text-white/30 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z"
            />
          </svg>
        </span>
      </span>
    </button>
  )
}