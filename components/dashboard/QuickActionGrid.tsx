"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowDownCircle,
  Smartphone,
  Banknote,
  ScanLine,
  TrendingUp, 
  Users, 
  Repeat, 
  Wifi, 
  FileText, 
  Grid2x2
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Metadata-driven Quick Actions.
 * Architecture: UI consumes from a predefined schema.
 */
const ACTIONS = [
  { id: 'deposit', icon: <ArrowDownCircle size={22} />, label: "Fund", iconColor: "text-[#D86F68]", path: "/fund" },
  { id: 'send', icon: <Banknote size={21} />, label: "Send Money", iconColor: "text-[#D86F68]", path: "/send-money" },
  { id: 'receive', icon: <ArrowDownCircle size={21} />, label: "Receive", iconColor: "text-[#D86F68]", path: "/wallet-details" },
  { id: 'futures', icon: <TrendingUp size={20} />, label: "Futures", iconColor: "text-accent", path: "/futures" },
  { id: 'p2p-trading', icon: <Users size={20} />, label: "P2P Trading", iconColor: "text-[#D86F68]", path: "/finance/p2p" },
  { id: 'spot', icon: <Repeat size={20} />, label: "Spot Trading", iconColor: "text-accent", path: "/spot" },
  { id: 'data', icon: <Wifi size={22} />, label: "Buy Data", iconColor: "text-[#D86F68]", path: "/buy-data" },
  { id: 'airtime', icon: <Smartphone size={21} />, label: "Airtime", iconColor: "text-[#D86F68]", path: "/buy-airtime" },
  { id: 'scan', icon: <ScanLine size={21} />, label: "Scan & Pay", iconColor: "text-[#D86F68]", path: "/scan-pay" },
  { id: 'bills', icon: <FileText size={22} />, label: "Bills", iconColor: "text-[#D86F68]", path: "/pay-bills" },
  { id: 'withdraw', icon: <ArrowDownCircle size={21} />, label: "Withdraw", iconColor: "text-[#D86F68]", path: "/withdraw" },
  { id: 'p2p', icon: <Users size={20} />, label: "P2P", iconColor: "text-[#D86F68]", path: "/finance/p2p" },
  { id: 'more', icon: <Grid2x2 size={22} />, label: "More", iconColor: "text-[#D86F68]", path: "/actions-hub" },
]

export function QuickActionGrid() {
  const router = useRouter()

  return (
    <div className="mb-6 relative overflow-hidden select-none">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-[15px] sm:text-[17px] font-bold text-foreground tracking-tight">Quick Actions</h2>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-2.5 md:grid-cols-8">
        {ACTIONS.map((action) => (
          <button 
            key={action.id} 
            onClick={() => router.push(action.path)}
            className="flex min-w-0 flex-col items-center gap-2 rounded-[16px] border border-[#E5D8D5] bg-[#FFFDFB] px-1.5 py-3 shadow-[0_6px_20px_rgba(25,55,45,.045)] transition-all hover:border-[#BFD8D0] active:scale-[.985] group relative"
          >
            <div className={cn("transition-transform group-hover:scale-110", action.iconColor)}>
              {React.cloneElement(action.icon as React.ReactElement<Record<string, unknown>>, { 
                className: "h-[19px] w-[19px]" 
              })}
            </div>
            <span className="w-full px-0.5 text-center text-[9px] font-bold leading-[1.15] text-foreground">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
