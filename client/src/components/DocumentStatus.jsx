export default function DocumentStatus({ documentStatus, isUploading, uploadError }) {
  // ── Uploading ──────────────────────────────────────────────────────────
  if (isUploading) {
    return (
      <div className="flex items-center gap-2.5 border-b border-black/[0.07] bg-accent/[0.06] px-4 py-2.5 text-xs font-medium text-accent dark:border-white/[0.06] dark:bg-accent/[0.05] dark:text-accent sm:px-6">
        <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
        Indexing document…
      </div>
    )
  }

  // ── Upload error ───────────────────────────────────────────────────────
  if (uploadError) {
    return (
      <div className="flex items-center gap-2.5 border-b border-black/[0.07] bg-red-500/[0.06] px-4 py-2.5 text-xs font-medium text-red-600 dark:border-white/[0.06] dark:bg-red-500/[0.06] dark:text-red-400 sm:px-6">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" d="M12 8v5M12 16h.01" />
        </svg>
        {uploadError}
      </div>
    )
  }

  // ── Document indexed ───────────────────────────────────────────────────
  if (documentStatus.hasDocument) {
    return (
      <div className="flex items-center gap-2.5 border-b border-black/[0.07] bg-accent/[0.06] px-4 py-2.5 text-xs font-medium text-accent dark:border-white/[0.06] dark:bg-accent/[0.05] dark:text-accent sm:px-6">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <span className="truncate">
          Indexed <span className="font-semibold">{documentStatus.fileName}</span>
          {typeof documentStatus.chunkCount === 'number' && ` · ${documentStatus.chunkCount} chunks`}
        </span>
      </div>
    )
  }

  // ── No document ────────────────────────────────────────────────────────
  return (
    <div className="flex items-center gap-2.5 border-b border-black/[0.07] px-4 py-2.5 text-xs font-medium text-obsidian/40 dark:border-white/[0.06] dark:text-white/30 sm:px-6">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 16.5V9.75m0 0L9 12.75m3-3 3 3M6.75 19.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Z"
        />
      </svg>
      No document — use the clip icon to attach one
    </div>
  )
}
