import React from 'react';
import bodylifeLogo from '../assets/bodylife_logo.png';
import { X, ShieldCheck, Share2, Printer, CheckCircle2, Calendar, Clock } from 'lucide-react';

export default function DigitalReceiptModal({ receipt, onClose, onShareWhatsApp }) {
  if (!receipt) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const isFutureDated = receipt.isFutureDated || receipt.status === 'Scheduled' || (receipt.date && receipt.date > todayStr);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="desktop-modal-dialog" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: isFutureDated ? '#FFFBEB' : '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isFutureDated ? (
                <Clock size={18} color="#D97706" />
              ) : (
                <ShieldCheck size={18} color="#2563EB" />
              )}
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                {isFutureDated ? 'Future Payment Bill / Voucher' : 'Digital Payment Receipt'}
              </h3>
              <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>
                {isFutureDated ? 'Official Advance Scheduled Billing' : 'Official Electronic Voucher'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="tap-btn"
            style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} color="#64748B" />
          </button>
        </div>

        {/* Official Gym Tax Invoice / Fee Bill Card */}
        <div 
          id="printable-voucher"
          className="printable-voucher-card"
          style={{ 
            background: '#FFFFFF', 
            borderRadius: '12px', 
            border: '1px solid #CBD5E1', 
            padding: '24px', 
            position: 'relative',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }}
        >
          {/* Top Brand & Invoice Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: '2px solid #0F172A', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img 
                src={bodylifeLogo} 
                alt="BodyLife" 
                onError={(e) => { e.currentTarget.src = './bodylife_logo.png'; }}
                style={{ width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #E2E8F0', padding: '2px' }} 
              />
              <div>
                <h3 style={{ fontSize: '19px', fontWeight: '900', color: '#0F172A', margin: 0, letterSpacing: '0.8px', lineHeight: 1.1 }}>
                  BODYLIFE FITNESS CLUB
                </h3>
                <p style={{ fontSize: '11px', color: '#2563EB', fontWeight: '800', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Official Membership Fee Invoice & Tax Bill
                </p>
                <p style={{ fontSize: '10.5px', color: '#64748B', margin: '2px 0 0' }}>
                  Reception Billing Desk · Ph: +91 93445 31196 · Reg: BL-FIT-2026
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{
                display: 'inline-block',
                fontSize: '11px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '3px 10px',
                borderRadius: '6px',
                background: isFutureDated ? '#FFFBEB' : '#ECFDF5',
                color: isFutureDated ? '#B45309' : '#047857',
                border: `1px solid ${isFutureDated ? '#FCD34D' : '#A7F3D0'}`
              }}>
                {isFutureDated ? 'Scheduled Advance Bill' : 'Official Paid Bill'}
              </span>
              <div style={{ fontSize: '13px', fontWeight: '800', fontFamily: 'monospace', color: '#0F172A', marginTop: '4px' }}>
                {receipt.receiptId}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                Date: {receipt.date || todayStr}
              </div>
            </div>
          </div>

          {/* Member & Payment Metadata Boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '14px 0', borderBottom: '1px solid #E2E8F0' }}>
            <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
                Billed To (Member)
              </span>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>
                {receipt.memberName || 'Client'}
              </div>
              <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px', display: 'flex', gap: '10px' }}>
                <span>ID: <strong style={{ fontFamily: 'monospace', color: '#2563EB' }}>{receipt.memberId || 'BL-1001'}</strong></span>
                {receipt.phone && <span>Ph: {receipt.phone}</span>}
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
                Payment Summary
              </span>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#334155' }}>
                <span>Mode:</span>
                <strong style={{ color: '#0F172A' }}>{receipt.mode || 'Cash'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                <span>Ref / UTR:</span>
                <strong style={{ fontFamily: 'monospace' }}>{receipt.utr || 'CASH-DESK'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                <span>Status:</span>
                <strong style={{ color: isFutureDated ? '#B45309' : '#16A34A' }}>
                  {isFutureDated ? 'Scheduled Bill' : 'Verified & Received'}
                </strong>
              </div>
            </div>
          </div>

          {/* Itemized Invoice Table */}
          <div style={{ padding: '12px 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #CBD5E1' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '800', color: '#334155', width: '30px' }}>#</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '800', color: '#334155' }}>Particulars / Package</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '800', color: '#334155' }}>HSN/SAC</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#334155' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '10px', textAlign: 'left', color: '#64748B' }}>1</td>
                  <td style={{ padding: '10px', textAlign: 'left' }}>
                    <div style={{ fontWeight: '800', color: '#0F172A' }}>{receipt.package || 'Gym Membership'}</div>
                    <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
                      Gym Floor, Weight Training, Cardio & Locker Facilities
                    </div>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#64748B', fontFamily: 'monospace', fontSize: '11px' }}>999723</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: '800', color: '#0F172A' }}>
                    ₹{Number(receipt.totalFee || receipt.amount || 0).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals & Balance Breakdown */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px', paddingBottom: '12px' }}>
            <div style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                <span>Gross Package Fee:</span>
                <span style={{ fontWeight: '700', color: '#334155' }}>
                  ₹{Number(receipt.totalFee || receipt.amount || 0).toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                <span>Discount / Concession:</span>
                <span style={{ fontWeight: '700', color: '#334155' }}>₹0</span>
              </div>
              <div style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '14px', 
                fontWeight: '900', 
                color: isFutureDated ? '#B45309' : '#059669',
                padding: '6px 8px',
                background: isFutureDated ? '#FFFBEB' : '#ECFDF5',
                borderRadius: '6px',
                border: `1px solid ${isFutureDated ? '#FCD34D' : '#A7F3D0'}`
              }}>
                <span>{isFutureDated ? 'Total Billable Amount:' : 'Amount Paid in Cash/UPI:'}</span>
                <span>₹{Number(receipt.amount || 0).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748B', paddingTop: '2px' }}>
                <span>Pending Due Balance:</span>
                <strong style={{ color: (receipt.pendingAmount > 0) ? '#DC2626' : '#16A34A' }}>
                  {receipt.pendingAmount > 0 ? `₹${Number(receipt.pendingAmount).toLocaleString()} (Due)` : '₹0.00 (Fully Paid)'}
                </strong>
              </div>
            </div>
          </div>

          {/* Footer Terms & Authorized Seal Stamp */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '12px', borderTop: '1px solid #E2E8F0', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '180px', fontSize: '10px', color: '#94A3B8', lineHeight: 1.4 }}>
              <strong>Terms & Conditions:</strong><br/>
              1. Fees once paid are strictly non-refundable and non-transferable.<br/>
              2. Membership is valid for the registered individual only.<br/>
              3. Computer-generated official tax bill from BodyLife Gym System.
            </div>

            <div style={{
              textAlign: 'center',
              border: '1.5px dashed #3B82F6',
              borderRadius: '8px',
              padding: '6px 14px',
              background: '#EFF6FF',
              minWidth: '150px'
            }}>
              <span style={{ fontSize: '9.5px', fontWeight: '900', color: '#1E40AF', letterSpacing: '0.5px', display: 'block' }}>
                BODYLIFE FITNESS
              </span>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563EB', display: 'block', margin: '2px 0' }}>
                PAID & VERIFIED
              </span>
              <span style={{ fontSize: '9px', color: '#64748B', display: 'block' }}>
                Authorized Billing Seal
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="no-print" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handlePrint}
            className="tap-btn"
            style={{
              flex: 1,
              minWidth: '130px',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              background: '#F8FAFC',
              color: '#0F172A',
              fontSize: '13px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Printer size={16} />
            <span>Print Receipt</span>
          </button>

          <button
            type="button"
            onClick={() => onShareWhatsApp && onShareWhatsApp(receipt)}
            className="tap-btn"
            style={{
              flex: 1,
              minWidth: '130px',
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: '#25D366',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Share2 size={15} />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="tap-btn btn-secondary"
            style={{ padding: '10px 18px', cursor: 'pointer' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
