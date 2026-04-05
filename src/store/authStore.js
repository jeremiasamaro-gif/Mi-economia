import { create } from 'zustand'
import { mockUsers } from './mockData'

// TODO SUPABASE: replace with supabase.auth.signIn/signUp/signOut

// Track registered users separately (visible in admin panel)
export const registeredUsers = []

const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,

  login: (email, password) => {
    set({ loading: true, error: null })
    // TODO SUPABASE: replace with supabase.auth.signInWithPassword({ email, password })

    // Check mock users (admin + demo)
    const found = mockUsers.find((u) => u.email === email)
    if (found) {
      // Admin requires correct password
      if (found.role === 'admin') {
        if (found.password && found.password !== password) {
          set({ error: 'Credenciales inválidas', loading: false })
          return false
        }
      }
      // Demo users accept any password
      set({ user: found, loading: false })
      return true
    }

    // Check registered users
    const registered = registeredUsers.find((u) => u.email === email)
    if (registered) {
      if (registered.password !== password) {
        set({ error: 'Contraseña incorrecta', loading: false })
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
      set({ user: registered, loading: false })
      return true
    }

    set({ error: 'Credenciales inválidas', loading: false })
    return false
  },

  register: (email, password, fullName, phone = null) => {
    set({ loading: true, error: null })
    // TODO SUPABASE: replace with supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })

    // Check if email exists in mock or registered users
    const existsMock = mockUsers.find((u) => u.email === email)
    const existsRegistered = registeredUsers.find((u) => u.email === email)
    if (existsMock || existsRegistered) {
      set({ error: 'El email ya está registrado', loading: false })
      return false
    }

    // New users get 7-day Pro trial (mirrors DB trigger handle_new_user_trial)
    const trialStart = new Date()
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 7)

    const newUser = {
      id: `user-${Date.now()}`,
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
    set({ user: newUser, loading: false })
    return true
  },

  logout: () => {
    // TODO SUPABASE: replace with supabase.auth.signOut()
    set({ user: null, error: null })
  },

  clearError: () => set({ error: null }),

  isAdmin: () => get().user?.role === 'admin',
  // Pro = paid pro OR active trial (mirrors server-side get_effective_plan)
  isPro: () => {
    const user = get().user
    if (!user) return false
    if (user.plan === 'pro' && user.subscription_status === 'active') return true
    if (user.subscription_status === 'trial' && user.trial_ends_at) {
      return new Date(user.trial_ends_at) > new Date()
    }
    return false
  },

  // Trial helpers
  isTrial: () => get().user?.subscription_status === 'trial',
  trialDaysLeft: () => {
    const user = get().user
    if (user?.subscription_status !== 'trial' || !user?.trial_ends_at) return 0
    const diff = new Date(user.trial_ends_at) - new Date()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  },
}))

export default useAuthStore
