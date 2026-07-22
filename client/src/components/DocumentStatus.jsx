export default function DocumentStatus({ documentStatus, isUploading, uploadError }) {
  if (isUploading) {
    return (
      <div className="flex items-center gap-2 border-b border-ink/10 bg-gold/10 px-4 py-2 text-xs font-medium text-gold-dim dark:border-paper/10 dark:bg-gold-dim/10 dark:text-gold-soft sm:px-6">
        <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-gold-dim/40 border-t-gold-dim dark:border-gold-soft/40 dark:border-t-gold-soft" />
        Indexing document…
      </div>
    )
  }

  if (uploadError) {
    return (
      <div className="flex items-center gap-2 border-b border-ink/10 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-700 dark:border-paper/10 dark:text-red-300 sm:px-6">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 shrink-0">
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" d="M12 8v5M12 16h.01" />
        </svg>
        {uploadError}
      </div>
    )
  }

  if (documentStatus.hasDocument) {
    return (
      <div className="flex items-center gap-2 border-b border-ink/10 bg-sage/10 px-4 py-2 text-xs font-medium text-sage dark:border-paper/10 dark:bg-sage/10 dark:text-sage-soft sm:px-6">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <span className="truncate">
          Indexed <span className="font-semibold">{documentStatus.fileName}</span>
          {typeof documentStatus.chunkCount === 'number' && ` · ${documentStatus.chunkCount} chunks`}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 border-b border-ink/10 px-4 py-2 text-xs font-medium text-ink/45 dark:border-paper/10 dark:text-paper/45 sm:px-6">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 shrink-0">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 16.5V9.75m0 0L9 12.75m3-3 3 3M6.75 19.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Z"
        />
      </svg>
      No document uploaded — use the clip icon by the message box to add one
    </div>
  )
}
