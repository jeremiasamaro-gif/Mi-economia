import { useState } from 'react'
import { ShieldCheck, Eye, EyeOff, AlertTriangle, Monitor, Smartphone, Loader2, Check } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import useProfileStore from '../../store/profileStore'
import useExpenseStore from '../../store/expenseStore'
import useAchievementStore from '../../store/achievementStore'
import useBudgetStore from '../../store/budgetStore'
import useRecurringStore from '../../store/recurringStore'

export default function Seguridad() {
  const { user, logout } = useAuth()
  const { resetAccount } = useProfileStore()

  // Password change state
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  // Reset state
  const [resetStep, setResetStep] = useState(0) // 0=none, 1=warning, 2=confirm, 3=processing, 4=done
  const [resetText, setResetText] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [resetError, setResetError] = useState('')

  // Mock sessions
  const sessions = [
    { id: 's1', device: 'Chrome en macOS', location: 'Buenos Aires', lastActive: new Date().toISOString(), current: true, icon: Monitor },
    { id: 's2', device: 'Safari en iPhone', location: 'Buenos Aires', lastActive: new Date(Date.now() - 86400000).toISOString(), current: false, icon: Smartphone },
  ]

  // Password strength
  const getStrength = (pw) => {
    if (!pw) return { level: '', color: '', width: '0%' }
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/\d/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++

    if (score <= 1) return { level: 'Débil', color: 'bg-red-500', width: '25%' }
    if (score === 2) return { level: 'Media', color: 'bg-yellow-500', width: '50%' }
    if (score === 3) return { level: 'Buena', color: 'bg-blue-500', width: '75%' }
    return { level: 'Fuerte', color: 'bg-green-500', width: '100%' }
  }

  const strength = getStrength(newPw)

  const handlePasswordChange = () => {
    setPwError('')
    if (!currentPw) { setPwError('Ingresá tu contraseña actual.'); return }
    if (newPw.length < 8) { setPwError('La contraseña debe tener al menos 8 caracteres.'); return }
    if (!/[A-Z]/.test(newPw)) { setPwError('La contraseña debe tener al menos 1 mayúscula.'); return }
    if (!/\d/.test(newPw)) { setPwError('La contraseña debe tener al menos 1 número.'); return }
    if (newPw !== confirmPw) { setPwError('Las contraseñas no coinciden.'); return }

    // TODO SUPABASE: supabase.auth.updateUser({ password: newPw })
    setPwSuccess(true)
    setTimeout(() => {
      logout()
    }, 2000)
  }

  const handleResetAccount = () => {
    if (resetText !== 'REINICIAR') return
    setResetError('')

    // Verify password
    if (user.password && user.password !== resetPassword) {
      setResetError('Contraseña incorrecta.')
      return
    }

    setResetStep(3) // processing

    // Simulate processing
    setTimeout(() => {
      // Clear all user data from stores
      const expenseStore = useExpenseStore.getState()
      const achievementStore = useAchievementStore.getState()
      const budgetStore = useBudgetStore.getState()
      const recurringStore = useRecurringStore.getState()

      // Filter out user's data
      useExpenseStore.setState({
        expenses: expenseStore.expenses.filter((e) => e.user_id !== user.id),
      })
      useAchievementStore.setState({
        achievements: achievementStore.achievements.filter((a) => a.user_id !== user.id),
      })
      useBudgetStore.setState({
        budgets: budgetStore.budgets.filter((b) => b.user_id !== user.id),
      })
      useRecurringStore.setState({
        recurringExpenses: recurringStore.recurringExpenses.filter((r) => r.user_id !== user.id),
      })

      resetAccount(user.id, resetPassword, user)

      setResetStep(4) // done
      setTimeout(() => {
        setResetStep(0)
        setResetText('')
        setResetPassword('')
        window.location.href = '/app'
      }, 2000)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-dark-text">Seguridad</h2>

      {/* Section A: Change password */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck size={20} className="text-accent" />
          <h3 className="text-base font-semibold text-dark-text">Cambiar contraseña</h3>
        </div>

        <div className="space-y-4 max-w-md">
          {/* Current password */}
          <div>
            <label className="block text-sm text-dark-muted mb-1.5">Contraseña actual</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-dark-text text-sm focus:border-accent focus:outline-none pr-10"
              />
              <button
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted hover:text-dark-text"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="block text-sm text-dark-muted mb-1.5">Nueva contraseña</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-dark-text text-sm focus:border-accent focus:outline-none pr-10"
              />
              <button
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted hover:text-dark-text"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Strength indicator */}
            {newPw && (
              <div className="mt-2">
                <div className="w-full h-1.5 bg-dark-bg rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} rounded-full transition-all`} style={{ width: strength.width }} />
                </div>
                <p className={`text-xs mt-1 ${
                  strength.level === 'Débil' ? 'text-red-400' :
                  strength.level === 'Media' ? 'text-yellow-400' :
                  strength.level === 'Buena' ? 'text-blue-400' : 'text-green-400'
                }`}>
                  {strength.level}
                </p>
              </div>
            )}
            <div className="mt-2 space-y-0.5">
              <p className={`text-xs ${newPw.length >= 8 ? 'text-green-400' : 'text-dark-muted'}`}>
                {newPw.length >= 8 ? '✓' : '○'} Mínimo 8 caracteres
              </p>
              <p className={`text-xs ${/[A-Z]/.test(newPw) ? 'text-green-400' : 'text-dark-muted'}`}>
                {/[A-Z]/.test(newPw) ? '✓' : '○'} Al menos 1 mayúscula
              </p>
              <p className={`text-xs ${/\d/.test(newPw) ? 'text-green-400' : 'text-dark-muted'}`}>
                {/\d/.test(newPw) ? '✓' : '○'} Al menos 1 número
              </p>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm text-dark-muted mb-1.5">Confirmar nueva contraseña</label>
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className={`w-full bg-dark-bg border rounded-lg px-3 py-2.5 text-dark-text text-sm focus:outline-none ${
                confirmPw && confirmPw !== newPw ? 'border-red-500 focus:border-red-500' : 'border-dark-border focus:border-accent'
              }`}
            />
            {confirmPw && confirmPw !== newPw && (
              <p className="text-xs text-red-400 mt-1">Las contraseñas no coinciden</p>
            )}
          </div>

          {pwError && <p className="text-sm text-red-400">{pwError}</p>}

          {pwSuccess ? (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <Check size={16} />
              Contraseña actualizada. Redirigiendo al login...
            </div>
          ) : (
            <button
              onClick={handlePasswordChange}
              className="px-5 py-2.5 bg-accent text-dark-bg rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              Actualizar contraseña
            </button>
          )}
        </div>
      </div>

      {/* Section B: Active sessions */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
        <h3 className="text-base font-semibold text-dark-text mb-4">Sesiones activas</h3>
        <div className="space-y-2">
          {sessions.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.id} className={`flex items-center gap-3 p-3 rounded-lg ${s.current ? 'bg-accent/5 border border-accent/20' : 'bg-dark-bg'}`}>
                <Icon size={20} className={s.current ? 'text-accent' : 'text-dark-muted'} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-dark-text">{s.device}</p>
                    {s.current && (
                      <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded">Sesión actual</span>
                    )}
                  </div>
                  <p className="text-xs text-dark-muted">
                    {s.location} · {s.current ? 'Activa ahora' : new Date(s.lastActive).toLocaleDateString('es-AR')}
                  </p>
                </div>
                {!s.current && (
                  <button className="text-xs text-red-400 hover:text-red-300 transition-colors">
                    Cerrar sesión
                  </button>
                )}
              </div>
            )
          })}
        </div>
        <button className="text-sm text-red-400 hover:text-red-300 transition-colors mt-3">
          Cerrar todas las otras sesiones
        </button>
      </div>

      {/* Section C: DANGER ZONE */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={18} className="text-red-400" />
          <h3 className="text-base font-semibold text-red-400">Zona de peligro</h3>
        </div>
        <p className="text-sm text-dark-muted mb-4">
          Reiniciar tu cuenta eliminará permanentemente todos tus gastos, presupuestos, recurrentes y logros personales.
        </p>
        <button
          onClick={() => setResetStep(1)}
          className="px-4 py-2 border border-red-500/50 text-red-400 rounded-lg text-sm hover:bg-red-500/10 transition-colors"
        >
          Reiniciar cuenta
        </button>
      </div>

      {/* Reset modal */}
      {resetStep > 0 && resetStep < 4 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => { if (resetStep < 3) { setResetStep(0); setResetText(''); setResetPassword(''); setResetError('') } }}>
          <div className="bg-dark-surface border border-dark-border rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>

            {/* Step 1: Warning */}
            {resetStep === 1 && (
              <>
                <h3 className="text-lg font-bold text-dark-text mb-4">¿Estás seguro?</h3>
                <ul className="space-y-2 mb-6">
                  <li className="text-sm text-dark-muted flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    Se eliminarán todos tus gastos e ingresos
                  </li>
                  <li className="text-sm text-dark-muted flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    Se eliminarán todos tus presupuestos
                  </li>
                  <li className="text-sm text-dark-muted flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    Se eliminarán todos tus gastos recurrentes
                  </li>
                  <li className="text-sm text-dark-muted flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    Se eliminarán todos tus logros personales
                  </li>
                  <li className="text-sm text-green-400 flex items-start gap-2">
                    <span className="mt-0.5">✓</span>
                    Tu plan ({user?.plan === 'pro' ? 'Pro' : 'Free'}) se mantiene
                  </li>
                  <li className="text-sm text-green-400 flex items-start gap-2">
                    <span className="mt-0.5">✓</span>
                    Tu grupo no se verá afectado
                  </li>
                </ul>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setResetStep(0); setResetText(''); setResetPassword('') }}
                    className="flex-1 px-4 py-2.5 bg-dark-hover text-dark-text rounded-lg text-sm hover:bg-dark-border transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => setResetStep(2)}
                    className="flex-1 px-4 py-2.5 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
                  >
                    Continuar
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Final confirmation */}
            {resetStep === 2 && (
              <>
                <h3 className="text-lg font-bold text-dark-text mb-4">Confirmación final</h3>

                {/* Re-authenticate */}
                <div className="mb-4">
                  <label className="block text-sm text-dark-muted mb-1.5">Ingresá tu contraseña</label>
                  <input
                    type="password"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-dark-text text-sm focus:border-red-400 focus:outline-none"
                    placeholder="Tu contraseña actual"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-dark-muted mb-1.5">
                    Escribí <span className="text-red-400 font-bold">REINICIAR</span> para confirmar
                  </label>
                  <input
                    type="text"
                    value={resetText}
                    onChange={(e) => setResetText(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-dark-text text-sm focus:border-red-400 focus:outline-none"
                    placeholder="REINICIAR"
                  />
                </div>

                {resetError && <p className="text-sm text-red-400 mb-3">{resetError}</p>}

                <div className="flex gap-3">
                  <button
                    onClick={() => { setResetStep(0); setResetText(''); setResetPassword(''); setResetError('') }}
                    className="flex-1 px-4 py-2.5 bg-dark-hover text-dark-text rounded-lg text-sm hover:bg-dark-border transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleResetAccount}
                    disabled={resetText !== 'REINICIAR' || !resetPassword}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      resetText === 'REINICIAR' && resetPassword
                        ? 'bg-red-500 text-white hover:bg-red-600 cursor-pointer'
                        : 'bg-dark-hover text-dark-muted cursor-not-allowed'
                    }`}
                  >
                    Confirmar reinicio
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Processing */}
            {resetStep === 3 && (
              <div className="text-center py-8">
                <Loader2 size={32} className="text-red-400 mx-auto mb-3 animate-spin" />
                <p className="text-dark-text">Eliminando tus datos...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {resetStep === 4 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-dark-surface border border-dark-border rounded-xl p-6 w-full max-w-sm mx-4 text-center">
            <Check size={32} className="text-green-400 mx-auto mb-3" />
            <p className="text-dark-text font-semibold">Cuenta reiniciada</p>
            <p className="text-sm text-dark-muted mt-1">Redirigiendo...</p>
          </div>
        </div>
      )}
    </div>
  )
}
