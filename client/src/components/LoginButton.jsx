import { useAuth } from '../context/AuthContext.jsx'

export default function LoginButton({ onOpenLogin, onLogout }) {
  const { user } = useAuth()

  // ── Logged in state ────────────────────────────────────────────────────
  if (user) {
    return (
      <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
        {/* Avatar initials in teal */}
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                     bg-accent/15 text-[11px] font-bold text-accent
                     dark:bg-accent/20 dark:text-accent"
        >
          {user.username.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium text-obsidian dark:text-white">
            {user.username}
          </p>
          {user.isAdmin && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-accent/70">
              Admin
            </p>
          )}
        </div>
        <button
          onClick={onLogout}
          className="shrink-0 text-xs font-medium text-obsidian/40 transition-colors
                     hover:text-obsidian dark:text-white/35 dark:hover:text-white/75"
        >
          Log out
        </button>
      </div>
    )
  }

  // ── Logged out state ───────────────────────────────────────────────────
  return (
    <button
      onClick={onOpenLogin}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium
                 text-obsidian/65 transition-colors duration-150
                 hover:bg-black/[0.05] hover:text-obsidian
                 dark:text-white/50 dark:hover:bg-white/[0.06] dark:hover:text-white"
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                   bg-black/[0.06] dark:bg-white/[0.08]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
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