// Ticket Scanner — OCR con Tesseract.js (client-side)
// TODO SUPABASE: en producción, reemplazar OCR client-side con Edge Function + Claude Vision
// para mayor precisión y seguridad (ver comentarios al final del archivo)
import Tesseract from 'tesseract.js'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3MB

// Base de datos de comercios conocidos → categoría
// TODO SUPABASE: mover a una tabla `known_businesses` en la base de datos
// para que se pueda actualizar sin deploy
const KNOWN_BUSINESSES = {
  // Supermercados
  'coto': { category: 'Alimentación', displayName: 'Supermercado Coto' },
  'jumbo': { category: 'Alimentación', displayName: 'Jumbo' },
  'disco': { category: 'Alimentación', displayName: 'Disco' },
  'carrefour': { category: 'Alimentación', displayName: 'Carrefour' },
  'dia': { category: 'Alimentación', displayName: 'Supermercado Día' },
  'changomas': { category: 'Alimentación', displayName: 'Changomas' },
  'vea': { category: 'Alimentación', displayName: 'Vea' },
  'la anonima': { category: 'Alimentación', displayName: 'La Anónima' },
  // Farmacias
  'farmacity': { category: 'Salud', displayName: 'Farmacity' },
  'farmacia del pueblo': { category: 'Salud', displayName: 'Farmacia del Pueblo' },
  // Combustible / Transporte
  'ypf': { category: 'Transporte', displayName: 'YPF' },
  'shell': { category: 'Transporte', displayName: 'Shell' },
  'axion': { category: 'Transporte', displayName: 'Axion Energy' },
  'puma': { category: 'Transporte', displayName: 'Puma Energy' },
  // Servicios
  'edenor': { category: 'Servicios', displayName: 'Edenor' },
  'edesur': { category: 'Servicios', displayName: 'Edesur' },
  'metrogas': { category: 'Servicios', displayName: 'Metrogas' },
  'aysa': { category: 'Servicios', displayName: 'AySA' },
  'telecom': { category: 'Servicios', displayName: 'Telecom' },
  'personal': { category: 'Servicios', displayName: 'Personal' },
  'movistar': { category: 'Servicios', displayName: 'Movistar' },
  'claro': { category: 'Servicios', displayName: 'Claro' },
  'fibertel': { category: 'Servicios', displayName: 'Fibertel' },
  // Entretenimiento / Comida afuera
  'mcdonalds': { category: 'Entretenimiento', displayName: 'McDonald\'s' },
  'burger king': { category: 'Entretenimiento', displayName: 'Burger King' },
  'starbucks': { category: 'Entretenimiento', displayName: 'Starbucks' },
  'rappi': { category: 'Entretenimiento', displayName: 'Rappi' },
  'pedidosya': { category: 'Entretenimiento', displayName: 'PedidosYa' },
  // Indumentaria
  'zara': { category: 'Ropa', displayName: 'Zara' },
  'nike': { category: 'Ropa', displayName: 'Nike' },
  'adidas': { category: 'Ropa', displayName: 'Adidas' },
  'falabella': { category: 'Ropa', displayName: 'Falabella' },
  // Educación
  'udemy': { category: 'Educación', displayName: 'Udemy' },
  'coursera': { category: 'Educación', displayName: 'Coursera' },
}

/**
 * Busca un comercio en la base de datos de conocidos.
 * Compara el nombre extraído contra las claves conocidas.
 * @param {string} razonSocial - Nombre/razón social leído del ticket
 * @returns {{ found: boolean, category: string|null, displayName: string|null }}
 */
export function lookupBusiness(razonSocial) {
  if (!razonSocial || typeof razonSocial !== 'string') {
    return { found: false, category: null, displayName: null }
  }

  const normalized = razonSocial.toLowerCase().trim()

  // Buscar coincidencia exacta o parcial en las claves conocidas
  for (const [key, data] of Object.entries(KNOWN_BUSINESSES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return { found: true, category: data.category, displayName: data.displayName }
    }
  }

  return { found: false, category: null, displayName: null }
}

// Palabras clave de productos/servicios → categoría
const PRODUCT_KEYWORDS = {
  Transporte: [
    'nafta', 'super', 'premium', 'diesel', 'gasoil', 'gnc', 'combustible',
    'fuel', 'litros', 'lts', 'surtidor', 'estacion de servicio', 'peaje',
    'subte', 'colectivo', 'tren', 'uber', 'cabify', 'estacionamiento',
  ],
  Alimentación: [
    'leche', 'pan', 'carne', 'pollo', 'arroz', 'fideos', 'aceite',
    'verdura', 'fruta', 'galletita', 'yogur', 'queso', 'harina',
    'azucar', 'cerveza', 'vino', 'gaseosa', 'agua', 'comestible',
    'almacen', 'supermercado', 'autoservicio', 'fiambre', 'lacteo',
  ],
  Salud: [
    'farmacia', 'medicamento', 'remedio', 'comprimido', 'jarabe',
    'ibuprofeno', 'paracetamol', 'vitamina', 'receta', 'drogueria',
  ],
  Entretenimiento: [
    'restaurant', 'restaurante', 'bar', 'cafe', 'pizza', 'hamburguesa',
    'delivery', 'cine', 'teatro', 'entrada', 'show', 'espectaculo',
  ],
  Ropa: [
    'remera', 'pantalon', 'camisa', 'zapatilla', 'calzado', 'jean',
    'campera', 'buzo', 'vestido', 'indumentaria', 'textil',
  ],
  Servicios: [
    'luz', 'gas', 'agua', 'internet', 'telefono', 'celular', 'cable',
    'electricidad', 'factura de servicio',
  ],
  Educación: [
    'libro', 'cuaderno', 'lapiz', 'carpeta', 'libreria', 'curso',
    'matricula', 'inscripcion', 'colegio', 'universidad',
  ],
}

/**
 * Detecta la categoría según las palabras clave encontradas en el texto del ticket.
 * Analiza los productos/detalles del ticket, no solo la razón social.
 */
function detectCategoryFromText(text) {
  const normalized = text.toLowerCase()
  const scores = {}

  for (const [category, keywords] of Object.entries(PRODUCT_KEYWORDS)) {
    let count = 0
    for (const kw of keywords) {
      if (normalized.includes(kw)) count++
    }
    if (count > 0) scores[category] = count
  }

  if (Object.keys(scores).length === 0) return null

  // Devolver la categoría con más coincidencias
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
}

/**
 * Extrae el monto TOTAL del texto del ticket.
 * Busca la línea que diga "TOTAL" y extrae el número asociado.
 * Ignora subtotales, IVA, descuentos, etc.
 */
function extractTotal(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  // Buscar la línea con TOTAL (no subtotal, no total iva, etc.)
  for (const line of lines) {
    const upper = line.toUpperCase()
    // Buscar líneas que contengan "TOTAL" pero NO "SUBTOTAL", "TOTAL IVA", "TOTAL NETO"
    if (
      upper.includes('TOTAL') &&
      !upper.includes('SUBTOTAL') &&
      !upper.includes('SUB TOTAL') &&
      !upper.includes('SUB-TOTAL') &&
      !upper.includes('TOTAL IVA') &&
      !upper.includes('TOTAL NETO') &&
      !upper.includes('TOTAL TRIBUTO')
    ) {
      // Extraer números de esta línea (formato argentino: 94.509,72 o 94509.72 o 94509,72)
      const amount = parseArgentineAmount(line)
      if (amount && amount > 0) return amount
    }
  }

  // Fallback: buscar el número más grande del ticket (probablemente sea el total)
  let maxAmount = 0
  for (const line of lines) {
    const amount = parseArgentineAmount(line)
    if (amount && amount > maxAmount) maxAmount = amount
  }

  return maxAmount || null
}

/**
 * Parsea un monto en formato argentino.
 * Formatos posibles: $94.509,72 | 94.509,72 | 94509.72 | $94,509.72
 */
function parseArgentineAmount(text) {
  // Limpiar signos de moneda y espacios
  const cleaned = text.replace(/[^\d.,]/g, ' ').trim()

  // Buscar patrones de números con formato
  const patterns = [
    // Formato argentino: 94.509,72 (puntos como miles, coma como decimal)
    /(\d{1,3}(?:\.\d{3})*,\d{2})/,
    // Formato: 94509,72
    /(\d+,\d{2})/,
    // Formato internacional: 94,509.72 o 94509.72
    /(\d{1,3}(?:,\d{3})*\.\d{2})/,
    /(\d+\.\d{2})/,
    // Solo número entero grande
    /(\d{3,})/,
  ]

  for (const pattern of patterns) {
    const match = cleaned.match(pattern)
    if (match) {
      let numStr = match[1]
      // Si tiene formato argentino (puntos como miles, coma decimal)
      if (numStr.includes(',') && numStr.includes('.') && numStr.lastIndexOf(',') > numStr.lastIndexOf('.')) {
        numStr = numStr.replace(/\./g, '').replace(',', '.')
      } else if (numStr.includes(',') && !numStr.includes('.')) {
        // Solo coma → es decimal
        numStr = numStr.replace(',', '.')
      } else if (numStr.includes(',') && numStr.includes('.') && numStr.lastIndexOf('.') > numStr.lastIndexOf(',')) {
        // Formato internacional
        numStr = numStr.replace(/,/g, '')
      }
      const num = parseFloat(numStr)
      if (!isNaN(num) && num > 0) return num
    }
  }

  return null
}

/**
 * Extrae la razón social / nombre del comercio del texto del ticket.
 * Generalmente está en las primeras líneas.
 */
function extractBusinessName(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2)

  // Las primeras líneas suelen tener el nombre del comercio
  // Filtrar líneas que son solo números, fechas, o datos técnicos
  for (const line of lines.slice(0, 8)) {
    const upper = line.toUpperCase()
    // Ignorar líneas que son solo números, CUIT, fechas, direcciones cortas
    if (/^\d+$/.test(line)) continue
    if (/^CUIT/i.test(line)) continue
    if (/^\d{2}[\/-]\d{2}[\/-]\d{2,4}/.test(line)) continue
    if (/^(IVA|RESP|CONS|FINAL|TICKET|FACTURA|COMPROBANTE)/i.test(upper)) continue
    if (line.length < 3) continue

    // Esta línea parece ser el nombre del comercio
    return line.slice(0, 100)
  }

  return null
}

/**
 * Extrae la fecha del texto del ticket.
 * Busca patrones de fecha comunes en tickets argentinos.
 */
function extractDate(text) {
  // Patrones de fecha comunes en tickets argentinos
  const patterns = [
    // DD/MM/YYYY o DD-MM-YYYY
    /(\d{2})[\/\-](\d{2})[\/\-](\d{4})/,
    // DD/MM/YY
    /(\d{2})[\/\-](\d{2})[\/\-](\d{2})/,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      let [, day, month, year] = match
      if (year.length === 2) year = '20' + year
      const d = parseInt(day), m = parseInt(month), y = parseInt(year)
      if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 2020 && y <= 2030) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }
    }
  }

  return new Date().toISOString().split('T')[0]
}

/**
 * Escanea un ticket/factura usando OCR (Tesseract.js) y extrae datos reales.
 * Lee la imagen, extrae texto, y parsea: razón social, total, fecha, categoría.
 *
 * TODO SUPABASE: en producción, reemplazar con Edge Function + Claude Vision
 * para mayor precisión en tickets difíciles de leer.
 *
 * @param {File} imageFile - Archivo de imagen del ticket
 * @returns {Promise<{ razonSocial: string, store: string, total: number, date: string, category: string, confidence: number, businessFound: boolean, ocrText: string }>}
 */
export async function scanTicket(imageFile) {
  // Validar que sea un archivo
  if (!imageFile || !(imageFile instanceof File || imageFile instanceof Blob)) {
    throw new Error('No se proporcionó un archivo válido')
  }

  // Validar tipo de archivo
  if (!ALLOWED_TYPES.includes(imageFile.type)) {
    throw new Error(
      `Formato de archivo no válido. Aceptamos: JPG, PNG, WebP. Recibido: ${imageFile.type || 'desconocido'}`
    )
  }

  // Validar tamaño de archivo
  if (imageFile.size > MAX_FILE_SIZE) {
    const sizeMB = (imageFile.size / (1024 * 1024)).toFixed(1)
    throw new Error(
      `El archivo es muy grande (${sizeMB}MB). El máximo es 3MB.`
    )
  }

  // OCR con Tesseract.js — leer el texto real de la imagen
  let ocrText = ''
  try {
    const result = await Tesseract.recognize(imageFile, 'spa', {
      logger: () => {}, // silenciar logs
    })
    ocrText = result.data.text || ''
  } catch (err) {
    throw new Error('No se pudo leer la imagen. Intentá con una foto más clara o con mejor iluminación.')
  }

  if (!ocrText || ocrText.trim().length < 10) {
    throw new Error('No se pudo extraer texto del ticket. Asegurate de que la imagen sea legible y esté bien iluminada.')
  }

  // Extraer datos del texto OCR
  const razonSocial = extractBusinessName(ocrText)
  const total = extractTotal(ocrText)
  const date = extractDate(ocrText)

  if (!total) {
    throw new Error('No se pudo leer el monto total del ticket. Intentá con una foto más clara.')
  }

  // Buscar en base de comercios conocidos
  const lookup = lookupBusiness(razonSocial)

  // Si no se encontró por razón social, intentar categorizar por productos/detalles
  const categoryFromProducts = detectCategoryFromText(ocrText)

  // Determinar categoría: primero por comercio conocido, luego por productos, luego Otros
  const category = lookup.found ? lookup.category : (categoryFromProducts || 'Otros')

  // Calcular confianza basada en cuántos datos pudimos extraer
  let confidence = 0.5
  if (total) confidence += 0.2
  if (razonSocial) confidence += 0.1
  if (lookup.found || categoryFromProducts) confidence += 0.1
  if (date !== new Date().toISOString().split('T')[0]) confidence += 0.1 // fecha real leída

  return {
    razonSocial: razonSocial || 'No identificado',
    store: lookup.found ? lookup.displayName : (razonSocial || 'No identificado'),
    total,
    date,
    category,
    confidence: Math.min(confidence, 1),
    businessFound: lookup.found,
    ocrText, // para debug/verificación
  }
}

// TODO SUPABASE: en producción, reemplazar OCR client-side con Edge Function:
// - Mejor precisión con Claude Vision API
// - Sin dependencia de Tesseract.js en el bundle del cliente
// - Rate limiting server-side
// - Validación de magic bytes del archivo
// - Limpieza de EXIF metadata
// - Política de no-almacenamiento de imágenes
