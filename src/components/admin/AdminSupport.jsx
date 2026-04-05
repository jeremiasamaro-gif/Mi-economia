import { useState, useRef, useEffect } from 'react'
import { Search, Send, X, Copy, Check } from 'lucide-react'
import useSupportStore from '../../store/supportStore'
import { useAuth } from '../../hooks/useAuth'
import { useTranslation } from '../../hooks/useTranslation'
import PlanBadge from '../shared/PlanBadge'

export default function AdminSupport() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const {
    getAllConversations,
    getConversationMessages,
    sendAdminMessage,
    markReadByAdmin,
    closeConversation,
    reopenConversation,
  } = useSupportStore()

  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all | unanswered | closed
  const [input, setInput] = useState('')
  const [copiedId, setCopiedId] = useState(false)
  const messagesEndRef = useRef(null)

  const conversations = getAllConversations()

  const filtered = conversations.filter((c) => {
    const matchSearch =
      !search ||
      c.user_name.toLowerCase().includes(search.toLowerCase()) ||
      c.user_email.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ||
      (filter === 'unanswered' && c.unread_by_admin) ||
      (filter === 'closed' && c.status === 'closed')
    return matchSearch && matchFilter
  })

  const selected = conversations.find((c) => c.id === selectedId)
  const messages = selectedId ? getConversationMessages(selectedId) : []

  // Mark as read when selecting conversation
  useEffect(() => {
    if (selectedId) {
      markReadByAdmin(selectedId)
    }
  }, [selectedId, markReadByAdmin])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = () => {
    if (!input.trim() || !selectedId || !user) return
    sendAdminMessage(selectedId, user.id, input.trim())
    setInput('')
  }

  const handleCopyId = () => {
    if (selected) {
      navigator.clipboard.writeText(selected.user_id)
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    }
  }

  const formatTime = (iso) => {
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (iso) => {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now - d
    const diffHrs = diffMs / (1000 * 60 * 60)

    if (diffHrs < 1) return `${Math.floor(diffMs / 60000)}m`
    if (diffHrs < 24) return `${Math.floor(diffHrs)}h`
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
  }

  const getLastMessage = (convId) => {
    const msgs = getConversationMessages(convId)
    return msgs.length > 0 ? msgs[msgs.length - 1] : null
  }

  const filterTabs = [
    { id: 'all', label: t('support.admin.filterAll') },
    { id: 'unanswered', label: t('support.admin.filterUnanswered') },
    { id: 'closed', label: t('support.admin.filterClosed') },
  ]

  return (
    <div className="flex h-[calc(100vh-180px)] bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
      {/* Conversations list */}
      <div className="w-[320px] border-r border-dark-border flex flex-col">
        {/* Search */}
        <div className="p-3 border-b border-dark-border">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('support.admin.searchPlaceholder')}
              maxLength={100}
              className="w-full bg-dark-bg border border-dark-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex border-b border-dark-border">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                filter === tab.id
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-dark-muted hover:text-dark-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-dark-muted text-center py-8">
              {t('support.admin.noConversations')}
            </p>
          ) : (
            filtered.map((conv) => {
              const lastMsg = getLastMessage(conv.id)
              const preview = lastMsg
                ? lastMsg.content.slice(0, 50) + (lastMsg.content.length > 50 ? '...' : '')
                : ''

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full text-left px-4 py-3 border-b border-dark-border/50 hover:bg-dark-hover transition-colors ${
                    selectedId === conv.id ? 'bg-dark-hover' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Unread dot */}
                    <div className="mt-2">
                      {conv.unread_by_admin ? (
                        <div className="w-2 h-2 rounded-full bg-accent" />
                      ) : (
                        <div className="w-2 h-2" />
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold flex-shrink-0">
                      {conv.user_name
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{conv.user_name}</span>
                        <span className="text-[10px] text-dark-muted flex-shrink-0 ml-2">
                          {formatDate(conv.last_message_at)}
                        </span>
                      </div>
                      <p className="text-[11px] text-dark-muted truncate">{conv.user_email}</p>
                      <p className="text-xs text-dark-muted truncate mt-0.5">{preview}</p>
                    </div>

                    {/* Status */}
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded flex-shrink-0 mt-1 ${
                        conv.status === 'open'
                          ? 'bg-accent/20 text-accent'
                          : 'bg-dark-border text-dark-muted'
                      }`}
                    >
                      {t(`support.status.${conv.status}`)}
                    </span>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Conversation detail */}
      <div className="flex-1 flex flex-col">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-dark-muted text-sm">
            {t('support.admin.selectConversation')}
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-4 py-3 border-b border-dark-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                  {selected.user_name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{selected.user_name}</span>
                    <PlanBadge plan={selected.user_plan} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-dark-muted">{selected.user_email}</span>
                    <button
                      onClick={handleCopyId}
                      className="text-dark-muted hover:text-dark-text"
                      title="Copiar ID"
                    >
                      {copiedId ? <Check size={10} className="text-accent" /> : <Copy size={10} />}
                    </button>
                  </div>
                </div>
              </div>
              <div>
                {selected.status === 'open' ? (
                  <button
                    onClick={() => closeConversation(selected.id)}
                    className="flex items-center gap-1.5 text-xs text-dark-muted hover:text-red-400 transition-colors"
                  >
                    <X size={14} />
                    {t('support.admin.close')}
                  </button>
                ) : (
                  <button
                    onClick={() => reopenConversation(selected.id)}
                    className="text-xs text-dark-muted hover:text-accent transition-colors"
                  >
                    {t('support.admin.reopen')}
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[70%]">
                    <div
                      className={`rounded-xl px-3 py-2 text-sm ${
                        msg.sender_role === 'admin'
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
              <div ref={messagesEndRef} />
            </div>

            {/* Reply input */}
            <div className="p-3 border-t border-dark-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('support.admin.replyPlaceholder').replace('{name}', selected.user_name)}
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
            </div>
          </>
        )}
      </div>
    </div>
  )
}
