import { create } from 'zustand'
import { mockUsers } from './mockData'

// TODO SUPABASE: replace with supabase.auth.signIn/signUp/signOut

// Track registered users separately (visible in admin panel)
export const registeredUsers = []

// ---------------------------------------------------------------------------
// AUTH SNAPSHOT — immutable copy of auth state at login time.
// Components read from this snapshot via isPro()/isAdmin().
// The snapshot is FROZEN — client-side mutations have no effect.
// ---------------------------------------------------------------------------
let _authSnapshot = null

function createSnapshot(user) {
  if (!user) return null
  return Object.freeze({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    plan: user.plan,
    role: user.role,
    subscription_status: user.subscription_status,
    trial_ends_at: user.trial_ends_at || null,
    mp_payment_id: user.mp_payment_id || null,
  })
}

// Generic error message — NEVER reveal if email exists or password is wrong
const GENERIC_AUTH_ERROR = 'Credenciales inválidas'

const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,

  login: (email, password) => {
    set({ loading: true, error: null })
    // TODO SUPABASE: replace with supabase.auth.signInWithPassword({ email, password })

    // Check mock users (admin + demo) — all require _devPassword match
    const found = mockUsers.find((u) => u.email === email)
    if (found) {
      if (found._devPassword && found._devPassword !== password) {
        set({ error: GENERIC_AUTH_ERROR, loading: false })
        return false
      }
      if (!found._devPassword) {
        // No password set = reject login (should never happen with DEV_PASSWORD)
        set({ error: GENERIC_AUTH_ERROR, loading: false })
        return false
      }
      _authSnapshot = createSnapshot(found)
      set({ user: found, loading: false })
      return true
    }

    // Check registered users — strict password check
    const registered = registeredUsers.find((u) => u.email === email)
    if (registered) {
      if (registered.password !== password) {
        // Same generic error — never reveal "email exists but password wrong"
        set({ error: GENERIC_AUTH_ERROR, loading: false })
        return false
      }
      // Check if trial has expired
      if (registered.subscription_status === 'trial' && registered.trial_ends_at) {
        if (new Date() > new Date(registered.trial_ends_at)) {
          registered.plan = 'free'
          registered.subscription_status = 'inactive'
          registered.trial_ends_at = null
        }
      }
      _authSnapshot = createSnapshot(registered)
      set({ user: registered, loading: false })
      return true
    }

    // Same generic error for non-existent emails
    set({ error: GENERIC_AUTH_ERROR, loading: false })
    return false
  },

  register: (email, password, fullName, phone = null) => {
    set({ loading: true, error: null })
    // TODO SUPABASE: replace with supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })

    // Check if email exists — use same generic error to avoid email enumeration
    const existsMock = mockUsers.find((u) => u.email === email)
    const existsRegistered = registeredUsers.find((u) => u.email === email)
    if (existsMock || existsRegistered) {
      set({ error: GENERIC_AUTH_ERROR, loading: false })
      return false
    }

    // New users get 7-day Pro trial (mirrors DB trigger handle_new_user_trial)
    const trialStart = new Date()
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 7)

    const newUser = {
      id: `user-${crypto.randomUUID()}`,
      email,
      full_name: fullName,
      phone,
      password,
      plan: 'free',               // Base plan is free (trial grants pro access)
      role: 'user',
      mp_payment_id: null,
      subscription_status: 'trial',
      trial_start: trialStart.toISOString(),
      trial_ends_at: trialEnd.toISOString(),
      created_at: new Date().toISOString(),
    }
    registeredUsers.push(newUser)
    _authSnapshot = createSnapshot(newUser)
    set({ user: newUser, loading: false })
    return true
  },

  logout: () => {
    // TODO SUPABASE: replace with supabase.auth.signOut()
    _authSnapshot = null
    set({ user: null, error: null })
  },

  clearError: () => set({ error: null }),

  // Read from FROZEN snapshot — immune to DevTools mutation
  isAdmin: () => _authSnapshot?.role === 'admin',

  // Pro = paid pro OR active trial (mirrors server-side get_effective_plan)
  isPro: () => {
    if (!_authSnapshot) return false
    if (_authSnapshot.plan === 'pro' && _authSnapshot.subscription_status === 'active') return true
    if (_authSnapshot.subscription_status === 'trial' && _authSnapshot.trial_ends_at) {
      return new Date(_authSnapshot.trial_ends_at) > new Date()
    }
    return false
  },

  // Trial helpers — also read from snapshot
  isTrial: () => _authSnapshot?.subscription_status === 'trial',
  trialDaysLeft: () => {
    if (_authSnapshot?.subscription_status !== 'trial' || !_authSnapshot?.trial_ends_at) return 0
    const diff = new Date(_authSnapshot.trial_ends_at) - new Date()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  },

  // Expose snapshot for read-only access (e.g., plan checks in other stores)
  getSnapshot: () => _authSnapshot,
}))

export default useAuthStore
