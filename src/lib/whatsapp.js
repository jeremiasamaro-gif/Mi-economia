// WhatsApp Bot — mock message parsing and response generation
// TODO SUPABASE: implementar como Edge Function real
//
// ============================================================
// EDGE FUNCTION: supabase/functions/whatsapp-webhook/index.ts
// ============================================================
//
// SEGURIDAD DEL WEBHOOK:
// 1. Verificar firma HMAC-SHA256 del header X-Hub-Signature-256
// 2. Verificación GET para suscripción al webhook
// 3. Rate limiting por número de teléfono (20 msg/hora)
// 4. Sanitización de input (500 chars max, strip HTML, normalize unicode)
// 5. Respuesta vía WhatsApp Business API

/**
 * Parsea un mensaje de WhatsApp y determina el comando.
 * @param {string} message
 * @returns {{ command: string, args: string[] } | null}
 */
export function parseMessage(message) {
  if (!message || typeof message !== 'string') return null
  const text = message.trim().toLowerCase().slice(0, 500)

  if (text === 'resumen' || text === 'resume') return { command: 'resumen', args: [] }
  if (text.startsWith('cuanto gaste') || text.startsWith('cuánto gasté')) return { command: 'cuanto_gaste', args: [] }
  if (text.startsWith('ultimo gasto') || text.startsWith('último gasto')) return { command: 'ultimo_gasto', args: [] }
  if (text === 'ayuda' || text === 'help' || text === '?') return { command: 'ayuda', args: [] }

  return null
}

/**
 * Genera una respuesta mock para un comando.
 * @param {{ command: string, args: string[] }} parsed
 * @param {{ income: number, expense: number, balance: number, lastExpense: object | null }} userData
 * @returns {string}
 */
export function generateResponse(parsed, userData = {}) {
  const { income = 850000, expense = 423500, balance = 426500, lastExpense = null } = userData

  const formatARS = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

  switch (parsed.command) {
    case 'resumen':
      return `📊 Resumen del mes:\n\nIngresos: ${formatARS(income)}\nGastos: ${formatARS(expense)}\nBalance: ${formatARS(balance)}`
    case 'cuanto_gaste':
      return `💸 Gastaste ${formatARS(expense)} este mes.`
    case 'ultimo_gasto':
      if (lastExpense) {
        return `📝 Último gasto:\n\n${lastExpense.description}\n${formatARS(lastExpense.amount)} - ${lastExpense.category}\n${lastExpense.date}`
      }
      return '📝 No tenés gastos registrados este mes.'
    case 'ayuda':
      return '🤖 Comandos disponibles:\n\n• resumen - Resumen del mes\n• cuanto gaste - Total gastado\n• ultimo gasto - Último gasto\n• ayuda - Esta lista'
    default:
      return '❓ No entendí tu mensaje. Escribí "ayuda" para ver los comandos disponibles.'
  }
}
