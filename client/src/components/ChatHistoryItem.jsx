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
      <div className="w-full rounded-lg px-3 py-2">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="w-full rounded border border-gold bg-paper px-1.5 py-0.5 text-sm text-ink
                     focus:outline-none dark:bg-ink dark:text-paper"
        />
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      className={`dogear group relative flex w-full items-center rounded-lg px-3 py-2 text-left text-sm
                  transition-colors duration-150
                  ${
                    active
                      ? 'bg-ink/[0.06] font-medium text-ink dark:bg-paper/10 dark:text-paper'
                      : 'text-ink/65 hover:bg-ink/[0.04] dark:text-paper/60 dark:hover:bg-paper/[0.06]'
                  }`}
      title={title}
    >
      <span className="min-w-0 flex-1 truncate pr-2">{title}</span>

      <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <span
          role="button"
          tabIndex={0}
          onClick={startEditing}
          onKeyDown={(e) => e.key === 'Enter' && startEditing(e)}
          className="rounded p-1 text-ink/40 hover:bg-ink/[0.08] hover:text-ink
                     dark:text-paper/40 dark:hover:bg-paper/[0.1] dark:hover:text-paper"
          aria-label="Rename chat"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"
            />
          </svg>
        </span>
        <span
          role="button"
          tabIndex={0}
          onClick={handleDelete}
          onKeyDown={(e) => e.key === 'Enter' && handleDelete(e)}
          className="rounded p-1 text-ink/40 hover:bg-red-500/10 hover:text-red-600
                     dark:text-paper/40 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          aria-label="Delete chat"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
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