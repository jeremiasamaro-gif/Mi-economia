import useAchievementStore from '../store/achievementStore'
import { useAuth } from './useAuth'
import useExpenseStore from '../store/expenseStore'
import useBudgetStore from '../store/budgetStore'
import { ACHIEVEMENT_DEFINITIONS } from '../store/mockData'

export function useAchievements() {
  const { user } = useAuth()
  const userId = user?.id
  const store = useAchievementStore()
  const expenseStore = useExpenseStore()
  const budgetStore = useBudgetStore()

  const achievements = userId ? store.getForUser(userId) : []
  const unlockedCount = userId ? store.getUnlockedCount(userId) : 0
  const totalCount = ACHIEVEMENT_DEFINITIONS.length

  const checkNow = () => {
    if (!userId) return []
    return store.checkAchievements(
      userId,
      expenseStore.expenses,
      budgetStore.budgets
    )
  }

  const isUnlocked = (achievementId) => {
    if (!userId) return false
    return store.isUnlocked(userId, achievementId)
  }

  return {
    achievements,
    definitions: ACHIEVEMENT_DEFINITIONS,
    unlockedCount,
    totalCount,
    checkNow,
    isUnlocked,
  }
}
