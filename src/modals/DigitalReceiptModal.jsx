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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
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

        {/* Voucher Paper Card */}
        <div style={{ 
          background: '#FFFFFF', 
          borderRadius: '12px', 
          border: isFutureDated ? '1.5px dashed #FCD34D' : '1.5px dashed #93C5FD', 
          padding: '20px', 
          position: 'relative'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', paddingBottom: '14px', borderBottom: '1px solid #E2E8F0' }}>
            <img 
              src={bodylifeLogo} 
              alt="BodyLife" 
              onError={(e) => { e.currentTarget.src = './bodylife_logo.png'; }}
              style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', margin: '0 auto 8px', display: 'block', border: '1px solid #E2E8F0' }} 
            />
            <h4 style={{ fontSize: '18px', fontWeight: '900', color: '#1E40AF', margin: 0, letterSpacing: '1px' }}>
              BODYLIFE FITNESS
            </h4>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0' }}>
              Gym Management & Membership Services
            </p>
            <span style={{
              display: 'inline-block',
              marginTop: '8px',
              fontSize: '11px',
              fontWeight: '800',
              fontFamily: 'monospace',
              background: isFutureDated ? '#FFFBEB' : '#EFF6FF',
              color: isFutureDated ? '#B45309' : '#1D4ED8',
              padding: '3px 10px',
              borderRadius: '999px'
            }}>
              {receipt.receiptId}
            </span>
          </div>

          {/* Amount Hero */}
          <div style={{ textAlign: 'center', padding: '16px 0', borderBottom: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
              {isFutureDated ? 'BILL AMOUNT (FUTURE PAYMENT)' : 'AMOUNT RECEIVED'}
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: '900', color: isFutureDated ? '#D97706' : '#059669', margin: '4px 0 2px' }}>
              ₹{Number(receipt.amount || 0).toLocaleString()}
            </h2>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: isFutureDated ? '#B45309' : '#059669',
              fontSize: '11.5px',
              fontWeight: '700'
            }}>
              {isFutureDated ? (
                <>
                  <Calendar size={13} />
                  <span>Scheduled for Effective Date: {receipt.date}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={13} />
                  <span>Payment Verified · {receipt.mode || 'Desk'}</span>
                </>
              )}
            </div>
          </div>

          {/* Details Table */}
          <div style={{ padding: '14px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: '#64748B' }}>Member Name:</span>
              <strong style={{ color: '#0F172A' }}>{receipt.memberName || 'Client'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: '#64748B' }}>Member ID:</span>
              <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>{receipt.memberId || 'BL-001'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: '#64748B' }}>Plan Enrolled:</span>
              <strong style={{ color: '#0F172A' }}>{receipt.package || 'Membership Plan'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: '#64748B' }}>{isFutureDated ? 'Scheduled Date:' : 'Payment Date:'}</span>
              <strong style={{ color: isFutureDated ? '#D97706' : '#0F172A' }}>
                {receipt.date || todayStr} {isFutureDated ? '(Future Dated)' : ''}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: '#64748B' }}>Payment Mode:</span>
              <strong style={{ color: '#0F172A' }}>{receipt.mode || 'Cash'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: '#64748B' }}>Ref / UTR:</span>
              <strong style={{ color: '#64748B', fontFamily: 'monospace', fontSize: '11.5px' }}>{receipt.utr || 'CASH-DESK'}</strong>
            </div>
            {isFutureDated && (
              <div style={{
                marginTop: '4px',
                padding: '6px 10px',
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '6px',
                fontSize: '11px',
                color: '#92400E',
                textAlign: 'center'
              }}>
                ℹ️ Future-dated payment bill generated. This bill will mature on {receipt.date}.
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', paddingTop: '10px', borderTop: '1px solid #E2E8F0', fontSize: '11px', color: '#94A3B8' }}>
            Computer-generated billing voucher · BodyLife Local Database
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
