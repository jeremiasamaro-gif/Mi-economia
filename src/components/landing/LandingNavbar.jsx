import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

const FlagES = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" xmlns="http://www.w3.org/2000/svg" className="rounded-sm">
    <rect width="20" height="14" fill="#c60b1e" />
    <rect y="3.5" width="20" height="7" fill="#ffc400" />
  </svg>
)

const FlagEN = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" xmlns="http://www.w3.org/2000/svg" className="rounded-sm">
    <rect width="20" height="14" fill="#012169" />
    <path d="M0 0L20 14M20 0L0 14" stroke="#fff" strokeWidth="2.5" />
    <path d="M0 0L20 14M20 0L0 14" stroke="#c8102e" strokeWidth="1.5" />
    <path d="M10 0V14M0 7H20" stroke="#fff" strokeWidth="4" />
    <path d="M10 0V14M0 7H20" stroke="#c8102e" strokeWidth="2.5" />
  </svg>
)

const NAV_LINKS = [
  { key: 'landing.nav.features', href: '#features' },
  { key: 'landing.nav.pricing', href: '#pricing' },
  { key: 'landing.nav.faq', href: '#faq' },
]

export default function LandingNavbar({ onLoginClick }) {
  const { t, lang, setLang } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (href) => {
    setMobileOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled ? 'bg-[#13151a]/90 backdrop-blur-xl border-b border-dark-border' : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="text-lg font-bold text-dark-text">
          mi Econom<span className="text-accent">IA</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ key, href }) => (
            <button
              key={key}
              onClick={() => scrollTo(href)}
              className="text-sm text-dark-muted hover:text-dark-text transition-colors"
            >
              {t(key)}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language switcher */}
          <div className="flex items-center border border-dark-border rounded-lg overflow-hidden">
            <button
              onClick={() => setLang('es')}
              className={`flex items-center gap-1 px-2 py-1.5 text-xs transition-colors ${
                lang === 'es' ? 'bg-accent/15 text-accent' : 'text-dark-muted hover:text-dark-text'
              }`}
            >
              <FlagES /> ES
            </button>
            <button
              onClick={() => setLang('en')}
              className={`flex items-center gap-1 px-2 py-1.5 text-xs transition-colors ${
                lang === 'en' ? 'bg-accent/15 text-accent' : 'text-dark-muted hover:text-dark-text'
              }`}
            >
              <FlagEN /> EN
            </button>
          </div>

          <button
            onClick={onLoginClick}
            className="text-sm font-medium text-dark-text bg-dark-surface border border-dark-border px-4 py-2 rounded-lg hover:border-accent/50 transition-colors"
          >
            {t('landing.nav.login')}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-dark-muted hover:text-dark-text p-1"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-dark-surface border-b border-dark-border px-4 pb-4 space-y-3">
          {NAV_LINKS.map(({ key, href }) => (
            <button
              key={key}
              onClick={() => scrollTo(href)}
              className="block w-full text-left text-sm text-dark-muted hover:text-dark-text py-2"
            >
              {t(key)}
            </button>
          ))}
          <div className="flex items-center gap-2 py-2">
            <button
              onClick={() => setLang('es')}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${lang === 'es' ? 'text-accent' : 'text-dark-muted'}`}
            >
              <FlagES /> ES
            </button>
            <button
              onClick={() => setLang('en')}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${lang === 'en' ? 'text-accent' : 'text-dark-muted'}`}
            >
              <FlagEN /> EN
            </button>
          </div>
          <button
            onClick={() => { setMobileOpen(false); onLoginClick() }}
            className="w-full text-sm font-medium text-dark-bg bg-accent py-2.5 rounded-lg"
          >
            {t('landing.nav.login')}
          </button>
        </div>
      )}
    </nav>
  )
}
