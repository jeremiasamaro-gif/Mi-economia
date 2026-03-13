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
      set({ user: registered, loading: false })
      return true
    }

    set({ error: 'Credenciales inválidas', loading: false })
    return false
  },

  register: (email, password, fullName) => {
    set({ loading: true, error: null })
    // TODO SUPABASE: replace with supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })

    // Check if email exists in mock or registered users
    const existsMock = mockUsers.find((u) => u.email === email)
    const existsRegistered = registeredUsers.find((u) => u.email === email)
    if (existsMock || existsRegistered) {
      set({ error: 'El email ya está registrado', loading: false })
      return false
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email,
      full_name: fullName,
      password,
      plan: 'free',
      role: 'user',
      mp_payment_id: null,
      subscription_status: 'inactive',
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
  isPro: () => get().user?.plan === 'pro',
}))

export default useAuthStore
