import { BarChart3, Bot, Camera, MessageSquare, Trophy, Users } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

const FEATURES = [
  { icon: BarChart3, titleKey: 'landing.features.1.title', descKey: 'landing.features.1.desc', color: 'text-blue-400 bg-blue-400/10' },
  { icon: Bot, titleKey: 'landing.features.2.title', descKey: 'landing.features.2.desc', color: 'text-accent bg-accent/10' },
  { icon: Camera, titleKey: 'landing.features.3.title', descKey: 'landing.features.3.desc', color: 'text-purple-400 bg-purple-400/10' },
  { icon: MessageSquare, titleKey: 'landing.features.4.title', descKey: 'landing.features.4.desc', color: 'text-emerald-400 bg-emerald-400/10' },
  { icon: Trophy, titleKey: 'landing.features.5.title', descKey: 'landing.features.5.desc', color: 'text-amber-400 bg-amber-400/10' },
  { icon: Users, titleKey: 'landing.features.6.title', descKey: 'landing.features.6.desc', color: 'text-pink-400 bg-pink-400/10' },
]

export default function FeaturesSection() {
  const { t } = useTranslation()

  return (
    <section id="features" className="py-20 sm:py-24 px-4 sm:px-6 scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-dark-text text-center mb-12">
          {t('landing.features.title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, titleKey, descKey, color }) => {
            const [textColor, bgColor] = color.split(' ')
            return (
              <div
                key={titleKey}
                className="bg-dark-surface border border-dark-border rounded-xl p-6 hover:border-accent/30 transition-all duration-300 group"
              >
                <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center mb-4`}>
                  <Icon size={20} className={textColor} />
                </div>
                <h3 className="text-sm font-medium text-dark-text mb-2 group-hover:text-accent transition-colors">
                  {t(titleKey)}
                </h3>
                <p className="text-xs text-dark-muted leading-relaxed">{t(descKey)}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
