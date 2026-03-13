// MercadoPago integration — Phase 1: Manual payment link
// Public key only on frontend — secret key stays on backend (Supabase Edge Function)

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY

// TODO MP: implement automatic subscription with preapproval API
// TODO MP: implement webhook to auto-upgrade user on payment confirmed

/**
 * Creates a MercadoPago checkout preference and returns the redirect URL.
 * Phase 1: This will be called from a Supabase Edge Function.
 * For now, returns a placeholder.
 */
export async function createCheckoutPreference() {
  // TODO SUPABASE: replace with Edge Function call:
  // const { data } = await fetch('/api/create-payment', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
  //   body: JSON.stringify({
  //     title: 'mi EconomIA Pro — 1 mes',
  //     unit_price: PRICE_PLACEHOLDER,
  //     currency_id: 'ARS',
  //     back_urls: {
  //       success: `${window.location.origin}/payment/success`,
  //       failure: `${window.location.origin}/payment/failure`,
  //     },
  //   }),
  // })
  // window.location.href = data.init_point

  return {
    init_point: '#', // Placeholder
  }
}

export { MP_PUBLIC_KEY }
