// MercadoPago integration — Phase 1: Manual payment link
// Public key only on frontend — secret key stays on backend (Supabase Edge Function)
// SECURITY: unit_price is ALWAYS set server-side, never from client input

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY

// Pricing constants — server-side source of truth
// These are displayed on frontend but MUST be validated server-side
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

// TODO MP: implement automatic subscription with preapproval API
// TODO MP: implement webhook to auto-upgrade user on payment confirmed

/**
 * Creates a MercadoPago checkout preference and returns the redirect URL.
 * Phase 1: This will be called from a Supabase Edge Function.
 * For now, returns a placeholder.
 *
 * @param {'monthly' | 'annual'} billingPeriod - The billing period to create preference for
 * @param {string} lang - Current language ('es' or 'en')
 */
export async function createCheckoutPreference(billingPeriod = 'monthly', lang = 'es') {
  const plan = PRICING[billingPeriod] || PRICING.monthly
  const title = lang === 'en' ? plan.title_en : plan.title_es

  // TODO SUPABASE: replace with Edge Function call:
  // SECURITY: The Edge Function MUST:
  // 1. Validate the billingPeriod parameter ('monthly' or 'annual')
  // 2. Use server-side PRICING constants for unit_price (never trust client)
  // 3. Verify user authentication via session token
  // 4. Log the preference creation for audit
  //
  // const { data } = await fetch('/api/create-payment', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
  //   body: JSON.stringify({ billing_period: billingPeriod }),
  // })
  //
  // Server-side Edge Function creates preference with:
  // {
  //   items: [{
  //     title: plan.title,
  //     unit_price: plan.unit_price,  // HARDCODED server-side
  //     currency_id: 'ARS',
  //     quantity: 1,
  //   }],
  //   back_urls: {
  //     success: `${origin}/payment/success`,
  //     failure: `${origin}/payment/failure`,
  //   },
  //   auto_return: 'approved',
  // }
  //
  // window.location.href = data.init_point

  return {
    init_point: '#', // Placeholder
    plan: { title, unit_price: plan.unit_price, currency_id: plan.currency_id },
  }
}

export { MP_PUBLIC_KEY }
