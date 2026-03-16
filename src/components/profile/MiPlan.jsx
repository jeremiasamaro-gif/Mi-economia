import { useState } from 'react'
import { Crown, Check, X, CreditCard, Download, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { usePlan } from '../../hooks/usePlan'
import { useExpenses } from '../../hooks/useExpenses'
import { useTranslation } from '../../hooks/useTranslation'
import useProfileStore from '../../store/profileStore'

export default function MiPlan() {
  const { user, isPro, isTrial, trialDaysLeft } = useAuth()
  const { maxExpenses } = usePlan()
  const { currentMonthCount } = useExpenses()
  const { t } = useTranslation()
  const { paymentHistory } = useProfileStore()
  const [showCancel, setShowCancel] = useState(false)
  const [cancelText, setCancelText] = useState('')
  const [isAnnual, setIsAnnual] = useState(false)

  const plan = user?.plan || 'free'

  const freeFeatures = [
    { text: t('plan.free.1'), included: true },
    { text: t('plan.free.2'), included: true },
    { text: t('plan.free.3'), included: true },
    { text: t('plan.free.4'), included: false },
    { text: t('plan.free.5'), included: false },
    { text: t('plan.free.6'), included: false },
    { text: t('plan.free.7'), included: false },
    { text: t('plan.free.8'), included: false },
    { text: t('plan.free.9'), included: false },
    { text: t('plan.free.10'), included: false },
  ]

  const proFeatures = [
    { text: t('plan.pro.1'), included: true },
    { text: t('plan.pro.2'), included: true },
    { text: t('plan.pro.3'), included: true },
    { text: t('plan.pro.4'), included: true },
    { text: t('plan.pro.5'), included: true },
    { text: t('plan.pro.6'), included: true },
    { text: t('plan.pro.7'), included: true },
    { text: t('plan.pro.8'), included: true },
    { text: t('plan.pro.9'), included: true },
    { text: t('plan.pro.10'), included: true },
  ]

  // Usage meter
  const usagePct = maxExpenses === Infinity ? 0 : (currentMonthCount / maxExpenses) * 100
  const usageColor = usagePct > 80 ? 'bg-red-400' : usagePct > 60 ? 'bg-amber-400' : 'bg-accent'

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-dark-text">{t('plan.title')}</h2>

      {/* Current plan card */}
      <div className={`bg-dark-surface border rounded-xl p-6 ${isPro ? 'border-accent/40' : 'border-dark-border'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPro ? 'bg-accent/20' : 'bg-dark-hover'}`}>
              <Crown size={24} className={isPro ? 'text-accent' : 'text-dark-muted'} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-dark-text">
                  {isPro ? `Plan Pro · ${isAnnual ? '$65.000 ARS/año' : '$7.500 ARS/mes'}` : `${t('plan.free')} · $0`}
                </h3>
                {isPro && (
                  <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium">
                    {isTrial ? `Trial · ${trialDaysLeft} ${t('common.days')}` : t('plan.activePlan')}
                  </span>
                )}
                {!isPro && (
                  <span className="text-xs bg-dark-hover text-dark-muted px-2 py-0.5 rounded-full font-medium">
                    {t('plan.freeForever')}
                  </span>
                )}
              </div>
              {isPro && !isTrial && (
                <p className="text-sm text-dark-muted mt-0.5">{t('plan.nextBilling')}: 15/04/2026</p>
              )}
            </div>
          </div>
        </div>

        {!isPro && (
          <div className="mt-4">
            {/* Usage meter */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-dark-muted">{t('plan.expensesThisMonth')}</span>
                <span className="text-dark-text font-medium font-mono">
                  {currentMonthCount}/{maxExpenses === Infinity ? '∞' : maxExpenses}
                </span>
              </div>
              <div className="w-full h-2 bg-dark-bg rounded-full overflow-hidden">
                <div className={`h-full ${usageColor} rounded-full transition-all`} style={{ width: `${Math.min(usagePct, 100)}%` }} />
              </div>
            </div>
            <a
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-dark-bg rounded-lg font-semibold hover:bg-accent/90 transition-colors"
            >
              <Crown size={18} />
              {t('plan.upgrade')}
            </a>
          </div>
        )}

        {isPro && !isTrial && (
          <div className="flex gap-3 mt-4">
            <button className="px-4 py-2 bg-dark-hover text-dark-text rounded-lg text-sm hover:bg-dark-border transition-colors">
              {t('plan.manage')}
            </button>
            <button
              onClick={() => setShowCancel(true)}
              className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors"
            >
              {t('plan.cancelPlan')}
            </button>
          </div>
        )}
      </div>

      {/* Billing toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center bg-dark-surface border border-dark-border rounded-lg p-1">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-4 py-1.5 text-xs rounded-md transition-colors ${
              !isAnnual ? 'bg-[#1e2128] border border-[#3a3d45] text-[#e2e4e9]' : 'border border-transparent text-[#6b7280]'
            }`}
          >
            {t('landing.pricing.monthly')}
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-4 py-1.5 text-xs rounded-md transition-colors ${
              isAnnual ? 'bg-[#1e2128] border border-[#3a3d45] text-[#e2e4e9]' : 'border border-transparent text-[#6b7280]'
            }`}
          >
            {t('landing.pricing.annual')}
          </button>
        </div>
      </div>

      {/* Plan comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Free card */}
        <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-dark-text">{t('plan.free')}</h3>
            <p className="text-sm text-dark-muted">{t('plan.freeForever')}</p>
            <div className="mt-2">
              <span className="text-[11px] bg-[#2a2a1e] text-[#fbbf24] px-2.5 py-1 rounded-md">
                {t('landing.pricing.freeLimit')}
              </span>
            </div>
          </div>
          <ul className="space-y-2.5">
            {freeFeatures.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                {f.included ? (
                  <Check size={16} className="text-accent shrink-0" />
                ) : (
                  <X size={16} className="text-dark-muted/50 shrink-0" />
                )}
                <span className={f.included ? 'text-dark-text' : 'text-dark-muted/50'}>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pro card */}
        <div className="bg-dark-surface border-2 border-accent/40 rounded-xl p-6 relative">
          <div className="absolute -top-3 right-4">
            <span className="text-xs bg-accent text-dark-bg px-3 py-1 rounded-full font-bold">{t('plan.recommended')}</span>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-dark-text">{t('plan.pro')}</h3>
            <p className="text-sm text-dark-muted font-mono">
              {isAnnual ? '$65.000 ARS' : '$7.500 ARS'}{' '}
              <span className="font-sans">{isAnnual ? t('landing.pricing.perYear') : t('landing.pricing.perMonth')}</span>
            </p>
            {isAnnual && (
              <div className="mt-1.5 space-y-1">
                <p className="text-xs text-dark-muted">{t('landing.pricing.monthlyEquiv')}</p>
                <span className="inline-block text-xs bg-[#1e3a2a] text-[#4ade80] px-3 py-1 rounded-md font-medium">
                  {t('landing.pricing.saveBadge')}
                </span>
              </div>
            )}
          </div>
          <ul className="space-y-2.5">
            {proFeatures.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <Check size={16} className="text-accent shrink-0" />
                <span className="text-dark-text">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Payment history (Pro only) */}
      {isPro && !isTrial && (
        <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-dark-muted uppercase tracking-wider mb-4">{t('plan.paymentHistory')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="text-left py-2.5 text-dark-muted font-medium">{t('plan.date')}</th>
                  <th className="text-left py-2.5 text-dark-muted font-medium">{t('plan.amount')}</th>
                  <th className="text-left py-2.5 text-dark-muted font-medium">{t('plan.status')}</th>
                  <th className="text-right py-2.5 text-dark-muted font-medium">{t('plan.receipt')}</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((p) => (
                  <tr key={p.id} className="border-b border-dark-border/50">
                    <td className="py-2.5 text-dark-text">
                      {new Date(p.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-2.5 text-dark-text font-mono">${p.amount.toLocaleString('es-AR')}</td>
                    <td className="py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {p.status === 'approved' ? t('plan.approved') : t('plan.pending')}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button className="text-accent hover:text-accent/80 transition-colors">
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancel modal */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCancel(false)}>
          <div className="bg-dark-surface border border-dark-border rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-dark-text">{t('plan.cancelTitle')}</h3>
            </div>
            <p className="text-sm text-dark-muted mb-4">
              {t('plan.cancelMessage')}
            </p>
            <div className="mb-4">
              <label className="block text-sm text-dark-muted mb-1.5">
                {t('plan.cancelConfirm')}
              </label>
              <input
                type="text"
                value={cancelText}
                onChange={(e) => setCancelText(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-dark-text text-sm focus:border-red-400 focus:outline-none"
                maxLength={20}
                placeholder="CANCELAR"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowCancel(false); setCancelText('') }}
                className="flex-1 px-4 py-2.5 bg-dark-hover text-dark-text rounded-lg text-sm hover:bg-dark-border transition-colors"
              >
                {t('plan.back')}
              </button>
              <button
                disabled={cancelText !== 'CANCELAR'}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  cancelText === 'CANCELAR'
                    ? 'bg-red-500 text-white hover:bg-red-600 cursor-pointer'
                    : 'bg-dark-hover text-dark-muted cursor-not-allowed'
                }`}
              >
                {t('plan.cancelButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
