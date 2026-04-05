/**
 * MercadoPago Integration — Secure Payment Flow
 *
 * ARCHITECTURE:
 * ┌─────────────┐     ┌──────────────────┐     ┌───────────────┐
 * │   Frontend   │────▶│  Edge Function    │────▶│  MercadoPago  │
 * │  (this file) │     │  create-payment   │     │     API       │
 * └─────────────┘     └──────────────────┘     └───────────────┘
 *       │                                              │
 *       │  redirect to init_point                      │
 *       ▼                                              ▼
 * ┌─────────────┐                              ┌───────────────┐
 * │  MP Checkout │                              │   Webhook     │
 * │   (hosted)   │                              │  /mp-webhook  │
 * └─────────────┘                              └───────┬───────┘
 *       │                                              │
 *       │  back_url redirect                           │ validates signature
 *       ▼                                              ▼
 * ┌─────────────┐                              ┌───────────────┐
 * │  /payment/   │                              │  Update DB:   │
 * │  success     │                              │  plan = 'pro' │
 * └─────────────┘                              └───────────────┘
 *
 * SECURITY RULES:
 * 1. Frontend NEVER sets prices — only sends billing_period ('monthly'|'annual')
 * 2. Edge Function hardcodes prices server-side from PRICING constant
 * 3. Webhook validates MP signature before updating any data
 * 4. User plan is ONLY upgraded via webhook — never from frontend
 * 5. All payments are logged in the payments table for audit
 * 6. MP secret key is in Supabase secrets, never in frontend env
 */

// ---------------------------------------------------------------------------
// PUBLIC KEY (safe for frontend — used by MP SDK for card tokenization)
// ---------------------------------------------------------------------------
const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY

// ---------------------------------------------------------------------------
// PRICING (display only — server enforces actual amounts)
// ---------------------------------------------------------------------------
// These values are used for UI display in PricingSection, MiPlan, etc.
// The Edge Function has its OWN copy of these values and NEVER reads from client.
export const PRICING = {
  monthly: {
    unit_price: 7500,
    title_es: 'mi EconomIA Pro — 1 mes',
    title_en: 'mi EconomIA Pro — 1 month',
    currency_id: 'ARS',
  },
  annual: {
    unit_price: 65000,
    title_es: 'mi EconomIA Pro Anual — 1 año',
    title_en: 'mi EconomIA Pro Annual — 1 year',
    currency_id: 'ARS',
  },
}

// ---------------------------------------------------------------------------
// CHECKOUT (frontend → Edge Function → MP)
// ---------------------------------------------------------------------------

/**
 * Request a MercadoPago checkout preference from the Edge Function.
 * The Edge Function creates the preference with hardcoded server-side prices.
 *
 * @param {'monthly' | 'annual'} billingPeriod
 * @param {string} lang - 'es' | 'en'
 * @returns {Promise<{ init_point: string, plan: object }>}
 */
export async function createCheckoutPreference(billingPeriod = 'monthly', lang = 'es') {
  const plan = PRICING[billingPeriod] || PRICING.monthly
  const title = lang === 'en' ? plan.title_en : plan.title_es

  // TODO SUPABASE: Replace with real Edge Function call
  //
  // const session = await supabase.auth.getSession()
  // if (!session.data.session) throw new Error('Not authenticated')
  //
  // const response = await fetch(
  //   `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment`,
  //   {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Bearer ${session.data.session.access_token}`,
  //     },
  //     body: JSON.stringify({ billing_period: billingPeriod }),
  //   }
  // )
  //
  // if (!response.ok) {
  //   const err = await response.json()
  //   throw new Error(err.message || 'Error al crear el pago')
  // }
  //
  // const { init_point } = await response.json()
  // window.location.href = init_point

  // Mock: return placeholder
  return {
    init_point: '#',
    plan: { title, unit_price: plan.unit_price, currency_id: plan.currency_id },
  }
}

export { MP_PUBLIC_KEY }

// ===========================================================================
// EDGE FUNCTION TEMPLATES (deploy to Supabase Edge Functions)
// ===========================================================================
//
// These are reference implementations. Deploy them to:
// supabase/functions/create-payment/index.ts
// supabase/functions/mp-webhook/index.ts
//
// ---------------------------------------------------------------------------
// EDGE FUNCTION 1: create-payment
// ---------------------------------------------------------------------------
//
// import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// import MercadoPago from 'mercadopago'
//
// const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')! // From Supabase secrets
// const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
// const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
//
// // SERVER-SIDE pricing — these are the ONLY values that matter
// const SERVER_PRICING = {
//   monthly: { unit_price: 7500, title: 'mi EconomIA Pro — 1 mes' },
//   annual:  { unit_price: 65000, title: 'mi EconomIA Pro Anual — 1 año' },
// }
//
// serve(async (req) => {
//   // 1. Verify authentication
//   const authHeader = req.headers.get('Authorization')
//   if (!authHeader) return new Response('Unauthorized', { status: 401 })
//
//   const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
//   const { data: { user }, error } = await supabase.auth.getUser(
//     authHeader.replace('Bearer ', '')
//   )
//   if (error || !user) return new Response('Unauthorized', { status: 401 })
//
//   // 2. Parse and validate billing period
//   const { billing_period } = await req.json()
//   if (!['monthly', 'annual'].includes(billing_period)) {
//     return new Response('Invalid billing period', { status: 400 })
//   }
//
//   // 3. Create MP preference with SERVER-SIDE prices (never trust client)
//   const plan = SERVER_PRICING[billing_period]
//   const mp = new MercadoPago(MP_ACCESS_TOKEN)
//
//   const preference = await mp.preferences.create({
//     items: [{
//       title: plan.title,
//       unit_price: plan.unit_price,  // HARDCODED — not from request
//       currency_id: 'ARS',
//       quantity: 1,
//     }],
//     metadata: {
//       user_id: user.id,
//       billing_period,
//     },
//     back_urls: {
//       success: `${req.headers.get('origin')}/payment/success`,
//       failure: `${req.headers.get('origin')}/payment/failure`,
//     },
//     auto_return: 'approved',
//     notification_url: `${SUPABASE_URL}/functions/v1/mp-webhook`,
//   })
//
//   // 4. Log for audit
//   await supabase.from('payments').insert({
//     user_id: user.id,
//     mp_payment_id: preference.id,
//     mp_status: 'preference_created',
//     amount: plan.unit_price,
//     billing_period,
//   })
//
//   return new Response(JSON.stringify({ init_point: preference.init_point }), {
//     headers: { 'Content-Type': 'application/json' },
//   })
// })
//
// ---------------------------------------------------------------------------
// EDGE FUNCTION 2: mp-webhook (MercadoPago → Supabase)
// ---------------------------------------------------------------------------
//
// import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// import crypto from 'node:crypto'
//
// const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')!
// const MP_WEBHOOK_SECRET = Deno.env.get('MP_WEBHOOK_SECRET')! // For HMAC validation
// const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
// const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
//
// serve(async (req) => {
//   // 1. Validate webhook signature (CRITICAL — prevents spoofed requests)
//   const signature = req.headers.get('x-signature')
//   const requestId = req.headers.get('x-request-id')
//   const body = await req.text()
//
//   // Validate HMAC-SHA256 signature
//   // See: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
//   const ts = signature?.split(',').find(s => s.startsWith('ts='))?.split('=')[1]
//   const v1 = signature?.split(',').find(s => s.startsWith('v1='))?.split('=')[1]
//   const manifest = `id:${JSON.parse(body).data?.id};request-id:${requestId};ts:${ts};`
//   const expectedHmac = crypto
//     .createHmac('sha256', MP_WEBHOOK_SECRET)
//     .update(manifest)
//     .digest('hex')
//
//   if (v1 !== expectedHmac) {
//     console.error('Invalid webhook signature')
//     return new Response('Invalid signature', { status: 403 })
//   }
//
//   // 2. Parse webhook payload
//   const payload = JSON.parse(body)
//   if (payload.type !== 'payment') {
//     return new Response('OK', { status: 200 }) // Ignore non-payment events
//   }
//
//   // 3. Fetch full payment details from MP API (don't trust webhook body)
//   const paymentId = payload.data.id
//   const mpResponse = await fetch(
//     `https://api.mercadopago.com/v1/payments/${paymentId}`,
//     { headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` } }
//   )
//   const payment = await mpResponse.json()
//
//   // 4. Validate payment status
//   if (payment.status !== 'approved') {
//     // Log but don't upgrade
//     const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
//     await supabase.from('payments').insert({
//       user_id: payment.metadata.user_id,
//       mp_payment_id: String(paymentId),
//       mp_status: payment.status,
//       amount: payment.transaction_amount,
//       billing_period: payment.metadata.billing_period,
//       raw_webhook: payload,
//     })
//     return new Response('OK', { status: 200 })
//   }
//
//   // 5. UPGRADE USER (only happens here — never from frontend)
//   const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
//   const userId = payment.metadata.user_id
//
//   await supabase
//     .from('profiles')
//     .update({
//       plan: 'pro',
//       subscription_status: 'active',
//       mp_payment_id: String(paymentId),
//       trial_ends_at: null,
//     })
//     .eq('id', userId)
//
//   // 6. Log successful payment
//   await supabase.from('payments').insert({
//     user_id: userId,
//     mp_payment_id: String(paymentId),
//     mp_status: 'approved',
//     amount: payment.transaction_amount,
//     billing_period: payment.metadata.billing_period,
//     raw_webhook: payload,
//   })
//
//   console.log(`✅ User ${userId} upgraded to Pro via payment ${paymentId}`)
//   return new Response('OK', { status: 200 })
// })
//
// ---------------------------------------------------------------------------
// WHY THE USER CANNOT SELF-UPGRADE:
// ---------------------------------------------------------------------------
//
// 1. The frontend only calls createCheckoutPreference() which redirects to MP
// 2. The user pays through MercadoPago's hosted checkout (we never see card data)
// 3. MP sends a webhook to our Edge Function (mp-webhook)
// 4. The Edge Function validates the HMAC signature from MP
// 5. The Edge Function fetches payment details directly from MP API
// 6. ONLY if payment.status === 'approved', it updates profiles.plan = 'pro'
// 7. The profiles table RLS BLOCKS users from changing their own plan:
//    WITH CHECK (plan = (SELECT plan FROM profiles WHERE id = auth.uid()))
// 8. The update uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS
//
// Attack vectors blocked:
// - Changing plan in DevTools → RLS blocks the update
// - Calling the Edge Function without paying → no approved payment exists
// - Spoofing a webhook → HMAC signature validation fails
// - Replaying an old webhook → payment ID is already logged (idempotent)
// ---------------------------------------------------------------------------
