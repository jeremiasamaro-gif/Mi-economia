import { useState, useRef, useEffect } from 'react'
import { Send, RotateCcw, ChevronDown, ChevronUp, Share2, Loader2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useExpenses } from '../../hooks/useExpenses'
import { usePlan } from '../../hooks/usePlan'
import useCfoStore from '../../store/cfoStore'
import { useTranslation } from '../../hooks/useTranslation'

// CFO Avatar — Toro image
const CfoAvatar = ({ size = 64, className = '' }) => (
  <img
    src="/toro-avatar.jpeg"
    alt="Asistente Financiero"
    className={`rounded-full border-2 border-accent/30 object-cover ${className}`}
    style={{ width: size, height: size }}
  />
)

// Mini CFO avatar for chat bubbles
const CfoMiniAvatar = () => (
  <img
    src="/toro-avatar.jpeg"
    alt="CFO"
    className="w-5 h-5 rounded-full object-cover shrink-0"
  />
)

// Expandable section inside CFO bubble
function ExpandableSection({ icon, title, content }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-t border-dark-border/30 mt-2 pt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-xs text-dark-muted hover:text-dark-text transition-colors"
      >
        <span>{icon} {title}</span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && (
        <p className="text-xs text-dark-muted mt-1.5 leading-relaxed">{content}</p>
      )}
    </div>
  )
}

// Verdict badge
function VerdictBadge({ verdict, title, subtitle }) {
  const colors = {
    yes: 'bg-green-500/20 border-green-500/30 text-green-400',
    warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    no: 'bg-red-500/20 border-red-500/30 text-red-400',
  }
  return (
    <div className={`rounded-lg px-3 py-2 mb-2 border ${colors[verdict] || colors.no}`}>
      <p className="text-sm font-bold">{title}</p>
      <p className="text-xs opacity-80">{subtitle}</p>
    </div>
  )
}

// CFO Response Bubble
function CfoBubble({ content }) {
  const { t } = useTranslation()

  if (content.type === 'purchase') {
    return (
      <div className="flex gap-2 items-start">
        <CfoMiniAvatar />
        <div className="max-w-[85%] bg-[#1a1d23] border border-[#2a2d35] rounded-xl rounded-bl-sm px-3 py-2.5 text-sm">
          <VerdictBadge verdict={content.verdict} title={content.verdictTitle} subtitle={content.verdictSubtitle} />
          <p className="text-dark-text leading-relaxed">{content.message}</p>
          <ExpandableSection icon="📊" title={t('cfo.analysis')} content={content.analysis} />
          <ExpandableSection icon="💥" title={t('cfo.impact')} content={content.impact} />
          <ExpandableSection icon="💡" title={t('cfo.advice')} content={content.recommendation} />
          {content.alternative && (
            <ExpandableSection icon="🔄" title={t('cfo.alternative')} content={content.alternative} />
          )}
        </div>
      </div>
    )
  }

  // General response
  return (
    <div className="flex gap-2 items-start">
      <CfoMiniAvatar />
      <div className="max-w-[85%] bg-[#1a1d23] border border-[#2a2d35] rounded-xl rounded-bl-sm px-3 py-2.5 text-sm">
        <p className="text-dark-text leading-relaxed">{content.message}</p>
        {content.insight && (
          <ExpandableSection icon="📊" title={t('cfo.insight')} content={content.insight} />
        )}
        {content.recommendation && (
          <ExpandableSection icon="💡" title={t('cfo.recommendation')} content={content.recommendation} />
        )}
      </div>
    </div>
  )
}

export default function CfoPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { isPro } = usePlan()
  const { expenses, currentMonthExpenses, monthlyTotals, categoryTotals } = useExpenses()
  const { messages, loading, sendMessage, clearChat, getConsultationCount } = useCfoStore()

  const [input, setInput] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Build financial context
  const totals = monthlyTotals
  const last3Income = totals.slice(-3).reduce((s, m) => s + m.income, 0) / Math.max(1, Math.min(3, totals.length))
  const last3Expenses = totals.slice(-3).reduce((s, m) => s + m.expense, 0) / Math.max(1, Math.min(3, totals.length))
  const currentMonth = totals.length > 0 ? totals[totals.length - 1] : { income: 0, expense: 0, balance: 0 }
  const currentBalance = currentMonth.income - currentMonth.expense
  const savingsRate = last3Income > 0 ? ((last3Income - last3Expenses) / last3Income) * 100 : 0

  // Financial health based on balance_ratio = currentBalance / avgIncome * 100
  const balanceRatio = last3Income > 0 ? (currentBalance / last3Income) * 100 : (currentBalance <= 0 ? -100 : 0)

  let healthLabel, healthBg, healthText
  if (currentBalance > 0) {
    if (balanceRatio >= 20) { healthLabel = t('cfo.excellent'); healthBg = 'bg-[#1e3a2a]'; healthText = 'text-[#4ade80]' }
    else if (balanceRatio >= 10) { healthLabel = t('cfo.good'); healthBg = 'bg-[#1e2a3a]'; healthText = 'text-[#60a5fa]' }
    else { healthLabel = t('cfo.fair'); healthBg = 'bg-[#2a2a1e]'; healthText = 'text-[#fbbf24]' }
  } else {
    if (balanceRatio >= -15) { healthLabel = t('cfo.atRisk'); healthBg = 'bg-[#2a2a1e]'; healthText = 'text-[#fbbf24]' }
    else if (balanceRatio >= -30) { healthLabel = t('cfo.critical'); healthBg = 'bg-[#2a1e0a]'; healthText = 'text-[#f97316]' }
    else { healthLabel = t('cfo.severe'); healthBg = 'bg-[#2a1e1e]'; healthText = 'text-[#ef4444]' }
  }
  const healthColor = `${healthBg} ${healthText}`
  const balanceColor = currentBalance > 0 ? 'text-[#4ade80]' : currentBalance === 0 ? 'text-[#9ca3af]' : 'text-[#ef4444]'
  const healthTooltip = t('cfo.healthTooltip', { ratio: balanceRatio.toFixed(1) })

  const suggestedPills = [t('cfo.pill1'), t('cfo.pill2'), t('cfo.pill3')]

  const expenseContext = {
    avgIncome: last3Income,
    avgExpenses: last3Expenses,
    currentBalance,
    savingsRate,
    categoryTotals: [...categoryTotals],
  }

  const consultationCount = getConsultationCount()
  const freeLimit = 3
  const canConsult = isPro || consultationCount < freeLimit

  const userInitials = (user?.full_name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleSend = () => {
    const text = input.trim()
    if (!text || loading || !canConsult) return
    sendMessage(text, expenseContext, userInitials)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handlePill = (text) => {
    if (!canConsult) return
    sendMessage(text, expenseContext, userInitials)
  }

  const handleClear = () => {
    clearChat()
    setShowClearConfirm(false)
  }

  const handleTextareaInput = (e) => {
    setInput(e.target.value.slice(0, 300))
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px'
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-7rem)]">
      {/* LEFT: CFO Identity Panel */}
      <div className="w-[280px] shrink-0 hidden lg:block">
        <div className="bg-dark-surface border border-dark-border rounded-xl p-5 sticky top-6 space-y-5">
          {/* Avatar + identity */}
          <div className="text-center">
            <div className={`mx-auto mb-3 ${loading ? 'animate-float' : ''}`}>
              <CfoAvatar size={72} className="mx-auto" />
            </div>
            <h3 className="text-lg font-bold text-dark-text">{t('cfo.title')}</h3>
            <p className="text-xs text-dark-muted">{t('cfo.subtitle')}</p>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs text-accent">{t('cfo.available')}</span>
            </div>
            {loading && (
              <p className="text-xs text-accent/60 mt-1 animate-pulse">{t('cfo.analyzing')}</p>
            )}
          </div>

          {/* Mini summary card */}
          <div className="space-y-3 pt-3 border-t border-dark-border">
            <div className="flex justify-between items-center">
              <span className="text-xs text-dark-muted">{t('cfo.avgIncome')}</span>
              <span className="text-xs font-mono text-dark-text">${last3Income.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-dark-muted">{t('cfo.avgExpenses')}</span>
              <span className="text-xs font-mono text-dark-text">${last3Expenses.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-dark-muted">{t('cfo.currentBalance')}</span>
              <span className={`text-xs font-mono font-semibold ${balanceColor}`}>
                ${currentBalance.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between items-center group relative">
              <span className="text-xs text-dark-muted">{t('cfo.financialHealth')}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium cursor-help ${healthColor}`}>
                {healthLabel}
              </span>
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-1.5 px-2.5 py-1.5 bg-dark-bg border border-dark-border rounded-lg text-[10px] text-dark-muted whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-10">
                {healthTooltip}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Chat Quadrant */}
      <div className="flex-1 min-w-0 flex flex-col bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
        {/* Chat header */}
        <div className="px-4 py-3 border-b border-dark-border flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-dark-text">{t('cfo.chatTitle')}</h3>
            <p className="text-[10px] text-dark-muted">{t('cfo.chatSubtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isPro ? 'bg-accent/20 text-accent' : 'bg-dark-hover text-dark-muted'}`}>
              {isPro ? t('cfo.unlimited') : `${Math.max(0, freeLimit - consultationCount)}/${freeLimit} ${t('cfo.consultations')}`}
            </span>
            {messages.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-xs text-dark-muted hover:text-dark-text flex items-center gap-1 px-2 py-1 rounded hover:bg-dark-hover transition-colors"
                title={t('cfo.newConsultation')}
              >
                <RotateCcw size={12} />
                {t('cfo.newConsultation')}
              </button>
            )}
          </div>
        </div>

        {/* Mobile mini summary (hidden on desktop) */}
        <div className="lg:hidden px-4 py-2 border-b border-dark-border flex items-center gap-4 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <CfoMiniAvatar />
            <span className="text-xs font-semibold text-dark-text">{t('cfo.title')}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          </div>
          <div className="text-[10px] text-dark-muted shrink-0">{t('cfo.avgIncome')}: <span className="text-dark-text font-mono">${last3Income.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span></div>
          <div className="text-[10px] text-dark-muted shrink-0">{t('cfo.currentBalance')}: <span className={`font-mono ${balanceColor}`}>${currentBalance.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span></div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${healthColor}`}>{healthLabel}</span>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Empty state */}
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="lg:hidden mb-4">
                <CfoAvatar size={56} className="mx-auto" />
              </div>
              <p className="text-dark-muted text-sm mb-1">{t('cfo.emptyGreeting')}</p>
              <p className="text-dark-muted text-xs mb-5">{t('cfo.emptySubtext')}</p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {suggestedPills.map((pill) => (
                  <button
                    key={pill}
                    onClick={() => handlePill(pill)}
                    className="text-xs bg-dark-bg border border-dark-border rounded-full px-3 py-2 text-dark-muted hover:text-accent hover:border-accent/40 transition-colors text-left"
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => {
            if (msg.role === 'user') {
              return (
                <div key={i} className="flex justify-end gap-2 items-start">
                  <div className="max-w-[80%] bg-[#1e2a1e] border border-[#2a3a2a] rounded-xl rounded-br-sm px-3 py-2 text-sm text-[#d1d5db]">
                    {msg.content}
                  </div>
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent text-[9px] font-bold shrink-0">
                    {msg.initials}
                  </div>
                </div>
              )
            }
            // CFO response
            return <CfoBubble key={i} content={msg.content} />
          })}

          {/* Loading / thinking */}
          {loading && (
            <div className="flex gap-2 items-start">
              <CfoMiniAvatar />
              <div className="bg-[#1a1d23] border border-[#2a2d35] rounded-xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="px-4 py-3 border-t border-dark-border shrink-0">
          {!canConsult ? (
            <div className="text-center py-2">
              <p className="text-xs text-dark-muted">{t('cfo.limitReached', { limit: freeLimit })}</p>
              <a href="/pricing" className="text-xs text-accent hover:underline">{t('cfo.upgradeCta')}</a>
            </div>
          ) : (
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleTextareaInput}
                  onKeyDown={handleKeyDown}
                  placeholder={t('cfo.inputPlaceholder')}
                  maxLength={300}
                  rows={1}
                  disabled={loading}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent resize-none disabled:opacity-50 pr-12"
                  style={{ minHeight: '40px', maxHeight: '80px' }}
                />
                {input.length > 100 && (
                  <span className="absolute right-3 bottom-2 text-[9px] text-dark-muted">
                    {input.length}/300
                  </span>
                )}
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="bg-accent text-dark-bg p-2.5 rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Clear confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowClearConfirm(false)}>
          <div className="bg-dark-surface border border-dark-border rounded-xl p-5 w-full max-w-xs mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-dark-text mb-2">{t('cfo.clearTitle')}</h3>
            <p className="text-xs text-dark-muted mb-4">{t('cfo.clearMessage')}</p>
            <div className="flex gap-2">
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 px-3 py-2 bg-dark-hover text-dark-text rounded-lg text-xs hover:bg-dark-border transition-colors">
                {t('common.cancel')}
              </button>
              <button onClick={handleClear} className="flex-1 px-3 py-2 bg-accent text-dark-bg rounded-lg text-xs font-medium hover:bg-accent/90 transition-colors">
                {t('cfo.clearTitle')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Float animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
