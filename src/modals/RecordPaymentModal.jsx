import React, { useState, useEffect } from 'react';
import { X, CreditCard, Check, AlertCircle, AlertTriangle, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function RecordPaymentModal({ members = [], preselectedMember = null, onClose, onRecordPayment }) {
  const [selectedMemberId, setSelectedMemberId] = useState(preselectedMember?.id || members[0]?.id || '');
  const member = members.find(m => m.id === selectedMemberId) || members[0];

  const pendingAmount = Number(member?.pendingAmount || 0);
  const totalFee = Number(member?.totalFee || 0);
  const paidAmount = Number(member?.paidAmount || 0);
  const isFullyPaid = member ? (pendingAmount <= 0 && (totalFee > 0 || paidAmount > 0)) : false;

  const [amount, setAmount] = useState(() => {
    if (isFullyPaid) return 0;
    return pendingAmount > 0 ? pendingAmount : (totalFee || 2000);
  });
  const [mode, setMode] = useState('UPI');
  const [utr, setUtr] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [errorMessage, setErrorMessage] = useState('');

  // When selected member changes, update default amount and clear errors
  const handleMemberChange = (id) => {
    setSelectedMemberId(id);
    setErrorMessage('');
    const m = members.find(x => x.id === id);
    if (m) {
      const mPending = Number(m.pendingAmount || 0);
      const mTotal = Number(m.totalFee || 0);
      const mPaid = Number(m.paidAmount || 0);
      const mFullyPaid = mPending <= 0 && (mTotal > 0 || mPaid > 0);
      setAmount(mFullyPaid ? 0 : (mPending > 0 ? mPending : (mTotal || 2000)));
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isFutureDated = paymentDate > todayStr;

  // Selected Billing Month (e.g. "2026-10")
  const selectedBillingMonth = paymentDate ? paymentDate.slice(0, 7) : todayStr.slice(0, 7);
  const monthName = paymentDate ? new Date(paymentDate + 'T00:00:00').toLocaleString('default', { month: 'long', year: 'numeric' }) : '';

  // Check for duplicate monthly payment for this member
  // (if this member has already paid their fee for this month)
  const duplicateMonthPayment = member && Array.isArray(member.paymentHistory)
    ? member.paymentHistory.find(p => {
        if (!p.date) return false;
        const pMonth = p.date.slice(0, 7);
        return pMonth === selectedBillingMonth && (p.status === 'Success' || !p.status);
      })
    : null;

  // Calculations
  const numericAmount = Number(amount || 0);
  const calculatedPending = Math.max(0, pendingAmount - numericAmount);
  const paymentPercentage = totalFee > 0 ? Math.min(100, Math.round(((paidAmount + (isFullyPaid ? 0 : numericAmount)) / totalFee) * 100)) : 100;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Requirement 9: Prevent additional payments after full payment
    if (isFullyPaid) {
      setErrorMessage(`This bill has been fully paid (₹${totalFee.toLocaleString()}). No additional payments can be recorded.`);
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setErrorMessage('Please enter a valid payment amount greater than ₹0.');
      return;
    }

    // Amount cannot exceed pending amount
    if (pendingAmount > 0 && numericAmount > pendingAmount) {
      setErrorMessage(`Payment amount cannot exceed the pending balance of ₹${pendingAmount.toLocaleString()}.`);
      return;
    }

    // Requirement 3: Duplicate monthly payment detection
    if (duplicateMonthPayment) {
      setErrorMessage(
        `Duplicate Payment Detected: A fee payment for ${monthName} has already been recorded for ${member.name} on ${duplicateMonthPayment.date} (Receipt #${duplicateMonthPayment.receiptId}). Duplicate payments for the same month are not allowed.`
      );
      return;
    }

    const paymentRecord = {
      memberId: member.id,
      memberName: member.name,
      amount: numericAmount,
      mode,
      utr: mode === 'UPI' ? (utr.trim() || `UPI/${Date.now().toString().slice(-8)}`) : 'CASH-DESK',
      date: paymentDate,
      billingMonth: selectedBillingMonth,
      package: member.packageName,
      receiptId: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      isFutureDated,
      status: isFutureDated ? 'Scheduled' : 'Success'
    };

    onRecordPayment(paymentRecord);
  };

  if (!member) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="desktop-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800' }}>No Members Enrolled</h3>
          <p style={{ fontSize: '13px', color: '#64748B' }}>Please enroll a member before recording fee payments.</p>
          <button onClick={onClose} className="tap-btn btn-secondary" style={{ marginTop: '12px' }}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="desktop-modal-dialog" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={18} color="#2563EB" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Record Fee Payment
              </h3>
              <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0' }}>
                Desk collection & billing verification
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="tap-btn"
            style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={16} color="#64748B" />
          </button>
        </div>

        {/* Global Error Notice */}
        {errorMessage && (
          <div style={{
            background: '#FEF2F2',
            border: '1.5px solid #FCA5A5',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            color: '#B91C1C',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Requirement 9 Banner: Prevent additional payments after full payment */}
        {isFullyPaid && (
          <div style={{
            background: '#F0FDF4',
            border: '1.5px solid #86EFAC',
            borderRadius: '8px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#166534'
          }}>
            <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '13px', fontWeight: '800', margin: 0 }}>
                Bill Fully Settled (₹{totalFee.toLocaleString()})
              </p>
              <p style={{ fontSize: '11.5px', margin: '2px 0 0', opacity: 0.9 }}>
                This member has completed 100% of the membership fee. No additional payments can be added to this bill.
              </p>
            </div>
          </div>
        )}

        {/* Requirement 3 Banner: Duplicate Monthly Payment Warning */}
        {!isFullyPaid && duplicateMonthPayment && (
          <div style={{
            background: '#FFFBEB',
            border: '1.5px solid #FCD34D',
            borderRadius: '8px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            color: '#92400E'
          }}>
            <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '13px', fontWeight: '800', margin: 0 }}>
                Duplicate Monthly Payment Alert
              </p>
              <p style={{ fontSize: '11.5px', margin: '3px 0 0', lineHeight: '1.4' }}>
                A fee payment for <strong>{monthName}</strong> was already completed for {member.name} on {duplicateMonthPayment.date} (Receipt #{duplicateMonthPayment.receiptId}, ₹{duplicateMonthPayment.amount.toLocaleString()}). To prevent duplicate billing for the same month, this payment is blocked.
              </p>
            </div>
          </div>
        )}

        {/* Requirement 8 Banner: Future Payment Identification */}
        {!isFullyPaid && !duplicateMonthPayment && isFutureDated && (
          <div style={{
            background: '#EFF6FF',
            border: '1.5px solid #BFDBFE',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#1E40AF'
          }}>
            <Calendar size={18} color="#2563EB" style={{ flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '12.5px', fontWeight: '800', margin: 0 }}>
                Future-Dated Payment Scheduled
              </p>
              <p style={{ fontSize: '11px', margin: '2px 0 0', color: '#1D4ED8' }}>
                Scheduled for {paymentDate}. The system will generate a Future Payment Bill / Voucher that takes effect on this date.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Member Picker */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
              Select Member Account
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => handleMemberChange(e.target.value)}
              className="form-input"
              style={{ fontWeight: '600' }}
            >
              {members.map(m => {
                const mPending = Number(m.pendingAmount || 0);
                const mTotal = Number(m.totalFee || 0);
                const isPaid = mPending <= 0 && mTotal > 0;
                return (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.id}) {isPaid ? '— ✓ Fully Paid' : `— Pending Due: ₹${mPending}`}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Member Financial Overview Card (Requirement 10: Accurate Calculations) */}
          <div style={{
            background: '#F8FAFC',
            padding: '12px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            textAlign: 'center'
          }}>
            <div style={{ borderRight: '1px solid #E2E8F0', paddingRight: '6px' }}>
              <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Package Fee</span>
              <p style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', margin: '3px 0 0' }}>₹{totalFee.toLocaleString()}</p>
            </div>
            <div style={{ borderRight: '1px solid #E2E8F0', paddingRight: '6px' }}>
              <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Amount Paid</span>
              <p style={{ fontSize: '13px', fontWeight: '800', color: '#059669', margin: '3px 0 0' }}>₹{paidAmount.toLocaleString()}</p>
            </div>
            <div style={{ borderRight: '1px solid #E2E8F0', paddingRight: '6px' }}>
              <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Pending Due</span>
              <p style={{ fontSize: '13px', fontWeight: '800', color: pendingAmount > 0 ? '#DC2626' : '#059669', margin: '3px 0 0' }}>
                {pendingAmount > 0 ? `₹${pendingAmount.toLocaleString()}` : 'Cleared'}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Paid Ratio</span>
              <p style={{ fontSize: '13px', fontWeight: '800', color: '#2563EB', margin: '3px 0 0' }}>
                {totalFee > 0 ? Math.min(100, Math.round((paidAmount / totalFee) * 100)) : 100}%
              </p>
            </div>
          </div>

          {/* Amount & Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                  Amount to Collect (₹) *
                </label>
                {pendingAmount > 0 && (
                  <span style={{ fontSize: '10.5px', color: '#64748B' }}>
                    Max: ₹{pendingAmount.toLocaleString()}
                  </span>
                )}
              </div>
              <input 
                type="number"
                required
                disabled={isFullyPaid || !!duplicateMonthPayment}
                max={pendingAmount > 0 ? pendingAmount : totalFee}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrorMessage('');
                }}
                className="form-input"
                style={{
                  fontSize: '15px',
                  fontWeight: '800',
                  color: isFullyPaid ? '#94A3B8' : '#059669',
                  background: (isFullyPaid || !!duplicateMonthPayment) ? '#F1F5F9' : '#FFFFFF',
                  cursor: (isFullyPaid || !!duplicateMonthPayment) ? 'not-allowed' : 'text'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Payment Date
              </label>
              <input 
                type="date"
                disabled={isFullyPaid}
                value={paymentDate}
                onChange={(e) => {
                  setPaymentDate(e.target.value);
                  setErrorMessage('');
                }}
                className="form-input"
                style={{
                  cursor: isFullyPaid ? 'not-allowed' : 'default',
                  background: isFullyPaid ? '#F1F5F9' : '#FFFFFF'
                }}
              />
            </div>
          </div>

          {/* Payment Mode */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
              Payment Mode
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {['UPI', 'Cash'].map(m => (
                <div 
                  key={m}
                  onClick={() => {
                    if (!isFullyPaid && !duplicateMonthPayment) setMode(m);
                  }}
                  className="tap-btn"
                  style={{
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1.5px solid',
                    borderColor: mode === m ? '#2563EB' : 'var(--border-color)',
                    background: mode === m ? '#EFF6FF' : '#FFFFFF',
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: '13px',
                    color: mode === m ? '#1D4ED8' : '#334155',
                    cursor: (isFullyPaid || !!duplicateMonthPayment) ? 'not-allowed' : 'pointer',
                    opacity: (isFullyPaid || !!duplicateMonthPayment) ? 0.6 : 1
                  }}
                >
                  {m === 'UPI' ? '⚡ UPI / Online' : '💵 Cash Desk'}
                </div>
              ))}
            </div>
          </div>

          {/* UTR reference if UPI */}
          {mode === 'UPI' && (
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                UPI Transaction / UTR Number (Optional)
              </label>
              <input 
                type="text"
                disabled={isFullyPaid || !!duplicateMonthPayment}
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="e.g. UPI/610428910471"
                className="form-input"
                style={{
                  cursor: (isFullyPaid || !!duplicateMonthPayment) ? 'not-allowed' : 'text',
                  background: (isFullyPaid || !!duplicateMonthPayment) ? '#F1F5F9' : '#FFFFFF'
                }}
              />
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', paddingTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              className="tap-btn btn-secondary"
              style={{ flex: 1, padding: '10px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isFullyPaid || !!duplicateMonthPayment}
              className="tap-btn btn-primary"
              style={{
                flex: 1.5,
                padding: '10px',
                opacity: (isFullyPaid || !!duplicateMonthPayment) ? 0.5 : 1,
                cursor: (isFullyPaid || !!duplicateMonthPayment) ? 'not-allowed' : 'pointer'
              }}
            >
              {isFullyPaid 
                ? 'Bill Fully Paid' 
                : (duplicateMonthPayment 
                    ? 'Duplicate Payment Blocked' 
                    : (isFutureDated ? 'Schedule Future Bill' : 'Confirm Fee Collection'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
