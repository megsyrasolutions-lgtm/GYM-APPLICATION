/**
 * Member Status & Expiry Computation Helper
 * Provides real-time dynamic status calculation grounded on dates and balances.
 */

export function getDaysRemaining(expiryDate) {
  if (!expiryDate) return null;
  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(todayStr + 'T00:00:00');
  const exp = new Date(expiryDate + 'T00:00:00');
  if (isNaN(exp.getTime())) return null;
  const diffTime = exp.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isMembershipExpired(member) {
  if (!member?.expiryDate) return false;
  const days = getDaysRemaining(member.expiryDate);
  return days !== null && days < 0;
}

export function isMembershipExpiringSoon(member, thresholdDays = 7) {
  if (!member?.expiryDate) return false;
  const days = getDaysRemaining(member.expiryDate);
  return days !== null && days >= 0 && days <= thresholdDays;
}

export function isPaymentOverdue(member) {
  return Number(member?.pendingAmount || 0) > 0;
}

export function getComputedMemberStatus(member) {
  if (!member) return 'Inactive';
  if (member.status === 'Inactive') return 'Inactive';

  // 1. Expired plan takes highest priority for access
  if (isMembershipExpired(member)) {
    return 'Expired';
  }

  // 2. Pending dues
  if (isPaymentOverdue(member)) {
    return 'Overdue';
  }

  // 3. Expiring within 7 days
  if (isMembershipExpiringSoon(member, 7)) {
    return 'Expiring';
  }

  return 'Active';
}

export function getStatusBadgeConfig(computedStatus) {
  switch (computedStatus) {
    case 'Active':
      return {
        label: 'Active (Paid)',
        bg: '#ECFDF5',
        color: '#047857',
        border: '#A7F3D0'
      };
    case 'Expiring':
      return {
        label: 'Expiring Soon',
        bg: '#FEF3C7',
        color: '#B45309',
        border: '#FDE68A'
      };
    case 'Expired':
      return {
        label: 'Plan Expired',
        bg: '#FEE2E2',
        color: '#B91C1C',
        border: '#FECACA'
      };
    case 'Overdue':
      return {
        label: 'Fee Due',
        bg: '#FFF0EB',
        color: '#EA580C',
        border: '#FFD7C7'
      };
    case 'Inactive':
    default:
      return {
        label: 'Inactive',
        bg: '#F3F4F6',
        color: '#4B5563',
        border: '#E5E7EB'
      };
  }
}
