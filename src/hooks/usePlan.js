import { useAuth } from './useAuth'
import { PLAN_LIMITS } from '../store/mockData'

export function usePlan() {
  const { user, isPro } = useAuth()
  const plan = user?.plan || 'free'
  const limits = PLAN_LIMITS[plan]

  return {
    plan,
    isPro,
    limits,
    canUseAI: limits.hasAI,
    canUseRecurring: limits.hasRecurring,
    canUseCharts: limits.hasCharts,
    canUseBudgets: limits.hasBudgets,
    canUseTags: limits.hasTags,
    canUseSplitting: limits.hasSplitting,
    canUseCsvExport: limits.hasCsvExport,
    maxExpenses: limits.maxExpensesPerMonth,
  }
}
