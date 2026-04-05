import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, User, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import useProfileStore from '../../store/profileStore'
import useSupportStore from '../../store/supportStore'
import { useTranslation } from '../../hooks/useTranslation'

// Compact flag SVGs
const FlagES = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" xmlns="http://www.w3.org/2000/svg" className="rounded-sm">
    <rect width="20" height="14" fill="#c60b1e" />
    <rect y="3.5" width="20" height="7" fill="#ffc400" />
  </svg>
)

const FlagEN = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" xmlns="http://www.w3.org/2000/svg" className="rounded-sm">
    <rect width="20" height="14" fill="#012169" />
    <path d="M0 0L20 14M20 0L0 14" stroke="#fff" strokeWidth="2.5" />
    <path d="M0 0L20 14M20 0L0 14" stroke="#c8102e" strokeWidth="1.5" />
    <path d="M10 0V14M0 7H20" stroke="#fff" strokeWidth="4" />
    <path d="M10 0V14M0 7H20" stroke="#c8102e" strokeWidth="2.5" />
  </svg>
)

export default function TopBar() {
  const { user, logout } = useAuth()
  const { profile } = useProfileStore()
  const { t, lang, setLang } = useTranslation()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)
  const openSupportPanel = useSupportStore((s) => s.openPanel)
  const unreadSupport = useSupportStore((s) => user ? s.getUnreadCountForUser(user.id) : 0)

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
      {/* Language switcher */}
      <div className="flex items-center bg-dark-surface border border-dark-border rounded-lg overflow-hidden">
        <button
          onClick={() => setLang('es')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-colors ${
            lang === 'es'
              ? 'bg-accent/15 text-accent'
              : 'text-dark-muted hover:text-dark-text hover:bg-dark-hover'
          }`}
          title="Español"
        >
          <FlagES />
          <span>ES</span>
        </button>
        <div className="w-px h-5 bg-dark-border" />
        <button
          onClick={() => setLang('en')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-colors ${
            lang === 'en'
              ? 'bg-accent/15 text-accent'
              : 'text-dark-muted hover:text-dark-text hover:bg-dark-hover'
          }`}
          title="English"
        >
          <FlagEN />
          <span>EN</span>
        </button>
      </div>

      {/* Notifications bell — opens support panel */}
      <button
        onClick={openSupportPanel}
        className="relative w-9 h-9 rounded-lg bg-dark-surface border border-dark-border flex items-center justify-center text-dark-muted hover:text-dark-text hover:bg-dark-hover transition-colors"
        title={t('nav.notifications')}
      >
        <Bell size={18} />
        {unreadSupport > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5">
            {unreadSupport > 9 ? '9+' : unreadSupport}
          </span>
        )}
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
              {t('nav.profile')}
            </button>
            <div className="border-t border-dark-border" />
            <button
              onClick={() => { logout(); setShowMenu(false) }}
              className="flex items-center gap-2 px-3 py-2.5 w-full text-sm text-dark-muted hover:text-red-400 hover:bg-dark-hover transition-colors"
            >
              <LogOut size={16} />
              {t('nav.logout')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
