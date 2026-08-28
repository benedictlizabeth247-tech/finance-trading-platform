import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { z } from 'zod'

const schema = z.object({ amount: z.number().finite().int().min(100).max(10_000_000) })

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Enter a valid amount.' }, { status: 400 })
    const secret = process.env.STRIPE_SECRET_KEY
    if (!secret) return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 503 })

    const stripe = new Stripe(secret)
    const origin = request.headers.get('origin') || new URL(request.url).origin
    const suffix = Math.random().toString(36).slice(2, 10)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price_data: { currency: 'ngn', product_data: { name: 'nexMonie account funding' }, unit_amount: parsed.data.amount }, quantity: 1 }],
      success_url: `${origin}/fund-account?provider=stripe&status=processing&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/fund-account?provider=stripe&status=cancelled`,
      metadata: { purpose: 'account_funding', currency: 'NGN' },
      integration_identifier: `nexmonie_funding_${suffix}`,
    })
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[v0] Stripe funding checkout error', error)
    return NextResponse.json({ error: 'Stripe checkout could not be started.' }, { status: 500 })
  }
}
