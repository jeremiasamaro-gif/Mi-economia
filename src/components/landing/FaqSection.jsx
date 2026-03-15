import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

const FAQ_KEYS = [1, 2, 3, 4, 5]

export default function FaqSection() {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section id="faq" className="py-20 sm:py-24 px-4 sm:px-6 scroll-mt-16">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-dark-text text-center mb-12">
          {t('landing.faq.title')}
        </h2>

        <div className="space-y-0">
          {FAQ_KEYS.map((n) => {
            const isOpen = openIndex === n
            return (
              <div key={n} className="border-b border-dark-border">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : n)}
                  className="w-full flex items-center justify-between py-5 text-left group"
                >
                  <span className={`text-sm font-medium pr-4 transition-colors ${isOpen ? 'text-accent' : 'text-dark-text group-hover:text-accent'}`}>
                    {t(`landing.faq.q${n}`)}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-dark-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-40 pb-5' : 'max-h-0'
                  }`}
                >
                  <p className="text-xs text-dark-muted leading-relaxed">
                    {t(`landing.faq.a${n}`)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
