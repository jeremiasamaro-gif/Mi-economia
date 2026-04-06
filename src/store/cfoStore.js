import { create } from 'zustand'

// TODO SUPABASE: persist in cfo_consultations table

const PURCHASE_KEYWORDS = ['$', 'pesos', 'precio', 'cuesta', 'vale', 'comprar', 'comprarme', 'adquirir', 'gastar en', 'permitir', 'puedo', 'alcanza']

// ---------------------------------------------------------------------------
// USAGE COUNTER — persists in localStorage, keyed per user+month
// ---------------------------------------------------------------------------
const COUNTER_KEY = 'mi-economia-cfo-usage'

function getMonthKey(userId) {
  const now = new Date()
  return `${userId}-${now.getFullYear()}-${now.getMonth()}`
}

function getUsageCount(userId) {
  try {
    const data = JSON.parse(localStorage.getItem(COUNTER_KEY) || '{}')
    return data[getMonthKey(userId)] || 0
  } catch { return 0 }
}

function incrementUsage(userId) {
  try {
    const data = JSON.parse(localStorage.getItem(COUNTER_KEY) || '{}')
    const key = getMonthKey(userId)
    data[key] = (data[key] || 0) + 1
    // Clean old months (keep only current)
    const validKeys = Object.keys(data).filter((k) => k.startsWith(userId))
    const cleaned = {}
    validKeys.forEach((k) => { cleaned[k] = data[k] })
    localStorage.setItem(COUNTER_KEY, JSON.stringify(cleaned))
    return cleaned[key]
  } catch { return 0 }
}

function isPurchaseQuestion(text) {
  const lower = text.toLowerCase()
  return PURCHASE_KEYWORDS.some((kw) => lower.includes(kw))
}

function sanitizeInput(text) {
  return text.replace(/<[^>]*>/g, '').replace(/[<>]/g, '').slice(0, 300)
}

// BUG-019 FIX: reject negative amounts, return null if not positive
function extractAmount(text) {
  const match = text.match(/\$\s?([\d.,]+)/i) || text.match(/([\d.,]+)\s*(?:pesos|ars)/i) || text.match(/([\d.]+)\s*(?:mil|k)/i)
  if (!match) return null
  let num = match[1].replace(/\./g, '').replace(',', '.')
  if (/mil|k/i.test(text) && !match[1].includes('.')) num = parseFloat(num) * 1000
  const result = parseFloat(num)
  // Only return positive finite numbers
  if (!result || !isFinite(result) || result <= 0) return null
  return result
}

function generatePurchaseResponse(amount, context) {
  const { avgIncome, avgExpenses, currentBalance, savingsRate, categoryTotals } = context
  const monthlyFree = avgIncome - avgExpenses
  const afterPurchase = currentBalance - amount
  const pctOfIncome = avgIncome > 0 ? ((amount / avgIncome) * 100).toFixed(1) : '0.0'

  let verdict, verdictTitle, verdictSubtitle

  if (amount <= monthlyFree * 0.3 && afterPurchase > avgExpenses * 0.2) {
    verdict = 'yes'
    verdictTitle = '✅ SÍ PODÉS'
    verdictSubtitle = `Representa solo el ${pctOfIncome}% de tu ingreso mensual`
  } else if (amount <= monthlyFree * 0.7 && afterPurchase > 0) {
    verdict = 'warning'
    verdictTitle = '⚠️ PODÉS, PERO...'
    verdictSubtitle = `Es el ${pctOfIncome}% de tu ingreso. Ajustá otros gastos`
  } else {
    verdict = 'no'
    verdictTitle = '❌ NO ES RECOMENDABLE'
    verdictSubtitle = `Te deja sin margen: tu balance quedaría en $${afterPurchase.toLocaleString('es-AR')}`
  }

  // BUG-028 FIX: spread to avoid mutating the original array
  const topCategory = categoryTotals.length > 0 ? [...categoryTotals].sort((a, b) => b.value - a.value)[0] : null

  const message = verdict === 'yes'
    ? `Tu situación financiera aguanta esta compra sin problemas. Tenés un balance de $${currentBalance.toLocaleString('es-AR')} y el gasto representa solo el ${pctOfIncome}% de tu ingreso promedio.`
    : verdict === 'warning'
    ? `Podés hacerlo, pero vas a tener que controlar los gastos el resto del mes. Tu balance actual es $${currentBalance.toLocaleString('es-AR')} y esto se lleva el ${pctOfIncome}% de tu ingreso.`
    : `Con tu balance actual de $${currentBalance.toLocaleString('es-AR')} y gastos promedio de $${avgExpenses.toLocaleString('es-AR')}, esta compra te pone en zona roja. Te recomiendo esperar.`

  const analysis = `Tu ingreso promedio es $${avgIncome.toLocaleString('es-AR')}/mes y gastás en promedio $${avgExpenses.toLocaleString('es-AR')}/mes. Tu tasa de ahorro es del ${savingsRate.toFixed(0)}%.${topCategory ? ` Tu mayor gasto es ${topCategory.name} ($${topCategory.value.toLocaleString('es-AR')}/mes).` : ''}`

  const impact = afterPurchase >= 0
    ? `Después de la compra, tu balance del mes quedaría en $${afterPurchase.toLocaleString('es-AR')}. ${afterPurchase < avgExpenses * 0.1 ? 'Quedás muy justo para el resto del mes.' : 'Todavía te queda margen.'}`
    : `Tu balance quedaría en $${afterPurchase.toLocaleString('es-AR')} (negativo). Estarías gastando más de lo que ingresás este mes.`

  const recommendation = verdict === 'yes'
    ? 'Adelante con la compra. Seguí manteniendo tu ritmo de ahorro que vas bien.'
    : verdict === 'warning'
    ? `Podrías hacerlo si reducís gastos en ${topCategory ? topCategory.name : 'otras categorías'} este mes. Pensalo bien.`
    : `Esperá al menos un mes más para juntar margen. Si es urgente, buscá alternativas más económicas.`

  return {
    type: 'purchase',
    verdict,
    verdictTitle,
    verdictSubtitle,
    message,
    analysis,
    impact,
    recommendation,
    alternative: verdict !== 'yes' ? 'Considerá buscar opciones más económicas o esperar a una promo/cuotas sin interés.' : null,
  }
}

function generateGeneralResponse(text, context) {
  const { avgIncome, avgExpenses, currentBalance, savingsRate, categoryTotals } = context
  const lower = text.toLowerCase()

  let message, insight, recommendation

  if (lower.includes('cómo estoy') || lower.includes('como estoy') || lower.includes('situación') || lower.includes('financieramente')) {
    const health = savingsRate > 30 ? 'excelente' : savingsRate > 15 ? 'buena' : savingsRate > 0 ? 'regular' : 'crítica'
    message = `Tu situación financiera este mes es ${health}. Ingresás en promedio $${avgIncome.toLocaleString('es-AR')} y gastás $${avgExpenses.toLocaleString('es-AR')}. Tu balance actual es $${currentBalance.toLocaleString('es-AR')} con una tasa de ahorro del ${savingsRate.toFixed(0)}%.`
    insight = savingsRate > 20
      ? 'Estás ahorrando más del 20%, lo cual es muy sano. Pensá en invertir ese excedente.'
      : savingsRate > 0
      ? 'Estás en positivo pero con margen ajustado. Cualquier gasto imprevisto te puede complicar.'
      : 'Atención: estás gastando más de lo que ingresás. Necesitás ajustar urgente.'
    recommendation = savingsRate > 30
      ? 'Mantené este ritmo. Considerá destinar parte del ahorro a inversiones.'
      : savingsRate > 0
      ? 'Intentá reducir los gastos no esenciales para mejorar tu margen de ahorro.'
      : 'Revisá tus gastos y eliminá todo lo que no sea esencial este mes.'
  } else if (lower.includes('gasto más') || lower.includes('categoría') || lower.includes('donde gasto')) {
    // BUG-028 FIX: spread to avoid mutating original
    const sorted = [...categoryTotals].sort((a, b) => b.value - a.value)
    const top3 = sorted.slice(0, 3)
    message = top3.length > 0
      ? `Tus mayores gastos son: ${top3.map((c, i) => `${i + 1}. ${c.name}: $${c.value.toLocaleString('es-AR')}`).join(', ')}.`
      : 'No tenés gastos suficientes cargados este mes para hacer un análisis por categoría.'
    insight = top3.length > 0 && avgExpenses > 0 ? `${top3[0].name} se lleva el ${((top3[0].value / avgExpenses) * 100).toFixed(0)}% de tus gastos.` : null
    recommendation = 'Revisá si podés optimizar las categorías más grandes. Pequeños ajustes ahí generan gran impacto.'
  } else if (lower.includes('ahorrar') || lower.includes('ahorro')) {
    const freeMonthly = avgIncome - avgExpenses
    message = freeMonthly > 0
      ? `Según tus números, podés ahorrar hasta $${freeMonthly.toLocaleString('es-AR')} por mes si mantenés tus gastos actuales.`
      : `Actualmente estás en déficit de $${Math.abs(freeMonthly).toLocaleString('es-AR')}/mes. Necesitás ajustar gastos antes de pensar en ahorrar.`
    insight = `Tu tasa de ahorro actual es del ${savingsRate.toFixed(0)}%. ${savingsRate > 20 ? 'Muy bien.' : 'Podrías mejorar.'}`
    recommendation = freeMonthly > 0 ? 'Automatizá el ahorro: apenas cobrás, separalo. No lo dejes para fin de mes.' : 'Priorizá reducir gastos variables: delivery, entretenimiento, compras impulsivas.'
  } else {
    message = `Analizando tus finanzas: ingresás $${avgIncome.toLocaleString('es-AR')}/mes, gastás $${avgExpenses.toLocaleString('es-AR')}/mes. Tu balance este mes es $${currentBalance.toLocaleString('es-AR')}.`
    insight = savingsRate > 0 ? `Ahorrás el ${savingsRate.toFixed(0)}% de tus ingresos.` : 'Estás gastando más de lo que ingresás.'
    recommendation = 'Cargá más gastos para que mi análisis sea más preciso. Cuantos más datos tengo, mejores consejos te doy.'
  }

  return { type: 'general', message, insight, recommendation }
}

const useCfoStore = create((set, get) => ({
  messages: [],
  loading: false,
  conversationHistory: [], // localStorage backup

  sendMessage: async (content, expenseContext, userInitials, userId) => {
    const sanitized = sanitizeInput(content)
    if (!sanitized) return

    const userMessage = {
      role: 'user',
      content: sanitized,
      timestamp: new Date().toISOString(),
      initials: userInitials || '?',
    }

    set((state) => ({
      messages: [...state.messages, userMessage],
      loading: true,
    }))

    // TODO SUPABASE: replace with fetch to /api/cfo-analysis
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200))

    const isPurchase = isPurchaseQuestion(sanitized)
    let response

    if (isPurchase) {
      const amount = extractAmount(sanitized)
      // BUG-020 FIX: if no amount found, ask the user instead of guessing $50k
      if (!amount) {
        response = {
          type: 'general',
          message: 'No pude detectar un monto en tu mensaje. ¿Cuánto sale lo que querés comprar? Decime el precio y te doy mi análisis.',
          insight: null,
          recommendation: 'Escribí algo como "¿Puedo comprar algo de $25.000?" para que pueda evaluarlo.',
        }
      } else {
        response = generatePurchaseResponse(amount, expenseContext)
      }
    } else {
      response = generateGeneralResponse(sanitized, expenseContext)
    }

    const cfoMessage = {
      role: 'cfo',
      content: response,
      timestamp: new Date().toISOString(),
    }

    // BUG-031 FIX: increment persistent counter
    if (userId) incrementUsage(userId)

    set((state) => ({
      messages: [...state.messages, cfoMessage],
      loading: false,
    }))

    // Save to localStorage
    get().saveToLocalStorage()
  },

  clearChat: () => {
    set({ messages: [] })
  },

  // BUG-031 FIX: read from persistent storage, not memory
  getConsultationCount: (userId) => {
    if (!userId) return 0
    return getUsageCount(userId)
  },

  saveToLocalStorage: () => {
    const { messages } = get()
    if (messages.length === 0) return
    try {
      const stored = JSON.parse(localStorage.getItem('cfo_history') || '[]')
      const preview = messages[0]?.content?.slice?.(0, 60) || messages[0]?.content?.message?.slice?.(0, 60) || 'Consulta'
      const entry = {
        date: new Date().toISOString(),
        preview: typeof preview === 'string' ? preview : 'Consulta CFO',
        messageCount: messages.length,
      }
      stored.unshift(entry)
      localStorage.setItem('cfo_history', JSON.stringify(stored.slice(0, 5)))
    } catch (e) { /* ignore */ }
  },

  getHistory: () => {
    try {
      return JSON.parse(localStorage.getItem('cfo_history') || '[]')
    } catch { return [] }
  },
}))

export default useCfoStore
