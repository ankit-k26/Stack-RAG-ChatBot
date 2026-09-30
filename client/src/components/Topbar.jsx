import { PanelLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Topbar({ onOpenSidebar, onOpenLogin }) {
  const { user } = useAuth()
  return (
    <header className=topbar>
      <button className=topbar-menu-btn onClick={onOpenSidebar} aria-label=Open sidebar>
        <PanelLeft size={18}/>
      </button>
      <div className=topbar-brand>
        <svg width=16 height=16 viewBox=0 0 32 32 fill=none>
          <rect x=4 y=20 width=24 height=4 rx=2 fill=#00C9B1 opacity=.5/>
          <rect x=4 y=14 width=24 height=4 rx=2 fill=#00C9B1 opacity=.75/>
          <rect x=4 y=8  width=24 height=4 rx=2 fill=#00C9B1/>
        </svg>
        <span>Stacks</span>
      </div>
      {!user && (
        <button className=topbar-signin onClick={onOpenLogin}>Sign in</button>
      )}
    </header>
  )
}
