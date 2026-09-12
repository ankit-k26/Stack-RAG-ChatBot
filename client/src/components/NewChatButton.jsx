export default function NewChatButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-2.5 rounded-xl border border-accent/25 px-4 py-2.5
                 text-sm font-semibold text-accent
                 transition-all duration-200
                 hover:border-accent/50 hover:bg-accent/[0.08] hover:shadow-teal-glow
                 active:scale-[0.98]
                 dark:border-accent/20 dark:text-accent dark:hover:bg-accent/[0.07]"
    >
      <svg
        className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:rotate-90"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
      </svg>
      New chat
    </button>
  )
}
