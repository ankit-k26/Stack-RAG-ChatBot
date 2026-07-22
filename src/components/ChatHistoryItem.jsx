export default function ChatHistoryItem({ title, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`dogear group relative w-full truncate rounded-lg px-3 py-2 text-left text-sm
                  transition-colors duration-150
                  ${
                    active
                      ? 'bg-ink/[0.06] font-medium text-ink dark:bg-paper/10 dark:text-paper'
                      : 'text-ink/65 hover:bg-ink/[0.04] dark:text-paper/60 dark:hover:bg-paper/[0.06]'
                  }`}
      title={title}
    >
      <span className="truncate pr-3">{title}</span>
    </button>
  )
}
