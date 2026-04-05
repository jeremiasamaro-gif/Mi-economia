/**
 * Trial Logic — Calculate trial status from user profile
 *
 * PURPOSE: Single source of truth for trial state calculations.
 * Used by TrialBanner, usePlan, and any component that needs trial info.
 *
 * Currently uses mock profile data from Zustand authStore.
 * TODO SUPABASE: Profile will come from supabase.auth.getUser()
 * and the server-side get_effective_plan() function.
 *
 * SECURITY NOTE:
 * These calculations are for UI display ONLY.
 * The server-side trigger (get_effective_plan) is the source of truth.
 * A user manipulating trial_ends_at in DevTools gains nothing because:
 * 1. RLS prevents users from updating their own plan/subscription_status
 * 2. Every API call checks the REAL plan via RLS or Edge Function
 * 3. The expire_trials() cron job cleans up expired trials hourly
 */

import { TRIAL_DAYS } from '../core/constants'

/**
 * Calculate trial status from a user profile.
 *
 * @param {object} profile - User profile with trial fields
 * @param {string} profile.subscription_status - 'trial' | 'active' | 'inactive' | 'disabled'
 * @param {string} [profile.trial_start] - ISO timestamp when trial started
 * @param {string} [profile.trial_ends_at] - ISO timestamp when trial expires
 * @param {string} profile.plan - 'free' | 'pro'
 * @returns {object} trial status
 */
export function getTrialStatus(profile) {
  if (!profile) {
    return {
      isTrialActive: false,
      trialDaysRemaining: 0,
      trialExpired: false,
      effectivePlan: 'free',
    }
  }

  const now = new Date()

  // Calculate trial expiry
  const trialStart = profile.trial_start
    ? new Date(profile.trial_start)
    : profile.trial_ends_at
      ? new Date(new Date(profile.trial_ends_at).getTime() - TRIAL_DAYS * 24 * 60 * 60 * 1000)
      : null

  const trialExpiry = profile.trial_ends_at
    ? new Date(profile.trial_ends_at)
    : trialStart
      ? new Date(trialStart.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
      : null

  // Is trial currently active?
  const isTrialActive =
    profile.subscription_status === 'trial' &&
    trialExpiry !== null &&
    trialExpiry > now

  // Days remaining (0 if expired or not on trial)
  const trialDaysRemaining = isTrialActive
    ? Math.ceil((trialExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Did the trial expire? (was on trial, but time ran out)
  const trialExpired =
    profile.subscription_status === 'trial' &&
    trialExpiry !== null &&
    trialExpiry <= now

  // Effective plan: trial users get pro access
  // TODO SUPABASE: use server-side get_effective_plan() instead
  let effectivePlan = profile.plan
  if (isTrialActive) {
    effectivePlan = 'pro'
  } else if (trialExpired) {
    effectivePlan = 'free'
  } else if (profile.subscription_status === 'active') {
    effectivePlan = 'pro'
  }

  return {
    isTrialActive,
    trialDaysRemaining,
    trialExpired,
    effectivePlan,
  }
}
