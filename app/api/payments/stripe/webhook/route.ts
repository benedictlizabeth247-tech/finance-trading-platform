import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = request.headers.get('stripe-signature')
  if (!secret || !webhookSecret || !signature) return NextResponse.json({ error: 'Webhook is not configured.' }, { status: 503 })

  try {
    const stripe = new Stripe(secret)
    const event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret)
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.metadata?.purpose === 'account_funding' && session.payment_status !== 'unpaid') {
        // Ledger crediting belongs here after the funding ledger is configured.
        // Never credit from the browser return URL.
        console.info('[v0] Confirmed Stripe funding session', session.id)
      }
    }
    if (event.type === 'checkout.session.async_payment_failed') console.warn('[v0] Stripe funding payment failed', event.id)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[v0] Stripe webhook signature or processing error', error)
    return NextResponse.json({ error: 'Invalid webhook.' }, { status: 400 })
  }
}
