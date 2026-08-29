import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getQuotes } from '@/services/market-data/router'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const mode = body?.mode
    const symbol = String(body?.symbol ?? '')
    const side = body?.side
    const orderType = body?.orderType ?? 'market'
    const quantity = Number(body?.quantity)
    const leverage = Number(body?.leverage ?? 1)
    if (!Number.isFinite(leverage) || leverage < 1 || leverage > 50) return NextResponse.json({ error: 'Leverage must be between 1x and 50x.' }, { status: 400 })
    const client = await createClient()
    const { data: auth } = await client.auth.getUser()
    const userId = auth.user?.id
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    if (!['spot', 'futures'].includes(mode) || !['buy', 'sell'].includes(side) || !symbol || !Number.isFinite(quantity) || quantity <= 0) {
      return NextResponse.json({ error: 'Invalid order request' }, { status: 400 })
    }

    const quoteId = symbol.includes('.') ? symbol : symbol.includes('/') ? `crypto.${symbol.replace('/', '').toUpperCase()}` : `stock.${symbol.toUpperCase()}`
    const market = await getQuotes([quoteId])
    const quote = market.quotes.find((q) => q.id === quoteId)
    const executionPrice = Number(quote?.price ?? 0)
    if (!executionPrice || !Number.isFinite(executionPrice)) {
      return NextResponse.json({ error: 'No live execution price is currently available.' }, { status: 503 })
    }
    if (quote?.stale) {
      return NextResponse.json({ error: 'Market feed is stale; order execution is paused until a fresh price is available.' }, { status: 503 })
    }

    const { data, error } = await client.rpc('trading_execute_order', {
      p_user_id: userId,
      p_mode: mode,
      p_symbol: symbol,
      p_side: side,
      p_order_type: orderType,
      p_quantity: quantity,
      p_execution_price: executionPrice,
      p_leverage: leverage,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ...data, execution_price: executionPrice, provider: quote.provider, timestamp: quote.timestamp }, { headers: { 'cache-control': 'no-store' } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Execution failed' }, { status: 500 })
  }
}
