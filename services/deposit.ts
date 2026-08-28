
'use client';

import { supabase } from '@/lib/supabase';

/**
 * @fileOverview Service layer for managing deposit sessions and requests.
 * Backed by Supabase (app_config for the active collection account, deposits for requests).
 */

export interface DepositSession {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  expiryTime: Date;
  status: 'active' | 'expired';
}

export interface DepositRequestInput {
  userId: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  senderBank: string;
  reference?: string;
  screenshotUrl?: string | null;
  expiryTime: Date;
}

/**
 * Fetches the currently active collection account and session details.
 */
export async function getDepositSession(): Promise<DepositSession> {
  const { data: config, error: configError } = await supabase
    .from('app_config')
    .select('*')
    .eq('id', 'bank_details')
    .single();
  if (configError || !config?.bankName || !config?.accountNumber || !config?.accountName) {
    throw new Error('Fiat funding account is not configured. Configure app_config.bank_details before accepting deposits.');
  }

  const now = new Date();
  const fifteenMinutesLater = new Date(now.getTime() + 15 * 60 * 1000);

  return {
    id: crypto.randomUUID(),
    bankName: config.bankName,
    accountNumber: config.accountNumber,
    accountName: config.accountName,
    expiryTime: fifteenMinutesLater,
    status: 'active',
  };
}

/**
 * Submits a deposit confirmation request to Supabase.
 */
export async function submitDepositRequest(input: DepositRequestInput): Promise<{ success: boolean; referenceId: string }> {
  const referenceId = 'DEP-' + Math.random().toString(36).substring(2, 10).toUpperCase();

  const { error } = await supabase.from('deposits').insert({
    user_id: input.userId,
    bank_name: input.bankName,
    account_number: input.accountNumber,
    account_name: input.accountName,
    amount: input.amount,
    sender_bank: input.senderBank,
    reference: input.reference || referenceId,
    screenshot_url: input.screenshotUrl || null,
    status: 'pending',
    expiry_time: input.expiryTime.toISOString(),
  });

  if (error) {
    return { success: false, referenceId: '' };
  }

  return {
    success: true,
    referenceId,
  };
}
