/**
 * Auth Service — Data abstraction layer for authentication
 *
 * PURPOSE: Decouples UI components from auth implementation.
 * Currently delegates to Zustand (mock auth with hardcoded users).
 * When Supabase is integrated, ONLY this file changes — no component edits needed.
 *
 * SECURITY NOTES (for Supabase migration):
 * - Never store plain text passwords (Supabase Auth handles hashing)
 * - Use supabase.auth.getSession() to validate session, not localStorage
 * - Admin role must be verified server-side via RLS or Edge Function
 * - Trial expiry must be checked server-side (user can manipulate client clock)
 * - Rate limit login attempts server-side (Supabase Auth does this by default)
 *
 * MIGRATION GUIDE:
 * 1. Replace login() with supabase.auth.signInWithPassword()
 * 2. Replace register() with supabase.auth.signUp() + profiles insert
 * 3. Replace logout() with supabase.auth.signOut()
 * 4. Replace checkSession() with supabase.auth.getSession()
 * 5. Remove Zustand store dependency entirely
 */

import useAuthStore, { registeredUsers } from '../store/authStore'

// ---------------------------------------------------------------------------
// AUTH OPERATIONS
// ---------------------------------------------------------------------------

/**
 * Sign in with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {{ success: boolean, error?: string }}
 */
export function login(email, password) {
  // TODO SUPABASE:
  // const { data, error } = await supabase.auth.signInWithPassword({
  //   email,
  //   password,
  // })
  // if (error) return { success: false, error: error.message }
  //
  // // Fetch profile with plan info
  // const { data: profile } = await supabase
  //   .from('profiles')
  //   .select('*')
  //   .eq('id', data.user.id)
  //   .single()
  //
  // // Server-side trial expiry check (via DB trigger or Edge Function)
  // return { success: true, user: profile }

  const result = useAuthStore.getState().login(email, password)
  const error = useAuthStore.getState().error
  return { success: result, error: error || undefined }
}

/**
 * Register a new user account.
 * New users get a 7-day Pro trial.
 * @param {string} email
 * @param {string} password
 * @param {string} fullName
 * @param {string|null} phone
 * @returns {{ success: boolean, error?: string }}
 */
export function register(email, password, fullName, phone = null) {
  // TODO SUPABASE:
  // const { data, error } = await supabase.auth.signUp({
  //   email,
  //   password,
  //   options: {
  //     data: {
  //       full_name: fullName,
  //       phone: phone,
  //     },
  //   },
  // })
  // if (error) return { success: false, error: error.message }
  //
  // // Profile created automatically via DB trigger on auth.users insert:
  // // - plan = 'pro'
  // // - subscription_status = 'trial'
  // // - trial_ends_at = now() + interval '7 days'
  // // - role = 'user' (NEVER set from client)
  //
  // return { success: true, user: data.user }

  const result = useAuthStore.getState().register(email, password, fullName, phone)
  const error = useAuthStore.getState().error
  return { success: result, error: error || undefined }
}

/**
 * Sign out the current user.
 */
export function logout() {
  // TODO SUPABASE:
  // await supabase.auth.signOut()
  useAuthStore.getState().logout()
}

/**
 * Check if there's an active session.
 * SECURITY: When using Supabase, this validates the JWT — not just localStorage.
 * @returns {{ user: object|null, session: object|null }}
 */
export function checkSession() {
  // TODO SUPABASE:
  // const { data: { session }, error } = await supabase.auth.getSession()
  // if (!session) return { user: null, session: null }
  //
  // const { data: profile } = await supabase
  //   .from('profiles')
  //   .select('*')
  //   .eq('id', session.user.id)
  //   .single()
  //
  // // Validate trial server-side
  // if (profile.subscription_status === 'trial') {
  //   if (new Date() > new Date(profile.trial_ends_at)) {
  //     await supabase.from('profiles').update({
  //       plan: 'free',
  //       subscription_status: 'inactive',
  //       trial_ends_at: null,
  //     }).eq('id', session.user.id)
  //     profile.plan = 'free'
  //   }
  // }
  //
  // return { user: profile, session }

  const user = useAuthStore.getState().user
  return { user, session: user ? { mock: true } : null }
}

// ---------------------------------------------------------------------------
// HELPERS (derived from session)
// ---------------------------------------------------------------------------

/**
 * Check if current user has admin role.
 * SECURITY: In production, admin check MUST happen server-side via:
 * - RLS policy: auth.jwt() ->> 'role' = 'admin'
 * - Edge Function: verify role from profiles table
 * Frontend check is for UI display only.
 */
export function isAdmin() {
  return useAuthStore.getState().isAdmin()
}

/**
 * Check if current user is on Pro plan (paid or trial).
 */
export function isPro() {
  return useAuthStore.getState().isPro()
}

/**
 * Check if user is on active trial.
 */
export function isTrial() {
  return useAuthStore.getState().isTrial()
}

/**
 * Get remaining trial days.
 * @returns {number}
 */
export function trialDaysLeft() {
  return useAuthStore.getState().trialDaysLeft()
}
