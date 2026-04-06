import useExpenseStore from '../store/expenseStore'
import { useAuth } from './useAuth'

export function useExpenses() {
  const { user, isPro } = useAuth()
  const userId = user?.id
  // Use effective plan: trial users get pro access
  const effectivePlan = isPro ? 'pro' : 'free'
  const store = useExpenseStore()

  return {
    expenses: userId ? store.getExpensesForUser(userId) : [],
    currentMonthExpenses: userId ? store.getCurrentMonthExpenses(userId) : [],
    currentMonthCount: userId ? store.getCurrentMonthCount(userId) : 0,
    canAdd: userId ? store.canAddExpense(userId, effectivePlan) : false,
    // Updated signature: addExpense now enforces limits internally
    addExpense: (expense) => store.addExpense(expense, userId, effectivePlan),
    updateExpense: (id, updates) => store.updateExpense(id, updates, userId),
    deleteExpense: (id) => store.deleteExpense(id, userId),
    monthlyTotals: userId ? store.getMonthlyTotals(userId) : [],
    categoryTotals: userId ? store.getCategoryTotals(userId) : [],
  }
}
