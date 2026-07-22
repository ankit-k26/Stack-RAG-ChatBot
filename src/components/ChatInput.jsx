import { useEffect, useRef, useState } from 'react'

export default function ChatInput({ onSend }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [value])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-ink/10 bg-paper px-4 py-4 dark:border-paper/10 dark:bg-ink sm:px-6">
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-ink/10 bg-white p-2 shadow-card transition-shadow duration-150 focus-within:shadow-lift dark:border-paper/10 dark:bg-ink-soft">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          rows={1}
          className="max-h-[200px] flex-1 resize-none bg-transparent px-3 py-2 text-[15px]
                     text-ink placeholder:text-ink/40 focus:outline-none
                     dark:text-paper dark:placeholder:text-paper/35"
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
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
        Enter to send · Shift + Enter for a new line
      </p>
    </div>
  )
}
