import ChatMessages from './ChatMessages.jsx'
import ChatInput from './ChatInput.jsx'
import ThemeToggle from './ThemeToggle.jsx'

export default function ChatPage({ messages, onSend, theme, onToggleTheme, onOpenSidebar }) {
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-ink/10 px-4 py-3 dark:border-paper/10 sm:px-6">
        <button
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink/60 hover:bg-ink/[0.06] dark:text-paper/60 dark:hover:bg-paper/[0.08] md:hidden"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <p className="hidden text-sm font-medium text-ink/50 dark:text-paper/50 md:block">
          New conversation
        </p>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </header>

      <ChatMessages messages={messages} />
      <ChatInput onSend={onSend} />
    </div>
  )
}
