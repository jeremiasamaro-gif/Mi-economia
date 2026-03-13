import { Lock, Share2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function AchievementCard({ definition, isUnlocked, unlockedAt, progress, onShare }) {
  const progressPercent = typeof progress === 'number' ? progress : 0

  return (
    <div
      className={`bg-dark-surface border rounded-xl p-4 transition-all ${
        isUnlocked
          ? 'border-accent/30'
          : 'border-dark-border opacity-40 grayscale'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <span className="text-4xl leading-none">{definition.icon}</span>
          {!isUnlocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-dark-bg/60 rounded-lg">
              <Lock size={18} className="text-dark-muted" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={`font-bold text-sm leading-tight ${
              isUnlocked ? 'text-dark-text' : 'text-dark-muted'
            }`}
          >
            {definition.title}
          </h3>
          <p
            className={`text-xs mt-0.5 ${
              isUnlocked ? 'text-dark-muted' : 'text-dark-muted/60'
            }`}
          >
            {definition.description}
          </p>

          {isUnlocked && unlockedAt && (
            <p className="text-xs text-accent mt-1.5">
              Desbloqueado el {format(new Date(unlockedAt), "d 'de' MMMM yyyy", { locale: es })}
            </p>
          )}

          {!isUnlocked && definition.type === 'streak' && progressPercent > 0 && (
            <div className="mt-2">
              <div className="w-full bg-dark-border rounded-full h-1.5">
                <div
                  className="bg-accent h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
              <p className="text-xs text-dark-muted/60 mt-0.5">{progressPercent}%</p>
            </div>
          )}
        </div>
      </div>

      {isUnlocked && onShare && (
        <button
          onClick={() => onShare(definition)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-accent hover:text-accent/80 border border-accent/20 hover:border-accent/40 rounded-lg py-1.5 transition-colors"
        >
          <Share2 size={14} />
          Compartir
        </button>
      )}
    </div>
  )
}
