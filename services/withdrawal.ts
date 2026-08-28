'use client'

import { createClient } from '@/lib/supabase/client'

export type WithdrawalDestination = 'bank' | 'nex' | 'card_refund' | 'mobile_money' | 'crypto'

export async function createWithdrawalRequest(input: {
  amount: number
  destinationType: WithdrawalDestination
  destination: string
  currency: string
  network?: string
  idempotencyKey?: string
  autopilot?: boolean
}) {
  if (!Number.isFinite(input.amount) || input.amount <= 0) throw new Error('Enter a valid amount.')
  if (!Number.isInteger(Math.round(input.amount * 100))) throw new Error('Amount must use valid currency precision.')
  if (input.destinationType === 'crypto' && !input.network) throw new Error('Select a crypto network.')
  if (!input.destination.trim()) throw new Error('Enter a withdrawal destination.')

  const supabase = createClient()
  const { data: auth } = await supabase.auth.getUser()
  const userId = auth.user?.id
  if (!userId) throw new Error('Not authenticated.')

  const { data, error } = await supabase
    .from('withdrawal_requests')
    .insert({
      user_id: userId,
      amount: input.amount,
      currency: input.currency,
      destination_type: input.destinationType,
      destination: input.destination.trim(),
      status: 'pending',
    })
    .select('id, status, created_at')
    .single()

  if (error) throw new Error(error.message)
  return data
}
