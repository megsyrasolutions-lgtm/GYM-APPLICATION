import { supabase, isSupabaseConfigured } from './supabase';
import { saveLocalDatabase } from './db';

const SYNC_TIMESTAMP_KEY = 'bodylife_last_synced_at';

export function getLastSyncTime() {
  try {
    return localStorage.getItem(SYNC_TIMESTAMP_KEY) || null;
  } catch {
    return null;
  }
}

export function setLastSyncTime(timestamp = new Date().toISOString()) {
  try {
    localStorage.setItem(SYNC_TIMESTAMP_KEY, timestamp);
  } catch (err) {
    console.error('Failed to save sync timestamp:', err);
  }
}

/**
 * Format React member object into Supabase PostgreSQL schema
 */
export function formatMemberForSupabase(m) {
  return {
    id: String(m.id || ''),
    name: String(m.name || ''),
    phone: String(m.phone || ''),
    email: m.email || null,
    gender: m.gender || null,
    age: Number(m.age) || 0,
    package_id: m.packageId || null,
    package_name: m.packageName || null,
    total_fee: Number(m.totalFee) || 0,
    paid_amount: Number(m.paidAmount) || 0,
    pending_amount: Number(m.pendingAmount) || 0,
    start_date: m.startDate || null,
    expiry_date: m.expiryDate || null,
    status: m.status || 'Active',
    locker_number: m.lockerNumber || null,
    photo: m.photo || null,
    updated_at: new Date().toISOString()
  };
}

/**
 * Format payment entry into Supabase PostgreSQL schema
 */
export function formatPaymentForSupabase(p, memberId) {
  return {
    receipt_id: String(p.receiptId || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`),
    member_id: String(memberId),
    amount: Number(p.amount) || 0,
    payment_mode: String(p.mode || 'Cash'),
    utr: p.utr || null,
    payment_date: p.date || new Date().toISOString().split('T')[0],
    package_name: p.package || null,
    status: p.status || 'Success',
    is_future_dated: Boolean(p.isFutureDated),
    billing_month: p.billingMonth || null
  };
}

/**
 * Format Supabase records back into application local member structure
 */
export function formatMemberFromSupabase(dbMember, payments = []) {
  const memberPayments = payments
    .filter(p => p.member_id === dbMember.id)
    .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
    .map(p => ({
      receiptId: p.receipt_id,
      date: p.payment_date,
      amount: Number(p.amount) || 0,
      mode: p.payment_mode || 'Cash',
      utr: p.utr || '',
      package: p.package_name || '',
      status: p.status || 'Success',
      isFutureDated: Boolean(p.is_future_dated),
      billingMonth: p.billing_month || ''
    }));

  return {
    id: dbMember.id,
    name: dbMember.name,
    phone: dbMember.phone,
    email: dbMember.email || '',
    gender: dbMember.gender || '',
    age: dbMember.age || 0,
    packageId: dbMember.package_id || '',
    packageName: dbMember.package_name || '',
    totalFee: Number(dbMember.total_fee) || 0,
    paidAmount: Number(dbMember.paid_amount) || 0,
    pendingAmount: Number(dbMember.pending_amount) || 0,
    startDate: dbMember.start_date || '',
    expiryDate: dbMember.expiry_date || '',
    status: dbMember.status || 'Active',
    lockerNumber: dbMember.locker_number || '',
    photo: dbMember.photo || null,
    paymentHistory: memberPayments
  };
}

/**
 * Push all local members & payments to Supabase via batch upsert
 */
export async function pushLocalToSupabase(members = []) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  if (!navigator.onLine) {
    throw new Error('Network is offline. Changes saved locally.');
  }

  if (members.length === 0) {
    return { membersCount: 0, paymentsCount: 0 };
  }

  // 1. Prepare members batch
  const membersPayload = members.map(formatMemberForSupabase);

  const { error: memberError } = await supabase
    .from('members')
    .upsert(membersPayload, { onConflict: 'id' });

  if (memberError) {
    console.error('Supabase members upsert error:', memberError);
    throw memberError;
  }

  // 2. Prepare payments batch
  const allPayments = [];
  members.forEach(m => {
    if (Array.isArray(m.paymentHistory)) {
      m.paymentHistory.forEach(p => {
        allPayments.push(formatPaymentForSupabase(p, m.id));
      });
    }
  });

  if (allPayments.length > 0) {
    const { error: paymentError } = await supabase
      .from('payments')
      .upsert(allPayments, { onConflict: 'receipt_id' });

    if (paymentError) {
      console.error('Supabase payments upsert error:', paymentError);
      throw paymentError;
    }
  }

  const now = new Date().toISOString();
  setLastSyncTime(now);

  return {
    membersCount: membersPayload.length,
    paymentsCount: allPayments.length,
    syncedAt: now
  };
}

/**
 * Pull all data from Supabase and merge with local members
 */
export async function pullFromSupabase(localMembers = []) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  if (!navigator.onLine) {
    throw new Error('Network is offline.');
  }

  const [membersRes, paymentsRes] = await Promise.all([
    supabase.from('members').select('*'),
    supabase.from('payments').select('*')
  ]);

  if (membersRes.error) throw membersRes.error;
  if (paymentsRes.error) throw paymentsRes.error;

  const remoteMembers = membersRes.data || [];
  const remotePayments = paymentsRes.data || [];

  if (remoteMembers.length === 0) {
    return localMembers;
  }

  // Map remote records to application objects
  const remoteFormatted = remoteMembers.map(m => formatMemberFromSupabase(m, remotePayments));

  // Merge Strategy:
  // Build a map keyed by Member ID.
  const memberMap = new Map();

  // First place remote members
  remoteFormatted.forEach(rm => {
    memberMap.set(rm.id, rm);
  });

  // Local members take priority for recently edited fields if present
  localMembers.forEach(lm => {
    if (!memberMap.has(lm.id)) {
      memberMap.set(lm.id, lm);
    } else {
      // Merge payment history uniquely by receiptId
      const existing = memberMap.get(lm.id);
      const combinedPaymentsMap = new Map();
      (existing.paymentHistory || []).forEach(p => combinedPaymentsMap.set(p.receiptId, p));
      (lm.paymentHistory || []).forEach(p => combinedPaymentsMap.set(p.receiptId, p));
      
      const mergedPayments = Array.from(combinedPaymentsMap.values())
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      memberMap.set(lm.id, {
        ...existing,
        ...lm,
        paymentHistory: mergedPayments
      });
    }
  });

  const mergedList = Array.from(memberMap.values());
  saveLocalDatabase(mergedList);
  setLastSyncTime(new Date().toISOString());

  return mergedList;
}

/**
 * Full Hybrid Two-Way Sync
 * 1. Pushes local records to Supabase.
 * 2. Pulls any cloud updates into local storage.
 */
export async function performHybridSync(localMembers = []) {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      status: 'unconfigured',
      message: 'Supabase credentials missing.',
      members: localMembers
    };
  }

  if (!navigator.onLine) {
    return {
      success: false,
      status: 'offline',
      message: 'Working offline. Changes are saved safely on this computer.',
      members: localMembers
    };
  }

  try {
    // If local has members, push them first to ensure cloud has them
    if (localMembers.length > 0) {
      await pushLocalToSupabase(localMembers);
    }

    // Then pull any additional records from Supabase
    const mergedMembers = await pullFromSupabase(localMembers);

    return {
      success: true,
      status: 'synced',
      message: 'Cloud database synchronized successfully.',
      members: mergedMembers,
      lastSyncedAt: new Date().toISOString()
    };
  } catch (err) {
    console.error('Hybrid sync error:', err);
    return {
      success: false,
      status: 'error',
      message: err.message || 'Sync failed. Local data remains safe.',
      members: localMembers
    };
  }
}
