// Partner services for ParkSpace

import { supabase } from './supabase';
import { getCommissionRate, calculateCommission } from '../constants/pricing';

// ── Validate Referral Code ──────────────────────────────
export async function validateReferralCode(code: string): Promise<{
  valid: boolean;
  partnerName?: string;
  partnerId?: string;
  error?: string;
}> {
  if (!code || code.length < 6) return { valid: false, error: 'Code too short' };

  const { data, error } = await supabase
    .from('partners')
    .select('id, full_name, status, commission_rate')
    .eq('referral_code', code.toUpperCase())
    .single();

  if (error || !data) return { valid: false, error: 'Invalid referral code' };
  if (data.status !== 'active') return { valid: false, error: 'Partner code is inactive' };

  return { valid: true, partnerName: data.full_name, partnerId: data.id };
}

// ── Record Commission ──────────────────────────────────
export async function recordCommission(
  sessionId: string,
  partnerId: string,
  saleAmount: number,
  durationKey: string
) {
  const rate = getCommissionRate(durationKey);
  const commissionAmount = calculateCommission(saleAmount, rate);

  const { data: commission } = await supabase
    .from('commission_transactions')
    .insert({
      partner_id:         partnerId,
      parking_session_id: sessionId,
      sale_amount:        saleAmount,
      commission_rate:    rate,
      commission_amount:  commissionAmount,
      status:             'pending',
    })
    .select()
    .single();

  await supabase.rpc('increment_partner_balance', {
    p_partner_id: partnerId,
    p_amount:     commissionAmount,
  });

  return commission;
}

// ── Register New Partner ──────────────────────────────────
export async function registerPartner(params: {
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  referralCode: string;
  upiId?: string;
  bankName?: string;
  bankAccountNo?: string;
  bankIfsc?: string;
}) {
  const { data, error } = await supabase
    .from('partners')
    .insert({
      user_id:        params.userId,
      full_name:      params.fullName,
      phone:          params.phone,
      email:          params.email,
      referral_code:  params.referralCode,
      upi_id:         params.upiId || null,
      bank_name:      params.bankName || null,
      bank_account_no: params.bankAccountNo || null,
      bank_ifsc:       params.bankIfsc || null,
      status:         'pending',
    })
    .select()
    .single();

  if (error) throw error;

  // Set role to partner
  await supabase
    .from('user_roles')
    .upsert({ user_id: params.userId, role: 'partner' });

  return data;
}

// ── Get Partner Profile ──────────────────────────────────
export async function getPartnerProfile(userId: string) {
  const { data } = await supabase
    .from('partners')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data;
}

// ── Get Partner Commissions ──────────────────────────────
export async function getPartnerCommissions(partnerId: string) {
  const { data } = await supabase
    .from('commission_transactions')
    .select('*')
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false });
  return data || [];
}

// ── Get Partner Payouts ──────────────────────────────────
export async function getPartnerPayouts(partnerId: string) {
  const { data } = await supabase
    .from('payout_requests')
    .select('*')
    .eq('partner_id', partnerId)
    .order('requested_at', { ascending: false });
  return data || [];
}

// ── Request Payout ──────────────────────────────────────
export async function requestPayout(params: {
  partnerId: string;
  amount: number;
  method: 'upi' | 'bank_transfer';
  upiId?: string;
  bankAccountNo?: string;
  bankIfsc?: string;
}) {
  const { data, error } = await supabase
    .from('payout_requests')
    .insert({
      partner_id:     params.partnerId,
      amount:         params.amount,
      method:         params.method,
      upi_id:         params.upiId || null,
      bank_account_no: params.bankAccountNo || null,
      bank_ifsc:       params.bankIfsc || null,
      status:         'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── ADMIN: Get All Partners ───────────────────────────────
export async function getAllPartners() {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// ── ADMIN: Update Partner Status ─────────────────────────
export async function updatePartnerStatus(partnerId: string, status: 'approved' | 'rejected' | 'pending' | 'active') {
  const { data, error } = await supabase
    .from('partners')
    .update({ status })
    .eq('id', partnerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
