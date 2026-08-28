import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function isAdmin(email?: string | null) {
  const staffEmails = new Set(['www.atuchukwuarinze@gmail.com', 'stevearinze594@gmail.com', 'fxchristopher96@gmail.com'])
  return !!email && staffEmails.has(email.trim().toLowerCase())
}

export async function GET() {
  const authClient = await createServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 })
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return NextResponse.json({ error: 'Admin service role is not configured.' }, { status: 503 })
  const admin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  const [{ data: authUsers, error: usersError }, data, airtime, bills, scan, sends, withdrawals, orders, deposits, wallets, allocations, ledger] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from('data_purchase_requests').select('*').order('created_at', { ascending: false }).limit(50),
    admin.from('airtime_purchase_requests').select('*').order('created_at', { ascending: false }).limit(50),
    admin.from('bill_payment_requests').select('*').order('created_at', { ascending: false }).limit(50),
    admin.from('scan_payment_requests').select('*').order('created_at', { ascending: false }).limit(50),
    admin.from('send_requests').select('*').order('created_at', { ascending: false }).limit(50),
    admin.from('withdrawal_requests').select('*').order('created_at', { ascending: false }).limit(50),
    admin.from('orders').select('id,user_id,market,side,order_type,quantity,requested_price,filled_quantity,leverage,margin_mode,status,demo,execution_venue,admin_note,created_at,reviewed_at').in('status', ['pending_admin','open','partially_filled','filled','rejected']).order('created_at', { ascending: false }).limit(100),
    admin.from('deposits').select('id,user_id,asset,network,amount,status,tx_hash,created_at').order('created_at', { ascending: false }).limit(100),
    admin.from('wallets').select('user_id,currency,available,locked,demo_available,updated_at').order('updated_at', { ascending: false }).limit(100),
    admin.from('autopilot_allocations').select('id,user_id,profile_name,amount,reserved_amount,funding_source,status,created_at,updated_at').order('updated_at', { ascending: false }).limit(100),
    admin.from('ledger_entries').select('id,user_id,kind,amount,currency,demo,reference_id,idempotency_key,created_at').order('created_at', { ascending: false }).limit(200),
  ])
  if (usersError) return NextResponse.json({ error: 'Unable to load registered users.' }, { status: 502 })
  return NextResponse.json({ users: (authUsers?.users || []).map(({ id, email, phone, created_at, last_sign_in_at, email_confirmed_at, user_metadata }) => ({ id, email, phone, created_at, last_sign_in_at, email_confirmed_at, name: user_metadata?.full_name || user_metadata?.name || null })), data: data.data || [], airtime: airtime.data || [], bills: bills.data || [], scan: scan.data || [], sends: sends.data || [], withdrawals: withdrawals.data || [], orders: orders.data || [], deposits: deposits.data || [], wallets: wallets.data || [], allocations: allocations.data || [], ledger: ledger.data || [] })
}
