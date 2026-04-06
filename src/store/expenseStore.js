import { create } from 'zustand'
import { mockExpenses, PLAN_LIMITS } from './mockData'

// TODO SUPABASE: replace with supabase.from('expenses').select/insert/update/delete

const useExpenseStore = create((set, get) => ({
  expenses: [...mockExpenses],

  getExpensesForUser: (userId) => {
    return get().expenses.filter((e) => e.user_id === userId)
  },

  getCurrentMonthExpenses: (userId) => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()
    return get().expenses.filter((e) => {
      if (e.user_id !== userId) return false
      const d = new Date(e.date)
      return d.getMonth() === month && d.getFullYear() === year && e.type === 'expense'
    })
  },

  getCurrentMonthCount: (userId) => {
    return get().getCurrentMonthExpenses(userId).length
  },

  canAddExpense: (userId, plan) => {
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free
    const count = get().getCurrentMonthCount(userId)
    return count < limits.maxExpensesPerMonth
  },

  addExpense: (expense, userId, plan) => {
    // BUG-010 FIX: Enforce limit INSIDE addExpense — caller cannot bypass
    const effectivePlan = plan || 'free'
    if (!get().canAddExpense(userId, effectivePlan)) {
      return { error: 'LIMIT_REACHED', expense: null }
    }

    // Sanitize inputs
    const sanitized = {
      ...expense,
      id: `e-${crypto.randomUUID()}`, // BUG-033 FIX: collision-free IDs
      user_id: userId, // Always set from auth, never from client payload
      description: String(expense.description || '').slice(0, 200),
      category: String(expense.category || '').slice(0, 50),
      amount: Math.max(0, Number(expense.amount) || 0),
      tags: Array.isArray(expense.tags) ? expense.tags.map((t) => String(t).slice(0, 30)).slice(0, 10) : [],
      created_at: new Date().toISOString(),
    }

    // Reject zero-amount expenses
    if (sanitized.amount <= 0) {
      return { error: 'INVALID_AMOUNT', expense: null }
    }

    // TODO SUPABASE: replace with supabase.from('expenses').insert(sanitized)
    set((state) => ({ expenses: [...state.expenses, sanitized] }))
    return { error: null, expense: sanitized }
  },

  // BUG-015 FIX: require userId to prevent cross-user mutations
  updateExpense: (id, updates, userId) => {
    // TODO SUPABASE: replace with supabase.from('expenses').update(updates).eq('id', id).eq('user_id', userId)
    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === id && e.user_id === userId ? { ...e, ...updates } : e
      ),
    }))
  },

  // BUG-015 FIX: require userId to prevent cross-user deletions
  deleteExpense: (id, userId) => {
    // TODO SUPABASE: replace with supabase.from('expenses').delete().eq('id', id).eq('user_id', userId)
    set((state) => ({
      expenses: state.expenses.filter((e) => !(e.id === id && e.user_id === userId)),
    }))
  },

  getMonthlyTotals: (userId, months = 6) => {
    const expenses = get().expenses.filter((e) => e.user_id === userId)
    const result = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = d.getMonth()
      const year = d.getFullYear()
      const monthName = d.toLocaleString('es-AR', { month: 'short' })

      const monthExpenses = expenses.filter((e) => {
        const ed = new Date(e.date)
        return ed.getMonth() === month && ed.getFullYear() === year
      })

      const income = monthExpenses
        .filter((e) => e.type === 'income')
        .reduce((sum, e) => sum + e.amount, 0)
      const expense = monthExpenses
        .filter((e) => e.type === 'expense')
        .reduce((sum, e) => sum + e.amount, 0)

      result.push({ month: monthName, income, expense, balance: income - expense })
    }
    return result
  },

  getCategoryTotals: (userId) => {
    const currentMonth = get().getCurrentMonthExpenses(userId)
    const totals = {}
    currentMonth.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount
    })
    return Object.entries(totals).map(([name, value]) => ({ name, value }))
  },
}))

export default useExpenseStore
