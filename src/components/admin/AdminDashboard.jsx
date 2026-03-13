import { Users, Crown, DollarSign, UserPlus } from 'lucide-react'
import useAdminStore from '../../store/adminStore'

const formatARS = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

export default function AdminDashboard() {
  const stats = useAdminStore((s) => s.getStats())

  const cards = [
    { label: 'Total usuarios', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
    { label: 'Usuarios Pro', value: stats.proUsers, sub: `${stats.freeUsers} free`, icon: Crown, color: 'text-accent' },
    { label: 'MRR estimado', value: formatARS(stats.estimatedMRR), icon: DollarSign, color: 'text-yellow-400' },
    { label: 'Nuevos (semana)', value: stats.newThisWeek, sub: `${stats.newThisMonth} este mes`, icon: UserPlus, color: 'text-purple-400' },
  ]

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-dark-surface border border-dark-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-dark-muted">{label}</span>
              <Icon size={20} className={color} />
            </div>
            <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
            {sub && <p className="text-xs text-dark-muted mt-1">{sub}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
