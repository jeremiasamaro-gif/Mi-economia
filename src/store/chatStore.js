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

    let responseContent

    if (!expenseContext || expenseContext.totalExpenses === 0) {
      // No data — fun, professional, non-offensive responses
      const noDataResponses = [
        '¡Ey! Todavía no tenés gastos cargados este mes. Soy muy bueno analizando finanzas, pero necesito datos para trabajar. Andá a la tabla de gastos y cargá algunos, ¡así puedo darte consejos de verdad!',
        '¡Hola! Veo que tu cuenta está más vacía que billetera de fin de mes. Cargá tus gastos en la tabla y volvé, que tengo muchos consejos esperándote.',
        'Mmm... no encuentro gastos cargados todavía. Sin datos soy como un contador sin calculadora. ¡Cargá tus gastos y vamos a poner tus finanzas en orden!',
        '¡Buenas! Tu historial está en cero. Empezá a cargar tus gastos en la tabla y después charlamos sobre cómo optimizar tu plata. ¡Te espero!',
      ]
      responseContent = noDataResponses[Math.floor(Math.random() * noDataResponses.length)]
    } else {
      // Has data — friendly, advisory, firm responses
      const withDataResponses = [
        `Mirá, analizando tus ${expenseContext.totalExpenses} gastos del mes, tu categoría más pesada es **Vivienda**. Esto es normal, pero si supera el 35% de tus ingresos, te conviene buscar alternativas. No te digo que te mudes mañana, pero tenerlo presente ayuda.`,
        `Vi tus números y hay algo que quiero que sepas: tus gastos en **Alimentación** vienen subiendo. La inflación pega, sí, pero también es donde más se puede optimizar. Compará precios, aprovechá ofertas y, sobre todo, evitá las compras impulsivas.`,
        `Buena noticia: tu balance este mes está en positivo. Eso ya es un logro. Ahora, mi consejo firme: ese excedente no lo dejes quieto en la cuenta. Armemos un plan de ahorro para que esa plata trabaje para vos.`,
        `Tenés gastos recurrentes que suman bastante. No está mal, son servicios que usás, pero revisalos cada tanto. ¿Seguís usando todas esas suscripciones? A veces pagamos cosas por inercia. Hacé una limpieza y tu bolsillo te lo va a agradecer.`,
        `¡Bien ahí! Tus gastos en **Entretenimiento** están controlados este mes. Disfrutar también es parte del plan, siempre y cuando sea con conciencia. Seguí así que vas por buen camino.`,
        `Te soy sincero: los gastos hormiga son traicioneros. Esos cafecitos, delivery, compras chicas... sumados pegan fuerte. Revisá los montos más chicos de tu tabla, te vas a sorprender.`,
      ]
      responseContent = withDataResponses[Math.floor(Math.random() * withDataResponses.length)]
    }

    const aiMessage = {
      role: 'assistant',
      content: responseContent,
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
