import React, { useState } from 'react';
import { X, RefreshCw, Calendar, CreditCard, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { DEFAULT_PACKAGES } from '../services/db';
import { getDaysRemaining } from '../utils/statusHelper';

export default function RenewMembershipModal({
  members = [],
  preselectedMember = null,
  onClose,
  onRenewMember
}) {
  const [selectedMemberId, setSelectedMemberId] = useState(preselectedMember?.id || members[0]?.id || '');
  const member = members.find(m => m.id === selectedMemberId) || members[0];

  const [packageId, setPackageId] = useState(DEFAULT_PACKAGES[0].id);
  const selectedPkg = DEFAULT_PACKAGES.find(p => p.id === packageId) || DEFAULT_PACKAGES[0];

  // Calculate default start date: if current membership hasn't expired yet, continue seamlessly from current expiry date
  const computeInitialStartDate = (m) => {
    if (!m?.expiryDate) return new Date().toISOString().split('T')[0];
    const days = getDaysRemaining(m.expiryDate);
    if (days !== null && days >= 0) {
      // Still active - start day after current expiry
      const d = new Date(m.expiryDate + 'T00:00:00');
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    }
    // Expired or invalid - start today
    return new Date().toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(() => computeInitialStartDate(member));

  const computeExpiryDate = (start, durationDays) => {
    try {
      const d = new Date(start + 'T00:00:00');
      d.setDate(d.getDate() + durationDays);
      return d.toISOString().split('T')[0];
    } catch {
      return start;
    }
  };

  const [expiryDate, setExpiryDate] = useState(() => computeExpiryDate(computeInitialStartDate(member), selectedPkg.durationDays));

  // Payment Options
  const [paymentOption, setPaymentOption] = useState('full'); // 'full' | 'partial' | 'unpaid'
  const [paidNow, setPaidNow] = useState(selectedPkg.price);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [utr, setUtr] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // When member changes
  const handleMemberChange = (id) => {
    setSelectedMemberId(id);
    const m = members.find(x => x.id === id);
    if (m) {
      const newStart = computeInitialStartDate(m);
      setStartDate(newStart);
      setExpiryDate(computeExpiryDate(newStart, selectedPkg.durationDays));
    }
    setErrorMessage('');
  };

  // When package changes
  const handlePackageChange = (id) => {
    setPackageId(id);
    const pkg = DEFAULT_PACKAGES.find(p => p.id === id) || DEFAULT_PACKAGES[0];
    setExpiryDate(computeExpiryDate(startDate, pkg.durationDays));
    if (paymentOption === 'full') {
      setPaidNow(pkg.price);
    } else if (paymentOption === 'partial' && paidNow > pkg.price) {
      setPaidNow(pkg.price);
    }
  };

  // When start date changes
  const handleStartDateChange = (date) => {
    setStartDate(date);
    setExpiryDate(computeExpiryDate(date, selectedPkg.durationDays));
  };

  // Handle payment option change
  const handlePaymentOptionChange = (opt) => {
    setPaymentOption(opt);
    if (opt === 'full') {
      setPaidNow(selectedPkg.price);
    } else if (opt === 'partial') {
      setPaidNow(Math.round(selectedPkg.price / 2));
    } else if (opt === 'unpaid') {
      setPaidNow(0);
    }
  };

  const existingPending = Number(member?.pendingAmount || 0);
  const numericPaidNow = Number(paidNow || 0);
  const newPlanFee = Number(selectedPkg.price);
  const calculatedNewPending = Math.max(0, existingPending + newPlanFee - numericPaidNow);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!member) {
      setErrorMessage('Please select a member to renew.');
      return;
    }

    if (paymentOption !== 'unpaid' && numericPaidNow <= 0) {
      setErrorMessage('Please enter an amount paid or select "Pay Later".');
      return;
    }

    if (numericPaidNow > (newPlanFee + existingPending)) {
      setErrorMessage(`Payment cannot exceed total due amount of ₹${(newPlanFee + existingPending).toLocaleString()}.`);
      return;
    }

    const renewalData = {
      memberId: member.id,
      memberName: member.name,
      packageId: selectedPkg.id,
      packageName: selectedPkg.name,
      startDate,
      expiryDate,
      renewalFee: newPlanFee,
      paidNow: numericPaidNow,
      paymentMode,
      utr: paymentMode === 'UPI' ? (utr.trim() || `UPI/${Date.now().toString().slice(-8)}`) : 'CASH-DESK',
      receiptId: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      paymentDate: new Date().toISOString().split('T')[0]
    };

    onRenewMember(renewalData);
  };

  if (!member) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="desktop-modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800' }}>No Members Available</h3>
          <p style={{ fontSize: '13px', color: '#64748B' }}>Please enroll a member first.</p>
          <button onClick={onClose} className="tap-btn btn-secondary" style={{ marginTop: '12px' }}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="desktop-modal-dialog"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '580px', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RefreshCw size={18} color="#2563EB" />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Renew Membership Plan
              </h3>
              <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0' }}>
                Extend subscription cycle and issue billing receipt
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

        {errorMessage && (
          <div style={{
            marginTop: '14px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#B91C1C',
            fontSize: '12.5px',
            fontWeight: '600'
          }}>
            <AlertCircle size={16} color="#DC2626" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>

          {/* Member Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Member
            </label>
            <select
              value={selectedMemberId}
              onChange={e => handleMemberChange(e.target.value)}
              className="desktop-input"
              style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #CBD5E1', padding: '0 10px', fontSize: '13px', background: '#FFFFFF', fontWeight: '600' }}
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.id}) · Current Expiry: {m.expiryDate || 'N/A'}
                </option>
              ))}
            </select>
          </div>

          {/* Member Summary Pill */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            fontSize: '12px'
          }}>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '10.5px', textTransform: 'uppercase', fontWeight: '700' }}>Current Plan</span>
              <strong style={{ color: '#0F172A', fontSize: '12.5px' }}>{member.packageName || 'Standard'}</strong>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '10.5px', textTransform: 'uppercase', fontWeight: '700' }}>Valid Until</span>
              <strong style={{ color: member.expiryDate ? '#2563EB' : '#64748B', fontSize: '12.5px' }}>{member.expiryDate || 'None'}</strong>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '10.5px', textTransform: 'uppercase', fontWeight: '700' }}>Existing Dues</span>
              <strong style={{ color: existingPending > 0 ? '#DC2626' : '#059669', fontSize: '12.5px' }}>
                ₹{existingPending.toLocaleString()}
              </strong>
            </div>
          </div>

          {/* Renewal Package Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
              Select Renewal Package
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {DEFAULT_PACKAGES.map(pkg => {
                const isSelected = pkg.id === packageId;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => handlePackageChange(pkg.id)}
                    className="tap-btn"
                    style={{
                      border: isSelected ? '2px solid #2563EB' : '1px solid #CBD5E1',
                      background: isSelected ? '#EFF6FF' : '#FFFFFF',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13px', color: isSelected ? '#1E40AF' : '#0F172A' }}>
                        {pkg.name}
                      </strong>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#2563EB' }}>
                        ₹{pkg.price.toLocaleString()}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', display: 'block' }}>
                      +{pkg.durationDays} days duration
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dates: Start & Computed Expiry */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Renewal Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => handleStartDateChange(e.target.value)}
                className="desktop-input"
                style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #CBD5E1', padding: '0 10px', fontSize: '13px' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                New Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                className="desktop-input"
                style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #CBD5E1', padding: '0 10px', fontSize: '13px', background: '#F8FAFC' }}
                required
              />
            </div>
          </div>

          {/* Payment Terms */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Payment Collection
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { id: 'full', label: `Full (₹${newPlanFee.toLocaleString()})` },
                { id: 'partial', label: 'Partial Amount' },
                { id: 'unpaid', label: 'Pay Later' }
              ].map(opt => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => handlePaymentOptionChange(opt.id)}
                  className="tap-btn"
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: paymentOption === opt.id ? '2px solid #2563EB' : '1px solid #CBD5E1',
                    background: paymentOption === opt.id ? '#EFF6FF' : '#FFFFFF',
                    color: paymentOption === opt.id ? '#1E40AF' : '#475569',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Paid Now (if not unpaid) */}
          {paymentOption !== 'unpaid' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Amount Paid Now (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  max={newPlanFee + existingPending}
                  value={paidNow}
                  onChange={e => setPaidNow(Math.max(0, Number(e.target.value)))}
                  className="desktop-input"
                  style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #CBD5E1', padding: '0 10px', fontSize: '14px', fontWeight: '700' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Payment Mode
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['UPI', 'Cash'].map(m => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setPaymentMode(m)}
                      className="tap-btn"
                      style={{
                        flex: 1,
                        height: '38px',
                        borderRadius: '8px',
                        border: paymentMode === m ? '2px solid #2563EB' : '1px solid #CBD5E1',
                        background: paymentMode === m ? '#EFF6FF' : '#FFFFFF',
                        color: paymentMode === m ? '#1E40AF' : '#475569',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {paymentOption !== 'unpaid' && paymentMode === 'UPI' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                UPI Reference / UTR Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 428198271029 or UPI Ref"
                value={utr}
                onChange={e => setUtr(e.target.value)}
                className="desktop-input"
                style={{ width: '100%', height: '36px', borderRadius: '8px', border: '1px solid #CBD5E1', padding: '0 10px', fontSize: '12.5px' }}
              />
            </div>
          )}

          {/* Renewal Financial Summary */}
          <div style={{
            background: calculatedNewPending > 0 ? '#FFFBEB' : '#ECFDF5',
            border: calculatedNewPending > 0 ? '1px solid #FDE68A' : '1px solid #A7F3D0',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '11px', color: '#475569', fontWeight: '600', display: 'block' }}>
                Total Renewal Cost: ₹{newPlanFee.toLocaleString()} {existingPending > 0 ? `(+ ₹${existingPending.toLocaleString()} existing dues)` : ''}
              </span>
              <strong style={{ fontSize: '13px', color: calculatedNewPending > 0 ? '#B45309' : '#047857' }}>
                {calculatedNewPending > 0 ? `Remaining Balance: ₹${calculatedNewPending.toLocaleString()}` : 'Full Renewal Paid in Advance'}
              </strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: '#64748B' }}>Extended to</span>
              <strong style={{ display: 'block', fontSize: '13px', color: '#2563EB' }}>{expiryDate}</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              type="submit"
              className="tap-btn btn-primary"
              style={{ flex: 1, padding: '11px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <RefreshCw size={16} />
              <span>Confirm & Activate Renewal</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="tap-btn btn-secondary"
              style={{ padding: '11px 18px', borderRadius: '8px', fontSize: '13px' }}
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
