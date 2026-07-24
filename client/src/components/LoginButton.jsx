import { useAuth } from '../context/AuthContext.jsx'

export default function LoginButton({ onOpenLogin, onLogout }) {
  const { user } = useAuth()

  if (user) {
    return (
      <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                     bg-gold-soft text-xs font-semibold text-ink
                     dark:bg-gold-dim dark:text-paper"
        >
          {user.username.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium text-ink dark:text-paper">{user.username}</p>
          {user.isAdmin && (
            <p className="text-[11px] uppercase tracking-wide text-gold-dim dark:text-gold-soft">
              Admin
            </p>
          )}
        </div>
        <button
          onClick={onLogout}
          className="shrink-0 text-xs font-medium text-ink/50 hover:text-ink
                     dark:text-paper/50 dark:hover:text-paper"
        >
          Log out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={onOpenLogin}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium
                 text-ink/80 transition-colors duration-150 hover:bg-ink/[0.05]
                 dark:text-paper/80 dark:hover:bg-paper/[0.08]"
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                   bg-ink/10 text-xs font-semibold text-ink/70
                   dark:bg-paper/10 dark:text-paper/70"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"
          />
        </svg>
      </span>
      Log in
    </button>
  )
}