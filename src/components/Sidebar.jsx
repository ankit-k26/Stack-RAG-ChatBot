import NewChatButton from './NewChatButton.jsx'
import ChatHistoryItem from './ChatHistoryItem.jsx'
import LoginButton from './LoginButton.jsx'

const DUMMY_HISTORY = [
  { id: 'h1', title: 'Q3 revenue breakdown from the 10-K' },
  { id: 'h2', title: 'Summarize onboarding policy PDF' },
  { id: 'h3', title: 'Compare vendor contracts (draft v2)' },
  { id: 'h4', title: 'Key clauses in the lease agreement' },
  { id: 'h5', title: 'Research notes — competitor teardown' },
  { id: 'h6', title: 'Employee handbook, section 4 questions' },
  { id: 'h7', title: 'Meeting transcript — action items' },
]

export default function Sidebar({ activeChatId, onSelectChat, onNewChat, isOpen, onClose }) {
  return (
    <>
      {/* Mobile scrim */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-72 shrink-0 flex-col
                    border-r border-ink/10 bg-paper-soft px-4 py-5
                    transition-transform duration-200 ease-out
                    dark:border-paper/10 dark:bg-ink-soft
                    md:static md:z-auto md:translate-x-0
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="mb-5 flex items-center gap-2.5 px-1">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-paper dark:bg-gold-soft dark:text-ink">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path
                d="M4 5.5C4 4.67 4.67 4 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z"
                fill="currentColor"
                opacity="0.9"
              />
              <path
                d="M13 4h5.5c.83 0 1.5.67 1.5 1.5v13c0 .83-.67 1.5-1.5 1.5H13V4Z"
                fill="currentColor"
                opacity="0.55"
              />
            </svg>
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold tracking-tight">Stacks</p>
            <p className="text-[11px] uppercase tracking-wide text-ink/45 dark:text-paper/45">
              document assistant
            </p>
          </div>
        </div>

        <NewChatButton onClick={onNewChat} />

        {/* Chat history */}
        <div className="mt-6 flex min-h-0 flex-1 flex-col">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-ink/40 dark:text-paper/40">
            Recent
          </p>
          <div className="flex-1 space-y-1 overflow-y-auto pr-1">
            {DUMMY_HISTORY.map((chat) => (
              <ChatHistoryItem
                key={chat.id}
                title={chat.title}
                active={chat.id === activeChatId}
                onClick={() => onSelectChat(chat.id)}
              />
            ))}
          </div>
        </div>

        {/* Fixed footer */}
        <div className="mt-3 shrink-0 border-t border-ink/10 pt-3 dark:border-paper/10">
          <LoginButton />
        </div>
      </aside>
    </>
  )
}
