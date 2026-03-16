import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X, ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'

export default function PricingPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isAnnual, setIsAnnual] = useState(false)

  const features = [
    { name: t('plan.free.1'), free: t('plan.free.1'), pro: t('plan.pro.2') },
    { name: t('plan.free.3'), free: true, pro: true },
    { name: t('plan.pro.4'), free: false, pro: true },
    { name: t('plan.pro.3'), free: false, pro: true },
    { name: t('plan.pro.5'), free: false, pro: true },
    { name: t('plan.pro.6'), free: false, pro: true },
    { name: t('plan.pro.7'), free: false, pro: true },
    { name: t('plan.pro.8'), free: false, pro: true },
    { name: t('plan.pro.9'), free: false, pro: true },
    { name: t('plan.pro.10'), free: false, pro: true },
  ]

  const handleSubscribe = () => {
    // TODO MP: replace with MercadoPago Checkout Pro API call
    // Will generate monthly ($7.500) or annual ($65.000) preference based on isAnnual
    alert('MercadoPago: Se generará un link de pago cuando se configure la integración.')
  }

  const FeatureValue = ({ value }) => {
    if (typeof value === 'string') return <span className="text-sm">{value}</span>
    if (value) return <Check size={18} className="text-accent" />
    return <X size={18} className="text-dark-muted/40" />
  }

  return (
    <div className="min-h-screen bg-dark-bg p-6">
      <div className="max-w-4xl mx-auto">
        {user && (
          <button
            onClick={() => navigate('/app')}
            className="flex items-center gap-1 text-sm text-dark-muted hover:text-accent mb-6"
          >
            <ArrowLeft size={14} /> {t('common.back')}
          </button>
        )}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            mi Econom<span className="text-accent">IA</span>
          </h1>
          <p className="text-dark-muted">{t('pricing.title')}</p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-10">
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

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Free */}
          <div className={`bg-dark-surface border rounded-2xl p-6 ${
            user?.plan === 'free' ? 'border-accent' : 'border-dark-border'
          }`}>
            {user?.plan === 'free' && (
              <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full mb-4 inline-block">
                {t('plan.activePlan')}
              </span>
            )}
            <h3 className="text-xl font-bold mb-1">{t('plan.free')}</h3>
            <p className="text-3xl font-bold font-mono mb-1">
              $0 <span className="text-sm font-normal text-dark-muted">{t('landing.pricing.perMonth')}</span>
            </p>
            <div className="mb-6">
              <span className="text-[11px] bg-[#2a2a1e] text-[#fbbf24] px-2.5 py-1 rounded-md">
                {t('landing.pricing.freeLimit')}
              </span>
            </div>

            {!user ? (
              <button
                onClick={() => navigate('/register')}
                className="w-full border border-accent text-accent font-semibold py-2.5 rounded-lg hover:bg-accent/10"
              >
                {t('pricing.startFree')}
              </button>
            ) : user.plan === 'free' ? (
              <button disabled className="w-full border border-dark-border text-dark-muted py-2.5 rounded-lg cursor-default">
                {t('plan.activePlan')}
              </button>
            ) : null}
          </div>

          {/* Pro */}
          <div className={`bg-dark-surface border rounded-2xl p-6 relative overflow-hidden ${
            user?.plan === 'pro' ? 'border-accent' : 'border-dark-border'
          }`}>
            <div className="absolute top-0 right-0 bg-accent text-dark-bg text-xs font-bold px-3 py-1 rounded-bl-lg">
              {t('plan.recommended')}
            </div>
            {user?.plan === 'pro' && (
              <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full mb-4 inline-block">
                {t('plan.activePlan')}
              </span>
            )}
            <h3 className="text-xl font-bold mb-1">{t('plan.pro')}</h3>
            <p className="text-3xl font-bold font-mono mb-1">
              <span className="text-accent">{isAnnual ? '$65.000' : '$7.500'}</span>{' '}
              <span className="text-xs font-normal text-dark-muted">ARS</span>{' '}
              <span className="text-sm font-normal text-dark-muted">
                {isAnnual ? t('landing.pricing.perYear') : t('landing.pricing.perMonth')}
              </span>
            </p>
            {isAnnual ? (
              <div className="mb-6 space-y-1.5">
                <p className="text-xs text-dark-muted">{t('landing.pricing.monthlyEquiv')}</p>
                <span className="inline-block text-xs bg-[#1e3a2a] text-[#4ade80] px-3 py-1 rounded-md font-medium">
                  {t('landing.pricing.saveBadge')}
                </span>
                <p className="text-[10px] text-dark-muted">{t('landing.pricing.annualTotal')}</p>
              </div>
            ) : (
              <p className="text-sm text-dark-muted mb-6">{t('plan.pricePerMonth')}</p>
            )}

            {user?.plan === 'pro' ? (
              <button disabled className="w-full border border-accent text-accent py-2.5 rounded-lg cursor-default">
                {t('plan.activePlan')}
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                className="w-full bg-accent text-dark-bg font-semibold py-2.5 rounded-lg hover:bg-accent/90"
              >
                {t('pricing.subscribePro')}
              </button>
            )}
          </div>
        </div>

        {/* Feature comparison */}
        <div className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="px-6 py-4 text-left font-medium text-dark-muted">{t('expenses.description')}</th>
                <th className="px-6 py-4 text-center font-medium">{t('plan.free')}</th>
                <th className="px-6 py-4 text-center font-medium text-accent">{t('plan.pro')}</th>
              </tr>
            </thead>
            <tbody>
              {features.map(({ name, free, pro }) => (
                <tr key={name} className="border-b border-dark-border/50">
                  <td className="px-6 py-3">{name}</td>
                  <td className="px-6 py-3 text-center"><FeatureValue value={free} /></td>
                  <td className="px-6 py-3 text-center"><FeatureValue value={pro} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
