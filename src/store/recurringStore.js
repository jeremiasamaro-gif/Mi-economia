import { create } from 'zustand'
import { mockRecurringExpenses } from './mockData'

// TODO SUPABASE: replace with supabase.from('recurring_expenses').select/insert/update/delete

const useRecurringStore = create((set, get) => ({
  recurringExpenses: [...mockRecurringExpenses],

  getForUser: (userId) => {
    return get().recurringExpenses.filter((r) => r.user_id === userId)
  },

  addRecurring: (recurring) => {
    const sanitized = {
      ...recurring,
      id: `r-${Date.now()}`,
      description: String(recurring.description || '').slice(0, 200),
      category: String(recurring.category || '').slice(0, 50),
      amount: Math.max(0, Number(recurring.amount) || 0),
      active: true,
    }
    // TODO SUPABASE: replace with supabase.from('recurring_expenses').insert(sanitized)
    set((state) => ({ recurringExpenses: [...state.recurringExpenses, sanitized] }))
  },

  toggleActive: (id) => {
    // TODO SUPABASE: replace with supabase.from('recurring_expenses').update({ active }).eq('id', id)
    set((state) => ({
      recurringExpenses: state.recurringExpenses.map((r) =>
        r.id === id ? { ...r, active: !r.active } : r
      ),
    }))
  },

  deleteRecurring: (id) => {
    // TODO SUPABASE: replace with supabase.from('recurring_expenses').delete().eq('id', id)
    set((state) => ({
      recurringExpenses: state.recurringExpenses.filter((r) => r.id !== id),
    }))
  },
}))

export default useRecurringStore
