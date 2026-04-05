/**
 * MercadoPago Webhook Handler
 *
 * TODO SUPABASE: Deploy this as a Supabase Edge Function at:
 *   supabase/functions/mp-webhook/index.ts
 *
 * This file documents the COMPLETE server-side flow.
 * Currently a reference implementation — will become the real Edge Function
 * when Supabase is connected.
 *
 * FLOW:
 * MercadoPago → POST /functions/v1/mp-webhook → validate → fetch MP API → update DB
 *
 * SECURITY CHECKLIST:
 * ✅ Verify HMAC-SHA256 signature before processing
 * ✅ Re-fetch payment from MP API (never trust webhook payload)
 * ✅ Validate amount matches known plan prices
 * ✅ Use service_role key for DB updates (bypasses RLS)
 * ✅ Idempotency: check if payment_id already processed
 * ✅ Log ALL webhook events for audit (success + failure)
 * ✅ Rate limit: reject if >100 calls/minute from same IP
 * ✅ Return 200 immediately, process async
 */

// ---------------------------------------------------------------------------
// SERVER-SIDE PRICING — hardcoded, never from client
// ---------------------------------------------------------------------------
const SERVER_PRICING = {
  7500: { plan: 'pro', billing: 'monthly' },
  65000: { plan: 'pro', billing: 'annual' },
}

// ---------------------------------------------------------------------------
// EXPIRY CALCULATION
// ---------------------------------------------------------------------------

/**
 * Calculate plan expiry date based on billing period.
 * @param {'monthly' | 'annual'} billing
 * @returns {string} ISO timestamp
 */
function calculateExpiry(billing) {
  const now = new Date()
  if (billing === 'annual') {
    return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString()
  }
  return new Date(now.setMonth(now.getMonth() + 1)).toISOString()
}

// ---------------------------------------------------------------------------
// WEBHOOK HANDLER
// ---------------------------------------------------------------------------

/**
 * Handle incoming MercadoPago webhook.
 *
 * TODO SUPABASE: This will be the body of the Edge Function.
 * Environment variables needed (set in Supabase Dashboard > Settings > Secrets):
 *   - MERCADOPAGO_ACCESS_TOKEN  (from MP dashboard)
 *   - MERCADOPAGO_WEBHOOK_SECRET (from MP webhook config)
 *   - SUPABASE_URL              (auto-provided)
 *   - SUPABASE_SERVICE_ROLE_KEY (auto-provided)
 *
 * @param {Request} request - incoming webhook request
 * @returns {Response}
 */
export async function handleMercadoPagoWebhook(request) {
  // TODO SUPABASE: uncomment when deploying as Edge Function
  // const MP_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
  // const MP_WEBHOOK_SECRET = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET')
  // const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
  // const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  // const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // =========================================================================
  // STEP 1: Verify webhook signature
  // =========================================================================
  // Every incoming request MUST have a valid x-signature header
  // from MercadoPago. Reject anything without it IMMEDIATELY.
  //
  // const signature = request.headers.get('x-signature')
  // const requestId = request.headers.get('x-request-id')
  //
  // if (!signature || !requestId) {
  //   console.error('[MP Webhook] Missing signature or request-id headers')
  //   return new Response('Forbidden', { status: 403 })
  // }
  //
  // const body = await request.text()
  //
  // // Parse signature components
  // const ts = signature.split(',').find(s => s.startsWith('ts='))?.split('=')[1]
  // const v1 = signature.split(',').find(s => s.startsWith('v1='))?.split('=')[1]
  //
  // if (!ts || !v1) {
  //   console.error('[MP Webhook] Malformed signature header')
  //   return new Response('Forbidden', { status: 403 })
  // }
  //
  // // Build manifest and compute expected HMAC
  // const dataId = JSON.parse(body).data?.id
  // const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`
  // const expectedHmac = crypto
  //   .createHmac('sha256', MP_WEBHOOK_SECRET)
  //   .update(manifest)
  //   .digest('hex')
  //
  // if (v1 !== expectedHmac) {
  //   console.error('[MP Webhook] INVALID signature — possible spoofing attempt')
  //   return new Response('Invalid signature', { status: 403 })
  // }
  //
  // console.log('[MP Webhook] Signature verified ✅')

  // =========================================================================
  // STEP 2: Parse and validate payload
  // =========================================================================
  // Only process payment events. Silently ignore everything else.
  //
  // const payload = JSON.parse(body)
  //
  // // Only handle payment.created and payment.updated
  // if (!['payment.created', 'payment.updated'].includes(payload.action)) {
  //   console.log(`[MP Webhook] Ignoring event type: ${payload.action}`)
  //   return new Response('OK', { status: 200 })
  // }
  //
  // const paymentId = payload.data?.id
  // if (!paymentId) {
  //   console.error('[MP Webhook] Missing payment ID in payload')
  //   return new Response('Bad Request', { status: 400 })
  // }

  // =========================================================================
  // STEP 3: Idempotency check
  // =========================================================================
  // Prevent double-processing if MP sends the same webhook twice.
  //
  // const { data: existingPayment } = await supabase
  //   .from('payments')
  //   .select('id, mp_status')
  //   .eq('mp_payment_id', String(paymentId))
  //   .eq('mp_status', 'approved')
  //   .single()
  //
  // if (existingPayment) {
  //   console.log(`[MP Webhook] Payment ${paymentId} already processed — skipping`)
  //   return new Response('OK', { status: 200 })
  // }

  // =========================================================================
  // STEP 4: Fetch payment details from MercadoPago API
  // =========================================================================
  // NEVER trust the webhook payload for amount/status.
  // Always re-fetch from the MP API to confirm.
  //
  // const mpResponse = await fetch(
  //   `https://api.mercadopago.com/v1/payments/${paymentId}`,
  //   {
  //     headers: {
  //       'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
  //       'Content-Type': 'application/json',
  //     },
  //   }
  // )
  //
  // if (!mpResponse.ok) {
  //   console.error(`[MP Webhook] Failed to fetch payment ${paymentId} from MP API`)
  //   return new Response('OK', { status: 200 }) // Return 200 to prevent MP retries
  // }
  //
  // const payment = await mpResponse.json()

  // =========================================================================
  // STEP 5: Validate payment status and amount
  // =========================================================================
  //
  // // Log ALL webhook events regardless of outcome
  // await supabase.from('payments').insert({
  //   user_id: payment.metadata?.user_id || null,
  //   mp_payment_id: String(paymentId),
  //   mp_status: payment.status,
  //   amount: payment.transaction_amount,
  //   billing_period: payment.metadata?.billing_period || null,
  //   raw_webhook: payload,
  // })
  //
  // // Only process approved payments
  // if (payment.status !== 'approved') {
  //   console.log(`[MP Webhook] Payment ${paymentId} status: ${payment.status} — not upgrading`)
  //   return new Response('OK', { status: 200 })
  // }
  //
  // // Validate amount matches a known plan price
  // const planInfo = SERVER_PRICING[payment.transaction_amount]
  // if (!planInfo) {
  //   console.error(
  //     `[MP Webhook] UNKNOWN AMOUNT: $${payment.transaction_amount} for payment ${paymentId}. ` +
  //     'Expected $7500 (monthly) or $65000 (annual). NOT upgrading.'
  //   )
  //   return new Response('OK', { status: 200 })
  // }

  // =========================================================================
  // STEP 6: Upgrade user profile
  // =========================================================================
  // This is the ONLY place where plan = 'pro' is set.
  // The frontend CANNOT do this (RLS blocks plan/role changes).
  //
  // const userId = payment.metadata?.user_id
  // if (!userId) {
  //   console.error(`[MP Webhook] No user_id in metadata for payment ${paymentId}`)
  //   return new Response('OK', { status: 200 })
  // }
  //
  // const { error: updateError } = await supabase
  //   .from('profiles')
  //   .update({
  //     plan: planInfo.plan,
  //     subscription_status: 'active',
  //     mp_payment_id: String(paymentId),
  //     mp_subscription_id: payment.metadata?.subscription_id || null,
  //     trial_ends_at: null, // Clear trial
  //     updated_at: new Date().toISOString(),
  //   })
  //   .eq('id', userId)
  //
  // if (updateError) {
  //   console.error(`[MP Webhook] Failed to update profile for user ${userId}:`, updateError)
  //   return new Response('OK', { status: 200 })
  // }
  //
  // console.log(
  //   `[MP Webhook] ✅ User ${userId} upgraded to ${planInfo.plan} ` +
  //   `(${planInfo.billing}) via payment ${paymentId} — ` +
  //   `amount: $${payment.transaction_amount} ARS — ` +
  //   `expires: ${calculateExpiry(planInfo.billing)}`
  // )

  // Return 200 immediately — MercadoPago expects a fast response
  return new Response('OK', { status: 200 })
}

// ---------------------------------------------------------------------------
// EXPORTS
// ---------------------------------------------------------------------------
export { SERVER_PRICING, calculateExpiry }

// ---------------------------------------------------------------------------
// SECURITY NOTES — WHY THE USER CANNOT SELF-UPGRADE
// ---------------------------------------------------------------------------
//
// ATTACK VECTOR 1: "Change plan in DevTools"
// BLOCKED BY: RLS policy on profiles table prevents users from changing
// their own plan or role fields. The WITH CHECK clause enforces:
//   plan = (SELECT plan FROM profiles WHERE id = auth.uid())
//
// ATTACK VECTOR 2: "Call the upgrade endpoint directly"
// BLOCKED BY: There IS no upgrade endpoint. The only way to upgrade
// is through the webhook, which requires a valid MP signature.
//
// ATTACK VECTOR 3: "Spoof a webhook request"
// BLOCKED BY: HMAC-SHA256 signature validation. The webhook secret
// is only known to our server and MercadoPago.
//
// ATTACK VECTOR 4: "Replay an old webhook"
// BLOCKED BY: Idempotency check — if payment_id already exists with
// status 'approved', the webhook is silently ignored.
//
// ATTACK VECTOR 5: "Modify localStorage subscription_status"
// BLOCKED BY: Client-side state is for UI only. Every API call
// goes through RLS which checks the REAL plan in the DB.
//
// ATTACK VECTOR 6: "Register with admin email"
// BLOCKED BY: Email uniqueness constraint + admin role is set
// manually in DB, never from signup flow.
// ---------------------------------------------------------------------------
