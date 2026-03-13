// Claude API integration
// SECURITY: The Claude API key NEVER touches the frontend.
// All AI requests go through /api/chat (Supabase Edge Function).
// The Edge Function handles:
//   1. Verifying user auth + plan (must be Pro)
//   2. Rate limiting (max 20 messages/day per user)
//   3. Calling Claude API (claude-sonnet-4-20250514) with expense context
//   4. Streaming response back to frontend

/**
 * Send a message to the AI assistant via the Edge Function proxy.
 * @param {string} message - User's question
 * @param {object} expenseContext - Summary of user's expenses for the system prompt
 * @param {string} accessToken - Supabase auth token
 * @returns {ReadableStream} - Streaming response from Claude
 */
export async function sendChatMessage(message, expenseContext, accessToken) {
  // TODO SUPABASE: replace with actual Edge Function call
  // const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${accessToken}`,
  //   },
  //   body: JSON.stringify({
  //     message,
  //     expense_context: expenseContext,
  //   }),
  // })
  //
  // if (!response.ok) {
  //   const error = await response.json()
  //   throw new Error(error.message || 'Error al contactar al asistente')
  // }
  //
  // return response.body // ReadableStream for streaming

  // Mock response for development
  return new Response('Mock response').body
}

// Edge Function template (for reference — deploy to Supabase):
//
// import { serve } from 'https://deno.land/std/http/server.ts'
// import Anthropic from '@anthropic-ai/sdk'
//
// const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })
//
// serve(async (req) => {
//   // 1. Verify auth
//   // 2. Check rate limit (20/day)
//   // 3. Build system prompt with expense context
//   // 4. Call Claude API
//   // 5. Stream response
// })
