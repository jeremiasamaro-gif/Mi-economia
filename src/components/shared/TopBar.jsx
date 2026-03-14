import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, User, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import useProfileStore from '../../store/profileStore'

export default function TopBar() {
  const { user, logout } = useAuth()
  const { profile } = useProfileStore()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const initials = (user?.full_name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex items-center justify-end gap-3 mb-6">
      {/* Notifications bell (placeholder for future) */}
      <button
        className="relative w-9 h-9 rounded-lg bg-dark-surface border border-dark-border flex items-center justify-center text-dark-muted hover:text-dark-text hover:bg-dark-hover transition-colors"
        title="Notificaciones (próximamente)"
      >
        <Bell size={18} />
        {/* Notification dot — uncomment when notifications are active */}
        {/* <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" /> */}
      </button>

      {/* Avatar dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-9 h-9 rounded-lg overflow-hidden border border-dark-border hover:border-accent/50 transition-colors cursor-pointer"
        >
          {profile.avatar ? (
            <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">
              {initials}
            </div>
          )}
        </button>

        {/* Dropdown */}
        {showMenu && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-dark-surface border border-dark-border rounded-lg shadow-xl overflow-hidden z-50">
            {/* User info */}
            <div className="px-3 py-2.5 border-b border-dark-border">
              <p className="text-sm font-medium text-dark-text truncate">{user?.full_name}</p>
              <p className="text-xs text-dark-muted truncate">{user?.email}</p>
            </div>

            <button
              onClick={() => { navigate('/app/perfil'); setShowMenu(false) }}
              className="flex items-center gap-2 px-3 py-2.5 w-full text-sm text-dark-muted hover:text-dark-text hover:bg-dark-hover transition-colors"
            >
              <User size={16} />
              Mi Perfil
            </button>
            <div className="border-t border-dark-border" />
            <button
              onClick={() => { logout(); setShowMenu(false) }}
              className="flex items-center gap-2 px-3 py-2.5 w-full text-sm text-dark-muted hover:text-red-400 hover:bg-dark-hover transition-colors"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
