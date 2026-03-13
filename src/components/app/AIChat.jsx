import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, X, Loader2, Lock, Sparkles, Trash2 } from 'lucide-react'
import useChatStore from '../../store/chatStore'
import { usePlan } from '../../hooks/usePlan'
import { useExpenses } from '../../hooks/useExpenses'
import UpgradeModal from '../shared/UpgradeModal'

const QUICK_PROMPTS = [
  '¿En qué gasto más?',
  'Proyectá mi fin de mes',
  '¿Me alcanza para ahorrar $50.000?',
  'Detectá gastos inusuales',
]

export default function AIChat() {
  const { canUseAI } = usePlan()
  const { messages, isOpen, loading, toggleChat, sendMessage, clearChat, getRemainingMessages, canSendMessage } = useChatStore()
  const { expenses, currentMonthExpenses } = useExpenses()
  const [input, setInput] = useState('')
  const [showUpgrade, setShowUpgrade] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || loading) return
    if (!canSendMessage()) return
    // Build expense context for the AI (would be sent to Edge Function)
    const context = { totalExpenses: currentMonthExpenses.length, expenses: currentMonthExpenses.slice(0, 50) }
    sendMessage(input.trim(), context)
    setInput('')
  }

  const handleQuickPrompt = (prompt) => {
    if (!canSendMessage()) return
    const context = { totalExpenses: currentMonthExpenses.length, expenses: currentMonthExpenses.slice(0, 50) }
    sendMessage(prompt, context)
  }

  if (!canUseAI) {
    return (
      <>
        <button
          onClick={() => setShowUpgrade(true)}
          className="fixed right-4 bottom-4 w-14 h-14 bg-dark-surface border border-dark-border rounded-full flex items-center justify-center shadow-lg hover:border-accent z-40"
        >
          <Lock size={20} className="text-dark-muted" />
        </button>
        <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} feature="Asistente IA" />
      </>
    )
  }

  return (
    <>
      {/* Toggle button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed right-4 bottom-4 w-14 h-14 bg-accent text-dark-bg rounded-full flex items-center justify-center shadow-lg hover:bg-accent/90 z-40"
        >
          <MessageSquare size={22} />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed right-0 top-0 h-screen w-[320px] bg-dark-surface border-l border-dark-border flex flex-col z-40 shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b border-dark-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-accent" />
              <h3 className="font-semibold text-sm">
                Econom<span className="text-accent">IA</span>
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-dark-muted">
                {getRemainingMessages()}/20 msgs
              </span>
              <button onClick={clearChat} className="text-dark-muted hover:text-dark-text" title="Limpiar chat">
                <Trash2 size={14} />
              </button>
              <button onClick={toggleChat} className="text-dark-muted hover:text-dark-text">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="text-center py-4">
                  <Sparkles size={32} className="mx-auto text-accent mb-3" />
                  <p className="text-sm text-dark-muted">
                    Soy tu asistente financiero. Preguntame lo que quieras sobre tus gastos.
                  </p>
                </div>
                <div className="space-y-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleQuickPrompt(prompt)}
                      className="w-full text-left text-sm bg-dark-bg border border-dark-border rounded-lg px-3 py-2 hover:border-accent text-dark-muted hover:text-dark-text"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-accent text-dark-bg rounded-br-sm'
                      : 'bg-dark-bg border border-dark-border rounded-bl-sm'
                  }`}
                >
                  {msg.content.split('\n').map((line, j) => (
                    <p key={j} className={j > 0 ? 'mt-1' : ''}>
                      {line.split(/(\*\*.*?\*\*)/).map((part, k) =>
                        part.startsWith('**') && part.endsWith('**') ? (
                          <strong key={k}>{part.slice(2, -2)}</strong>
                        ) : (
                          part
                        )
                      )}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-dark-bg border border-dark-border rounded-xl px-4 py-3 rounded-bl-sm">
                  <Loader2 size={16} className="animate-spin text-accent" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-dark-border">
            {!canSendMessage() ? (
              <p className="text-xs text-center text-dark-muted py-2">
                Alcanzaste el límite de 20 mensajes por día. Volvé mañana.
              </p>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Preguntá algo..."
                  maxLength={500}
                  className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="bg-accent text-dark-bg p-2 rounded-lg hover:bg-accent/90 disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
