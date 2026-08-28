"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bot, LineChart, Pause, Play, Search, Wallet } from "lucide-react"
import { Card } from "@/components/ui/card"
import { BottomNav } from "@/components/layout/BottomNav"
import { useMarketBoard } from "@/hooks/use-market-data"
import { MARKET_PULSE_IDS } from "@/services/market-data/symbols"
import { formatPercent, formatQuotePrice } from "@/lib/market-format"

const researched = [
  { name: "Berkshire Hathaway", type: "Value · Conglomerate", risk: "Moderate", desc: "A public-equity research profile based on SEC filings.", holdings: "AAPL · AXP · KO · GOOGL · BAC" },
  { name: "BlackRock", type: "Asset manager · ETFs", risk: "Moderate", desc: "Global index and active manager research profile.", holdings: "IVV · AGG · IEMG · BLK" },
  { name: "Vanguard", type: "Asset manager · Index", risk: "Low", desc: "Broad index and bond fund research profile.", holdings: "VOO · VTI · BND · VXUS" },
  { name: "Citadel", type: "Hedge fund · Market maker", risk: "High", desc: "Alternative investment and market-making research profile.", holdings: "Publicly reported positions" },
]

export default function FinancesScreen() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<(typeof researched)[number] | null>(null)
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [allocations, setAllocations] = useState<any[]>([])
  const [amount, setAmount] = useState("")
  const [source, setSource] = useState<"live" | "demo">("live")
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)
  const { quotes } = useMarketBoard({ ids: MARKET_PULSE_IDS, limit: 6 })

  const load = () => {
    void Promise.all([
      fetch("/api/finances/portfolios", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/finances/allocations", { cache: "no-store" }).then((r) => r.json()),
    ]).then(([portfolioResult, allocationResult]) => {
      setPortfolios(portfolioResult.data ?? [])
      setAllocations(allocationResult.data ?? [])
    }).catch(() => setMessage("Finance data is temporarily unavailable."))
  }
  useEffect(() => { load(); const timer = window.setInterval(load, 10000); return () => window.clearInterval(timer) }, [])

  const visible = useMemo(() => researched.filter((p) => `${p.name} ${p.type}`.toLowerCase().includes(query.toLowerCase())), [query])
  const pnl = portfolios.reduce((sum, p) => sum + Number(p.pnl || 0), 0)
  const allocate = async () => {
    if (!selected || Number(amount) <= 0) return setMessage("Enter a positive amount.")
    setSaving(true); setMessage("")
    const response = await fetch("/api/finances/allocations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileName: selected.name, amount: Number(amount), fundingSource: source }) })
    const result = await response.json(); setSaving(false)
    if (!response.ok) return setMessage(result.error || "Allocation failed.")
    setAllocations((current) => [result.data, ...current]); setMessage("Allocation created and recorded."); setAmount("")
  }
  const toggle = async (allocation: any) => {
    const status = allocation.status === "active" ? "paused" : "active"
    const response = await fetch("/api/finances/allocations", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: allocation.id, status }) })
    if (response.ok) setAllocations((current) => current.map((item) => item.id === allocation.id ? { ...item, status } : item))
  }

  return <main className="min-h-screen bg-background pb-28 text-foreground"><header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur"><button aria-label="Go back" onClick={() => router.back()} className="grid size-10 place-items-center rounded-xl border"><ArrowLeft size={18} /></button><div className="flex items-center gap-2"><Bot size={20} className="text-primary" /><div><h1 className="text-sm font-black">NexPilot Finance</h1><p className="text-[10px] text-muted-foreground">Live portfolio marketplace</p></div></div><button aria-label="Open wallet" onClick={() => router.push("/wallet-details")} className="grid size-10 place-items-center rounded-xl border"><Wallet size={17} /></button></header><div className="mx-auto max-w-2xl space-y-4 px-4 py-5"><Card className="bg-[#17231F] p-5 text-white"><p className="text-[10px] font-bold uppercase tracking-widest text-[#9FD9C0]">Investor workflow</p><h2 className="mt-3 text-2xl font-black">Choose an investor to follow</h2><p className="mt-2 text-xs leading-5 text-white/70">Review live portfolio holdings, cost basis, and P&amp;L before allocating your balance.</p><div className="mt-4 grid grid-cols-4 gap-1 text-center text-[9px] font-bold"><span className="rounded bg-[#16A36A] p-2">1<br />Investor</span><span className="rounded bg-white/10 p-2">2<br />Portfolio</span><span className="rounded bg-white/10 p-2">3<br />Review</span><span className="rounded bg-white/10 p-2">4<br />Amount</span></div></Card><div className="flex items-center gap-2 rounded-xl border px-3"><Search size={16} className="text-muted-foreground" /><input aria-label="Search investors" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search investors" className="h-11 flex-1 bg-transparent text-xs outline-none" /></div>{portfolios.length > 0 && <Card className="p-4"><div className="flex justify-between"><div><p className="text-[10px] font-bold uppercase text-primary">Live portfolios</p><p className="text-xl font-black">{portfolios.length}</p></div><div className="text-right"><p className="text-[10px] font-bold uppercase text-primary">Portfolio P&amp;L</p><p className="text-xl font-black">${pnl.toFixed(2)}</p></div></div>{portfolios.map((portfolio) => <div key={portfolio.id} className="mt-4 border-t pt-3"><div className="flex justify-between text-xs font-bold"><span>{portfolio.name}</span><span>{Number(portfolio.performance_30d || 0).toFixed(2)}%</span></div>{(portfolio.holdings || []).map((holding: any) => <div key={holding.id} className="mt-2 flex justify-between text-[10px] text-muted-foreground"><span>{holding.ticker} · {Number(holding.quantity).toLocaleString()} units</span><span>${(Number(holding.current_price) * Number(holding.quantity)).toFixed(2)}</span></div>)}<p className="mt-2 text-[10px] text-muted-foreground">Cost basis ${Number(portfolio.costBasis || 0).toFixed(2)} · P&amp;L ${Number(portfolio.pnl || 0).toFixed(2)}</p></div>)}</Card>}<section><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-black">Investors</h2><span className="text-[10px] text-muted-foreground">{visible.length} profiles</span></div><div className="grid gap-3 sm:grid-cols-2">{visible.map((profile) => <Card key={profile.name} className="p-4"><div className="flex justify-between gap-3"><div><h3 className="text-xs font-black">{profile.name}</h3><p className="mt-1 text-[10px] text-muted-foreground">{profile.type}</p></div><span className="rounded-full bg-muted px-2 py-1 text-[9px] font-bold">{profile.risk}</span></div><p className="mt-3 text-[10px] leading-5 text-muted-foreground">{profile.desc}</p><p className="mt-2 text-[10px] font-bold">{profile.holdings}</p><button onClick={() => setSelected(profile)} className="mt-4 w-full rounded-xl bg-primary px-3 py-2 text-[10px] font-black text-primary-foreground">Review portfolio</button></Card>)}</div></section>{selected && <Card className="border-primary p-4"><div className="flex justify-between"><div><h2 className="text-sm font-black">{selected.name}</h2><p className="text-[10px] text-muted-foreground">{selected.type} · {selected.risk} risk</p></div><button aria-label="Close investor" onClick={() => setSelected(null)}>×</button></div><p className="mt-3 text-xs leading-5 text-muted-foreground">{selected.desc}</p><p className="mt-3 rounded-xl bg-muted p-3 text-xs font-bold">{selected.holdings}</p><div className="mt-4 flex gap-2"><input aria-label="Investment amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" className="min-w-0 flex-1 rounded-xl border px-3 text-xs" /><select aria-label="Funding source" value={source} onChange={(e) => setSource(e.target.value as "live" | "demo")} className="rounded-xl border px-2 text-xs"><option value="live">Live</option><option value="demo">Demo</option></select><button disabled={saving} onClick={allocate} className="rounded-xl bg-primary px-4 text-[10px] font-black text-primary-foreground">{saving ? "Saving" : "Follow"}</button></div>{message && <p className="mt-3 text-[10px] font-bold text-primary">{message}</p>}</Card>}{allocations.length > 0 && <Card className="p-4"><div className="flex items-center gap-2"><Wallet size={16} className="text-primary" /><h2 className="text-sm font-black">Managed allocations</h2></div>{allocations.map((allocation) => <div key={allocation.id} className="mt-3 flex items-center justify-between rounded-xl bg-muted p-3"><div><p className="text-xs font-bold">{allocation.profile_name}</p><p className="text-[10px] text-muted-foreground">${Number(allocation.amount).toLocaleString()} · {allocation.status}</p></div><button aria-label={`${allocation.status === "active" ? "Pause" : "Resume"} allocation`} onClick={() => toggle(allocation)} className="grid size-9 place-items-center rounded-lg border">{allocation.status === "active" ? <Pause size={14} /> : <Play size={14} />}</button></div>)}</Card>}<section><div className="mb-3 flex items-center gap-2"><LineChart size={16} className="text-primary" /><h2 className="text-sm font-black">Live market context</h2></div><div className="grid grid-cols-2 gap-3">{quotes.map((quote) => <button key={quote.id} onClick={() => router.push(`/markets/${encodeURIComponent(quote.id)}`)} className="rounded-xl border p-3 text-left"><p className="text-[10px] font-bold">{quote.display}</p><p className="mt-1 text-xs font-black">{formatQuotePrice(quote)}</p><p className="text-[10px] text-primary">{formatPercent(quote.changePercent)}</p></button>)}</div></section></div><BottomNav /></main>
}
