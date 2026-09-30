import { forwardRef } from 'react'
import { clsx } from 'clsx'

export const GlassCard = forwardRef(function GlassCard(
  { className, children, glow, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={clsx('glass-card', className)}
      style={glow ? { boxShadow: 'var(--shadow-blue)' } : undefined}
      {...props}
    >
      {children}
    </div>
  )
})

export default GlassCard
