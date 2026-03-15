import { useState, useEffect } from 'react'
import { useTranslation } from '../../hooks/useTranslation'

export default function CookieConsent() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const choice = localStorage.getItem('mi-economia-cookies')
    if (!choice) setVisible(true)
  }, [])

  const handleChoice = (value) => {
    const record = JSON.stringify({ consent: value, timestamp: new Date().toISOString() })
    localStorage.setItem('mi-economia-cookies', record)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-dark-surface/95 backdrop-blur-md border-t border-dark-border p-4 sm:p-5">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-xs text-dark-muted flex-1">{t('cookie.message')}</p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => handleChoice('essential')}
            className="px-4 py-2 text-xs border border-dark-border rounded-lg text-dark-muted hover:text-dark-text hover:border-dark-text transition-colors"
          >
            {t('cookie.essential')}
          </button>
          <button
            onClick={() => handleChoice('all')}
            className="px-4 py-2 text-xs bg-accent text-dark-bg font-medium rounded-lg hover:bg-accent/90 transition-colors"
          >
            {t('cookie.acceptAll')}
          </button>
        </div>
      </div>
    </div>
  )
}
