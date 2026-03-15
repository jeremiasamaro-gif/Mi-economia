import { useTranslation } from '../../hooks/useTranslation'

export default function Footer() {
  const { t } = useTranslation()

  const scrollTo = (href) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="bg-dark-surface border-t border-dark-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="text-lg font-bold text-dark-text mb-2">
              mi Econom<span className="text-accent">IA</span>
            </div>
            <p className="text-xs text-dark-muted">{t('landing.footer.tagline')}</p>
          </div>

          {/* Links */}
          <div className="space-y-2">
            <button onClick={() => scrollTo('#features')} className="block text-xs text-dark-muted hover:text-dark-text transition-colors">
              {t('landing.nav.features')}
            </button>
            <button onClick={() => scrollTo('#pricing')} className="block text-xs text-dark-muted hover:text-dark-text transition-colors">
              {t('landing.nav.pricing')}
            </button>
            <button onClick={() => scrollTo('#faq')} className="block text-xs text-dark-muted hover:text-dark-text transition-colors">
              {t('landing.nav.faq')}
            </button>
            <p className="text-xs text-dark-muted/60 pt-1">{t('landing.footer.terms')}</p>
            <p className="text-xs text-dark-muted/60">{t('landing.footer.privacy')}</p>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs text-dark-muted mb-2">hola@mieconomia.app</p>
            <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
              <span className="text-xs font-bold text-accent">M</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-dark-border py-4 px-4 sm:px-6">
        <p className="text-center text-[10px] text-dark-muted">
          {t('landing.footer.copyright')}
        </p>
      </div>
    </footer>
  )
}
