"use client"

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { 
  Clock, 
  Copy, 
  ShieldAlert, 
  CheckCircle2, 
  Loader2, 
  MessageSquare,
  AlertCircle
} from 'lucide-react'
import { P2PTrade } from '@/types/p2p'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface ActiveTradeScreenProps {
  trade: P2PTrade
  onPaymentMarked: () => Promise<void>
  onCancel: () => Promise<void>
}

export function ActiveTradeScreen({ trade, onPaymentMarked, onCancel }: ActiveTradeScreenProps) {
  const { toast } = useToast()
  const [timeLeft, setTimeLeft] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const expiry = new Date(trade.escrow_timer_expires_at).getTime()
      const now = new Date().getTime()
      const diff = Math.max(0, Math.floor((expiry - now) / 1000))
      setTimeLeft(diff)
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [trade.escrow_timer_expires_at])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied!", description: `${label} saved to clipboard.` })
  }

  const handlePayment = async () => {
    setIsSubmitting(true)
    try {
      await onPaymentMarked()
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (trade.status === 'completed') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-500 rounded-[40px] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20 mb-8">
          <CheckCircle2 size={56} />
        </div>
        <h2 className="text-[32px] font-black italic tracking-tighter text-[#1A1A1A] mb-2">Trade Successful!</h2>
        <p className="text-gray-500 font-medium px-8 leading-relaxed max-w-xs">
          {Number(trade.trade_amount_asset).toFixed(6)} assets have been released to your wallet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between bg-white p-6 rounded-[32px] shadow-sm">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
            timeLeft < 300 ? "bg-red-50 text-red-500" : "bg-primary/10 text-primary"
          )}>
            <Clock size={20} className={cn(timeLeft < 300 && "animate-pulse")} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time Remaining</p>
            <p className={cn("text-xl font-black italic tabular-nums", timeLeft < 300 ? "text-red-500" : "text-[#1A1A1A]")}>
              {formatTime(timeLeft)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount to Pay</p>
          <p className="text-xl font-black italic text-primary">₦{Number(trade.trade_amount_fiat).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-amber-50 p-5 rounded-[28px] border border-amber-100 flex gap-4">
        <ShieldAlert size={24} className="text-amber-500 shrink-0 mt-1" />
        <p className="text-[12px] text-amber-700 leading-relaxed font-medium">
          <b>SECURITY:</b> Do NOT mention "Crypto" or "USDT" in your bank app memo. Use the reference code or leave it blank to avoid account freezes.
        </p>
      </div>

      <Card className="p-6 border-none bg-white rounded-[32px] shadow-sm space-y-5">
        <div className="flex items-center justify-between">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Seller Bank Details</h3>
           <Badge variant="outline" className="text-[10px] font-black uppercase text-blue-500">Verified Account</Badge>
        </div>
        
        <PaymentDetail 
          label="Bank Name" 
          value={trade.seller_bank_details?.bank_name || 'Moniepoint MFB'} 
          onCopy={(val) => handleCopy(val, 'Bank Name')} 
        />
        <PaymentDetail 
          label="Account Name" 
          value={trade.seller_bank_details?.account_name || 'NEX TRADING SOLUTIONS'} 
          onCopy={(val) => handleCopy(val, 'Account Name')} 
        />
        <PaymentDetail 
          label="Account Number" 
          value={trade.seller_bank_details?.account_number || '5051528892'} 
          onCopy={(val) => handleCopy(val, 'Account Number')} 
        />
        <PaymentDetail 
          label="Reference" 
          value={trade.id.slice(0, 8).toUpperCase()} 
          onCopy={(val) => handleCopy(val, 'Reference')} 
        />
      </Card>

      <div className="flex gap-3">
        <button 
          onClick={handlePayment}
          disabled={trade.status === 'payment_marked' || isSubmitting}
          className="flex-[2] py-5 bg-primary text-white font-bold rounded-[22px] shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : trade.status === 'payment_marked' ? 'Awaiting Release' : 'I Have Paid'}
        </button>
        <button 
          onClick={onCancel}
          className="flex-1 py-5 bg-gray-100 text-gray-500 font-bold rounded-[22px] active:scale-95 transition-all"
        >
          Cancel
        </button>
      </div>

      <button className="w-full py-4 flex items-center justify-center gap-2 text-primary font-bold text-xs uppercase tracking-widest bg-primary/5 rounded-2xl">
        <MessageSquare size={16} /> Contact Seller
      </button>
    </div>
  )
}

function PaymentDetail({ label, value, onCopy }: { label: string; value: string; onCopy: (val: string) => void }) {
  return (
    <div className="flex justify-between items-center group">
      <div>
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-[15px] font-black italic text-[#1A1A1A] tabular-nums">{value}</p>
      </div>
      <button 
        onClick={() => onCopy(value)}
        className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary transition-colors border border-gray-100"
      >
        <Copy size={16} />
      </button>
    </div>
  )
}

function Badge({ children, variant, className }: any) {
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full border text-[10px]",
      variant === 'outline' ? "border-blue-200 bg-blue-50 text-blue-600" : "",
      className
    )}>
      {children}
    </span>
  )
}
