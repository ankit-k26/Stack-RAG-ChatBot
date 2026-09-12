import ChatMessages from './ChatMessages.jsx'
import ChatInput from './ChatInput.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import DocumentStatus from './DocumentStatus.jsx'

export default function ChatPage({
  messages,
  onSend,
  isTyping,
  theme,
  onToggleTheme,
  onOpenSidebar,
  documentStatus,
  isUploading,
  uploadError,
  onUploadFile,
}) {
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-cloud dark:bg-obsidian-raised">
      {/* ── Top header bar ── */}
      <header className="flex shrink-0 items-center justify-between border-b border-black/[0.07] bg-cloud px-4 py-3 dark:border-white/[0.06] dark:bg-obsidian-raised sm:px-6">
        {/* Hamburger — mobile only */}
        <button
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-obsidian/50
                     transition-colors duration-150 hover:bg-black/[0.05] hover:text-obsidian
                     dark:text-white/40 dark:hover:bg-white/[0.07] dark:hover:text-white
                     md:hidden"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Conversation label — desktop only */}
        <p className="hidden text-sm font-medium text-obsidian/40 dark:text-white/35 md:block">
          New conversation
        </p>

        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </header>

      <DocumentStatus
        documentStatus={documentStatus}
        isUploading={isUploading}
        uploadError={uploadError}
      />
      <ChatMessages messages={messages} isTyping={isTyping} />
      <ChatInput
        onSend={onSend}
        onUploadFile={onUploadFile}
        isUploading={isUploading}
        isSending={isTyping}
      />
    </div>
  )
}
