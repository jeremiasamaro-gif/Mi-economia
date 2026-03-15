import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTranslation } from '../../hooks/useTranslation'

export default function TrialBanner() {
  const { user, isTrial, trialDaysLeft, isPro } = useAuth()
  const { t } = useTranslation()
  const [dismissed, setDismissed] = useState(false)

  // Don't show if: no user, not on trial, already Pro subscriber, or dismissed this session
  if (!user || !isTrial || dismissed) return null
  // If subscription is active (paid Pro), hide permanently
  if (user.subscription_status === 'active') return null

  const expired = trialDaysLeft <= 0
  const bgClass = expired
    ? 'bg-red-500/10 border-b border-red-500/30'
    : 'bg-amber-500/10 border-b border-amber-500/30'
  const textClass = expired ? 'text-red-400' : 'text-amber-300'

  return (
    <div className={`${bgClass} px-4 py-2.5 mb-4 rounded-lg flex items-center justify-between gap-3`}>
      <p className={`text-xs ${textClass} flex-1`}>
        {expired
          ? t('trial.expired')
          : t('trial.banner', { days: trialDaysLeft })}
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          to="/pricing"
          className={`text-xs font-medium px-3 py-1 rounded-md transition-colors ${
            expired
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-amber-500 text-dark-bg hover:bg-amber-400'
          }`}
        >
          {expired ? t('trial.upgrade') : t('trial.subscribe')}
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className={`p-1 rounded hover:bg-dark-hover transition-colors ${textClass}`}
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
