import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useGroup } from '../../hooks/useGroup'

const COLORS = ['#4ade80', '#3b82f6', '#f97316', '#a855f7', '#ec4899']

const formatARS = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

const formatShort = (n) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`
  return `$${n}`
}

export default function GroupDashboard() {
  const { group, members, groupExpenses } = useGroup()

  if (!group) return null

  const now = new Date()
  const thisMonthExpenses = groupExpenses.filter((e) => {
    const d = new Date(e.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && e.type === 'expense'
  })

  const totalGroupExpenses = thisMonthExpenses.reduce((s, e) => s + e.amount, 0)

  const perMember = members.map((m, i) => {
    const memberExpenses = thisMonthExpenses.filter((e) => e.user_id === m.user_id)
    const total = memberExpenses.reduce((s, e) => s + e.amount, 0)
    return { name: m.name, total, color: COLORS[i % COLORS.length] }
  })

  const chartData = perMember.map((m) => ({ name: m.name, Gastos: m.total }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-dark-surface border border-dark-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="text-xs" style={{ color: p.color }}>
            {p.name}: {formatARS(p.value)}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Gastos del grupo: {group.name}</h3>
        <span className="text-xs text-dark-muted font-mono">{formatARS(totalGroupExpenses)} total</span>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        {perMember.map((m, i) => (
          <div key={m.name} className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-dark-bg"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            >
              {m.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-medium">{m.name}</p>
              <p className="text-xs text-dark-muted font-mono">{formatARS(m.total)}</p>
            </div>
          </div>
        ))}
      </div>

      {chartData.length > 0 && totalGroupExpenses > 0 && (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2d35" />
            <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 12 }} />
            <YAxis tickFormatter={formatShort} tick={{ fill: '#71717a', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Gastos" fill="#4ade80" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
