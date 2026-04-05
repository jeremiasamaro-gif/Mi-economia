import { MessageSquare } from 'lucide-react'
import useSupportStore from '../../store/supportStore'
import { useAuth } from '../../hooks/useAuth'
import { useTranslation } from '../../hooks/useTranslation'
import SupportPanel from './SupportPanel'

export default function SupportButton() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { isPanelOpen, togglePanel, getUnreadCountForUser } = useSupportStore()
  const unread = user ? getUnreadCountForUser(user.id) : 0

  return (
    <>
      {/* Floating button */}
      {!isPanelOpen && (
        <button
          onClick={togglePanel}
          className="fixed right-4 bottom-4 w-14 h-14 rounded-full bg-dark-surface border border-dark-border flex items-center justify-center shadow-lg hover:border-accent hover:scale-105 transition-all z-40"
          title={t('support.tooltip')}
        >
          <MessageSquare size={22} className="text-dark-muted" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      )}

      {/* Slide-in panel */}
      <SupportPanel />
    </>
  )
}
