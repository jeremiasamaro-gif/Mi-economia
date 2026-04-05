/**
 * Ticket Data Validation — Sanitize OCR/AI output before it touches the store
 *
 * PURPOSE: AI and OCR output is UNTRUSTED data. This layer validates
 * and sanitizes everything before the user even sees it in the preview modal.
 *
 * SECURITY PRINCIPLES:
 * 1. Strip all HTML/script tags from text fields
 * 2. Enforce max lengths on all strings
 * 3. Validate amounts are positive numbers within range
 * 4. Validate dates are real dates in a sane range
 * 5. Only allow known categories (whitelist, not blacklist)
 * 6. Flag low-confidence results for user review
 * 7. Never trust AI output for financial data without user confirmation
 *
 * TODO SUPABASE: When using Claude Vision via Edge Function,
 * this validation runs BOTH server-side (in the Edge Function)
 * AND client-side (before showing preview). Defense in depth.
 */

import { CATEGORIES } from '../../store/mockData'

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------

const MAX_STORE_LENGTH = 100
const MAX_DESCRIPTION_LENGTH = 200
const MAX_AMOUNT = 99_999_999 // $99M ARS max
const MIN_AMOUNT = 0.01
const MIN_VALID_YEAR = 2020
const MAX_VALID_YEAR = 2030
const LOW_CONFIDENCE_THRESHOLD = 0.5

// ---------------------------------------------------------------------------
// VALIDATION
// ---------------------------------------------------------------------------

/**
 * Validates and sanitizes raw ticket data from OCR/AI.
 *
 * @param {object} raw - Raw data from scanTicket()
 * @param {string} [raw.store] - Business name
 * @param {number} [raw.total] - Total amount
 * @param {string} [raw.date] - Date string (YYYY-MM-DD)
 * @param {string} [raw.category] - Category name
 * @param {number} [raw.confidence] - OCR confidence (0-1)
 * @param {string} [raw.razonSocial] - Original business name from OCR
 * @returns {{ valid: boolean, data?: object, errors: string[], warnings: string[] }}
 */
export function validateTicketData(raw) {
  const errors = []
  const warnings = []

  if (!raw || typeof raw !== 'object') {
    return { valid: false, data: null, errors: ['Datos inválidos'], warnings: [] }
  }

  // --- Store name ---
  const rawStore = typeof raw.store === 'string' ? raw.store : (typeof raw.razonSocial === 'string' ? raw.razonSocial : '')
  const safeStore = sanitizeText(rawStore, MAX_STORE_LENGTH)
  if (!safeStore) {
    warnings.push('No se pudo leer el nombre del comercio')
  }

  // --- Amount ---
  const rawTotal = Number(raw.total)
  if (isNaN(rawTotal) || rawTotal <= 0) {
    errors.push('Monto inválido — no se pudo leer el total del ticket')
  } else if (rawTotal < MIN_AMOUNT) {
    errors.push(`El monto debe ser mayor a $${MIN_AMOUNT}`)
  } else if (rawTotal > MAX_AMOUNT) {
    errors.push(`Monto fuera de rango (máximo $${MAX_AMOUNT.toLocaleString('es-AR')})`)
  }

  const safeTotal = isNaN(rawTotal) ? 0 : Math.round(Math.max(0, Math.min(rawTotal, MAX_AMOUNT)) * 100) / 100

  // --- Category ---
  const rawCategory = typeof raw.category === 'string' ? raw.category : 'Otros'
  // Whitelist: only allow known categories
  const safeCategory = CATEGORIES.includes(rawCategory) ? rawCategory : 'Otros'
  if (!CATEGORIES.includes(rawCategory) && rawCategory !== 'Otros') {
    warnings.push(`Categoría "${rawCategory}" no reconocida — asignada como "Otros"`)
  }

  // --- Date ---
  const rawDate = typeof raw.date === 'string' ? raw.date : ''
  const safeDate = validateDate(rawDate)
  if (safeDate.fallback) {
    warnings.push('No se pudo leer la fecha — se usó la fecha de hoy')
  }

  // --- Confidence ---
  const rawConfidence = Number(raw.confidence)
  const safeConfidence = isNaN(rawConfidence) ? 0 : Math.min(Math.max(rawConfidence, 0), 1)

  if (safeConfidence < LOW_CONFIDENCE_THRESHOLD) {
    warnings.push('La lectura del ticket tiene baja confianza. Revisá los datos antes de guardar.')
  }

  // --- Total not found ---
  if (raw.totalNotFound) {
    warnings.push('No se encontró la línea de TOTAL. El monto podría ser incorrecto.')
  }

  // If critical errors exist (no amount at all), mark as invalid
  const hasCriticalError = errors.length > 0 && safeTotal <= 0

  return {
    valid: !hasCriticalError,
    errors,
    warnings,
    data: {
      store: safeStore || 'No identificado',
      total: safeTotal,
      date: safeDate.value,
      category: safeCategory,
      confidence: safeConfidence,
      // Preserve original fields for display
      razonSocial: sanitizeText(raw.razonSocial || '', MAX_STORE_LENGTH),
      businessFound: Boolean(raw.businessFound),
    },
  }
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

/**
 * Sanitize text: strip HTML/script tags, trim, enforce max length.
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
function sanitizeText(text, maxLength) {
  if (typeof text !== 'string') return ''
  return text
    .replace(/<[^>]*>/g, '')       // Strip HTML tags
    .replace(/javascript:/gi, '')   // Remove javascript: URIs
    .replace(/on\w+\s*=/gi, '')     // Remove event handlers
    .trim()
    .slice(0, maxLength)
}

/**
 * Validate a date string (YYYY-MM-DD format).
 * Returns the validated date or today as fallback.
 * @param {string} dateStr
 * @returns {{ value: string, fallback: boolean }}
 */
function validateDate(dateStr) {
  const today = new Date().toISOString().split('T')[0]

  if (!dateStr) return { value: today, fallback: true }

  const parsed = new Date(dateStr)
  if (isNaN(parsed.getTime())) return { value: today, fallback: true }

  const year = parsed.getFullYear()
  if (year < MIN_VALID_YEAR || year > MAX_VALID_YEAR) {
    return { value: today, fallback: true }
  }

  // Don't allow future dates
  if (parsed > new Date()) {
    return { value: today, fallback: true }
  }

  return { value: dateStr, fallback: false }
}

// ---------------------------------------------------------------------------
// EXPORT for testing
// ---------------------------------------------------------------------------
export { sanitizeText, validateDate }
