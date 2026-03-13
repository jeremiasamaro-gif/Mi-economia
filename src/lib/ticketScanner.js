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

/**
 * Escanea un ticket/factura y extrae datos de gasto.
 * En producción, esto llama a una Edge Function que usa Claude Vision.
 * En desarrollo, devuelve datos mock después de un delay simulado.
 *
 * @param {File} imageFile - Archivo de imagen del ticket
 * @returns {Promise<{ store: string, total: number, date: string, category: string, confidence: number }>}
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
  // return response.json()

  // Mock: simular delay de procesamiento (1500-2500ms)
  const delay = 1500 + Math.random() * 1000
  await new Promise((resolve) => setTimeout(resolve, delay))

  // Mock: devolver datos de ejemplo
  const today = new Date().toISOString().split('T')[0]
  return {
    store: 'Supermercado Coto',
    total: 15430,
    date: today,
    category: 'Alimentación',
    confidence: 0.92,
  }
}
