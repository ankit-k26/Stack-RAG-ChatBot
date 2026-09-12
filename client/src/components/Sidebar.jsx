import NewChatButton from './NewChatButton.jsx'
import ChatHistoryItem from './ChatHistoryItem.jsx'
import LoginButton from './LoginButton.jsx'
import { useAuth } from '../context/AuthContext.jsx'

/** Teal two-panel Stacks logomark */
function StacksMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M4 5.5C4 4.67 4.67 4 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z"
        fill="#00C9B1"
        opacity="0.95"
      />
      <path
        d="M13 4h5.5c.83 0 1.5.67 1.5 1.5v13c0 .83-.67 1.5-1.5 1.5H13V4Z"
        fill="#00C9B1"
        opacity="0.42"
      />
    </svg>
  )
}

export default function Sidebar({
  activeChatId,
  onSelectChat,
  onNewChat,
  isOpen,
  onClose,
  onOpenLogin,
  history,
  historyLoading,
  onRenameChat,
  onDeleteChat,
  onLogout,
}) {
  const { user } = useAuth()

  return (
    <>
      {/* Mobile backdrop scrim */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-72 shrink-0 flex-col
                    border-r border-black/[0.07] bg-cloud-raised px-4 py-5
                    dark:border-white/[0.06] dark:bg-obsidian
                    transition-transform duration-200 ease-out
                    md:static md:z-auto md:translate-x-0
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* ── Logo ── */}
        <div className="mb-5 flex items-center gap-3 px-1">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-accent/20">
            <StacksMark />
          </span>
          <div className="leading-tight">
            <p className="text-lg font-semibold tracking-tight text-obsidian dark:text-white">
              Stacks
            </p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-obsidian/40 dark:text-white/35">
              Document assistant
            </p>
          </div>
        </div>

        <NewChatButton onClick={onNewChat} />

        {/* ── Chat history ── */}
        <div className="mt-6 flex min-h-0 flex-1 flex-col">
          <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-obsidian/35 dark:text-white/30">
            Recent
          </p>
          <div className="flex-1 space-y-0.5 overflow-y-auto pr-1">
            {!user ? (
              <p className="px-1 py-2 text-sm text-obsidian/45 dark:text-white/40">
                Log in to save and revisit your chats.
              </p>
            ) : historyLoading ? (
              <p className="px-1 py-2 text-sm text-obsidian/45 dark:text-white/40">Loading…</p>
            ) : history.length === 0 ? (
              <p className="px-1 py-2 text-sm text-obsidian/45 dark:text-white/40">
                No saved chats yet — ask something to get started.
              </p>
            ) : (
              history.map((chat) => (
                <ChatHistoryItem
                  key={chat.sessionId}
                  title={chat.title || 'Untitled chat'}
                  active={chat.sessionId === activeChatId}
                  onClick={() => onSelectChat(chat.sessionId)}
                  onRename={(newTitle) => onRenameChat(chat.sessionId, newTitle)}
                  onDelete={() => onDeleteChat(chat.sessionId)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Footer / auth ── */}
        <div className="mt-3 shrink-0 border-t border-black/[0.07] pt-3 dark:border-white/[0.06]">
          <LoginButton onOpenLogin={onOpenLogin} onLogout={onLogout} />
        </div>
      </aside>
    </>
  )
}