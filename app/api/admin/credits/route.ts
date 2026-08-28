import { NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const staff = new Set(["www.atuchukwuarinze@gmail.com", "stevearinze594@gmail.com", "fxchristopher96@gmail.com"])

export async function POST(request: Request) {
  const auth = await createServerClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user?.email || !staff.has(user.email.toLowerCase())) return NextResponse.json({ error: "Admin access required." }, { status: 403 })
  const body = await request.json().catch(() => null)
  const userId = typeof body?.userId === "string" ? body.userId : ""
  const amount = Number(body?.amount)
  const reason = typeof body?.reason === "string" ? body.reason.trim() : ""
  const demo = body?.demo === true
  if (!userId || !Number.isFinite(amount) || amount === 0 || Math.abs(amount) > 100000000 || reason.length < 3) return NextResponse.json({ error: "Enter a valid amount and reason." }, { status: 400 })
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return NextResponse.json({ error: "Admin service role is not configured." }, { status: 503 })
  const admin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data, error } = await admin.rpc("admin_manage_credit", { p_user_id: userId, p_amount: amount, p_currency: "USD", p_demo: demo, p_reason: reason })
  if (error) return NextResponse.json({ error: "Credit update could not be completed." }, { status: 422 })
  return NextResponse.json({ wallet: data })
}
