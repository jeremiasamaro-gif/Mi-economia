import { useState, useRef, useEffect } from 'react'
import { X, Send } from 'lucide-react'
import useSupportStore from '../../store/supportStore'
import { useAuth } from '../../hooks/useAuth'
import { useTranslation } from '../../hooks/useTranslation'

export default function SupportPanel() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const {
    isPanelOpen,
    closePanel,
    getOrCreateConversation,
    getConversationMessages,
    sendUserMessage,
    markReadByUser,
    canSendMessage,
  } = useSupportStore()

  const [input, setInput] = useState('')
  const [showSentMsg, setShowSentMsg] = useState(false)
  const [started, setStarted] = useState(false)
  const messagesEndRef = useRef(null)

  const conv = user
    ? useSupportStore.getState().conversations.find((c) => c.user_id === user.id)
    : null
  const messages = conv ? getConversationMessages(conv.id) : []
  const hasMessages = messages.length > 0

  // Mark as read when panel opens
  useEffect(() => {
    if (isPanelOpen && user) {
      markReadByUser(user.id)
    }
  }, [isPanelOpen, user, markReadByUser])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = () => {
    if (!input.trim() || !user) return
    if (!canSendMessage()) return

    const success = sendUserMessage(
      user.id,
      user.full_name,
      user.email,
      user.plan,
      input.trim()
    )

    if (success) {
      setInput('')
      setStarted(true)
      setShowSentMsg(true)
      setTimeout(() => setShowSentMsg(false), 4000)
    }
  }

  const handleStart = () => {
    if (user) {
      getOrCreateConversation(user.id, user.full_name, user.email, user.plan)
      setStarted(true)
    }
  }

  const formatTime = (iso) => {
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      {/* Backdrop on mobile */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 sm:hidden"
          onClick={closePanel}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-screen w-full sm:w-[320px] bg-dark-surface border-l border-dark-border flex flex-col z-50 shadow-2xl transition-transform duration-300 ${
          isPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">{t('support.title')}</h3>
              <p className="text-[11px] text-dark-muted mt-0.5">{t('support.subtitle')}</p>
            </div>
            <button
              onClick={closePanel}
              className="text-dark-muted hover:text-dark-text p-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!hasMessages && !started ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full text-center">
              <img
                src="/toro-avatar.jpeg"
                alt="MAX"
                className="w-10 h-10 rounded-full object-cover mb-3"
              />
              <p className="text-sm font-medium mb-1">{t('support.emptyTitle')}</p>
              <p className="text-xs text-dark-muted mb-4">{t('support.emptyDesc')}</p>
              <button
                onClick={handleStart}
                className="bg-accent text-dark-bg px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
              >
                {t('support.emptyButton')}
              </button>
            </div>
          ) : (
            /* Messages */
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_role === 'user' ? 'justify-end' : 'justify-start gap-2'}`}
                >
                  {msg.sender_role === 'admin' && (
                    <div className="flex-shrink-0 mt-1">
                      <img
                        src="/toro-avatar.jpeg"
                        alt="MAX"
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    </div>
                  )}
                  <div className="max-w-[80%]">
                    {msg.sender_role === 'admin' && (
                      <span className="text-[9px] text-dark-muted block mb-0.5">
                        {t('support.teamLabel')}
                      </span>
                    )}
                    <div
                      className={`rounded-xl px-3 py-2 text-sm ${
                        msg.sender_role === 'user'
                          ? 'bg-accent/15 text-dark-text rounded-br-sm'
                          : 'bg-dark-bg border border-dark-border rounded-bl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[9px] text-dark-muted mt-0.5 block">
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                </div>
              ))}

              {showSentMsg && (
                <p className="text-[11px] text-accent/70 text-center py-1">
                  {t('support.sent')}
                </p>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        {(hasMessages || started) && (
          <div className="p-3 border-t border-dark-border">
            {!canSendMessage() ? (
              <p className="text-xs text-center text-dark-muted py-2">
                {t('support.rateLimited')}
              </p>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('support.placeholder')}
                  maxLength={1000}
                  className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="bg-accent text-dark-bg p-2 rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
