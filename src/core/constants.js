/**
 * Centralized Plan Permissions (Capabilities System)
 *
 * PURPOSE: Single source of truth for what each plan can do.
 * Components ask: if (capabilities.canUseOCR) instead of if (plan === 'pro')
 *
 * SECURITY NOTES:
 * - These constants are for UI display and client-side gating ONLY
 * - Server-side enforcement happens via:
 *   1. RLS policies (row-level access control)
 *   2. DB triggers (plan limit enforcement)
 *   3. Edge Functions (feature access validation)
 * - A user manipulating these values in DevTools gains NOTHING because
 *   the backend independently checks entitlements on every mutation
 *
 * MIGRATION GUIDE:
 * When Supabase is live, capabilities should be fetched from a
 * server-side 'entitlements' table or computed in an Edge Function,
 * then passed to the client. This file becomes the FALLBACK only.
 */

// ---------------------------------------------------------------------------
// PLAN DEFINITIONS
// ---------------------------------------------------------------------------

export const PLANS = {
  FREE: 'free',
  PRO: 'pro',
}

// ---------------------------------------------------------------------------
// CAPABILITIES MAP
// ---------------------------------------------------------------------------
// Each key is a capability name used in components.
// Value per plan: true = allowed, false = blocked.

export const PLAN_PERMISSIONS = {
  free: {
    // Expenses
    maxExpensesPerMonth: 20,
    canUseExpenses: true,
    canUseDashboard: true,

    // Pro features — blocked
    canUseRecurring: false,
    canUseCharts: false,
    canUseBudgets: false,
    canUseTags: false,
    canUseSplitting: false,
    canUseCsvExport: false,
    canUseAchievements: false,
    canUseGroups: false,
    canUseOCR: false,        // Ticket Scanner
    canUseWhatsApp: false,

    // Admin
    canAccessAdmin: false,
  },
  pro: {
    // Expenses
    maxExpensesPerMonth: Infinity,
    canUseExpenses: true,
    canUseDashboard: true,

    // Pro features — all unlocked
    canUseRecurring: true,
    canUseCharts: true,
    canUseBudgets: true,
    canUseTags: true,
    canUseSplitting: true,
    canUseCsvExport: true,
    canUseAchievements: true,
    canUseGroups: true,
    canUseOCR: true,
    canUseWhatsApp: true,

    // Admin
    canAccessAdmin: false, // Admin is role-based, not plan-based
  },
}

// ---------------------------------------------------------------------------
// HELPER: Resolve capabilities for a user
// ---------------------------------------------------------------------------

/**
 * Resolves the full capabilities object for a user.
 * Merges plan permissions with admin feature overrides.
 *
 * @param {string} plan - 'free' | 'pro'
 * @param {string} role - 'user' | 'admin'
 * @param {object} adminOverrides - feature toggles set by admin (from adminStore)
 * @returns {object} capabilities
 */
export function resolveCapabilities(plan = 'free', role = 'user', adminOverrides = {}) {
  const base = { ...(PLAN_PERMISSIONS[plan] || PLAN_PERMISSIONS.free) }

  // Admin role always gets admin access
  if (role === 'admin') {
    base.canAccessAdmin = true
  }

  // Admin feature overrides can grant pro features to free users
  // or revoke features from pro users
  const overrideMap = {
    dashboard: 'canUseDashboard',
    expenses: 'canUseExpenses',
    budgets: 'canUseBudgets',
    recurring: 'canUseRecurring',
    achievements: 'canUseAchievements',
    groups: 'canUseGroups',
    whatsapp: 'canUseWhatsApp',
    scanner: 'canUseOCR',
  }

  for (const [featureKey, capabilityKey] of Object.entries(overrideMap)) {
    if (adminOverrides[featureKey] === true) {
      base[capabilityKey] = true
    } else if (adminOverrides[featureKey] === false) {
      base[capabilityKey] = false
    }
  }

  return base
}

// ---------------------------------------------------------------------------
// PRICING (display only — server validates actual amounts)
// ---------------------------------------------------------------------------

export const PRICING = {
  monthly: {
    amount: 7500,
    currency: 'ARS',
    label_es: '$7.500 ARS / mes',
    label_en: '$7,500 ARS / month',
  },
  annual: {
    amount: 65000,
    currency: 'ARS',
    label_es: '$65.000 ARS / año',
    label_en: '$65,000 ARS / year',
    savings_percent: 28,
  },
}

// ---------------------------------------------------------------------------
// SECURITY CONSTANTS
// ---------------------------------------------------------------------------

// Admin email — NEVER passed from frontend, hardcoded server-side too
export const ADMIN_EMAIL = 'jeremias@mieconomia.com'

// Trial duration in days
export const TRIAL_DAYS = 7

// Rate limits (enforced server-side, these are for UI messages)
export const RATE_LIMITS = {
  supportMessagesPerHour: 10,
  loginAttemptsBeforeLock: 5,
  loginLockMinutes: 15,
}
