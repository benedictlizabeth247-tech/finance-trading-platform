import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) return NextResponse.json({ error: 'Fiat payment rail is not configured.' }, { status: 503 })
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth.user
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const body = await request.json()
  const amount = Number(body?.amount)
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  const reference = `nex_${crypto.randomUUID().replaceAll('-', '')}`
  const admin = createAdminClient()
  const { error: insertError } = await admin.from('fiat_payment_intents').insert({ user_id: user.id, provider: 'paystack', reference, amount, currency: 'NGN', status: 'pending' })
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user.email, amount: Math.round(amount * 100), currency: 'NGN', reference, callback_url: `${process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin}/fund?payment=paystack` }),
  })
  const payload = await response.json()
  if (!response.ok || !payload?.status) return NextResponse.json({ error: payload?.message || 'Paystack initialization failed' }, { status: 502 })
  return NextResponse.json({ authorization_url: payload.data.authorization_url, reference })
}
