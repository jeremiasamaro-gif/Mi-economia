import { useState } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import useRecurringStore from '../../store/recurringStore'
import { useAuth } from '../../hooks/useAuth'
import { CATEGORIES } from '../../store/mockData'
import { useTranslation } from '../../hooks/useTranslation'

const formatARS = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

export default function RecurringExpenses() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const items = useRecurringStore((s) => s.getForUser(user?.id))
  const addRecurring = useRecurringStore((s) => s.addRecurring)
  const toggleActive = useRecurringStore((s) => s.toggleActive)
  const deleteRecurring = useRecurringStore((s) => s.deleteRecurring)

  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    description: '',
    category: 'Servicios',
    amount: '',
    type: 'expense',
    frequency: 'monthly',
    next_date: new Date().toISOString().split('T')[0],
  })

  const handleAdd = () => {
    const amount = Number(form.amount)
    if (!form.description || !amount) return
    addRecurring({ ...form, amount, user_id: user.id })
    setForm({
      description: '',
      category: 'Servicios',
      amount: '',
      type: 'expense',
      frequency: 'monthly',
      next_date: new Date().toISOString().split('T')[0],
    })
    setShowAdd(false)
  }

  const active = items.filter((i) => i.active)
  const inactive = items.filter((i) => !i.active)
  const totalMonthly = active
    .filter((i) => i.type === 'expense')
    .reduce((s, i) => s + (i.frequency === 'weekly' ? i.amount * 4 : i.amount), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">{t('recurring.title')}</h2>
          <p className="text-sm text-dark-muted mt-1">
            Total mensual: <span className="font-mono text-accent">{formatARS(totalMonthly)}</span>
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-accent text-dark-bg px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent/90"
        >
          <Plus size={16} /> {t('expenses.add')}
        </button>
      </div>

      {showAdd && (
        <div className="bg-dark-surface border border-dark-border rounded-xl p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder={t('expenses.description')}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={200}
              className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder={t('expenses.amount')}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              min="0"
              className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              <option value="expense">{t('expenses.expense')}</option>
              <option value="income">{t('expenses.income')}</option>
            </select>
            <select
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              <option value="monthly">{t('recurring.monthly')}</option>
              <option value="weekly">{t('recurring.weekly')}</option>
            </select>
            <input
              type="date"
              value={form.next_date}
              onChange={(e) => setForm({ ...form, next_date: e.target.value })}
              className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
            <div className="flex-1" />
            <button onClick={handleAdd} className="bg-accent text-dark-bg px-4 py-2 rounded-lg text-sm font-semibold">
              {t('expenses.save')}
            </button>
            <button onClick={() => setShowAdd(false)} className="text-dark-muted hover:text-dark-text text-sm">
              {t('expenses.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Active */}
      <div className="space-y-2 mb-6">
        <h3 className="text-sm font-semibold text-dark-muted uppercase tracking-wide mb-3">{t('recurring.active')}</h3>
        {active.map((item) => (
          <RecurringItem key={item.id} item={item} onToggle={toggleActive} onDelete={deleteRecurring} />
        ))}
        {active.length === 0 && (
          <p className="text-sm text-dark-muted py-4 text-center">{t('recurring.noRecurring')}</p>
        )}
      </div>

      {/* Inactive */}
      {inactive.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-dark-muted uppercase tracking-wide mb-3">{t('recurring.paused')}</h3>
          {inactive.map((item) => (
            <RecurringItem key={item.id} item={item} onToggle={toggleActive} onDelete={deleteRecurring} />
          ))}
        </div>
      )}
    </div>
  )
}

function RecurringItem({ item, onToggle, onDelete }) {
  const { t } = useTranslation()
  return (
    <div className={`bg-dark-surface border border-dark-border rounded-xl p-4 flex items-center gap-4 ${!item.active ? 'opacity-50' : ''}`}>
      <button onClick={() => onToggle(item.id)} className="text-dark-muted hover:text-accent">
        {item.active ? <ToggleRight size={24} className="text-accent" /> : <ToggleLeft size={24} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.description}</p>
        <p className="text-xs text-dark-muted">
          {item.category} · {item.frequency === 'monthly' ? t('recurring.monthly') : t('recurring.weekly')} · {t('recurring.nextDate') + ':'} {item.next_date}
        </p>
      </div>
      <div className="text-right">
        <p className={`font-mono font-medium text-sm ${item.type === 'income' ? 'text-accent' : 'text-dark-text'}`}>
          {item.type === 'income' ? '+' : '-'}{formatARS(item.amount)}
        </p>
      </div>
      <button onClick={() => onDelete(item.id)} className="text-dark-muted hover:text-red-400">
        <Trash2 size={14} />
      </button>
    </div>
  )
}
