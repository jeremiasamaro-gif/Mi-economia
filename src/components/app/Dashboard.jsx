import { useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Lock } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useExpenses } from '../../hooks/useExpenses'
import { usePlan } from '../../hooks/usePlan'
import { useGroup } from '../../hooks/useGroup'
import { useTranslation } from '../../hooks/useTranslation'
import UpgradeModal from '../shared/UpgradeModal'
import GroupDashboard from './GroupDashboard'

const COLORS = ['#4ade80', '#f97316', '#3b82f6', '#a855f7', '#ef4444', '#eab308', '#06b6d4', '#ec4899', '#84cc16', '#6366f1']

const formatARS = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

const formatShort = (n) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`
  return `$${n}`
}

export default function Dashboard() {
  const { expenses, currentMonthExpenses, monthlyTotals, categoryTotals } = useExpenses()
  const { canUseCharts } = usePlan()
  const { group } = useGroup()
  const { t } = useTranslation()
  const [showUpgrade, setShowUpgrade] = useState(false)

  const now = new Date()
  const thisMonthAll = expenses.filter((e) => {
    const d = new Date(e.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const totalIncome = thisMonthAll.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const totalExpense = thisMonthAll.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const balance = totalIncome - totalExpense

  // Smart savings projection: estimate remaining expenses based on daily average
  const dayOfMonth = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysRemaining = daysInMonth - dayOfMonth

  // Use current month's daily average + historical trend from previous months
  const prevMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.date)
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear && e.type === 'expense'
  })
  const prevMonthTotal = prevMonthExpenses.reduce((s, e) => s + e.amount, 0)

  // Weighted projection: 60% current pace + 40% last month pattern
  const currentDailyAvg = dayOfMonth > 0 ? totalExpense / dayOfMonth : 0
  const prevDailyAvg = prevMonthTotal > 0 ? prevMonthTotal / daysInMonth : 0
  const projectedDailyAvg = prevDailyAvg > 0
    ? currentDailyAvg * 0.6 + prevDailyAvg * 0.4
    : currentDailyAvg
  const projectedRemainingExpenses = projectedDailyAvg * daysRemaining
  const projectedTotalExpenses = totalExpense + projectedRemainingExpenses
  const savings = Math.max(0, totalIncome - projectedTotalExpenses)

  const cards = [
    { label: t('dashboard.monthlyIncome'), value: totalIncome, icon: TrendingUp, color: 'text-accent' },
    { label: t('dashboard.monthlyExpenses'), value: totalExpense, icon: TrendingDown, color: 'text-red-400' },
    { label: t('dashboard.netBalance'), value: balance, icon: DollarSign, color: balance >= 0 ? 'text-accent' : 'text-red-400' },
    { label: t('dashboard.savings'), value: savings, icon: PiggyBank, color: 'text-blue-400', subtitle: daysRemaining > 0 ? `Faltan ~${formatARS(projectedRemainingExpenses)} en ${daysRemaining} días` : null },
  ]

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
    <div>
      <h2 className="text-xl font-bold mb-6">{t('dashboard.title')}</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color, subtitle }) => (
          <div key={label} className="bg-dark-surface border border-dark-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-dark-muted">{label}</span>
              <Icon size={18} className={color} />
            </div>
            <p className={`text-2xl font-bold font-mono ${color}`}>{formatARS(value)}</p>
            {subtitle && <p className="text-[11px] text-dark-muted mt-1">{subtitle}</p>}
          </div>
        ))}
      </div>

      {/* Charts - Pro only */}
      {canUseCharts ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category donut */}
          <div className="bg-dark-surface border border-dark-border rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4">{t('dashboard.byCategory')}</h3>
            {categoryTotals.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryTotals}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryTotals.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => <span className="text-xs text-dark-muted">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-dark-muted text-sm">
                {t('dashboard.noData')}
              </div>
            )}
          </div>

          {/* Monthly line chart */}
          <div className="bg-dark-surface border border-dark-border rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4">{t('dashboard.last6months')}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyTotals}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d35" />
                <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 12 }} />
                <YAxis tickFormatter={formatShort} tick={{ fill: '#71717a', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span className="text-xs text-dark-muted">{v}</span>} />
                <Line type="monotone" dataKey="income" name={t('expenses.income')} stroke="#4ade80" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="expense" name={t('expenses.expense')} stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart income vs expense */}
          <div className="bg-dark-surface border border-dark-border rounded-xl p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold mb-4">{`${t('expenses.income')} vs ${t('expenses.expense')}`}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyTotals}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d35" />
                <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 12 }} />
                <YAxis tickFormatter={formatShort} tick={{ fill: '#71717a', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span className="text-xs text-dark-muted">{v}</span>} />
                <Bar dataKey="income" name={t('expenses.income')} fill="#4ade80" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name={t('expenses.expense')} fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-dark-surface border border-dark-border rounded-xl p-12 text-center">
          <Lock size={48} className="mx-auto text-dark-muted mb-4" />
          <h3 className="text-lg font-semibold mb-2">Gráficos disponibles en Pro</h3>
          <p className="text-dark-muted text-sm mb-4">
            Visualizá tus finanzas con gráficos interactivos de categorías, evolución mensual y más.
          </p>
          <button
            onClick={() => setShowUpgrade(true)}
            className="bg-accent text-dark-bg font-semibold px-6 py-2.5 rounded-lg hover:bg-accent/90"
          >
            Mejorar a Pro
          </button>
        </div>
      )}

      {/* Group breakdown */}
      {group && canUseCharts && (
        <div className="mt-6">
          <GroupDashboard />
        </div>
      )}

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} feature="Dashboard completo" />
    </div>
  )
}
