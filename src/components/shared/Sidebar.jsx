import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Receipt, PiggyBank, RefreshCw, Shield } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import useAdminStore from '../../store/adminStore'
import PlanBadge from './PlanBadge'

// Inline SVG briefcase/suit icon for CFO
const CfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
    <path d="M5.5 5V3.5C5.5 2.67 6.17 2 7 2h2c.83 0 1.5.67 1.5 1.5V5" stroke="currentColor" strokeWidth="1.3" fill="none" />
    <path d="M2 8.5h12" stroke="currentColor" strokeWidth="1.3" />
    <rect x="6.5" y="7.5" width="3" height="2" rx="0.5" fill="currentColor" />
  </svg>
)

const navItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard', featureKey: 'dashboard' },
  { to: '/app/expenses', icon: Receipt, label: 'Gastos', featureKey: 'expenses' },
  { to: '/app/budgets', icon: PiggyBank, label: 'Presupuestos', pro: true, featureKey: 'budgets' },
  { to: '/app/recurring', icon: RefreshCw, label: 'Recurrentes', pro: true, featureKey: 'recurring' },
]

export default function Sidebar() {
  const { user, logout, isAdmin, isPro, isTrial, trialDaysLeft } = useAuth()
  const getUserFeatures = useAdminStore((s) => s.getUserFeatures)
  const userFeatures = user ? getUserFeatures(user.id, user.plan) : {}
  const [showPulse, setShowPulse] = useState(false)

  // Pulse animation on first visit
  useEffect(() => {
    const seen = localStorage.getItem('cfo_seen')
    if (!seen) {
      setShowPulse(true)
      const timer = setTimeout(() => {
        setShowPulse(false)
        localStorage.setItem('cfo_seen', '1')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <aside className="w-[220px] h-screen bg-dark-surface border-r border-dark-border flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-5 border-b border-dark-border">
        <h1 className="text-xl font-bold">
          mi Econom<span className="text-accent">IA</span>
        </h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {/* Main nav items */}
        <div className="space-y-1">
          {navItems.map(({ to, icon: Icon, label, pro, featureKey }) => {
            if (featureKey && userFeatures[featureKey] === false) return null
            const enabledByOverride = featureKey && userFeatures[featureKey] === true
            const isLocked = pro && !isPro && !enabledByOverride
            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/app'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-accent/10 text-accent'
                      : 'text-dark-muted hover:text-dark-text hover:bg-dark-hover'
                  } ${isLocked ? 'opacity-50' : ''}`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
                {isLocked && (
                  <span className="ml-auto text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded">PRO</span>
                )}
              </NavLink>
            )
          })}
        </div>

        {/* Herramientas IA section */}
        <div className="mt-5">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-600">
            Herramientas IA
          </p>

          {/* Mi CFO Personal — featured entry */}
          <NavLink
            to="/app/cfo"
            className={({ isActive }) =>
              `group relative flex items-start gap-3 px-3 py-3 rounded-lg text-sm transition-all border-l-[3px] ${
                isActive
                  ? 'border-accent bg-[#1e2a1e] text-accent'
                  : 'border-accent/60 bg-[#1e2a1e]/70 text-accent/90 hover:border-accent hover:bg-[#1e2a1e]'
              } ${showPulse ? 'animate-cfo-pulse' : ''}`
            }
          >
            <div className="mt-0.5 text-accent">
              <CfoIcon />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-medium block">Mi CFO Personal</span>
              <span className="text-[10px] text-accent/60 block mt-0.5">¿Puedo comprar esto?</span>
            </div>
          </NavLink>
        </div>

        {/* Admin */}
        {isAdmin && (
          <div className="mt-5">
            <div className="border-t border-dark-border mb-3" />
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-dark-muted hover:text-dark-text hover:bg-dark-hover'
                }`
              }
            >
              <Shield size={18} />
              <span>Admin</span>
            </NavLink>
          </div>
        )}
      </nav>

      {/* User info */}
      <div className="p-3 border-t border-dark-border">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">
            {user?.full_name?.charAt(0) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">{user?.full_name}</p>
            {isTrial ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-medium">
                Trial · {trialDaysLeft}d
              </span>
            ) : (
              <PlanBadge plan={user?.plan} />
            )}
          </div>
        </div>
      </div>

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes cfo-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
          50% { box-shadow: 0 0 12px 2px rgba(74, 222, 128, 0.3); }
        }
        .animate-cfo-pulse {
          animation: cfo-pulse 1.5s ease-in-out 2;
        }
      `}</style>
    </aside>
  )
}
