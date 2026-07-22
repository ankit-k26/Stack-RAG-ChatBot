import { useEffect, useRef, useState } from 'react'

const ACCEPTED_TYPES = '.pdf,.docx,.txt,.md'

export default function ChatInput({ onSend, onUploadFile, isUploading, isSending }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

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
    e.target.value = '' // allow re-selecting the same file later
  }

  return (
    <div className="border-t border-ink/10 bg-paper px-4 py-4 dark:border-paper/10 dark:bg-ink sm:px-6">
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-ink/10 bg-white p-2 shadow-card transition-shadow duration-150 focus-within:shadow-lift dark:border-paper/10 dark:bg-ink-soft">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          aria-label="Attach a document"
          title="Attach a document (PDF, DOCX, TXT, or MD)"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                     text-ink/50 transition-colors duration-150 hover:bg-ink/[0.06] hover:text-ink
                     disabled:cursor-not-allowed disabled:opacity-40
                     dark:text-paper/50 dark:hover:bg-paper/[0.08] dark:hover:text-paper"
        >
          {isUploading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gold-dim/40 border-t-gold-dim dark:border-gold-soft/40 dark:border-t-gold-soft" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01a2.5 2.5 0 0 1-3.536-3.536L14.99 5.397"
              />
            </svg>
          )}
        </button>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          rows={1}
          className="max-h-[200px] flex-1 resize-none bg-transparent px-1 py-2 text-[15px]
                     text-ink placeholder:text-ink/40 focus:outline-none
                     dark:text-paper dark:placeholder:text-paper/35"
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || isSending}
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                     bg-ink text-paper transition-all duration-150
                     hover:shadow-card active:scale-95
                     disabled:cursor-not-allowed disabled:bg-ink/20 disabled:text-ink/40
                     dark:bg-gold-soft dark:text-ink dark:disabled:bg-paper/10 dark:disabled:text-paper/30"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>
      <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-ink/35 dark:text-paper/35">
        Enter to send · Shift + Enter for a new line · clip icon to attach a document
      </p>
    </div>
  )
}
