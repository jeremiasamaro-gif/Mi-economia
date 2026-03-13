import { create } from 'zustand'

const MAX_MESSAGES_PER_DAY = 20

const useChatStore = create((set, get) => ({
  messages: [],
  isOpen: false,
  loading: false,
  dailyCount: 0,
  lastResetDate: new Date().toDateString(),

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),

  canSendMessage: () => {
    const state = get()
    // Reset counter if new day
    if (state.lastResetDate !== new Date().toDateString()) {
      set({ dailyCount: 0, lastResetDate: new Date().toDateString() })
      return true
    }
    return state.dailyCount < MAX_MESSAGES_PER_DAY
  },

  getRemainingMessages: () => {
    const state = get()
    if (state.lastResetDate !== new Date().toDateString()) {
      return MAX_MESSAGES_PER_DAY
    }
    return Math.max(0, MAX_MESSAGES_PER_DAY - state.dailyCount)
  },

  sendMessage: async (content, expenseContext) => {
    if (!get().canSendMessage()) return

    const userMessage = { role: 'user', content, timestamp: new Date().toISOString() }
    set((state) => ({
      messages: [...state.messages, userMessage],
      loading: true,
      dailyCount: state.dailyCount + 1,
    }))

    // TODO SUPABASE: replace with fetch to Supabase Edge Function /api/chat
    // The Edge Function will:
    // 1. Verify user auth and plan
    // 2. Check rate limit (20/day)
    // 3. Call Claude API with expense context as system prompt
    // 4. Stream response back

    // Mock AI response
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1500))

    const mockResponses = [
      `Analizando tus gastos del mes, veo que tu categoría más alta es **Vivienda** con $150.000 (alquiler). Representan el ${((150000 / 340000) * 100).toFixed(0)}% de tus gastos totales. Te recomiendo revisar si hay opciones más económicas o si podés negociar el precio.`,
      `Basándome en tu historial de los últimos 3 meses, tus gastos en **Alimentación** han subido un 15%. Esto puede deberse a la inflación, pero te sugiero comparar precios entre supermercados y aprovechar ofertas.`,
      `Tu balance este mes es positivo: ingresás $535.000 y gastás aproximadamente $340.000. Tenés un margen de ahorro de ~$195.000. ¿Querés que te arme un plan de ahorro?`,
      `Detecté que tenés gastos recurrentes por $202.500/mes (alquiler + servicios + streaming). Eso representa el 38% de tus ingresos. Es un ratio saludable, pero estate atento a aumentos.`,
      `Tu gasto en **Entretenimiento** este mes ($19.000) está dentro del presupuesto de $25.000. Te quedan $6.000 disponibles. ¡Vas bien! 🎯`,
    ]

    const aiMessage = {
      role: 'assistant',
      content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
      timestamp: new Date().toISOString(),
    }

    set((state) => ({
      messages: [...state.messages, aiMessage],
      loading: false,
    }))
  },

  clearChat: () => set({ messages: [] }),
}))

export default useChatStore
