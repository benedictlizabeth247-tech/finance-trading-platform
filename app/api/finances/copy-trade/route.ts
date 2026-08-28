import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const body = await request.json()
  const amount = Number(body?.amount)
  const portfolioId = String(body?.portfolioId ?? '')
  if (!portfolioId || !Number.isFinite(amount) || amount <= 0 || amount > 2) return NextResponse.json({ error: 'Amount must be greater than zero and no more than the available $2 credit.' }, { status: 400 })
  const { data: portfolio } = await supabase.from('investor_portfolios').select('id').eq('id', portfolioId).eq('is_public', true).maybeSingle()
  if (!portfolio) return NextResponse.json({ error: 'Portfolio not found.' }, { status: 404 })
  const { data, error } = await supabase.from('copy_trade_allocations').insert({ investor_portfolio_id: portfolioId, follower_id: auth.user.id, amount, idempotency_key: `copy-${auth.user.id}-${portfolioId}-${crypto.randomUUID()}` }).select('id,investor_portfolio_id,amount,status,created_at').single()
  if (error) return NextResponse.json({ error: 'Unable to create allocation.' }, { status: 400 })
  return NextResponse.json({ data })
}
