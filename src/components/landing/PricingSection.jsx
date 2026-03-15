import { Check, X } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

const FREE_FEATURES = [
  { key: 'landing.pricing.f1', included: true },
  { key: 'landing.pricing.f2', included: true },
  { key: 'landing.pricing.f3', included: true },
  { key: 'landing.pricing.f4', included: false },
  { key: 'landing.pricing.f5', included: false },
  { key: 'landing.pricing.f6', included: false },
  { key: 'landing.pricing.f7', included: false },
  { key: 'landing.pricing.f8', included: false },
  { key: 'landing.pricing.f9', included: false },
]

const PRO_FEATURES = [
  'landing.pricing.p1', 'landing.pricing.p2', 'landing.pricing.p3',
  'landing.pricing.p4', 'landing.pricing.p5', 'landing.pricing.p6',
  'landing.pricing.p7', 'landing.pricing.p8', 'landing.pricing.p9',
  'landing.pricing.p10',
]

export default function PricingSection() {
  const { t } = useTranslation()

  const scrollToRegister = () => {
    const el = document.querySelector('#hero')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="pricing" className="py-20 sm:py-24 px-4 sm:px-6 scroll-mt-16">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-dark-text text-center mb-12">
          {t('landing.pricing.title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 sm:p-7 flex flex-col">
            <div className="mb-5">
              <span className="text-xs text-dark-muted uppercase tracking-wider">{t('landing.pricing.free')}</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-dark-text">$0</span>
              </div>
            </div>

            <ul className="space-y-2.5 flex-1 mb-6">
              {FREE_FEATURES.map(({ key, included }) => (
                <li key={key} className="flex items-center gap-2.5">
                  {included ? (
                    <Check size={14} className="text-accent shrink-0" />
                  ) : (
                    <X size={14} className="text-dark-muted/50 shrink-0" />
                  )}
                  <span className={`text-xs ${included ? 'text-dark-text' : 'text-dark-muted/60'}`}>
                    {t(key)}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={scrollToRegister}
              className="w-full py-2.5 text-sm font-medium text-dark-text border border-dark-border rounded-lg hover:border-accent/50 transition-colors"
            >
              {t('landing.pricing.ctaFree')}
            </button>
          </div>

          {/* Pro */}
          <div className="bg-dark-surface border-2 border-accent rounded-2xl p-6 sm:p-7 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-accent text-dark-bg text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                {t('landing.pricing.popular')}
              </span>
            </div>

            <div className="mb-5">
              <span className="text-xs text-accent uppercase tracking-wider">Pro</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-dark-text">$2.999</span>
                <span className="text-sm text-dark-muted">ARS / mes</span>
              </div>
              <p className="text-[10px] text-dark-muted mt-1">{t('landing.pricing.tryFree')}</p>
            </div>

            <ul className="space-y-2.5 flex-1 mb-6">
              {PRO_FEATURES.map((key) => (
                <li key={key} className="flex items-center gap-2.5">
                  <Check size={14} className="text-accent shrink-0" />
                  <span className="text-xs text-dark-text">{t(key)}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={scrollToRegister}
              className="w-full py-2.5 text-sm font-semibold bg-accent text-dark-bg rounded-lg hover:bg-accent/90 transition-colors"
            >
              {t('landing.pricing.ctaPro')}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
