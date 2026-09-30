import { clsx } from 'clsx'

export function Badge({ variant = 'user', children, className }) {
  return (
    <span className={clsx('badge', variant, className)}>
      {children}
    </span>
  )
}

export default Badge
