import { create } from 'zustand'
import { mockBudgets } from './mockData'

// TODO SUPABASE: replace with supabase.from('budgets').select/insert/update/delete

const useBudgetStore = create((set, get) => ({
  budgets: [...mockBudgets],

  getBudgetsForUser: (userId) => {
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return get().budgets.filter((b) => b.user_id === userId && b.month === currentMonth)
  },

  addBudget: (budget) => {
    const sanitized = {
      ...budget,
      id: `b-${Date.now()}`,
      category: String(budget.category || '').slice(0, 50),
      limit_amount: Math.max(0, Number(budget.limit_amount) || 0),
    }
    // TODO SUPABASE: replace with supabase.from('budgets').insert(sanitized)
    set((state) => ({ budgets: [...state.budgets, sanitized] }))
  },

  updateBudget: (id, updates) => {
    // TODO SUPABASE: replace with supabase.from('budgets').update(updates).eq('id', id)
    set((state) => ({
      budgets: state.budgets.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }))
  },

  deleteBudget: (id) => {
    // TODO SUPABASE: replace with supabase.from('budgets').delete().eq('id', id)
    set((state) => ({
      budgets: state.budgets.filter((b) => b.id !== id),
    }))
  },
}))

export default useBudgetStore
