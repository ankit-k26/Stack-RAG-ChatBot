import { clsx } from 'clsx'

export function Avatar({ user, size = 'md', className }) {
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : user?.displayName
      ? user.displayName.slice(0, 2).toUpperCase()
      : '?'

  return (
    <div className={clsx('avatar', size, className)}>
      {user?.avatarUrl ? (
        <img src={user.avatarUrl} alt={user.username || 'User'} />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}

export function GuestAvatar({ label = 'G', size = 'md', className }) {
  return (
    <div
      className={clsx('avatar', size, className)}
      style={{ background: 'var(--glass-surface)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}
    >
      <span>{label.charAt(0).toUpperCase()}</span>
    </div>
  )
}

export default Avatar
