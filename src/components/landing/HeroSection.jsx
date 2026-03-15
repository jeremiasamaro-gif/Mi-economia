import { useTranslation } from '../../hooks/useTranslation'
import HeroRegisterForm from './HeroRegisterForm'
import DashboardMockup from './DashboardMockup'

const AVATARS = ['JA', 'ML', 'CR', 'DP', 'LG']
const AVATAR_COLORS = ['bg-accent/20 text-accent', 'bg-blue-500/20 text-blue-400', 'bg-purple-500/20 text-purple-400', 'bg-amber-500/20 text-amber-400', 'bg-pink-500/20 text-pink-400']

export default function HeroSection({ onLegalClick }) {
  const { t } = useTranslation()

  return (
    <section id="hero" className="min-h-screen flex items-center pt-20 pb-16 px-4 sm:px-6 scroll-mt-16">
      <div className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Left column - Copy */}
        <div className="flex-1 max-w-xl">
          {/* Social proof */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex -space-x-2">
              {AVATARS.map((initials, i) => (
                <div
                  key={i}
                  className={`w-7 h-7 rounded-full ${AVATAR_COLORS[i]} flex items-center justify-center text-[9px] font-bold border-2 border-dark-bg`}
                >
                  {initials}
                </div>
              ))}
            </div>
            <span className="text-xs text-dark-muted">
              ⭐ 4.9 · {t('landing.hero.socialProof')}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-dark-text leading-tight mb-5">
            {t('landing.hero.headline')}
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-dark-muted leading-relaxed mb-6">
            {t('landing.hero.subheadline')}
          </p>

          {/* Trial badge */}
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-2 mb-6">
            <span className="text-sm text-accent font-medium">✓ {t('landing.hero.trialBadge')}</span>
          </div>

          {/* Dashboard mockup - visible on mobile, hidden on desktop (shown on right on desktop) */}
          <div className="lg:hidden mt-8 mb-8">
            <DashboardMockup />
          </div>

          {/* Register form card - on mobile it's below, on desktop it moves to the right */}
          <div className="lg:hidden">
            <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 sm:p-7">
              <h3 className="text-base font-semibold text-dark-text mb-5">{t('landing.hero.registerTitle')}</h3>
              <HeroRegisterForm onLegalClick={onLegalClick} />
            </div>
          </div>
        </div>

        {/* Right column - Desktop only: form card + mockup */}
        <div className="hidden lg:flex flex-col gap-8 w-full max-w-md">
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-7">
            <h3 className="text-base font-semibold text-dark-text mb-5">{t('landing.hero.registerTitle')}</h3>
            <HeroRegisterForm onLegalClick={onLegalClick} />
          </div>
        </div>
      </div>
    </section>
  )
}
