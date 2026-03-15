import { X } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

export default function LegalModal({ type, onClose }) {
  const { t } = useTranslation()
  if (!type) return null

  const title = type === 'terms' ? t('landing.legal.termsTitle') : t('landing.legal.privacyTitle')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-dark-surface border border-dark-border rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-dark-text">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-dark-hover transition-colors text-dark-muted">
            <X size={18} />
          </button>
        </div>
        <div className="text-sm text-dark-muted space-y-3">
          <p>{t('landing.legal.placeholder')}</p>
          <p className="text-xs text-dark-muted/60">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <p className="text-xs text-dark-muted/60">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </div>
      </div>
    </div>
  )
}
