import useAuthStore from '../store/authStore'

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const error = useAuthStore((s) => s.error)
  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)
  const logout = useAuthStore((s) => s.logout)
  const clearError = useAuthStore((s) => s.clearError)
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const isPro = useAuthStore((s) => s.isPro)
  const isTrial = useAuthStore((s) => s.isTrial)
  const trialDaysLeft = useAuthStore((s) => s.trialDaysLeft)

  return { user, loading, error, login, register, logout, clearError, isAdmin: isAdmin(), isPro: isPro(), isTrial: isTrial(), trialDaysLeft: trialDaysLeft() }
}
