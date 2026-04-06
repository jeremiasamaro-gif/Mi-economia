import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTranslation } from '../../hooks/useTranslation'

const MAX_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000
const LOCK_STORAGE_KEY = 'mi-economia-login-lock'

// BUG-008 FIX: persist rate limit in localStorage so refresh doesn't reset it
function getLoginLock() {
  try {
    const data = JSON.parse(localStorage.getItem(LOCK_STORAGE_KEY) || '{}')
    if (data.lockUntil && Date.now() >= data.lockUntil) {
      localStorage.removeItem(LOCK_STORAGE_KEY)
      return { attempts: 0, lockUntil: null }
    }
    return { attempts: data.attempts || 0, lockUntil: data.lockUntil || null }
  } catch { return { attempts: 0, lockUntil: null } }
}

function persistLoginLock(attempts, lockUntil) {
  try {
    localStorage.setItem(LOCK_STORAGE_KEY, JSON.stringify({ attempts, lockUntil }))
  } catch { /* ignore */ }
}

export default function LoginModal({ isOpen, onClose }) {
  const { login } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // BUG-008 FIX: read persisted lock state
  const lock = getLoginLock()
  const [attempts, setAttempts] = useState(lock.attempts)
  const [lockUntil, setLockUntil] = useState(lock.lockUntil)

  if (!isOpen) return null

  const isLocked = lockUntil && Date.now() < lockUntil
  const lockMinutes = isLocked ? Math.max(1, Math.ceil((lockUntil - Date.now()) / 60000)) : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (isLocked) {
      setError(t('landing.login.locked', { minutes: lockMinutes }))
      return
    }

    const trimmedEmail = email.trim().slice(0, 254)
    const trimmedPassword = password.slice(0, 128)

    if (!trimmedEmail || !trimmedPassword) return

    setLoading(true)
    try {
      const success = await login(trimmedEmail, trimmedPassword)
      if (success) {
        // Clear lock on successful login
        localStorage.removeItem(LOCK_STORAGE_KEY)
        onClose()
        navigate('/app')
      } else {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        if (newAttempts >= MAX_ATTEMPTS) {
          const newLockUntil = Date.now() + LOCK_DURATION_MS
          setLockUntil(newLockUntil)
          persistLoginLock(newAttempts, newLockUntil)
          setError(t('landing.login.locked', { minutes: 15 }))
        } else {
          persistLoginLock(newAttempts, null)
          setError(t('landing.login.genericError'))
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-dark-surface border border-dark-border rounded-2xl w-full max-w-md p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-dark-text">{t('landing.login.title')}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-dark-hover transition-colors text-dark-muted">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-dark-muted block mb-1.5">{t('landing.login.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={254}
              required
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-sm text-dark-text focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-dark-muted block mb-1.5">{t('landing.login.password')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={128}
                required
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 pr-10 text-sm text-dark-text focus:outline-none focus:border-accent transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted hover:text-dark-text"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || isLocked}
            className="w-full bg-accent text-dark-bg font-semibold py-2.5 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? '...' : t('landing.login.submit')}
          </button>

          <div className="text-center text-xs text-dark-muted">
            <a href="/forgot-password" className="text-accent hover:underline">{t('landing.login.forgotPassword')}</a>
          </div>

          <p className="text-center text-xs text-dark-muted">
            {t('landing.login.noAccount')}{' '}
            <button type="button" onClick={onClose} className="text-accent hover:underline">
              {t('landing.login.register')}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
