import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import useBudgetStore from '../../store/budgetStore'
import { useAuth } from '../../hooks/useAuth'
import { useExpenses } from '../../hooks/useExpenses'
import { CATEGORIES } from '../../store/mockData'

const formatARS = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

export default function BudgetManager() {
  const { user } = useAuth()
  const { currentMonthExpenses } = useExpenses()
  const budgets = useBudgetStore((s) => s.getBudgetsForUser(user?.id))
  const addBudget = useBudgetStore((s) => s.addBudget)
  const updateBudget = useBudgetStore((s) => s.updateBudget)
  const deleteBudget = useBudgetStore((s) => s.deleteBudget)

  const [showAdd, setShowAdd] = useState(false)
  const [newBudget, setNewBudget] = useState({ category: 'Alimentación', limit_amount: '' })

  const getSpent = (category) => {
    return currentMonthExpenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0)
  }

  const handleAdd = () => {
    const amount = Number(newBudget.limit_amount)
    if (!amount || !newBudget.category) return
    const now = new Date()
    addBudget({
      ...newBudget,
      limit_amount: amount,
      user_id: user.id,
      month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    })
    setNewBudget({ category: 'Alimentación', limit_amount: '' })
    setShowAdd(false)
  }

  const usedCategories = budgets.map((b) => b.category)
  const availableCategories = CATEGORIES.filter((c) => c !== 'Ingresos' && !usedCategories.includes(c))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Presupuestos</h2>
        {availableCategories.length > 0 && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 bg-accent text-dark-bg px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent/90"
          >
            <Plus size={16} /> Agregar
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-dark-surface border border-dark-border rounded-xl p-4 mb-4 flex items-end gap-3">
          <div className="flex-1">
            <label className="text-xs text-dark-muted block mb-1">Categoría</label>
            <select
              value={newBudget.category}
              onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              {availableCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-dark-muted block mb-1">Límite mensual</label>
            <input
              type="number"
              value={newBudget.limit_amount}
              onChange={(e) => setNewBudget({ ...newBudget, limit_amount: e.target.value })}
              placeholder="$0"
              min="0"
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent"
            />
          </div>
          <button onClick={handleAdd} className="bg-accent text-dark-bg px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent/90">
            Guardar
          </button>
          <button onClick={() => setShowAdd(false)} className="text-dark-muted hover:text-dark-text text-sm px-2 py-2">
            Cancelar
          </button>
        </div>
      )}

      <div className="space-y-4">
        {budgets.map((budget) => {
          const spent = getSpent(budget.category)
          const pct = budget.limit_amount > 0 ? (spent / budget.limit_amount) * 100 : 0
          const barColor = pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-yellow-500' : 'bg-accent'

          return (
            <div key={budget.id} className="bg-dark-surface border border-dark-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{budget.category}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-dark-muted">
                    <span className="font-mono">{formatARS(spent)}</span>
                    {' / '}
                    <span className="font-mono">{formatARS(budget.limit_amount)}</span>
                  </span>
                  <button
                    onClick={() => deleteBudget(budget.id)}
                    className="text-dark-muted hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="w-full h-3 bg-dark-bg rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className={`text-xs ${pct > 80 ? 'text-red-400' : 'text-dark-muted'}`}>
                  {pct.toFixed(0)}% usado
                </span>
                <span className="text-xs text-dark-muted font-mono">
                  Restante: {formatARS(Math.max(0, budget.limit_amount - spent))}
                </span>
              </div>
            </div>
          )
        })}

        {budgets.length === 0 && (
          <div className="text-center py-12 text-dark-muted bg-dark-surface border border-dark-border rounded-xl">
            <p>No tenés presupuestos configurados</p>
            <p className="text-sm mt-1">Agregá límites por categoría para controlar tus gastos</p>
          </div>
        )}
      </div>
    </div>
  )
}
