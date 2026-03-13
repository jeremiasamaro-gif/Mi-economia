// Ticket Scanner — mock endpoint para desarrollo
// TODO SUPABASE: reemplazar con llamada a Edge Function real
//
// ============================================================
// EDGE FUNCTION: supabase/functions/scan-ticket/index.ts
// ============================================================
//
// import { serve } from 'https://deno.land/std/http/server.ts'
// import { createClient } from '@supabase/supabase-js'
// import Anthropic from '@anthropic-ai/sdk'
//
// const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })
// const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
//
// serve(async (req) => {
//   // 1. AUTENTICACIÓN Y PLAN
//   //    - Extraer JWT del header Authorization: Bearer <token>
//   //    - Verificar con supabase.auth.getUser(token)
//   //    - Consultar plan del usuario — solo Pro puede escanear
//   //    - Si no es Pro, devolver 403 { error: 'Función disponible solo en plan Pro' }
//
//   // 2. RATE LIMITING
//   //    - Consultar tabla scan_usage: SELECT count(*) FROM scan_usage
//   //      WHERE user_id = $1 AND created_at >= CURRENT_DATE
//   //    - Máximo 10 escaneos por día por usuario
//   //    - Si se excede, devolver 429 { error: 'Límite de escaneos alcanzado (10/día)' }
//   //    - Insertar registro en scan_usage al completar el escaneo
//
//   // 3. VALIDACIÓN DE ARCHIVO
//   //    - Recibir archivo como multipart/form-data
//   //    - Validar tipo de archivo por MAGIC BYTES (no confiar en Content-Type del header):
//   //      - JPEG: bytes 0-1 = FF D8
//   //      - PNG: bytes 0-3 = 89 50 4E 47
//   //      - WebP: bytes 0-3 = 52 49 46 46 + bytes 8-11 = 57 45 42 50
//   //    - Tamaño máximo: 3MB (3 * 1024 * 1024 bytes)
//   //    - Si la validación falla, devolver 400 { error: 'Formato de archivo no válido' }
//
//   // 4. LIMPIEZA DE METADATA
//   //    - Stripear toda la metadata EXIF del archivo antes de procesar
//   //    - EXIF puede contener: ubicación GPS, modelo de dispositivo, fecha/hora, etc.
//   //    - Usar librería como 'piexifjs' o leer solo los bytes de imagen sin EXIF
//   //    - NUNCA almacenar la imagen original ni procesada — solo mantener en memoria
//
//   // 5. ENVÍO A CLAUDE VISION API
//   //    - Convertir imagen a base64
//   //    - Llamar a anthropic.messages.create({
//   //        model: 'claude-sonnet-4-20250514',
//   //        max_tokens: 500,
//   //        messages: [{
//   //          role: 'user',
//   //          content: [
//   //            { type: 'image', source: { type: 'base64', media_type: imageType, data: base64Image } },
//   //            { type: 'text', text: CLAUDE_PROMPT }
//   //          ]
//   //        }]
//   //      })
//
//   // 6. PARSEO Y SANITIZACIÓN DE RESPUESTA
//   //    - Parsear JSON de la respuesta de Claude
//   //    - Validar que todos los campos existan y tengan tipos correctos:
//   //      - store: string, max 100 chars, strip HTML
//   //      - total: number, positivo, max 99999999
//   //      - date: string, formato YYYY-MM-DD, no futuro
//   //      - category: string, debe estar en CATEGORIES válidas
//   //      - confidence: number, entre 0 y 1
//   //    - Si el parseo falla, devolver 422 { error: 'No se pudo leer el ticket' }
//
//   // 7. POLÍTICA DE NO-ALMACENAMIENTO
//   //    - NUNCA guardar la imagen en Storage ni en ningún bucket
//   //    - NUNCA loguear el contenido de la imagen ni el base64
//   //    - Solo guardar el resultado del escaneo (store, total, date, category)
//   //    - La imagen existe solo en memoria durante el procesamiento
//   //    - Al terminar el request, la imagen se libera automáticamente
// })
//
// CLAUDE PROMPT para análisis de ticket:
// "Analizá este ticket/factura. Extraé: 1. Nombre del comercio 2. Monto total 3. Fecha 4. Categoría sugerida. Respondé SOLO en JSON: { store, total, date, category, confidence }"
//
// Categorías válidas para el prompt:
// Alimentación, Vivienda, Transporte, Servicios, Entretenimiento, Salud, Educación, Ropa, Ingresos, Otros

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

/**
 * Escanea un ticket/factura y extrae datos de gasto.
 * En producción, esto llama a una Edge Function que usa Claude Vision.
 * En desarrollo, devuelve datos mock después de un delay simulado.
 *
 * IMPORTANTE: Solo se extrae el campo TOTAL del ticket (no subtotal ni IVA).
 * Si no se puede leer el ticket, se devuelve un error honesto.
 * Si la razón social no se encuentra, se marca como no encontrada.
 *
 * @param {File} imageFile - Archivo de imagen del ticket
 * @returns {Promise<{ razonSocial: string, store: string, total: number, date: string, category: string, confidence: number, businessFound: boolean }>}
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

  // TODO SUPABASE: reemplazar todo lo de abajo con:
  // const formData = new FormData()
  // formData.append('ticket', imageFile)
  // const { data: { session } } = await supabase.auth.getSession()
  // const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-ticket`, {
  //   method: 'POST',
  //   headers: { 'Authorization': `Bearer ${session.access_token}` },
  //   body: formData,
  // })
  // if (!response.ok) {
  //   const err = await response.json()
  //   throw new Error(err.error || 'Error al escanear el ticket')
  // }
  // const data = response.json()
  //
  // // Buscar razón social en la base de comercios conocidos
  // const lookup = lookupBusiness(data.razonSocial)
  // return {
  //   ...data,
  //   businessFound: lookup.found,
  //   category: lookup.found ? lookup.category : 'Otros',
  //   store: lookup.found ? lookup.displayName : data.razonSocial,
  // }

  // Mock: simular delay de procesamiento (1500-2500ms)
  const delay = 1500 + Math.random() * 1000
  await new Promise((resolve) => setTimeout(resolve, delay))

  // TODO SUPABASE: en producción, Claude Vision extrae:
  // 1. Razón social / nombre del establecimiento (campo superior del ticket)
  // 2. TOTAL (solo la línea que dice TOTAL, no subtotal ni IVA)
  // 3. Fecha del ticket
  // Prompt de Claude: "Extraé SOLO: 1. Razón social o nombre del comercio 2. El monto de la línea TOTAL (no subtotal, no IVA, solo TOTAL) 3. Fecha. Si no podés leer algún campo, devolvé null para ese campo. NO inventes datos."

  // Mock: simular diferentes escenarios realistas
  const scenarios = [
    // Comercio conocido - alta confianza
    { razonSocial: 'COTO CICSA', total: 15430, confidence: 0.92 },
    { razonSocial: 'JUMBO RETAIL ARG SA', total: 28750, confidence: 0.88 },
    { razonSocial: 'FARMACITY SA', total: 8200, confidence: 0.90 },
    { razonSocial: 'YPF SA', total: 22000, confidence: 0.95 },
    // Comercio NO conocido - el usuario debe categorizar a mano
    { razonSocial: 'PANADERIA DON JULIO SRL', total: 4500, confidence: 0.85 },
    { razonSocial: 'FERRETERIA MARTINEZ', total: 12300, confidence: 0.78 },
  ]

  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)]
  const lookup = lookupBusiness(scenario.razonSocial)
  const today = new Date().toISOString().split('T')[0]

  return {
    razonSocial: scenario.razonSocial,
    store: lookup.found ? lookup.displayName : scenario.razonSocial,
    total: scenario.total,
    date: today,
    category: lookup.found ? lookup.category : 'Otros',
    confidence: scenario.confidence,
    businessFound: lookup.found,
  }
}
