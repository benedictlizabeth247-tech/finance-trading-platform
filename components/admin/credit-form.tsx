"use client"

import { useState } from "react"

export function CreditForm({ userId }: { userId: string }) {
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [demo, setDemo] = useState(false)
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage("")
    try {
      const response = await fetch("/api/admin/credits", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ userId, amount, reason, demo }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Credit update failed")
      setMessage(`Updated wallet: ${result.wallet.available ?? 0} available${demo ? " demo" : ""}`)
      setAmount(""); setReason("")
    } catch (error) { setMessage(error instanceof Error ? error.message : "Credit update failed") }
    finally { setSaving(false) }
  }

  return <form onSubmit={submit} className="mt-5 grid gap-3 rounded-2xl border border-[#29413A] bg-[#101A18] p-4 sm:grid-cols-2">
    <label className="text-xs font-bold">Amount (+ credit / - debit)<input value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal" required className="mt-2 w-full rounded-xl border border-[#29413A] bg-[#15231F] px-3 py-3 text-sm outline-none focus:border-[#55D6A7]" placeholder="25.00" /></label>
    <label className="text-xs font-bold">Reason<input value={reason} onChange={e => setReason(e.target.value)} minLength={3} required className="mt-2 w-full rounded-xl border border-[#29413A] bg-[#15231F] px-3 py-3 text-sm outline-none focus:border-[#55D6A7]" placeholder="Verified adjustment" /></label>
    <label className="flex items-center gap-2 text-xs text-[#9BB8AF]"><input type="checkbox" checked={demo} onChange={e => setDemo(e.target.checked)} /> Apply to demo credits</label>
    <button disabled={saving} className="rounded-xl bg-[#55D6A7] px-4 py-3 text-xs font-black text-[#101A18] disabled:opacity-50">{saving ? "Updating…" : "Update credits"}</button>
    {message && <p role="status" className="text-xs text-[#8DE0BD] sm:col-span-2">{message}</p>}
  </form>
}
