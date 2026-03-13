import { useState, useEffect } from 'react'
import { Trophy } from 'lucide-react'
import { useAchievements } from '../../hooks/useAchievements'
import { useAuth } from '../../hooks/useAuth'
import AchievementCard from './AchievementCard'
import AchievementShareCanvas from './AchievementShareCanvas'

export default function Achievements() {
  const { user } = useAuth()
  const { achievements, definitions, unlockedCount, totalCount, checkNow, isUnlocked } =
    useAchievements()
  const [selectedAchievement, setSelectedAchievement] = useState(null)

  useEffect(() => {
    checkNow()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getUnlockedData = (defId) => {
    return achievements.find((a) => a.achievement_id === defId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <Trophy className="text-accent" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark-text">Logros</h2>
            <p className="text-sm text-dark-muted">Tu progreso financiero</p>
          </div>
        </div>
        <span className="text-sm font-medium bg-accent/10 text-accent px-3 py-1.5 rounded-full">
          {unlockedCount}/{totalCount} desbloqueados
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {definitions.map((def) => {
          const unlocked = isUnlocked(def.id)
          const data = getUnlockedData(def.id)
          return (
            <AchievementCard
              key={def.id}
              definition={def}
              isUnlocked={unlocked}
              unlockedAt={data?.unlocked_at}
              progress={data?.progress || 0}
              onShare={unlocked ? (d) => setSelectedAchievement(d) : undefined}
            />
          )
        })}
      </div>

      {/* Share Modal */}
      <AchievementShareCanvas
        achievement={selectedAchievement}
        userName={user?.full_name || 'Usuario'}
        isOpen={!!selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />
    </div>
  )
}
