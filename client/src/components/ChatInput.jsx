import { useEffect, useRef, useState } from 'react'

const ACCEPTED_TYPES = '.pdf,.docx,.txt,.md'

export default function ChatInput({ onSend, onUploadFile, isUploading, isSending }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  // Auto-grow textarea up to 200px
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [value])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || isSending) return
    onSend(trimmed)
    setValue('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) onUploadFile(file)
    e.target.value = '' // allow re-selecting the same file
  }

  return (
    <div className="border-t border-black/[0.07] bg-cloud px-4 py-4 dark:border-white/[0.06] dark:bg-obsidian-raised sm:px-6">
      {/* Frosted glass pill container — teal glow on focus */}
      <div
        className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-black/[0.08]
                   bg-cloud-raised px-3 py-2 shadow-card
                   transition-shadow duration-200
                   focus-within:border-accent/35 focus-within:shadow-teal-focus
                   dark:border-white/[0.08] dark:bg-obsidian-overlay"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Paperclip / attach button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          aria-label="Attach a document"
          title="Attach a document (PDF, DOCX, TXT, or MD)"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
                     text-obsidian/40 transition-colors duration-150
                     hover:bg-black/[0.05] hover:text-obsidian
                     disabled:cursor-not-allowed disabled:opacity-40
                     dark:text-white/35 dark:hover:bg-white/[0.07] dark:hover:text-white/75"
        >
          {isUploading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01a2.5 2.5 0 0 1-3.536-3.536L14.99 5.397"
              />
            </svg>
          )}
        </button>

        {/* Message textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything…"
          rows={1}
          className="max-h-[200px] flex-1 resize-none bg-transparent px-1 py-2 text-[15px]
                     text-obsidian placeholder:text-obsidian/35 focus:outline-none
                     dark:text-white dark:placeholder:text-white/30"
        />

        {/* Send button — teal accent */}
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || isSending}
          aria-label="Send message"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
                     bg-accent text-obsidian transition-all duration-150
                     hover:bg-accent-dim hover:shadow-teal-glow
                     active:scale-95
                     disabled:cursor-not-allowed disabled:bg-black/[0.07] disabled:text-black/25
                     dark:bg-accent dark:text-obsidian dark:disabled:bg-white/[0.08] dark:disabled:text-white/25"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>

      <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-obsidian/30 dark:text-white/25">
        Enter to send · Shift + Enter for new line · clip icon to attach a doc
      </p>
    </div>
  )
}
