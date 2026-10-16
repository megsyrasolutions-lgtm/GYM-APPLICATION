import React from 'react';
import { 
  Users, 
  AlertCircle, 
  TrendingUp, 
  ChevronRight, 
  MessageSquare, 
  DollarSign, 
  Calendar,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { getComputedMemberStatus } from '../../utils/statusHelper';

export default function AdminDashboard({ 
  members = [], 
  onNavigate, 
  onOpenAddMember, 
  onOpenRecordPayment, 
  onOpenMemberDetail,
  onOpenWhatsApp
}) {
  const totalMembers = members.length;
  const activeMembers = members.filter(m => getComputedMemberStatus(m) === 'Active').length;
  const expiringMembers = members.filter(m => getComputedMemberStatus(m) === 'Expiring');
  const overdueMembers = members.filter(m => {
    const s = getComputedMemberStatus(m);
    return s === 'Overdue' || s === 'Expired';
  });
  const inactiveMembers = members.filter(m => getComputedMemberStatus(m) === 'Inactive');
  const pendingFeesTotal = members.reduce((sum, m) => sum + (Number(m.pendingAmount) || 0), 0);
  const totalCollected = members.reduce((sum, m) => sum + (Number(m.paidAmount) || 0), 0);
  const totalExpected = totalCollected + pendingFeesTotal;
  const collectionRate = totalExpected > 0 ? Math.min(100, Math.round((totalCollected / totalExpected) * 100)) : 100;

  // Recent payments
  const allPayments = members.flatMap(m => (m.paymentHistory || []).map(p => ({ ...p, memberName: m.name, memberId: m.id })));
  const recentPayments = [...allPayments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Real weekly collection calculation from actual payment records (Active Week: Mon-Sun)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  const mondayOffset = (currentDayOfWeek + 6) % 7; // 0 for Mon, 1 for Tue, 2 for Wed, 3 for Thu, 4 for Fri, 5 for Sat, 6 for Sun

  // Format local date YYYY-MM-DD avoiding UTC conversion shift
  const formatLocalDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const isSameDay = (dateVal, targetDateStr) => {
    if (!dateVal) return false;
    if (typeof dateVal === 'string' && dateVal.startsWith(targetDateStr)) return true;
    try {
      const d = new Date(dateVal);
      return !isNaN(d.getTime()) && formatLocalDate(d) === targetDateStr;
    } catch {
      return false;
    }
  };

  const weeklyBars = daysOfWeek.map((dayName, idx) => {
    // Exact local date relative to today
    const dayDiff = idx - mondayOffset;
    const dayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayDiff);
    const dateStr = formatLocalDate(dayDate);
    
    // Sum real payments made on this day
    const dayTotal = allPayments
      .filter(p => isSameDay(p.date, dateStr))
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const isToday = idx === mondayOffset;

    return {
      day: dayName,
      date: dateStr,
      total: dayTotal,
      today: isToday
    };
  });

  const weeklyTotal = weeklyBars.reduce((sum, b) => sum + b.total, 0);
  const maxDayTotal = Math.max(...weeklyBars.map(b => b.total), 0);

  const formatAmountBadge = (val) => {
    if (!val || val === 0) return '₹0';
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${val % 1000 === 0 ? Math.round(val / 1000) : (val / 1000).toFixed(1)}k`;
    return `₹${val}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 4 KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        {/* Total Members */}
        <div className="bodylife-card" style={{ padding: '18px 20px', borderLeft: '4px solid #2563EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Members
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="#2563EB" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h3 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              {totalMembers}
            </h3>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
              Members ({activeMembers} Active)
            </span>
          </div>
          <p style={{ fontSize: '11.5px', color: '#64748B', margin: '8px 0 0' }}>
            {overdueMembers.length} with Pending Balance · {inactiveMembers.length} Inactive
          </p>
        </div>

        {/* Total Collected */}
        <div className="bodylife-card" style={{ padding: '18px 20px', borderLeft: '4px solid #059669' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Collected
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} color="#059669" />
            </div>
          </div>
          <h3 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
            ₹{totalCollected.toLocaleString()}
          </h3>
          <p style={{ fontSize: '11.5px', color: '#059669', fontWeight: '700', margin: '8px 0 0' }}>
            Audited Fee Collections
          </p>
        </div>

        {/* Pending Fees */}
        <div className="bodylife-card" style={{ padding: '18px 20px', borderLeft: '4px solid #DC2626' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pending Dues
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={18} color="#DC2626" />
            </div>
          </div>
          <h3 style={{ fontSize: '26px', fontWeight: '800', color: '#DC2626', margin: 0 }}>
            ₹{pendingFeesTotal.toLocaleString()}
          </h3>
          <p style={{ fontSize: '11.5px', color: '#DC2626', fontWeight: '700', margin: '8px 0 0' }}>
            {overdueMembers.length} Members with Overdue Balance
          </p>
        </div>

        {/* Collection Efficiency */}
        <div className="bodylife-card" style={{ padding: '18px 20px', borderLeft: '4px solid #3B82F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Fee Realization
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="#2563EB" />
            </div>
          </div>
          <h3 style={{ fontSize: '26px', fontWeight: '800', color: '#2563EB', margin: 0 }}>
            {collectionRate}%
          </h3>
          <p style={{ fontSize: '11.5px', color: '#64748B', margin: '8px 0 0' }}>
            Target: ₹{totalExpected.toLocaleString()}
          </p>
        </div>

      </div>

      {/* Main 2-Column Responsive Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        
        {/* Left Column: Weekly Collections Volume & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Weekly Collections Chart */}
          <div className="bodylife-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Weekly Collections Summary
                </h4>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
                  Fee realization across Cash & UPI
                </p>
              </div>
              <span style={{ fontSize: '12px', color: '#1E40AF', fontWeight: '700', background: '#EFF6FF', padding: '3px 8px', borderRadius: '6px' }}>
                Active Week
              </span>
            </div>

            {/* Clean Chart Bars */}
            <div style={{ marginTop: '12px' }}>
              {/* Bar Plot Area */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                height: '110px',
                padding: '0 8px 0',
                borderBottom: '1px solid var(--border-color)'
              }}>
                {weeklyBars.map((bar, idx) => {
                  const barHeight = maxDayTotal > 0 && bar.total > 0
                    ? Math.max(10, Math.round((bar.total / maxDayTotal) * 76))
                    : 6;

                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'flex-end', 
                        flex: 1, 
                        height: '100%' 
                      }}
                    >
                      <span style={{ 
                        fontSize: '11px', 
                        color: bar.total > 0 ? (bar.today ? '#2563EB' : '#1E40AF') : '#94A3B8', 
                        fontWeight: bar.total > 0 ? '700' : '600',
                        marginBottom: '6px',
                        lineHeight: 1
                      }}>
                        {formatAmountBadge(bar.total)}
                      </span>
                      <div 
                        title={`${bar.day} (${bar.date}): ₹${bar.total.toLocaleString()}`}
                        style={{
                          width: '28px',
                          height: `${barHeight}px`,
                          borderRadius: '6px 6px 0 0',
                          background: bar.total > 0 
                            ? (bar.today ? '#2563EB' : '#93C5FD') 
                            : (bar.today ? '#BFDBFE' : '#E2E8F0'),
                          boxShadow: bar.today && bar.total > 0 ? '0 2px 8px rgba(37, 99, 235, 0.25)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      ></div>
                    </div>
                  );
                })}
              </div>

              {/* X-Axis Day Labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 8px 0' }}>
                {weeklyBars.map((item, idx) => (
                  <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      color: item.today ? '#1E40AF' : '#64748B', 
                      fontWeight: item.today ? '800' : '600' 
                    }}>
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px' }}>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                7-Day Total: <strong>₹{weeklyTotal.toLocaleString()}</strong>
              </span>
              <button 
                onClick={() => onNavigate('payments')}
                className="tap-btn"
                style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                View Ledger Details →
              </button>
            </div>
          </div>


        </div>

        {/* Right Column: Pending Dues Follow-up & Efficiency */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Overdue Dues Follow-up List */}
          <div className="bodylife-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Pending Fee Follow-up
                </h4>
                <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0' }}>
                  {overdueMembers.length + expiringMembers.length} members with action required
                </p>
              </div>

              <button
                onClick={() => onNavigate('alerts')}
                style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
              >
                <span>View All</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[...overdueMembers, ...expiringMembers].length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 10px', color: '#64748B', fontSize: '13px' }}>
                  ✓ All member fees are currently cleared!
                </div>
              ) : (
                [...overdueMembers, ...expiringMembers].slice(0, 4).map((m) => {
                  const initials = m.name ? m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'BL';
                  return (
                    <div 
                      key={m.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: '#F8FAFC',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px'
                      }}
                    >
                      <div 
                        onClick={() => onOpenMemberDetail && onOpenMemberDetail(m)}
                        style={{ cursor: 'pointer', flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '10px' }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          background: '#EFF6FF',
                          color: '#2563EB',
                          fontWeight: '800',
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          overflow: 'hidden',
                          border: '1px solid #BFDBFE'
                        }}>
                          {m.photo ? (
                            <img src={m.photo} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            initials
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {m.name}
                          </p>
                          <p style={{ fontSize: '11px', color: m.status === 'Overdue' || m.pendingAmount > 0 ? '#DC2626' : '#D97706', margin: '2px 0 0', fontWeight: '600' }}>
                            {m.status === 'Overdue' || m.pendingAmount > 0 ? `Due: ₹${m.pendingAmount.toLocaleString()}` : `Expires: ${m.expiryDate}`}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenWhatsApp && onOpenWhatsApp(m)}
                        className="tap-btn"
                        title="Send WhatsApp notice"
                        style={{
                          background: '#25D366',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          flexShrink: 0,
                          cursor: 'pointer'
                        }}
                      >
                        <MessageSquare size={13} />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Breakdown by Plan Status */}
          <div className="bodylife-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', marginBottom: '12px' }}>
              Membership Status Breakdown
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Active VIPs</span>
                <p style={{ fontSize: '16px', fontWeight: '800', color: '#059669', margin: '2px 0 0' }}>{activeMembers}</p>
              </div>
              <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Overdue Accounts</span>
                <p style={{ fontSize: '16px', fontWeight: '800', color: '#DC2626', margin: '2px 0 0' }}>{overdueMembers.length}</p>
              </div>
              <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Expiring ≤7d</span>
                <p style={{ fontSize: '16px', fontWeight: '800', color: '#D97706', margin: '2px 0 0' }}>{expiringMembers.length}</p>
              </div>
              <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Inactive</span>
                <p style={{ fontSize: '16px', fontWeight: '800', color: '#64748B', margin: '2px 0 0' }}>{inactiveMembers.length}</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Section: Recent Payments Ledger */}
      <div className="desktop-table-card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Recent Fee Transactions
            </h4>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
              Latest receipts recorded in local database
            </p>
          </div>
          <button
            onClick={() => onNavigate('payments')}
            className="tap-btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <span>View Full Ledger →</span>
          </button>
        </div>

        <div className="table-responsive">
          <table className="desktop-table">
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Member Name</th>
                <th>Date</th>
                <th>Mode</th>
                <th>Amount Paid</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px 16px', color: '#64748B' }}>
                    No payment records recorded yet.
                  </td>
                </tr>
              ) : (
                recentPayments.map((rec, idx) => (
                  <tr key={idx}>
                    <td>
                      <span style={{ fontWeight: '700', fontFamily: 'monospace', color: '#0F172A' }}>
                        {rec.receiptId}
                      </span>
                    </td>
                    <td>
                      <span 
                        onClick={() => {
                          const m = members.find(x => x.id === rec.memberId || x.name === rec.memberName);
                          if (m && onOpenMemberDetail) onOpenMemberDetail(m);
                        }}
                        style={{ fontWeight: '700', color: '#1E40AF', cursor: onOpenMemberDetail ? 'pointer' : 'default', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                      >
                        {rec.memberName}
                      </span>
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
                      <span style={{ fontWeight: '800', color: '#059669' }}>
                        ₹{rec.amount.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className="badge-active">
                        ✓ Recorded
                      </span>
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
