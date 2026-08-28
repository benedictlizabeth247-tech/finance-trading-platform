
"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  MessageSquare, 
  Phone, 
  Mail, 
  FileText, 
  Search,
  ShieldCheck,
  Zap,
  CreditCard,
  UserCheck
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { BottomNav } from '@/components/layout/BottomNav'
import { NexLogo } from '@/components/ui/NexLogo'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FAQ_CATEGORIES = [
  {
    category: "Account & Security",
    icon: <ShieldCheck size={18} className="text-primary" />,
    items: [
      { 
        q: "How do I upgrade my account to nex Elite?", 
        a: "To upgrade to nex Elite, you simply need to maintain a minimum average balance of ₦500,000 for three consecutive months. Alternatively, you can complete the advanced KYC verification in your profile settings to unlock higher transaction limits immediately." 
      },
      { 
        q: "Is my money safe with nex Monie?", 
        a: "Absolutely. All deposits with nex Monie are fully insured by the Nigeria Deposit Insurance Corporation (NDIC) up to the maximum legal limit. Furthermore, we use bank-grade AES-256 encryption to protect your data and offer multi-factor authentication for every transaction." 
      },
      { 
        q: "What should I do if I lose my phone?", 
        a: "If your device is lost or stolen, please contact our emergency response line (+234 800 NEX HELP) immediately from another device. We can remotely de-authorize your session and lock your account within seconds to prevent unauthorized access." 
      }
    ]
  },
  {
    category: "Transactions & Fees",
    icon: <Zap size={18} className="text-accent" />,
    items: [
      { 
        q: "How long do transfers take to reach other banks?", 
        a: "Internal nex-to-nex transfers are always instant. Transfers to other Nigerian banks are processed via NIP and typically arrive within 30 seconds to 2 minutes. On rare occasions, banking network congestion may cause delays of up to 30 minutes." 
      },
      { 
        q: "What are the transaction fees?", 
        a: "We believe in transparency. All nex-to-nex transfers are 100% free. For transfers to other banks, nex Basic users pay ₦10 after the first 3 free transfers each month. nex Elite and Premium members enjoy unlimited free transfers." 
      }
    ]
  },
  {
    category: "Savings & NexVault",
    icon: <CreditCard size={18} className="text-emerald-500" />,
    items: [
      { 
        q: "How does NexVault work?", 
        a: "NexVault is our premium fixed-deposit feature. It allows you to lock away funds for a period of 3, 6, or 12 months. During this time, your money earns a highly competitive interest rate of up to 18.5% per annum, paid directly into your wallet upon maturity." 
      },
      { 
        q: "Can I withdraw from my savings early?", 
        a: "For regular daily savings, you can withdraw at any time for free. For NexVault (Fixed) accounts, early liquidation is possible but will result in a 25% forfeiture of the accrued interest to date. The principal amount always remains safe." 
      }
    ]
  }
]

export default function SupportPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen pb-32 bg-[#F8FAF9]">
      <header className="px-4 pt-6 pb-6 bg-white sticky top-0 z-20 border-b border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-primary hover:bg-gray-50 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <NexLogo />
          <div className="w-10" />
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
          <Input 
            placeholder="Search for topics, guides or help..." 
            className="pl-12 h-14 rounded-2xl bg-gray-50 border-none shadow-inner text-[15px] focus-visible:ring-1 focus-visible:ring-primary/20" 
          />
        </div>
      </header>

      <div className="px-4 py-8">
        <div className="mb-10 text-center px-4">
          <h1 className="text-[28px] font-bold text-[#1A1A1A] mb-2 leading-tight">Help Center</h1>
          <p className="text-gray-500 text-[15px] font-medium leading-relaxed">
            Our expert support team is available 24/7 to assist you with any inquiries or issues.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <ContactCard 
            icon={<MessageSquare className="text-primary" />} 
            title="Live Chat" 
            subtitle="Wait: ~2 mins" 
          />
          <ContactCard 
            icon={<Phone className="text-accent" />} 
            title="Call Us" 
            subtitle="Toll-free 24/7" 
          />
          <ContactCard 
            icon={<Mail className="text-blue-500" />} 
            title="Email Support" 
            subtitle="Staff sign-in" 
            onClick={() => router.push('/auth/login?redirectedFrom=%2Fsupport')} 
          />
          <ContactCard 
            icon={<FileText className="text-emerald-500" />} 
            title="My Tickets" 
            subtitle="View history" 
          />
        </div>

        <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
          Frequently Asked Questions
        </h2>

        <div className="space-y-8">
          {FAQ_CATEGORIES.map((cat, catIdx) => (
            <div key={catIdx} className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                {cat.icon}
                <h3 className="text-[14px] font-bold text-gray-500 uppercase tracking-widest">{cat.category}</h3>
              </div>
              
              <Card className="border-none shadow-soft rounded-[24px] bg-white overflow-hidden">
                <Accordion type="single" collapsible className="w-full">
                  {cat.items.map((item, i) => (
                    <AccordionItem key={i} value={`item-${catIdx}-${i}`} className="border-gray-50 px-5 last:border-0">
                      <AccordionTrigger className="text-[15px] font-bold text-left hover:no-underline hover:text-primary transition-colors py-5">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-[14px] leading-relaxed text-gray-500 pb-5">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-primary/5 rounded-[32px] border border-primary/10 text-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="text-white" size={24} />
          </div>
          <h3 className="text-[18px] font-bold text-primary mb-2">Still need help?</h3>
          <p className="text-gray-500 text-[14px] mb-6 px-4">
            If you couldn't find what you were looking for, our community and agents are always ready.
          </p>
          <button className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all">
            Start a Conversation
          </button>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}

function ContactCard({ icon, title, subtitle, onClick }: { icon: React.ReactNode, title: string, subtitle: string, onClick?: () => void }) {
  return (
    <Card onClick={onClick} onKeyDown={(event) => { if (onClick && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onClick() } }} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} className="p-5 border-none shadow-soft rounded-[24px] bg-white flex flex-col items-center text-center gap-3 active:scale-95 hover:shadow-md transition-all cursor-pointer">
      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
        {React.cloneElement(icon as React.ReactElement<Record<string, unknown>>, { size: 24 })}
      </div>
      <div>
        <h3 className="text-[14px] font-bold text-[#1A1A1A] mb-0.5">{title}</h3>
        <p className="text-[11px] text-gray-400 font-medium">{subtitle}</p>
      </div>
    </Card>
  )
}
