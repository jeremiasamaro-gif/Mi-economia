import React, { useState } from 'react'
import { Search, ArrowUpCircle, ArrowDownCircle, Ban, ChevronDown, ChevronRight, LayoutDashboard, Receipt, PiggyBank, RefreshCw, MessageCircle } from 'lucide-react'
import useAdminStore from '../../store/adminStore'
import useExpenseStore from '../../store/expenseStore'
import PlanBadge from '../shared/PlanBadge'

const FEATURE_LABELS = {
  dashboard: { label: 'Dashboard', icon: LayoutDashboard },
  expenses: { label: 'Gastos', icon: Receipt },
  budgets: { label: 'Presupuestos', icon: PiggyBank },
  recurring: { label: 'Recurrentes', icon: RefreshCw },
  ai_chat: { label: 'Asistente IA', icon: MessageCircle },
}

export default function UsersTable() {
  const allUsers = useAdminStore((s) => s.getAllUsers())
  const registeredUsers = useAdminStore((s) => s.getRegisteredUsers())
  const updatePlan = useAdminStore((s) => s.updateUserPlan)
  const disableUser = useAdminStore((s) => s.disableUser)
  const getUserFeatures = useAdminStore((s) => s.getUserFeatures)
  const setUserFeature = useAdminStore((s) => s.setUserFeature)
  const sidebarFeatures = useAdminStore((s) => s.getSidebarFeatures())
  const expenses = useExpenseStore((s) => s.expenses)
  const [search, setSearch] = useState('')
  const [filterPlan, setFilterPlan] = useState('all')
  const [expandedUser, setExpandedUser] = useState(null)

  const isDemo = (user) => user.id.startsWith('user-demo')

  const filtered = allUsers.filter((u) => {
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name.toLowerCase().includes(search.toLowerCase())
    const matchPlan = filterPlan === 'all' || u.plan === filterPlan
    return matchSearch && matchPlan
  })

  const getExpenseCount = (userId) => expenses.filter((e) => e.user_id === userId).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Usuarios</h2>
          <p className="text-sm text-dark-muted mt-1">
            <span className="font-mono text-accent">{registeredUsers.length}</span> usuarios registrados
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por email o nombre..."
            maxLength={100}
            className="w-full bg-dark-surface border border-dark-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
          className="bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">Todos</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
        </select>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-border text-dark-muted text-left">
              <th className="px-4 py-3 font-medium">Usuario</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Registro</th>
              <th className="px-4 py-3 font-medium text-right">Gastos</th>
              <th className="px-4 py-3 font-medium">Módulos</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-dark-muted">
                  {registeredUsers.length === 0
                    ? 'No hay usuarios registrados todavía'
                    : 'No se encontraron resultados'}
                </td>
              </tr>
            )}
            {filtered.map((u) => {
              const features = getUserFeatures(u.id, u.plan)
              const isExpanded = expandedUser === u.id
              return (
                <React.Fragment key={u.id}>
                  <tr className={`border-b border-dark-border/50 hover:bg-dark-hover ${isDemo(u) ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{u.full_name}</p>
                      <p className="text-xs text-dark-muted">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {isDemo(u) ? (
                        <span className="text-xs px-2 py-0.5 rounded bg-dark-border text-dark-muted">Demo</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">Real</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <PlanBadge plan={u.plan} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        u.subscription_status === 'active' ? 'bg-accent/20 text-accent' :
                        u.subscription_status === 'trial' ? 'bg-yellow-500/20 text-yellow-400' :
                        u.subscription_status === 'disabled' ? 'bg-red-500/20 text-red-400' :
                        'bg-dark-border text-dark-muted'
                      }`}>
                        {u.subscription_status === 'trial' ? `trial (${
                          Math.max(0, Math.ceil((new Date(u.trial_ends_at) - new Date()) / 86400000))
                        }d)` : u.subscription_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-dark-muted text-xs">
                      {new Date(u.created_at).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{getExpenseCount(u.id)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setExpandedUser(isExpanded ? null : u.id)}
                        className="text-dark-muted hover:text-accent flex items-center gap-1 text-xs"
                        title="Configurar módulos"
                      >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <span className="font-mono">{sidebarFeatures.filter((f) => features[f]).length}/{sidebarFeatures.length}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {!isDemo(u) && (
                        <div className="flex gap-1">
                          {u.plan === 'free' ? (
                            <button
                              onClick={() => updatePlan(u.id, 'pro')}
                              className="text-accent hover:text-accent/80 flex items-center gap-1 text-xs"
                              title="Upgrade a Pro"
                            >
                              <ArrowUpCircle size={14} /> Pro
                            </button>
                          ) : (
                            <button
                              onClick={() => updatePlan(u.id, 'free')}
                              className="text-yellow-400 hover:text-yellow-300 flex items-center gap-1 text-xs"
                              title="Downgrade a Free"
                            >
                              <ArrowDownCircle size={14} /> Free
                            </button>
                          )}
                          {u.subscription_status !== 'disabled' && (
                            <button
                              onClick={() => disableUser(u.id)}
                              className="text-red-400 hover:text-red-300 flex items-center gap-1 text-xs ml-2"
                              title="Deshabilitar"
                            >
                              <Ban size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="border-b border-dark-border/50 bg-dark-bg/50">
                      <td colSpan={8} className="px-4 py-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs text-dark-muted mr-1">Módulos:</span>
                          {sidebarFeatures.map((feat) => {
                            const { label, icon: Icon } = FEATURE_LABELS[feat]
                            const enabled = features[feat]
                            return (
                              <button
                                key={feat}
                                onClick={() => setUserFeature(u.id, feat, !enabled)}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                  enabled
                                    ? 'bg-accent/20 text-accent border border-accent/30'
                                    : 'bg-dark-surface text-dark-muted border border-dark-border hover:border-dark-muted'
                                }`}
                              >
                                <Icon size={13} />
                                {label}
                              </button>
                            )
                          })}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
