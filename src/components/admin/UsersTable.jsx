import { useState } from 'react'
import { Search, ArrowUpCircle, ArrowDownCircle, Ban } from 'lucide-react'
import useAdminStore from '../../store/adminStore'
import useExpenseStore from '../../store/expenseStore'
import PlanBadge from '../shared/PlanBadge'

export default function UsersTable() {
  const users = useAdminStore((s) => s.getAllUsers())
  const updatePlan = useAdminStore((s) => s.updateUserPlan)
  const disableUser = useAdminStore((s) => s.disableUser)
  const expenses = useExpenseStore((s) => s.expenses)
  const [search, setSearch] = useState('')
  const [filterPlan, setFilterPlan] = useState('all')

  const filtered = users.filter((u) => {
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name.toLowerCase().includes(search.toLowerCase())
    const matchPlan = filterPlan === 'all' || u.plan === filterPlan
    return matchSearch && matchPlan
  })

  const getExpenseCount = (userId) => expenses.filter((e) => e.user_id === userId).length

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Usuarios</h2>

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
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Registro</th>
              <th className="px-4 py-3 font-medium text-right">Gastos</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-dark-border/50 hover:bg-dark-hover">
                <td className="px-4 py-3">
                  <p className="font-medium">{u.full_name}</p>
                  <p className="text-xs text-dark-muted">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <PlanBadge plan={u.plan} />
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    u.subscription_status === 'active' ? 'bg-accent/20 text-accent' :
                    u.subscription_status === 'disabled' ? 'bg-red-500/20 text-red-400' :
                    'bg-dark-border text-dark-muted'
                  }`}>
                    {u.subscription_status}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-dark-muted text-xs">
                  {new Date(u.created_at).toLocaleDateString('es-AR')}
                </td>
                <td className="px-4 py-3 text-right font-mono">{getExpenseCount(u.id)}</td>
                <td className="px-4 py-3">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
