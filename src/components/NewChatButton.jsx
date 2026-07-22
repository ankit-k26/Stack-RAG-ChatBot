export default function NewChatButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-2 rounded-xl border border-gold/40
                 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-gold-dim
                 transition-all duration-150 hover:bg-gold hover:text-paper
                 hover:shadow-card active:scale-[0.98]
                 dark:border-gold-soft/30 dark:text-gold-soft dark:hover:bg-gold-soft dark:hover:text-ink"
    >
      <svg
        className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:rotate-90"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
      </svg>
      New chat
    </button>
  )
}
