"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bot, LineChart, Pause, Play, Search, Wallet } from "lucide-react"
import { Card } from "@/components/ui/card"
import { BottomNav } from "@/components/layout/BottomNav"
import { useMarketBoard } from "@/hooks/use-market-data"
import { MARKET_PULSE_IDS } from "@/services/market-data/symbols"
import { formatPercent, formatQuotePrice } from "@/lib/market-format"

const investors = [
  { name: "Berkshire Hathaway", type: "Value · Conglomerate", risk: "Moderate", desc: "A public-equity research profile based on SEC filings.", holdings: "AAPL · AXP · KO · GOOGL · BAC" },
  { name: "BlackRock", type: "Asset manager · ETFs", risk: "Moderate", desc: "Global index and active manager research profile.", holdings: "IVV · AGG · IEMG · BLK" },
  { name: "Vanguard", type: "Asset manager · Index", risk: "Low", desc: "Broad index and bond fund research profile.", holdings: "VOO · VTI · BND · VXUS" },
  { name: "Citadel", type: "Hedge fund · Market maker", risk: "High", desc: "Alternative investment and market-making research profile.", holdings: "Publicly reported positions" },
]
const steps = ["Investor", "Portfolio", "Review", "Amount"]

export default function FinancesScreen() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<(typeof investors)[number] | null>(null)
  const [activeStep, setActiveStep] = useState(1)
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

  const visible = useMemo(() => investors.filter((p) => `${p.name} ${p.type}`.toLowerCase().includes(query.toLowerCase())), [query])
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
  const chooseStep = (step: number) => {
    if (step > 1 && !selected) return setMessage("Choose an investor first.")
    setActiveStep(step)
    if (step === 2) window.setTimeout(() => document.getElementById("portfolio-section")?.scrollIntoView({ behavior: "smooth" }), 0)
    if (step === 3) window.setTimeout(() => document.getElementById("review-section")?.scrollIntoView({ behavior: "smooth" }), 0)
    if (step === 4) window.setTimeout(() => document.getElementById("amount-section")?.scrollIntoView({ behavior: "smooth" }), 0)
  }

  return <main className="min-h-screen bg-background pb-28 text-foreground"><header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur"><button aria-label="Go back" onClick={() => router.back()} className="grid size-10 place-items-center rounded-xl border"><ArrowLeft size={18} /></button><div className="flex items-center gap-2"><Bot size={20} className="text-primary" /><div><h1 className="text-sm font-black">NexPilot Finance</h1><p className="text-[10px] text-muted-foreground">Live portfolio marketplace</p></div></div><button aria-label="Open wallet" onClick={() => router.push("/wallet-details")} className="grid size-10 place-items-center rounded-xl border"><Wallet size={17} /></button></header><div className="mx-auto max-w-2xl space-y-4 px-4 py-5"><Card className="bg-[#17231F] p-5 text-white"><p className="text-[10px] font-bold uppercase tracking-widest text-[#9FD9C0]">Investor workflow</p><h2 className="mt-3 text-2xl font-black">Choose an investor to follow</h2><p className="mt-2 text-xs leading-5 text-white/70">Review live portfolio holdings, cost basis, and P&amp;L before allocating your balance.</p><div className="mt-4 grid grid-cols-4 gap-1 text-center text-[9px] font-bold">{steps.map((step, index) => <button key={step} type="button" onClick={() => chooseStep(index + 1)} aria-current={activeStep === index + 1 ? "step" : undefined} className={`rounded p-2 transition-colors ${activeStep === index + 1 ? "bg-[#16A36A]" : "bg-white/10 hover:bg-white/20"}`}>{index + 1}<br />{step}</button>)}</div></Card><div className="flex items-center gap-2 rounded-xl border px-3"><Search size={16} className="text-muted-foreground" /><input aria-label="Search investors" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search investors" className="h-11 flex-1 bg-transparent text-xs outline-none" /></div><section id="portfolio-section" className="space-y-2"><h3 className="text-sm font-black">Top investors</h3>{visible.map((investor) => <button type="button" key={investor.name} onClick={() => { setSelected(investor); setActiveStep(2); setMessage("") }} className={`w-full rounded-2xl border p-4 text-left transition-colors ${selected?.name === investor.name ? "border-primary bg-primary/10" : "hover:bg-muted/50"}`}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold">{investor.name}</p><p className="mt-1 text-[11px] text-muted-foreground">{investor.type}</p></div><span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold">{investor.risk}</span></div><p className="mt-3 text-xs leading-5 text-muted-foreground">{investor.desc}</p><p className="mt-2 text-[11px] font-medium text-primary">Holdings: {investor.holdings}</p></button>)}</section>{selected && <><Card id="review-section" className="space-y-3 p-4"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Selected investor</p><h3 className="mt-1 text-lg font-black">{selected.name}</h3></div><LineChart size={20} className="text-primary" /></div><p className="text-xs leading-5 text-muted-foreground">{selected.desc}</p><div className="flex gap-2"><button type="button" onClick={() => setActiveStep(3)} className="flex-1 rounded-xl bg-primary px-3 py-3 text-xs font-bold text-primary-foreground">Review portfolio</button><button type="button" onClick={() => chooseStep(4)} className="flex-1 rounded-xl border px-3 py-3 text-xs font-bold">Choose amount</button></div></Card><Card id="amount-section" className="space-y-3 p-4"><div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Amount to invest</p><h3 className="mt-1 text-lg font-black">Allocate to {selected.name}</h3></div><div className="flex items-center rounded-xl border px-3"><span className="text-sm text-muted-foreground">$</span><input aria-label="Investment amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="h-12 flex-1 bg-transparent px-2 text-xl font-black outline-none" /></div><div className="flex gap-2"><button type="button" onClick={() => setSource("live")} className={`flex-1 rounded-lg border px-2 py-2 text-xs font-bold ${source === "live" ? "border-primary bg-primary/10" : ""}`}>Live broker</button><button type="button" onClick={() => setSource("demo")} className={`flex-1 rounded-lg border px-2 py-2 text-xs font-bold ${source === "demo" ? "border-primary bg-primary/10" : ""}`}>Demo balance</button></div><button type="button" disabled={saving} onClick={allocate} className="w-full rounded-xl bg-primary px-3 py-3 text-xs font-bold text-primary-foreground disabled:opacity-50">{saving ? "Recording..." : "Start copy allocation"}</button></Card></>}{message && <p role="status" className="rounded-xl bg-muted p-3 text-xs font-medium">{message}</p>}{allocations.length > 0 && <Card className="space-y-3 p-4"><div className="flex items-center justify-between"><h3 className="text-sm font-black">Your copy allocations</h3><span className="text-xs text-muted-foreground">P&amp;L {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}</span></div>{allocations.map((allocation) => <div key={allocation.id} className="flex items-center justify-between gap-3 rounded-xl border p-3"><div><p className="text-xs font-bold">{allocation.profile_name || allocation.profileName}</p><p className="text-[11px] text-muted-foreground">${Number(allocation.amount || 0).toFixed(2)} · {allocation.status}</p></div><button type="button" aria-label={`${allocation.status === "active" ? "Pause" : "Resume"} ${allocation.profile_name || allocation.profileName}`} onClick={() => toggle(allocation)} className="grid size-9 place-items-center rounded-lg border">{allocation.status === "active" ? <Pause size={15} /> : <Play size={15} />}</button></div>)}</Card>}{quotes.length > 0 && <Card className="p-4"><h3 className="text-sm font-black">Market pulse</h3><div className="mt-3 grid grid-cols-2 gap-2">{quotes.slice(0, 4).map((quote) => <div key={quote.id} className="rounded-xl bg-muted p-3"><p className="text-[11px] font-bold">{quote.symbol}</p><p className="mt-1 text-xs">{formatQuotePrice(quote.price)}</p><p className="text-[10px] text-primary">{formatPercent(quote.changePercent)}</p></div>)}</div></Card>}</div><BottomNav /></main>
}
