import { useAuth } from './useAuth'
import { resolveCapabilities } from '../core/constants'
import useAdminStore from '../store/adminStore'

/**
 * usePlan — resolves the current user's capabilities.
 *
 * Uses the centralized PLAN_PERMISSIONS from core/constants.js
 * merged with admin feature overrides from adminStore.
 *
 * Components should ask: capabilities.canUseOCR
 * NOT: plan === 'pro'
 *
 * SECURITY: These are client-side checks for UI gating only.
 * Server-side RLS + Edge Functions enforce the real limits.
 */
export function usePlan() {
  const { user, isPro } = useAuth()
  const plan = user?.plan || 'free'
  const role = user?.role || 'user'
  const getUserFeatures = useAdminStore((s) => s.getUserFeatures)
  const adminOverrides = user ? getUserFeatures(user.id, user.plan) : {}

  // Resolve all capabilities from centralized permissions + admin overrides
  const capabilities = resolveCapabilities(plan, role, adminOverrides)

  // Return capabilities with backward-compatible names
  return {
    plan,
    isPro,
    capabilities,
    // Backward-compatible aliases (used by existing components)
    canUseRecurring: capabilities.canUseRecurring,
    canUseCharts: capabilities.canUseCharts,
    canUseBudgets: capabilities.canUseBudgets,
    canUseTags: capabilities.canUseTags,
    canUseSplitting: capabilities.canUseSplitting,
    canUseCsvExport: capabilities.canUseCsvExport,
    canUseAchievements: capabilities.canUseAchievements,
    canUseGroups: capabilities.canUseGroups,
    canUseScanner: capabilities.canUseOCR,
    canUseWhatsApp: capabilities.canUseWhatsApp,
    canAccessAdmin: capabilities.canAccessAdmin,
    maxExpenses: capabilities.maxExpensesPerMonth,
  }
}
