import { create } from 'zustand'
import { mockUsers } from './mockData'

// TODO SUPABASE: replace with supabase.auth.signIn/signUp/signOut

const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,

  login: (email, password) => {
    set({ loading: true, error: null })
    // TODO SUPABASE: replace with supabase.auth.signInWithPassword({ email, password })
    const found = mockUsers.find((u) => u.email === email)
    if (found) {
      set({ user: found, loading: false })
      return true
    }
    set({ error: 'Credenciales inválidas', loading: false })
    return false
  },

  register: (email, password, fullName) => {
    set({ loading: true, error: null })
    // TODO SUPABASE: replace with supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
    const exists = mockUsers.find((u) => u.email === email)
    if (exists) {
      set({ error: 'El email ya está registrado', loading: false })
      return false
    }
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      full_name: fullName,
      plan: 'free',
      role: 'user',
      mp_payment_id: null,
      subscription_status: 'inactive',
      created_at: new Date().toISOString(),
    }
    mockUsers.push(newUser)
    set({ user: newUser, loading: false })
    return true
  },

  logout: () => {
    // TODO SUPABASE: replace with supabase.auth.signOut()
    set({ user: null, error: null })
  },

  clearError: () => set({ error: null }),

  isAdmin: () => get().user?.role === 'admin',
  isPro: () => get().user?.plan === 'pro',
}))

export default useAuthStore
