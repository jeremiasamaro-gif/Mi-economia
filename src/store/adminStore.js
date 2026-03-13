import { create } from 'zustand'
import { mockUsers, mockFeatureFlags, mockPayments } from './mockData'

// TODO SUPABASE: replace all with Supabase admin queries (need service_role key on backend)

const useAdminStore = create((set, get) => ({
  users: [...mockUsers],
  featureFlags: [...mockFeatureFlags],
  payments: [...mockPayments],

  // Users
  getAllUsers: () => get().users,

  updateUserPlan: (userId, plan) => {
    // TODO SUPABASE: replace with supabase.from('profiles').update({ plan, subscription_status }).eq('id', userId)
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId
          ? { ...u, plan, subscription_status: plan === 'pro' ? 'active' : 'inactive' }
          : u
      ),
    }))
  },

  disableUser: (userId) => {
    // TODO SUPABASE: replace with supabase.auth.admin.updateUserById(userId, { banned: true })
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, subscription_status: 'disabled' } : u
      ),
    }))
  },

  // Feature flags
  toggleFeatureFlag: (key) => {
    // TODO SUPABASE: replace with supabase.from('feature_flags').update({ enabled }).eq('key', key)
    set((state) => ({
      featureFlags: state.featureFlags.map((f) =>
        f.key === key ? { ...f, enabled: !f.enabled } : f
      ),
    }))
  },

  isFeatureEnabled: (key) => {
    const flag = get().featureFlags.find((f) => f.key === key)
    return flag ? flag.enabled : true
  },

  // Stats
  getStats: () => {
    const users = get().users
    const totalUsers = users.length
    const proUsers = users.filter((u) => u.plan === 'pro').length
    const freeUsers = users.filter((u) => u.plan === 'free').length
    const estimatedMRR = proUsers * 2999 // placeholder price

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const newThisWeek = users.filter((u) => new Date(u.created_at) > oneWeekAgo).length

    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    const newThisMonth = users.filter((u) => new Date(u.created_at) > oneMonthAgo).length

    return { totalUsers, proUsers, freeUsers, estimatedMRR, newThisWeek, newThisMonth }
  },
}))

export default useAdminStore
