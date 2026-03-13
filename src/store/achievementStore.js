import { create } from 'zustand'
import { mockAchievements, ACHIEVEMENT_DEFINITIONS } from './mockData'

// TODO SUPABASE: replace with supabase.from('user_achievements').select/insert

const useAchievementStore = create((set, get) => ({
  achievements: [...mockAchievements],

  getForUser: (userId) => {
    return get().achievements.filter((a) => a.user_id === userId)
  },

  getUnlockedCount: (userId) => {
    return get().achievements.filter((a) => a.user_id === userId).length
  },

  isUnlocked: (userId, achievementId) => {
    return get().achievements.some(
      (a) => a.user_id === userId && a.achievement_id === achievementId
    )
  },

  unlockAchievement: (userId, achievementId) => {
    if (get().isUnlocked(userId, achievementId)) return
    const newAchievement = {
      id: `ua-${Date.now()}`,
      user_id: userId,
      achievement_id: achievementId,
      unlocked_at: new Date().toISOString(),
      progress: 100,
    }
    // TODO SUPABASE: replace with supabase.from('user_achievements').insert(newAchievement)
    set((state) => ({
      achievements: [...state.achievements, newAchievement],
    }))
  },

  checkAchievements: (userId, expenses, budgets) => {
    const store = get()
    const userExpenses = expenses.filter((e) => e.user_id === userId)
    const newlyUnlocked = []

    // --- Helper: get monthly balances ---
    const monthMap = {}
    userExpenses.forEach((e) => {
      const d = new Date(e.date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!monthMap[key]) monthMap[key] = { income: 0, expense: 0 }
      if (e.type === 'income') {
        monthMap[key].income += e.amount
      } else {
        monthMap[key].expense += e.amount
      }
    })

    const monthKeys = Object.keys(monthMap).sort()
    const monthBalances = monthKeys.map((key) => ({
      key,
      balance: monthMap[key].income - monthMap[key].expense,
      income: monthMap[key].income,
      expense: monthMap[key].expense,
    }))

    // Cumulative savings = total income - total expenses across all months
    const cumulativeSavings = monthBalances.reduce((sum, m) => sum + m.balance, 0)

    // --- Milestones ---
    const milestoneChecks = {
      'milestone-first': () => monthBalances.some((m) => m.balance > 0),
      'milestone-10k': () => cumulativeSavings >= 10000,
      'milestone-50k': () => cumulativeSavings >= 50000,
      'milestone-100k': () => cumulativeSavings >= 100000,
      'milestone-500k': () => cumulativeSavings >= 500000,
      'milestone-1m': () => cumulativeSavings >= 1000000,
    }

    Object.entries(milestoneChecks).forEach(([id, check]) => {
      if (!store.isUnlocked(userId, id) && check()) {
        store.unlockAchievement(userId, id)
        newlyUnlocked.push(id)
      }
    })

    // --- Streaks ---

    // streak-logging-7: 7 consecutive days with at least 1 expense
    const checkLogging7 = () => {
      const expenseDates = new Set(
        userExpenses
          .filter((e) => e.type === 'expense')
          .map((e) => e.date.split('T')[0])
      )
      const today = new Date()
      for (let start = 0; start <= expenseDates.size; start++) {
        let consecutive = 0
        for (let i = 0; i < 30; i++) {
          const d = new Date(today)
          d.setDate(d.getDate() - start - i)
          const key = d.toISOString().split('T')[0]
          if (expenseDates.has(key)) {
            consecutive++
            if (consecutive >= 7) return true
          } else {
            break
          }
        }
      }
      return false
    }

    // streak-no-delivery-7: 7 days without "delivery" tag expenses
    const checkNoDelivery7 = () => {
      const deliveryDates = new Set(
        userExpenses
          .filter((e) => e.type === 'expense' && e.tags && e.tags.some((t) => t.toLowerCase() === 'delivery'))
          .map((e) => e.date.split('T')[0])
      )
      const today = new Date()
      let consecutive = 0
      for (let i = 0; i < 30; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const key = d.toISOString().split('T')[0]
        if (!deliveryDates.has(key)) {
          consecutive++
          if (consecutive >= 7) return true
        } else {
          consecutive = 0
        }
      }
      return false
    }

    // streak-under-budget: current month all categories under budget
    const checkUnderBudget = () => {
      const now = new Date()
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      const userBudgets = budgets.filter((b) => b.user_id === userId && b.month === currentMonthKey)
      if (userBudgets.length === 0) return false

      const currentMonthExpenses = userExpenses.filter((e) => {
        if (e.type !== 'expense') return false
        const d = new Date(e.date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })

      const categoryTotals = {}
      currentMonthExpenses.forEach((e) => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount
      })

      return userBudgets.every((b) => (categoryTotals[b.category] || 0) <= b.limit_amount)
    }

    // streak-savings-3m: 3 consecutive months with positive balance
    const checkSavings3m = () => {
      if (monthBalances.length < 3) return false
      for (let i = 0; i <= monthBalances.length - 3; i++) {
        if (
          monthBalances[i].balance > 0 &&
          monthBalances[i + 1].balance > 0 &&
          monthBalances[i + 2].balance > 0
        ) {
          // Check months are consecutive
          const keys = [monthBalances[i].key, monthBalances[i + 1].key, monthBalances[i + 2].key]
          const dates = keys.map((k) => {
            const [y, m] = k.split('-').map(Number)
            return y * 12 + m
          })
          if (dates[1] - dates[0] === 1 && dates[2] - dates[1] === 1) {
            return true
          }
        }
      }
      return false
    }

    const streakChecks = {
      'streak-logging-7': checkLogging7,
      'streak-no-delivery-7': checkNoDelivery7,
      'streak-under-budget': checkUnderBudget,
      'streak-savings-3m': checkSavings3m,
    }

    Object.entries(streakChecks).forEach(([id, check]) => {
      if (!store.isUnlocked(userId, id) && check()) {
        store.unlockAchievement(userId, id)
        newlyUnlocked.push(id)
      }
    })

    return newlyUnlocked
  },
}))

export default useAchievementStore
