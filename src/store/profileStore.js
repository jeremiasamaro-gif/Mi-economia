import { create } from 'zustand'

// TODO SUPABASE: replace with supabase.from('profiles'), supabase.from('custom_achievements')

const ALLOWED_EMOJIS = ['🎯', '✈️', '🏠', '🚗', '📱', '💻', '👗', '🎓', '💊', '🏋️', '🎸', '📚', '🍕', '☕', '🎮', '🏖️', '💍', '🐶', '🌱', '🎄']

const useProfileStore = create((set, get) => ({
  // Profile data
  profile: {
    avatar: null, // base64 string or null
    phone: '',
    currency: 'ARS',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },

  // Custom achievements
  customAchievements: [
    {
      id: 'ca-1',
      user_id: 'user-demo-pro',
      name: 'Vacaciones en Brasil',
      description: 'Ahorrar $200.000 para julio',
      type: 'savings_target',
      target_amount: 200000,
      target_category: null,
      target_days: null,
      emoji: '✈️',
      deadline: '2026-07-01',
      completed: false,
      completed_at: null,
      created_at: '2026-02-01T10:00:00Z',
    },
    {
      id: 'ca-2',
      user_id: 'user-demo-pro',
      name: 'Mes sin ropa',
      description: 'No gastar en ropa por 30 días',
      type: 'no_spend',
      target_amount: null,
      target_category: 'Ropa',
      target_days: 30,
      emoji: '👗',
      deadline: null,
      completed: true,
      completed_at: '2026-02-28T18:00:00Z',
      created_at: '2026-02-01T10:00:00Z',
    },
    {
      id: 'ca-3',
      user_id: 'user-demo-pro',
      name: 'Delivery bajo control',
      description: 'No gastar más de $15.000 en delivery',
      type: 'monthly_limit',
      target_amount: 15000,
      target_category: 'Alimentación',
      target_days: null,
      emoji: '🍕',
      deadline: null,
      completed: false,
      completed_at: null,
      created_at: '2026-03-01T10:00:00Z',
    },
  ],

  // Mock payment history
  paymentHistory: [
    { id: 'ph-1', date: '2026-03-01T10:00:00Z', amount: 2999, status: 'approved', receipt_url: '#' },
    { id: 'ph-2', date: '2026-02-01T10:00:00Z', amount: 2999, status: 'approved', receipt_url: '#' },
    { id: 'ph-3', date: '2026-01-01T10:00:00Z', amount: 2999, status: 'approved', receipt_url: '#' },
  ],

  // --- Profile Actions ---
  updateProfile: (updates) => {
    set((state) => ({
      profile: { ...state.profile, ...updates },
    }))
  },

  setAvatar: (base64) => {
    // Validate size (1MB max)
    if (base64 && base64.length > 1_400_000) {
      return { error: 'La imagen supera el tamaño máximo de 1MB.' }
    }
    set((state) => ({
      profile: { ...state.profile, avatar: base64 },
    }))
    return { success: true }
  },

  // --- Custom Achievements Actions ---
  getCustomAchievements: (userId) => {
    return get().customAchievements.filter((a) => a.user_id === userId)
  },

  addCustomAchievement: (userId, achievement) => {
    const userAchievements = get().getCustomAchievements(userId)
    if (userAchievements.length >= 20) {
      return { error: 'Máximo 20 logros personales permitidos.' }
    }

    // Validate emoji
    const emoji = ALLOWED_EMOJIS.includes(achievement.emoji) ? achievement.emoji : '🎯'

    const newAchievement = {
      id: `ca-${Date.now()}`,
      user_id: userId,
      name: String(achievement.name || '').slice(0, 50),
      description: String(achievement.description || '').slice(0, 120),
      type: ['savings_target', 'no_spend', 'monthly_limit', 'manual'].includes(achievement.type) ? achievement.type : 'manual',
      target_amount: achievement.target_amount ? Math.max(0, Number(achievement.target_amount)) : null,
      target_category: achievement.target_category ? String(achievement.target_category).slice(0, 50) : null,
      target_days: achievement.target_days ? Math.max(1, Math.min(365, Number(achievement.target_days))) : null,
      emoji,
      deadline: achievement.deadline || null,
      completed: false,
      completed_at: null,
      created_at: new Date().toISOString(),
    }

    set((state) => ({
      customAchievements: [...state.customAchievements, newAchievement],
    }))
    return { achievement: newAchievement }
  },

  updateCustomAchievement: (id, userId, updates) => {
    const achievement = get().customAchievements.find((a) => a.id === id && a.user_id === userId)
    if (!achievement) return { error: 'Logro no encontrado.' }

    set((state) => ({
      customAchievements: state.customAchievements.map((a) =>
        a.id === id && a.user_id === userId ? { ...a, ...updates } : a
      ),
    }))
    return { success: true }
  },

  toggleCustomAchievement: (id, userId) => {
    const achievement = get().customAchievements.find((a) => a.id === id && a.user_id === userId)
    if (!achievement) return { error: 'Logro no encontrado.' }
    if (achievement.type !== 'manual') return { error: 'Solo logros libres pueden completarse manualmente.' }

    set((state) => ({
      customAchievements: state.customAchievements.map((a) =>
        a.id === id && a.user_id === userId
          ? { ...a, completed: !a.completed, completed_at: !a.completed ? new Date().toISOString() : null }
          : a
      ),
    }))
    return { success: true }
  },

  deleteCustomAchievement: (id, userId) => {
    set((state) => ({
      customAchievements: state.customAchievements.filter((a) => !(a.id === id && a.user_id === userId)),
    }))
    return { success: true }
  },

  // --- Account Reset ---
  resetAccount: (userId, password, user) => {
    // TODO SUPABASE: implement as Edge Function with service role
    // Verify password
    if (user.password && user.password !== password) {
      return { error: 'Contraseña incorrecta.' }
    }

    // Delete custom achievements for user
    set((state) => ({
      customAchievements: state.customAchievements.filter((a) => a.user_id !== userId),
    }))

    return { success: true }
  },

  getAllowedEmojis: () => ALLOWED_EMOJIS,
}))

export default useProfileStore
