import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { User, CreditCard, Trophy, UsersRound, ShieldCheck, Plug } from 'lucide-react'
import DatosPersonales from '../components/profile/DatosPersonales'
import MiPlan from '../components/profile/MiPlan'
import MisLogros from '../components/profile/MisLogros'
import MiGrupo from '../components/profile/MiGrupo'
import Seguridad from '../components/profile/Seguridad'
import Integraciones from '../components/profile/Integraciones'
import { useTranslation } from '../hooks/useTranslation'

const TAB_KEYS = [
  { id: 'datos', labelKey: 'profile.datos', icon: User },
  { id: 'plan', labelKey: 'profile.plan', icon: CreditCard },
  { id: 'logros', labelKey: 'profile.logros', icon: Trophy },
  { id: 'grupo', labelKey: 'profile.grupo', icon: UsersRound },
  { id: 'integraciones', labelKey: 'profile.integraciones', icon: Plug },
  { id: 'seguridad', labelKey: 'profile.seguridad', icon: ShieldCheck },
]

export default function ProfilePage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'datos')
  const [unsavedTabs, setUnsavedTabs] = useState(new Set())

  useEffect(() => {
    if (tabFromUrl && TAB_KEYS.some((tab) => tab.id === tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setSearchParams({ tab: tabId })
  }

  const markUnsaved = (tabId) => {
    setUnsavedTabs((prev) => new Set(prev).add(tabId))
  }

  const clearUnsaved = (tabId) => {
    setUnsavedTabs((prev) => {
      const next = new Set(prev)
      next.delete(tabId)
      return next
    })
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'datos':
        return <DatosPersonales onUnsaved={() => markUnsaved('datos')} onSaved={() => clearUnsaved('datos')} />
      case 'plan':
        return <MiPlan />
      case 'logros':
        return <MisLogros />
      case 'grupo':
        return <MiGrupo />
      case 'integraciones':
        return <Integraciones />
      case 'seguridad':
        return <Seguridad />
      default:
        return <DatosPersonales onUnsaved={() => markUnsaved('datos')} onSaved={() => clearUnsaved('datos')} />
    }
  }

  return (
    <div className="flex gap-6 min-h-[calc(100vh-3rem)]">
      {/* Left: Submenu */}
      <div className="w-[220px] shrink-0">
        <div className="bg-dark-surface border border-dark-border rounded-xl p-2 sticky top-6">
          <h3 className="text-sm font-semibold text-dark-muted px-3 py-2 uppercase tracking-wider">{t('profile.title')}</h3>
          <nav className="space-y-0.5">
            {TAB_KEYS.map(({ id, labelKey, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                  activeTab === id
                    ? 'bg-accent/10 text-accent border-l-2 border-accent'
                    : 'text-dark-muted hover:text-dark-text hover:bg-dark-hover'
                }`}
              >
                <Icon size={18} />
                <span className="flex-1">{t(labelKey)}</span>
                {unsavedTabs.has(id) && (
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Right: Content panel */}
      <div className="flex-1 min-w-0">
        {renderContent()}
      </div>
    </div>
  )
}
