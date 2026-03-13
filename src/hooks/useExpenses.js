import useExpenseStore from '../store/expenseStore'
import { useAuth } from './useAuth'

export function useExpenses() {
  const { user } = useAuth()
  const userId = user?.id
  const store = useExpenseStore()

  return {
    expenses: userId ? store.getExpensesForUser(userId) : [],
    currentMonthExpenses: userId ? store.getCurrentMonthExpenses(userId) : [],
    currentMonthCount: userId ? store.getCurrentMonthCount(userId) : 0,
    canAdd: userId ? store.canAddExpense(userId, user.plan) : false,
    addExpense: (expense) => store.addExpense({ ...expense, user_id: userId }),
    updateExpense: store.updateExpense,
    deleteExpense: store.deleteExpense,
    monthlyTotals: userId ? store.getMonthlyTotals(userId) : [],
    categoryTotals: userId ? store.getCategoryTotals(userId) : [],
  }
}
