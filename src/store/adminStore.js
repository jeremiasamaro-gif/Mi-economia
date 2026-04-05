import { create } from 'zustand'
import { mockUsers, mockFeatureFlags, mockPayments } from './mockData'
import { registeredUsers } from './authStore'

// TODO SUPABASE: replace all with Supabase admin queries (need service_role key on backend)

// Per-user feature overrides: { [userId]: { dashboard: true, expenses: true, budgets: false, ... } }
// null = use plan defaults, true/false = admin override
const SIDEBAR_FEATURES = ['dashboard', 'expenses', 'budgets', 'recurring', 'achievements', 'groups', 'whatsapp', 'scanner']

const getDefaultFeatures = (plan) => ({
  dashboard: true,       // all plans
  expenses: true,        // all plans
  budgets: plan === 'pro',
  recurring: plan === 'pro',
  achievements: plan === 'pro',
  groups: plan === 'pro',
  whatsapp: plan === 'pro',
  scanner: plan === 'pro',
})

const useAdminStore = create((set, get) => ({
  featureFlags: [...mockFeatureFlags],
  payments: [...mockPayments],
  userFeatureOverrides: {},  // { userId: { feature: boolean } }

  // Users — combines demo users + real registered users
  // Only registered users count in stats (demo users are excluded)
  getAllUsers: () => {
    const demoUsers = mockUsers.filter((u) => u.role !== 'admin')
    return [...demoUsers, ...registeredUsers]
  },

  getRegisteredUsers: () => [...registeredUsers],

  updateUserPlan: (userId, plan) => {
    // Check registered users first
    const regUser = registeredUsers.find((u) => u.id === userId)
    if (regUser) {
      regUser.plan = plan
      regUser.subscription_status = plan === 'pro' ? 'active' : 'inactive'
    }
    // Force re-render
    set((s) => ({ ...s }))
  },

  disableUser: (userId) => {
    const regUser = registeredUsers.find((u) => u.id === userId)
    if (regUser) {
      regUser.subscription_status = 'disabled'
    }
    set((s) => ({ ...s }))
  },

  // Per-user feature toggles
  getUserFeatures: (userId, plan) => {
    const defaults = getDefaultFeatures(plan || 'free')
    const overrides = get().userFeatureOverrides[userId]
    if (!overrides) return defaults
    return { ...defaults, ...overrides }
  },

  toggleUserFeature: (userId, feature) => {
    set((state) => {
      const current = state.userFeatureOverrides[userId] || {}
      return {
        userFeatureOverrides: {
          ...state.userFeatureOverrides,
          [userId]: { ...current, [feature]: !current[feature] ? true : !current[feature] },
        },
      }
    })
  },

  setUserFeature: (userId, feature, enabled) => {
    set((state) => ({
      userFeatureOverrides: {
        ...state.userFeatureOverrides,
        [userId]: { ...(state.userFeatureOverrides[userId] || {}), [feature]: enabled },
      },
    }))
  },

  getSidebarFeatures: () => SIDEBAR_FEATURES,

  // Feature flags
  toggleFeatureFlag: (key) => {
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

  // Stats — only count REAL registered users (not demo)
  getStats: () => {
    const realUsers = registeredUsers
    const totalUsers = realUsers.length
    const proUsers = realUsers.filter((u) => u.plan === 'pro').length
    const freeUsers = realUsers.filter((u) => u.plan === 'free').length
    const estimatedMRR = proUsers * 2999

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const newThisWeek = realUsers.filter((u) => new Date(u.created_at) > oneWeekAgo).length

    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    const newThisMonth = realUsers.filter((u) => new Date(u.created_at) > oneMonthAgo).length

    return { totalUsers, proUsers, freeUsers, estimatedMRR, newThisWeek, newThisMonth }
  },
}))

export default useAdminStore
