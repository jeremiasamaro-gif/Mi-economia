import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Check } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTranslation } from '../../hooks/useTranslation'

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

function getStrength(password) {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  return score // 0-4
}

export default function HeroRegisterForm({ onLegalClick }) {
  const { register } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const strength = getStrength(password)
  const strengthLabel = strength <= 1
    ? t('landing.hero.strengthWeak')
    : strength <= 2
    ? t('landing.hero.strengthFair')
    : t('landing.hero.strengthStrong')
  const strengthColor = strength <= 1 ? 'bg-red-400' : strength <= 2 ? 'bg-amber-400' : 'bg-accent'

  const isValid =
    fullName.trim().length > 0 &&
    EMAIL_REGEX.test(email.trim()) &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    password === confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const trimmedName = fullName.trim().slice(0, 80)
    const trimmedEmail = email.trim().slice(0, 254)
    const trimmedPassword = password.slice(0, 128)

    if (!trimmedName || !EMAIL_REGEX.test(trimmedEmail)) {
      setError(t('landing.hero.genericError'))
      return
    }

    if (trimmedPassword.length < 8 || !/[A-Z]/.test(trimmedPassword) || !/[0-9]/.test(trimmedPassword)) {
      setError(t('landing.hero.minPassword'))
      return
    }

    if (trimmedPassword !== confirmPassword) {
      setError(t('landing.hero.passwordsNoMatch'))
      return
    }

    setLoading(true)
    try {
      const success = await register(trimmedEmail, trimmedPassword, trimmedName)
      if (success) {
        navigate('/app')
      } else {
        setError(t('landing.hero.genericError'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div>
        <label className="text-xs text-dark-muted block mb-1">{t('landing.hero.fullName')}</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          maxLength={80}
          required
          className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-sm text-dark-text focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      <div>
        <label className="text-xs text-dark-muted block mb-1">{t('landing.hero.phone')}</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={20}
          className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-sm text-dark-text focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      <div>
        <label className="text-xs text-dark-muted block mb-1">{t('landing.hero.email')}</label>
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
        <label className="text-xs text-dark-muted block mb-1">{t('landing.hero.password')}</label>
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
        {password.length > 0 && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1 bg-dark-border rounded-full overflow-hidden">
              <div
                className={`h-full ${strengthColor} transition-all`}
                style={{ width: `${(strength / 4) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-dark-muted">{strengthLabel}</span>
          </div>
        )}
        <p className="text-[10px] text-dark-muted mt-1">{t('landing.hero.minPassword')}</p>
      </div>

      <div>
        <label className="text-xs text-dark-muted block mb-1">{t('landing.hero.confirmPassword')}</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            maxLength={128}
            required
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 pr-10 text-sm text-dark-text focus:outline-none focus:border-accent transition-colors"
          />
          {confirmPassword.length > 0 && password === confirmPassword && (
            <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-accent" />
          )}
        </div>
        {confirmPassword.length > 0 && password !== confirmPassword && (
          <p className="text-[10px] text-red-400 mt-1">{t('landing.hero.passwordsNoMatch')}</p>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading || !isValid}
        className="w-full bg-accent text-dark-bg font-semibold py-3 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {loading ? '...' : t('landing.hero.submit')}
      </button>

      <p className="text-[10px] text-dark-muted text-center leading-relaxed">
        {t('landing.hero.terms')}{' '}
        <button type="button" onClick={() => onLegalClick('terms')} className="text-accent hover:underline">
          {t('landing.hero.termsLink')}
        </button>{' '}
        {t('landing.hero.and')}{' '}
        <button type="button" onClick={() => onLegalClick('privacy')} className="text-accent hover:underline">
          {t('landing.hero.privacyLink')}
        </button>
      </p>
    </form>
  )
}
