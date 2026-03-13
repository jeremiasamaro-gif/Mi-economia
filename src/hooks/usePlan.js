import { useAuth } from './useAuth'
import { PLAN_LIMITS } from '../store/mockData'
import useAdminStore from '../store/adminStore'

export function usePlan() {
  const { user, isPro } = useAuth()
  const plan = user?.plan || 'free'
  const limits = PLAN_LIMITS[plan]
  const getUserFeatures = useAdminStore((s) => s.getUserFeatures)
  const features = user ? getUserFeatures(user.id, user.plan) : {}

  // Admin overrides can grant pro features to free users
  return {
    plan,
    isPro,
    limits,
    canUseAI: limits.hasAI || features.ai_chat === true,
    canUseRecurring: limits.hasRecurring || features.recurring === true,
    canUseCharts: limits.hasCharts || features.dashboard === true,
    canUseBudgets: limits.hasBudgets || features.budgets === true,
    canUseTags: limits.hasTags,
    canUseSplitting: limits.hasSplitting,
    canUseCsvExport: limits.hasCsvExport,
    maxExpenses: limits.maxExpensesPerMonth,
  }
}
