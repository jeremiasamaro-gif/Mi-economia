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
  'cuba': { category: 'Transporte', displayName: 'Estación Cuba' },
  'oil': { category: 'Transporte', displayName: 'Oil Combustibles' },
  'petrobras': { category: 'Transporte', displayName: 'Petrobras' },
  'refinor': { category: 'Transporte', displayName: 'Refinor' },
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
 * Busca en la razón social Y en todo el texto OCR del ticket.
 */
export function lookupBusiness(razonSocial, fullText) {
  const sources = [razonSocial, fullText].filter(Boolean)

  for (const source of sources) {
    const normalized = source.toLowerCase().trim()
    for (const [key, data] of Object.entries(KNOWN_BUSINESSES)) {
      if (normalized.includes(key)) {
        return { found: true, category: data.category, displayName: data.displayName }
      }
    }
  }

  return { found: false, category: null, displayName: null }
}

// Palabras clave de productos/servicios → categoría + sugerencia de descripción
const PRODUCT_KEYWORDS = {
  Transporte: {
    keywords: [
      'nafta', 'super', 'premium', 'diesel', 'gasoil', 'gnc', 'combustible',
      'fuel', 'litros', 'lts', 'surtidor', 'estacion de servicio', 'peaje',
      'subte', 'colectivo', 'tren', 'uber', 'cabify', 'estacionamiento',
      'infinia', 'v-power', 'euro', 'despacho',
    ],
    suggestStore: 'Estación de servicio',
    descriptionHints: {
      'nafta': 'Nafta', 'super': 'Nafta Súper', 'premium': 'Nafta Premium',
      'infinia': 'Nafta Infinia', 'v-power': 'Nafta V-Power',
      'diesel': 'Diesel', 'gasoil': 'Gasoil', 'gnc': 'GNC',
      'peaje': 'Peaje', 'estacionamiento': 'Estacionamiento',
    },
  },
  Alimentación: {
    keywords: [
      'leche', 'pan', 'carne', 'pollo', 'arroz', 'fideos', 'aceite',
      'verdura', 'fruta', 'galletita', 'yogur', 'queso', 'harina',
      'azucar', 'cerveza', 'vino', 'gaseosa', 'comestible',
      'almacen', 'supermercado', 'autoservicio', 'fiambre', 'lacteo',
    ],
    suggestStore: 'Supermercado / Almacén',
    descriptionHints: {},
  },
  Salud: {
    keywords: [
      'farmacia', 'medicamento', 'remedio', 'comprimido', 'jarabe',
      'ibuprofeno', 'paracetamol', 'vitamina', 'receta', 'drogueria',
    ],
    suggestStore: 'Farmacia',
    descriptionHints: {},
  },
  Entretenimiento: {
    keywords: [
      'restaurant', 'restaurante', 'bar', 'cafe', 'pizza', 'hamburguesa',
      'delivery', 'cine', 'teatro', 'entrada', 'show', 'espectaculo',
    ],
    suggestStore: 'Restaurant / Bar',
    descriptionHints: {},
  },
  Ropa: {
    keywords: [
      'remera', 'pantalon', 'camisa', 'zapatilla', 'calzado', 'jean',
      'campera', 'buzo', 'vestido', 'indumentaria', 'textil',
    ],
    suggestStore: 'Tienda de ropa',
    descriptionHints: {},
  },
  Servicios: {
    keywords: [
      'luz', 'internet', 'telefono', 'celular', 'cable',
      'electricidad', 'factura de servicio',
    ],
    suggestStore: 'Servicio',
    descriptionHints: {},
  },
  Educación: {
    keywords: [
      'libro', 'cuaderno', 'lapiz', 'carpeta', 'libreria', 'curso',
      'matricula', 'inscripcion', 'colegio', 'universidad',
    ],
    suggestStore: 'Educación',
    descriptionHints: {},
  },
}

/**
 * Detecta categoría y genera una descripción sugerida según los productos del ticket.
 * Retorna { category, suggestedStore, detectedProducts }
 */
function detectFromProducts(text) {
  const normalized = text.toLowerCase()
  let bestCategory = null
  let bestScore = 0
  let suggestedStore = null
  const detectedProducts = []

  for (const [category, config] of Object.entries(PRODUCT_KEYWORDS)) {
    let count = 0
    for (const kw of config.keywords) {
      if (normalized.includes(kw)) {
        count++
        // Detectar productos específicos para la descripción
        if (config.descriptionHints[kw]) {
          detectedProducts.push(config.descriptionHints[kw])
        }
      }
    }
    if (count > bestScore) {
      bestScore = count
      bestCategory = category
      suggestedStore = config.suggestStore
    }
  }

  return {
    category: bestCategory,
    suggestedStore: bestScore > 0 ? suggestedStore : null,
    detectedProducts: [...new Set(detectedProducts)], // eliminar duplicados
  }
}

/**
 * Preprocesa la imagen para mejorar el OCR: aumenta contraste y convierte a escala de grises.
 */
function preprocessImage(imageFile) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(imageFile)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')

      // Dibujar imagen original
      ctx.drawImage(img, 0, 0)

      // Obtener datos de píxeles
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Convertir a escala de grises y aumentar contraste
      for (let i = 0; i < data.length; i += 4) {
        // Escala de grises
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        // Aumentar contraste (factor 1.5)
        const contrasted = Math.min(255, Math.max(0, ((gray - 128) * 1.5) + 128))
        // Binarizar (blanco o negro) para tickets térmicos
        const bin = contrasted > 128 ? 255 : 0
        data[i] = bin
        data[i + 1] = bin
        data[i + 2] = bin
      }

      ctx.putImageData(imageData, 0, 0)
      URL.revokeObjectURL(url)

      canvas.toBlob((blob) => {
        resolve(blob || imageFile)
      }, 'image/png')
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(imageFile) // fallback: usar imagen original
    }

    img.src = url
  })
}

/**
 * Limpia artefactos de OCR de un texto numérico.
 * El OCR suele meter espacios, letras sueltas, o caracteres raros entre dígitos.
 * Ej: "94. 509, 72" → "94.509,72", "$ 94 509,72" → "94509,72"
 */
function cleanOCRNumber(text) {
  // Paso 1: Sacar todo lo que no sea dígito, punto, coma o espacio
  let cleaned = text.replace(/[^\d.,\s]/g, '').trim()
  // Paso 2: Sacar espacios alrededor de puntos y comas (OCR artifact)
  cleaned = cleaned.replace(/\s*([.,])\s*/g, '$1')
  // Paso 3: Si quedan espacios entre dígitos, puede ser separador de miles
  // "94 509" → "94509"
  cleaned = cleaned.replace(/(\d)\s+(\d)/g, '$1$2')
  return cleaned
}

/**
 * Parsea un monto en formato argentino.
 * Primero limpia artefactos de OCR, luego intenta parsear.
 * Formatos: $94.509,72 | 94.509,72 | 94509,72 | 94509.72
 */
function parseArgentineAmount(text) {
  const cleaned = cleanOCRNumber(text)
  if (!cleaned) return null

  const patterns = [
    // Formato argentino: 94.509,72 (puntos miles, coma decimal)
    /(\d{1,3}(?:\.\d{3})+,\d{1,2})/,
    // Formato: 94509,72 (sin separador de miles, coma decimal)
    /(\d+,\d{1,2})/,
    // Formato internacional: 94,509.72 o 94509.72
    /(\d{1,3}(?:,\d{3})+\.\d{1,2})/,
    /(\d+\.\d{1,2})/,
    // Número entero grande (puede ser un total sin decimales)
    /(\d{4,})/,
  ]

  for (const pattern of patterns) {
    const match = cleaned.match(pattern)
    if (match) {
      let numStr = match[1]
      if (numStr.includes(',') && numStr.includes('.') && numStr.lastIndexOf(',') > numStr.lastIndexOf('.')) {
        numStr = numStr.replace(/\./g, '').replace(',', '.')
      } else if (numStr.includes(',') && !numStr.includes('.')) {
        numStr = numStr.replace(',', '.')
      } else if (numStr.includes(',') && numStr.includes('.') && numStr.lastIndexOf('.') > numStr.lastIndexOf(',')) {
        numStr = numStr.replace(/,/g, '')
      }
      const num = parseFloat(numStr)
      if (!isNaN(num) && num > 0) return num
    }
  }

  return null
}

/**
 * Verifica si una línea contiene la palabra TOTAL (no subtotal, no total iva, etc.)
 */
function isTotalLine(line) {
  const upper = line.toUpperCase()
  if (!upper.includes('TOTAL') &&
      !upper.match(/T.?[O0]T.?[AIL]{1,2}/i) &&
      !upper.includes('IMPORTE') &&
      !upper.includes('A PAGAR')) {
    return false
  }
  // Excluir subtotales y similares
  if (upper.includes('SUBTOTAL') || upper.includes('SUB TOTAL') ||
      upper.includes('SUB-TOTAL') || upper.includes('TOTAL IVA') ||
      upper.includes('TOTAL NETO') || upper.includes('TOTAL TRIBUTO') ||
      upper.includes('TOTAL DESCUENTO') || upper.includes('TOTAL GRAVADO')) {
    return false
  }
  return true
}

/**
 * Extrae el monto TOTAL del texto del ticket.
 * Busca la línea que dice TOTAL y lee el importe al lado.
 * Múltiples estrategias para tolerar errores de OCR.
 */
function extractTotal(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  // Estrategia 1: Buscar línea con TOTAL y extraer el monto de esa línea
  for (const line of lines) {
    if (isTotalLine(line)) {
      const amount = parseArgentineAmount(line)
      if (amount && amount > 0) return amount
    }
  }

  // Estrategia 2: TOTAL puede estar en una línea y el monto en la siguiente
  for (let i = 0; i < lines.length; i++) {
    if (isTotalLine(lines[i])) {
      // Si no hay monto en esta línea, buscar en la siguiente
      const amountThis = parseArgentineAmount(lines[i])
      if (amountThis && amountThis > 0) return amountThis
      if (i + 1 < lines.length) {
        const amountNext = parseArgentineAmount(lines[i + 1])
        if (amountNext && amountNext > 0) return amountNext
      }
      // Buscar 2 líneas más abajo también
      if (i + 2 < lines.length) {
        const amount2 = parseArgentineAmount(lines[i + 2])
        if (amount2 && amount2 > 0) return amount2
      }
    }
  }

  // Estrategia 3: Juntar líneas que el OCR separó mal
  // A veces "TOTAL         $94.509,72" se lee como 2 líneas
  const fullText = lines.join(' ')
  const totalMatch = fullText.match(/TOTAL[\s:$]*([0-9\s.,]+)/i)
  if (totalMatch) {
    const amount = parseArgentineAmount(totalMatch[1])
    if (amount && amount > 0) return amount
  }

  // Estrategia 4: Buscar el monto más grande del ticket (fallback)
  let maxAmount = 0
  for (const line of lines) {
    const amount = parseArgentineAmount(line)
    if (amount && amount > maxAmount) maxAmount = amount
  }

  return maxAmount || null
}

/**
 * Extrae la razón social / nombre del comercio del texto del ticket.
 */
function extractBusinessName(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2)

  for (const line of lines.slice(0, 10)) {
    const upper = line.toUpperCase()
    if (/^\d+$/.test(line)) continue
    if (/^CUIT/i.test(line)) continue
    if (/^\d{2}[\/-]\d{2}[\/-]\d{2,4}/.test(line)) continue
    if (/^(IVA|RESP|CONS|FINAL|TICKET|FACTURA|COMPROBANTE|ORIGINAL|DUPLICADO)/i.test(upper)) continue
    if (/^(PUNTO DE VENTA|PTO|NRO|NUMERO)/i.test(upper)) continue
    if (line.length < 3) continue

    return line.slice(0, 100)
  }

  return null
}

/**
 * Extrae la fecha del texto del ticket.
 */
function extractDate(text) {
  const patterns = [
    /(\d{2})[\/\-](\d{2})[\/\-](\d{4})/,
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
 * Preprocesa la imagen, lee con OCR, y parsea datos inteligentemente.
 * Si detecta productos (ej: nafta), sugiere la descripción del gasto.
 *
 * @param {File} imageFile - Archivo de imagen del ticket
 */
export async function scanTicket(imageFile) {
  if (!imageFile || !(imageFile instanceof File || imageFile instanceof Blob)) {
    throw new Error('No se proporcionó un archivo válido')
  }

  if (!ALLOWED_TYPES.includes(imageFile.type)) {
    throw new Error(
      `Formato de archivo no válido. Aceptamos: JPG, PNG, WebP. Recibido: ${imageFile.type || 'desconocido'}`
    )
  }

  if (imageFile.size > MAX_FILE_SIZE) {
    const sizeMB = (imageFile.size / (1024 * 1024)).toFixed(1)
    throw new Error(`El archivo es muy grande (${sizeMB}MB). El máximo es 3MB.`)
  }

  // Preprocesar imagen para mejor OCR (contraste + binarización)
  const processedImage = await preprocessImage(imageFile)

  // OCR con Tesseract.js — leer con imagen procesada Y original, quedarse con mejor resultado
  let ocrText = ''
  try {
    // Intentar primero con imagen preprocesada
    const result1 = await Tesseract.recognize(processedImage, 'spa', {
      logger: () => {},
    })
    const text1 = result1.data.text || ''

    // También intentar con imagen original
    const result2 = await Tesseract.recognize(imageFile, 'spa', {
      logger: () => {},
    })
    const text2 = result2.data.text || ''

    // Usar el resultado que tenga más texto legible (más caracteres alfanuméricos)
    const score1 = (text1.match(/[a-záéíóúñ0-9]/gi) || []).length
    const score2 = (text2.match(/[a-záéíóúñ0-9]/gi) || []).length
    ocrText = score1 >= score2 ? text1 : text2
  } catch {
    throw new Error('No se pudo leer la imagen. Intentá con una foto más clara o con mejor iluminación.')
  }

  if (!ocrText || ocrText.trim().length < 5) {
    throw new Error('No se pudo extraer texto del ticket. Asegurate de que la imagen sea legible y esté bien iluminada.')
  }

  // Extraer datos del texto OCR
  const razonSocial = extractBusinessName(ocrText)
  const total = extractTotal(ocrText)
  const date = extractDate(ocrText)

  // Buscar comercio conocido en razón social Y en texto completo
  const lookup = lookupBusiness(razonSocial, ocrText)

  // Detectar categoría y productos por palabras clave del texto
  const productDetection = detectFromProducts(ocrText)

  // Determinar categoría: comercio conocido > productos detectados > Otros
  const category = lookup.found ? lookup.category : (productDetection.category || 'Otros')

  // Construir descripción sugerida inteligente
  let suggestedStore
  if (lookup.found) {
    // Comercio conocido + productos detectados
    suggestedStore = lookup.displayName
    if (productDetection.detectedProducts.length > 0) {
      suggestedStore += ' - ' + productDetection.detectedProducts.slice(0, 2).join(', ')
    }
  } else if (productDetection.suggestedStore) {
    // Comercio no conocido pero detectamos qué tipo de gasto es
    suggestedStore = productDetection.suggestedStore
    if (razonSocial) suggestedStore = razonSocial
    if (productDetection.detectedProducts.length > 0) {
      suggestedStore += ' - ' + productDetection.detectedProducts.slice(0, 2).join(', ')
    }
  } else {
    suggestedStore = razonSocial || 'No identificado'
  }

  // Calcular confianza
  let confidence = 0.3
  if (total) confidence += 0.3
  if (razonSocial) confidence += 0.1
  if (lookup.found) confidence += 0.15
  if (productDetection.category) confidence += 0.1
  if (date !== new Date().toISOString().split('T')[0]) confidence += 0.05

  return {
    razonSocial: razonSocial || 'No identificado',
    store: suggestedStore,
    total: total || 0,
    date,
    category,
    confidence: Math.min(confidence, 1),
    businessFound: lookup.found,
    ocrText,
    totalNotFound: !total,
  }
}

// TODO SUPABASE: en producción, reemplazar OCR client-side con Edge Function:
// - Mejor precisión con Claude Vision API
// - Sin dependencia de Tesseract.js en el bundle del cliente
// - Rate limiting server-side
// - Validación de magic bytes del archivo
// - Limpieza de EXIF metadata
// - Política de no-almacenamiento de imágenes
