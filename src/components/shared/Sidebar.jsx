import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Receipt, PiggyBank, RefreshCw, CreditCard, Settings, Shield, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import PlanBadge from './PlanBadge'

const navItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/expenses', icon: Receipt, label: 'Gastos' },
  { to: '/app/budgets', icon: PiggyBank, label: 'Presupuestos', pro: true },
  { to: '/app/recurring', icon: RefreshCw, label: 'Recurrentes', pro: true },
  { to: '/pricing', icon: CreditCard, label: 'Planes' },
]

export default function Sidebar() {
  const { user, logout, isAdmin, isPro } = useAuth()

  return (
    <aside className="w-[220px] h-screen bg-dark-surface border-r border-dark-border flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-5 border-b border-dark-border">
        <h1 className="text-xl font-bold">
          mi Econom<span className="text-accent">IA</span>
        </h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, pro }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/app'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-dark-muted hover:text-dark-text hover:bg-dark-hover'
              } ${pro && !isPro ? 'opacity-50' : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
            {pro && !isPro && (
              <span className="ml-auto text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded">PRO</span>
            )}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="border-t border-dark-border my-3" />
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
          </>
        )}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-dark-border">
        <div className="flex items-center gap-2 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">
            {user?.full_name?.charAt(0) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">{user?.full_name}</p>
            <PlanBadge plan={user?.plan} />
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 w-full text-sm text-dark-muted hover:text-red-400 rounded-lg hover:bg-dark-hover"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
