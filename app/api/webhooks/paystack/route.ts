import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  const raw = await request.text()
  const signature = request.headers.get('x-paystack-signature') || ''
  const expected = crypto.createHmac('sha512', secret).update(raw).digest('hex')
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  const event = JSON.parse(raw)
  if (event?.event !== 'charge.success') return NextResponse.json({ received: true })
  const reference = event?.data?.reference
  if (!reference) return NextResponse.json({ received: true })
  const admin = createAdminClient()
  const { data: intent } = await admin.from('fiat_payment_intents').select('*').eq('reference', reference).single()
  if (!intent || intent.status === 'credited') return NextResponse.json({ received: true })
  const verified = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${secret}` }, cache: 'no-store' })
  const check = await verified.json()
  const paidAmount = Number(check?.data?.amount ?? 0) / 100
  if (!check?.status || check?.data?.status !== 'success' || paidAmount !== Number(intent.amount) || check?.data?.currency !== intent.currency) return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
  const { data: ledger, error } = await admin.rpc('credit_fiat_deposit', { p_user_id: intent.user_id, p_amount: Number(intent.amount), p_reference: reference })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await admin.from('fiat_payment_intents').update({ status: 'credited', provider_id: String(event.data.id), credited_at: new Date().toISOString() }).eq('id', intent.id)
  return NextResponse.json({ received: true, ledger })
}
