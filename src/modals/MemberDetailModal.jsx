import React from 'react';
import { X, MessageSquare, Edit3, UserX, UserCheck, CreditCard, Calendar, FileText, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function MemberDetailModal({ 
  member, 
  onClose, 
  onEdit, 
  onToggleStatus, 
  onCollectPayment, 
  onOpenWhatsApp,
  onViewReceipt
}) {
  if (!member) return null;

  const isExpiring = member.status === 'Expiring';
  const isOverdue = member.status === 'Overdue';
  const isInactive = member.status === 'Inactive';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="desktop-modal-dialog" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px' }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px' }}>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: '800', 
            padding: '4px 10px', 
            borderRadius: '999px',
            background: isInactive ? '#F3F4F6' : isOverdue ? '#FFF0EB' : isExpiring ? '#FEF3C7' : '#ECFDF5',
            color: isInactive ? '#6B7280' : isOverdue ? '#EA580C' : isExpiring ? '#D97706' : '#047857',
            letterSpacing: '0.5px'
          }}>
            {member.status.toUpperCase()}
          </span>

          <button 
            onClick={onClose}
            className="tap-btn"
            style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F3F4F6', border: 'none', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Member Profile Hero Header */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            {member.photo ? (
              <img 
                src={member.photo} 
                alt={member.name} 
                style={{ width: '68px', height: '68px', borderRadius: '16px', objectFit: 'cover', border: '2.5px solid #2563EB', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
              />
            ) : (
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '16px',
                background: '#EFF6FF',
                color: '#2563EB',
                fontSize: '22px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2.5px solid #BFDBFE'
              }}>
                {member.name ? member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'BL'}
              </div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: 0 }}>{member.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#1E40AF', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '2px 8px', borderRadius: '6px', fontFamily: 'monospace' }}>
                {member.id}
              </span>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>{member.gender}, {member.age}y</span>
            </div>
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '3px' }}>{member.phone} {member.email ? `· ${member.email}` : ''}</p>
          </div>
        </div>

        {/* Quick Contact & Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button 
            onClick={() => onOpenWhatsApp && onOpenWhatsApp(member)}
            className="tap-btn"
            style={{
              background: '#25D366',
              borderRadius: '12px',
              padding: '12px 14px',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              border: 'none',
              boxShadow: '0 2px 8px rgba(37, 211, 102, 0.25)',
              cursor: 'pointer'
            }}
          >
            <MessageSquare size={17} />
            <span>WhatsApp Notice</span>
          </button>

          {member.pendingAmount > 0 ? (
            <button 
              onClick={() => onCollectPayment && onCollectPayment(member)}
              className="tap-btn"
              style={{
                background: '#FFF5F2',
                borderRadius: '12px',
                padding: '12px 14px',
                color: '#C2410C',
                fontSize: '13px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: '1px solid rgba(255, 122, 89, 0.2)',
                cursor: 'pointer'
              }}
            >
              <CreditCard size={17} color="#FF7A59" />
              <span>Collect Payment (₹{member.pendingAmount.toLocaleString()})</span>
            </button>
          ) : (
            <div
              style={{
                background: '#F0FDF4',
                borderRadius: '12px',
                padding: '12px 14px',
                color: '#166534',
                fontSize: '13px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: '1px solid #BBF7D0'
              }}
            >
              <CheckCircle2 size={17} color="#16A34A" />
              <span>Bill Fully Paid</span>
            </div>
          )}
        </div>

        {/* Membership Details Card */}
        <div className="mint-card" style={{ padding: '16px', background: '#F9FAFB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: '700' }}>Membership Package</span>
            <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#047857' }}>{member.packageName}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px 0', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
            <div>
              <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>Enrolled Date</p>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#111827', margin: '2px 0 0' }}>{member.startDate}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>Expiry Date</p>
              <p style={{ fontSize: '13px', fontWeight: '800', color: isExpiring ? '#D97706' : '#111827', margin: '2px 0 0' }}>{member.expiryDate}</p>
            </div>
          </div>

          {/* Dues & Financials */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <div>
              <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>Billing Balance</p>
              <p style={{ fontSize: '15px', fontWeight: '800', color: member.pendingAmount > 0 ? '#EA580C' : '#047857', margin: '2px 0 0' }}>
                {member.pendingAmount > 0 ? `Pending ₹${member.pendingAmount.toLocaleString()}` : 'Fully Paid'}
              </p>
            </div>

            {member.pendingAmount > 0 ? (
              <button
                onClick={() => onCollectPayment && onCollectPayment(member)}
                className="tap-btn btn-coral"
                style={{ padding: '8px 14px', fontSize: '12px', cursor: 'pointer' }}
              >
                <CreditCard size={14} />
                Collect ₹{member.pendingAmount.toLocaleString()}
              </button>
            ) : (
              <span style={{
                fontSize: '11.5px',
                fontWeight: '700',
                color: '#065F46',
                background: '#ECFDF5',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #A7F3D0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <CheckCircle2 size={13} color="#059669" />
                <span>✓ Cleared & Settled</span>
              </span>
            )}
          </div>
        </div>

        {/* Vital Info Grid: Locker, Total Fee, Paid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <div style={{ background: '#F9FAFB', borderRadius: '14px', padding: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '10.5px', color: '#6B7280', margin: 0 }}>Locker Allocated</p>
            <p style={{ fontSize: '13.5px', fontWeight: '800', color: '#111827', marginTop: '3px' }}>{member.lockerNumber || 'Unassigned'}</p>
          </div>
          <div style={{ background: '#ECFDF5', borderRadius: '14px', padding: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '10.5px', color: '#047857', margin: 0 }}>Total Paid</p>
            <p style={{ fontSize: '13.5px', fontWeight: '800', color: '#047857', marginTop: '3px' }}>₹{member.paidAmount.toLocaleString()}</p>
          </div>
          <div style={{ background: member.pendingAmount > 0 ? '#FFF7F5' : '#F9FAFB', borderRadius: '14px', padding: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '10.5px', color: member.pendingAmount > 0 ? '#EA580C' : '#6B7280', margin: 0 }}>Pending Dues</p>
            <p style={{ fontSize: '13.5px', fontWeight: '800', color: member.pendingAmount > 0 ? '#EA580C' : '#6B7280', marginTop: '3px' }}>
              {member.pendingAmount > 0 ? `₹${member.pendingAmount.toLocaleString()}` : 'Cleared'}
            </p>
          </div>
        </div>

        {/* Receipts List */}
        <div>
          <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
            Payment Receipts Ledger ({member.paymentHistory.length})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {member.paymentHistory.map((rec, idx) => (
              <div 
                key={idx}
                onClick={() => onViewReceipt && onViewReceipt({ ...rec, memberName: member.name, memberId: member.id, totalFee: member.totalFee, pendingAmount: member.pendingAmount })}
                className="tap-btn"
                style={{
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '9px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} color="#10B981" />
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#111827', margin: 0 }}>{rec.receiptId}</p>
                    <p style={{ fontSize: '10.5px', color: '#6B7280', margin: 0 }}>{rec.date} · {rec.mode}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#047857' }}>₹{rec.amount.toLocaleString()}</span>
                  <ChevronRight size={14} color="#9CA3AF" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Operations: Edit / Toggle Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
          <button 
            onClick={() => onEdit && onEdit(member)}
            className="tap-btn btn-secondary"
            style={{ borderRadius: '999px', fontSize: '12.5px', padding: '10px' }}
          >
            <Edit3 size={15} />
            <span>Edit Profile</span>
          </button>

          <button 
            onClick={() => onToggleStatus && onToggleStatus(member.id)}
            className="tap-btn"
            style={{
              borderRadius: '999px',
              padding: '10px',
              fontSize: '12.5px',
              fontWeight: '700',
              border: 'none',
              background: member.status === 'Inactive' ? '#ECFDF5' : '#FFF0EB',
              color: member.status === 'Inactive' ? '#047857' : '#EA580C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            {member.status === 'Inactive' ? (
              <>
                <UserCheck size={16} />
                <span>Mark as Active</span>
              </>
            ) : (
              <>
                <UserX size={16} />
                <span>Deactivate User</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
