import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Edit3, 
  UserX, 
  UserCheck, 
  CreditCard, 
  Calendar, 
  FileText, 
  ChevronRight, 
  CheckCircle2, 
  RefreshCw, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';
import { getComputedMemberStatus, getDaysRemaining, getStatusBadgeConfig } from '../utils/statusHelper';

export default function MemberDetailModal({ 
  member, 
  onClose, 
  onEdit, 
  onToggleStatus, 
  onCollectPayment, 
  onRenewPlan,
  onDeleteMember,
  onOpenWhatsApp,
  onViewReceipt
}) {
  if (!member) return null;

  const [confirmDelete, setConfirmDelete] = useState(false);

  const computedStatus = getComputedMemberStatus(member);
  const badgeConfig = getStatusBadgeConfig(computedStatus);
  const daysRemaining = getDaysRemaining(member.expiryDate);

  const pendingAmount = Number(member.pendingAmount || 0);
  const totalFee = Number(member.totalFee || 0);
  const paidAmount = Number(member.paidAmount || 0);

  const getDaysRemainingText = () => {
    if (daysRemaining === null) return 'No expiry date set';
    if (daysRemaining < 0) return `Expired ${Math.abs(daysRemaining)} days ago`;
    if (daysRemaining === 0) return 'Expires today';
    if (daysRemaining === 1) return 'Expires tomorrow';
    return `${daysRemaining} days remaining`;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="desktop-modal-dialog" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '620px', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '800', 
              padding: '4px 10px', 
              borderRadius: '999px',
              background: badgeConfig.bg,
              color: badgeConfig.color,
              border: `1px solid ${badgeConfig.border}`,
              letterSpacing: '0.5px'
            }}>
              {badgeConfig.label.toUpperCase()}
            </span>
            <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: '600' }}>
              ({getDaysRemainingText()})
            </span>
          </div>

          <button 
            onClick={onClose}
            className="tap-btn"
            style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F3F4F6', border: 'none', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
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
              {member.lockerNumber && (
                <span style={{ fontSize: '11px', color: '#047857', background: '#ECFDF5', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                  Locker #{member.lockerNumber}
                </span>
              )}
            </div>
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '3px' }}>
              {member.phone} {member.email ? `· ${member.email}` : ''}
            </p>
          </div>
        </div>

        {/* Quick Contact & Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
          
          {/* WhatsApp Button */}
          <button 
            onClick={() => onOpenWhatsApp && onOpenWhatsApp(member)}
            className="tap-btn"
            style={{
              background: '#25D366',
              borderRadius: '10px',
              padding: '10px 12px',
              color: '#FFFFFF',
              fontSize: '12.5px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              border: 'none',
              boxShadow: '0 2px 8px rgba(37, 211, 102, 0.25)',
              cursor: 'pointer'
            }}
          >
            <MessageSquare size={16} />
            <span>WhatsApp Notice</span>
          </button>

          {/* Renew Plan Button */}
          <button
            onClick={() => onRenewPlan && onRenewPlan(member)}
            className="tap-btn"
            style={{
              background: '#EFF6FF',
              borderRadius: '10px',
              padding: '10px 12px',
              color: '#1D4ED8',
              fontSize: '12.5px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              border: '1.5px solid #BFDBFE',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} />
            <span>Renew Plan</span>
          </button>

          {/* Collect Payment (if pending) */}
          {pendingAmount > 0 && (
            <button 
              onClick={() => onCollectPayment && onCollectPayment(member)}
              className="tap-btn"
              style={{
                background: '#FFF5F2',
                borderRadius: '10px',
                padding: '10px 12px',
                color: '#C2410C',
                fontSize: '12.5px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                border: '1px solid rgba(255, 122, 89, 0.3)',
                cursor: 'pointer'
              }}
            >
              <CreditCard size={16} color="#FF7A59" />
              <span>Collect Dues (₹{pendingAmount.toLocaleString()})</span>
            </button>
          )}

        </div>

        {/* Membership Details Card */}
        <div className="mint-card" style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Active Subscription
            </span>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#2563EB' }}>
              {member.packageName}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', paddingTop: '8px', borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
            <div>
              <span style={{ fontSize: '10.5px', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Total Billed</span>
              <strong style={{ fontSize: '14px', color: '#0F172A' }}>₹{totalFee.toLocaleString()}</strong>
            </div>
            <div>
              <span style={{ fontSize: '10.5px', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Paid</span>
              <strong style={{ fontSize: '14px', color: '#059669' }}>₹{paidAmount.toLocaleString()}</strong>
            </div>
            <div>
              <span style={{ fontSize: '10.5px', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Balance Due</span>
              <strong style={{ fontSize: '14px', color: pendingAmount > 0 ? '#DC2626' : '#059669' }}>
                ₹{pendingAmount.toLocaleString()}
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #E2E8F0', fontSize: '12px', color: '#475569' }}>
            <span><strong>Start Date:</strong> {member.startDate || 'N/A'}</span>
            <span><strong>Expiry Date:</strong> {member.expiryDate || 'N/A'}</span>
          </div>
        </div>

        {/* Payment History Receipts */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Payment Receipts History ({member.paymentHistory?.length || 0})
            </h4>
          </div>

          {(!member.paymentHistory || member.paymentHistory.length === 0) ? (
            <p style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic', margin: 0, padding: '10px 0' }}>
              No payments recorded for this member yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
              {member.paymentHistory.map((p, idx) => (
                <div 
                  key={p.receiptId || idx}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={15} color="#2563EB" />
                    <div>
                      <strong style={{ color: '#0F172A' }}>₹{Number(p.amount || 0).toLocaleString()}</strong>
                      <span style={{ color: '#64748B', marginLeft: '6px' }}>({p.mode || 'Cash'}) · {p.date}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748B' }}>
                      {p.receiptId}
                    </span>
                    <button
                      type="button"
                      onClick={() => onViewReceipt && onViewReceipt({ ...p, memberName: member.name, memberId: member.id, package: member.packageName, pendingAmount: member.pendingAmount })}
                      className="tap-btn"
                      style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      View Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Alert Banner */}
        {confirmDelete && (
          <div style={{
            background: '#FEF2F2',
            border: '1.5px solid #FECACA',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B91C1C' }}>
              <AlertTriangle size={18} color="#DC2626" />
              <strong style={{ fontSize: '13px' }}>Delete {member.name}'s record permanently?</strong>
            </div>
            <p style={{ fontSize: '12px', color: '#7F1D1D', margin: 0 }}>
              This will remove the member from your local database and unregister all fee records for this client.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="tap-btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteMember) onDeleteMember(member.id);
                  onClose();
                }}
                className="tap-btn"
                style={{ padding: '6px 14px', fontSize: '12px', background: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}

        {/* Bottom Operations: Edit / Toggle Status / Delete */}
        {!confirmDelete && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginTop: '6px' }}>
            <button 
              onClick={() => onEdit && onEdit(member)}
              className="tap-btn btn-secondary"
              style={{ borderRadius: '8px', fontSize: '12.5px', padding: '9px 12px' }}
            >
              <Edit3 size={15} />
              <span>Edit Profile</span>
            </button>

            <button 
              onClick={() => onToggleStatus && onToggleStatus(member.id)}
              className="tap-btn"
              style={{
                borderRadius: '8px',
                padding: '9px 12px',
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
                  <UserCheck size={15} />
                  <span>Mark Active</span>
                </>
              ) : (
                <>
                  <UserX size={15} />
                  <span>Deactivate</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="tap-btn"
              title="Delete Member Record"
              style={{
                borderRadius: '8px',
                padding: '9px 12px',
                border: '1px solid #FECACA',
                background: '#FEF2F2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
