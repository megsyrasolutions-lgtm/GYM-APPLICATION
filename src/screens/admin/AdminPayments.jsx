import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Search, 
  FileText, 
  Share2, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function AdminPayments({ 
  members = [], 
  onOpenRecordPayment, 
  onOpenMemberDetail,
  onViewReceipt,
  onShareWhatsApp
}) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all receipts across all members
  const allReceipts = members.flatMap(m => 
    (m.paymentHistory || []).map(rec => ({
      ...rec,
      memberName: m.name,
      memberId: m.id,
      package: m.packageName,
      totalFee: m.totalFee,
      pendingAmount: m.pendingAmount
    }))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalCollected = members.reduce((sum, m) => sum + (m.paidAmount || 0), 0);
  const totalPending = members.reduce((sum, m) => sum + (m.pendingAmount || 0), 0);

  const filteredReceipts = allReceipts.filter(r => {
    const matchesSearch = 
      !searchQuery || 
      (r.memberName && r.memberName.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (r.memberId && r.memberId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.receiptId && r.receiptId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.utr && r.utr.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterStatus === 'UPI') return r.mode === 'UPI';
    if (filterStatus === 'CASH') return r.mode === 'Cash';
    if (filterStatus === 'PARTIAL') return r.pendingAmount > 0;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
            Fee Collections & Receipts Ledger
          </h2>
          <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
            Audited financial register of all client payments recorded locally
          </p>
        </div>

        <button 
          onClick={onOpenRecordPayment}
          className="tap-btn btn-primary"
          style={{ padding: '9px 18px', fontSize: '13px' }}
        >
          <Plus size={15} />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* 3 Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        
        {/* Total Collected */}
        <div className="bodylife-card" style={{ padding: '18px', borderLeft: '4px solid #2563EB' }}>
          <span style={{ fontSize: '11.5px', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
            Total Collected
          </span>
          <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: '4px 0 2px' }}>
            ₹{totalCollected.toLocaleString()}
          </h3>
          <p style={{ fontSize: '11px', color: '#059669', fontWeight: '700', margin: '4px 0 0' }}>
            Audited Ledger Balance
          </p>
        </div>

        {/* Outstanding Dues */}
        <div className="bodylife-card" style={{ padding: '18px', borderLeft: '4px solid #DC2626' }}>
          <span style={{ fontSize: '11.5px', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
            Outstanding Dues
          </span>
          <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#DC2626', margin: '4px 0 2px' }}>
            ₹{totalPending.toLocaleString()}
          </h3>
          <p style={{ fontSize: '11px', color: '#DC2626', margin: '4px 0 0', fontWeight: '600' }}>
            {members.filter(m => m.pendingAmount > 0).length} members with pending balance
          </p>
        </div>

        {/* Receipts Issued */}
        <div className="bodylife-card" style={{ padding: '18px', borderLeft: '4px solid #059669' }}>
          <span style={{ fontSize: '11.5px', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
            Total Vouchers Generated
          </span>
          <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: '4px 0 2px' }}>
            {allReceipts.length} Receipts
          </h3>
          <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0' }}>
            Stored in local client database
          </p>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bodylife-card" style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Receipts' },
            { id: 'UPI', label: 'UPI' },
            { id: 'CASH', label: 'Cash' },
            { id: 'PARTIAL', label: 'With Pending Balance' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className="tap-btn"
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: filterStatus === tab.id ? 'transparent' : 'var(--border-color)',
                background: filterStatus === tab.id ? '#2563EB' : '#FFFFFF',
                color: filterStatus === tab.id ? '#FFFFFF' : '#334155',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#F8FAFC',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          padding: '6px 10px',
          gap: '6px',
          width: '260px'
        }}>
          <Search size={14} color="#94A3B8" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search receipt ID, member, UTR..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '12px',
              color: '#0F172A',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="desktop-table-card">
        <div className="table-responsive">
          <table className="desktop-table">
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Member Name</th>
                <th>Date</th>
                <th>Payment Mode</th>
                <th>UTR / Ref Number</th>
                <th>Amount Paid</th>
                <th>Balance Due</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px 16px', color: '#64748B' }}>
                    No payment records match your search. Click "Record New Payment" to add one.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((rec, idx) => (
                  <tr key={idx}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#0F172A' }}>
                        {rec.receiptId}
                      </span>
                    </td>
                    <td>
                      <div 
                        onClick={() => {
                          const m = members.find(x => x.id === rec.memberId || x.name === rec.memberName);
                          if (m && onOpenMemberDetail) onOpenMemberDetail(m);
                        }}
                        style={{ cursor: onOpenMemberDetail ? 'pointer' : 'default' }}
                      >
                        <p style={{ fontSize: '13px', fontWeight: '700', color: '#1E40AF', margin: 0, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                          {rec.memberName}
                        </p>
                        <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>{rec.memberId} · {rec.package}</p>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: '#64748B' }}>{rec.date}</span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: rec.mode === 'UPI' ? '#EFF6FF' : '#F1F5F9',
                        color: rec.mode === 'UPI' ? '#1D4ED8' : '#334155'
                      }}>
                        {rec.mode}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748B' }}>
                        {rec.utr || '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '800', color: '#059669' }}>
                        ₹{rec.amount.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      {rec.pendingAmount > 0 ? (
                        <span style={{ fontWeight: '700', color: '#DC2626', fontSize: '12px' }}>
                          ₹{rec.pendingAmount.toLocaleString()}
                        </span>
                      ) : (
                        <span style={{ color: '#059669', fontWeight: '700', fontSize: '12px' }}>
                          ✓ Cleared
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => onViewReceipt && onViewReceipt(rec)}
                          className="tap-btn"
                          title="View Digital Voucher"
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            background: '#FFFFFF',
                            color: '#1E40AF',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <FileText size={13} color="#2563EB" />
                          <span>Voucher</span>
                        </button>

                        <button
                          onClick={() => onShareWhatsApp && onShareWhatsApp(rec)}
                          className="tap-btn"
                          title="Share on WhatsApp"
                          style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            border: 'none',
                            background: '#25D366',
                            color: '#FFFFFF',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Share2 size={13} />
                          <span>Share</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
