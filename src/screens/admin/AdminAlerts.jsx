import React, { useState } from 'react';
import { 
  Send, 
  MessageSquare, 
  Clock, 
  AlertCircle, 
  Search, 
  CheckCircle, 
  CheckCircle2, 
  Phone, 
  Bell, 
  RefreshCw 
} from 'lucide-react';
import { getComputedMemberStatus } from '../../utils/statusHelper';

export default function AdminAlerts({ 
  members = [], 
  onOpenMemberDetail,
  onSelectMember,
  onOpenWhatsApp, 
  onUpdateMembers,
  onTriggerPushNotification 
}) {
  const handleMemberClick = onOpenMemberDetail || onSelectMember;
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const expiringMembers = members.filter(m => getComputedMemberStatus(m) === 'Expiring');
  const overdueMembers = members.filter(m => {
    const s = getComputedMemberStatus(m);
    return s === 'Overdue' || s === 'Expired';
  });
  const totalPending = members.reduce((sum, m) => sum + (Number(m.pendingAmount) || 0), 0);

  // Unique list of members needing alert attention
  const alertMembersMap = new Map();
  [...overdueMembers, ...expiringMembers].forEach(m => {
    if (!alertMembersMap.has(m.id)) {
      alertMembersMap.set(m.id, m);
    }
  });
  const allAlertMembers = Array.from(alertMembersMap.values());

  const sentMembers = allAlertMembers.filter(m => m.reminderSent || m.reminderStatus === 'Sent');
  const unsentMembers = allAlertMembers.filter(m => !(m.reminderSent || m.reminderStatus === 'Sent'));

  const displayedList = allAlertMembers.filter(m => {
    const computed = getComputedMemberStatus(m);
    if (activeTab === 'EXPIRING') return computed === 'Expiring';
    if (activeTab === 'OVERDUE') return computed === 'Overdue' || computed === 'Expired';
    if (activeTab === 'SENT') return m.reminderSent || m.reminderStatus === 'Sent';
    if (activeTab === 'PENDING_MSG') return !(m.reminderSent || m.reminderStatus === 'Sent');
    return true;
  }).filter(m => 
    !searchQuery || 
    (m.name && m.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (m.id && m.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (m.phone && m.phone.includes(searchQuery))
  );

  const handleBroadcastAll = () => {
    const nowIso = new Date().toISOString();
    // Mark displayed unsent members as sent
    if (onUpdateMembers) {
      const displayedIds = new Set(displayedList.map(m => m.id));
      const updated = members.map(m => {
        if (displayedIds.has(m.id)) {
          return {
            ...m,
            reminderSent: true,
            reminderStatus: 'Sent',
            lastReminderSent: nowIso
          };
        }
        return m;
      });
      onUpdateMembers(updated);
    }

    if (onTriggerPushNotification) {
      onTriggerPushNotification({
        title: 'Batch Reminders Dispatched',
        message: `Payment notices prepared for ${displayedList.length} members with pending dues or expiry.`,
        icon: '📲'
      });
    }
  };

  const formatSentDate = (isoString) => {
    if (!isoString) return 'Sent Today';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return 'Sent';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* Header & Batch Dispatch Action */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
            Fee Dues & Expiry Reminders
          </h2>
          <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
            Track client message statuses and dispatch overdue reminders
          </p>
        </div>

        {displayedList.length > 0 && (
          <button 
            onClick={handleBroadcastAll}
            className="tap-btn btn-primary"
            style={{ padding: '9px 18px', fontSize: '13px' }}
          >
            <Send size={15} />
            <span>Send Batch Reminders ({displayedList.length})</span>
          </button>
        )}
      </div>

      {/* 3 Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
        
        {/* Expiring Soon */}
        <div className="bodylife-card" style={{ padding: '18px', borderLeft: '4px solid #D97706' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
              Expiring Within 7 Days
            </span>
            <Clock size={16} color="#D97706" />
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#D97706', margin: '2px 0' }}>
            {expiringMembers.length} Members
          </h3>
          <p style={{ fontSize: '11.5px', color: '#64748B', margin: '4px 0 0' }}>
            Notify clients before membership expires
          </p>
        </div>

        {/* Overdue Fees */}
        <div className="bodylife-card" style={{ padding: '18px', borderLeft: '4px solid #DC2626' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
              Total Overdue Balance
            </span>
            <AlertCircle size={16} color="#DC2626" />
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#DC2626', margin: '2px 0' }}>
            ₹{totalPending.toLocaleString()}
          </h3>
          <p style={{ fontSize: '11.5px', color: '#64748B', margin: '4px 0 0' }}>
            Across {overdueMembers.length} accounts with pending balance
          </p>
        </div>

        {/* Reminder Status Summary */}
        <div className="bodylife-card" style={{ padding: '18px', borderLeft: '4px solid #059669' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
              Reminder Notice Status
            </span>
            <CheckCircle2 size={16} color="#059669" />
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#059669', margin: '2px 0' }}>
            {sentMembers.length} Sent
          </h3>
          <p style={{ fontSize: '11.5px', color: '#64748B', margin: '4px 0 0' }}>
            {unsentMembers.length} contacts pending notification
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
            { id: 'ALL', label: 'All Alerts', count: allAlertMembers.length },
            { id: 'SENT', label: 'Reminders Sent', count: sentMembers.length },
            { id: 'PENDING_MSG', label: 'Not Yet Sent', count: unsentMembers.length },
            { id: 'OVERDUE', label: 'Overdue Dues', count: overdueMembers.length },
            { id: 'EXPIRING', label: 'Expiring Soon', count: expiringMembers.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="tap-btn"
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: activeTab === tab.id ? 'transparent' : 'var(--border-color)',
                background: activeTab === tab.id ? '#2563EB' : '#FFFFFF',
                color: activeTab === tab.id ? '#FFFFFF' : '#334155',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                fontSize: '10.5px',
                padding: '1px 5px',
                borderRadius: '999px',
                background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                color: activeTab === tab.id ? '#FFFFFF' : '#64748B'
              }}>
                {tab.count}
              </span>
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
          width: '240px'
        }}>
          <Search size={14} color="#94A3B8" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search member name or ID..."
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

      {/* Alerts Table with Dedicated Message Status Column */}
      <div className="desktop-table-card">
        <div className="table-responsive">
          <table className="desktop-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Phone</th>
                <th>Package Tier</th>
                <th>Alert Type</th>
                <th>Due / Expiry Date</th>
                <th>Pending Amount</th>
                <th>Reminder Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedList.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px 16px', color: '#64748B' }}>
                    ✓ No members match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                displayedList.map(m => {
                  const isSent = m.reminderSent || m.reminderStatus === 'Sent';

                  return (
                    <tr 
                      key={m.id}
                      onClick={() => handleMemberClick && handleMemberClick(m)}
                      style={{ cursor: handleMemberClick ? 'pointer' : 'default' }}
                      className="hover-row"
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
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
                              m.name ? m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'BL'
                            )}
                          </div>
                          <div>
                            <p style={{ 
                              fontSize: '13px', 
                              fontWeight: '700', 
                              color: '#1E40AF', 
                              margin: 0,
                              textDecoration: 'underline',
                              textUnderlineOffset: '2px'
                            }}>
                              {m.name}
                            </p>
                            <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0', fontFamily: 'monospace' }}>{m.id}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ color: '#334155', fontWeight: '600' }}>{m.phone}</span>
                      </td>
                      <td>
                        <span style={{ color: '#0F172A', fontWeight: '600' }}>{m.packageName}</span>
                      </td>
                      <td>
                        <span className={m.pendingAmount > 0 || m.status === 'Overdue' ? 'badge-overdue' : 'badge-expiring'}>
                          {m.pendingAmount > 0 || m.status === 'Overdue' ? 'Overdue Dues' : 'Expiring Soon'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: '700', color: '#0F172A' }}>
                          {m.expiryDate}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: '800', color: m.pendingAmount > 0 ? '#DC2626' : '#059669' }}>
                          {m.pendingAmount > 0 ? `₹${m.pendingAmount.toLocaleString()}` : '—'}
                        </span>
                      </td>

                      {/* Requirement 7: Dedicated Message Status Indicator */}
                      <td>
                        {isSent ? (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            background: '#ECFDF5',
                            color: '#065F46',
                            border: '1px solid #A7F3D0',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <CheckCircle2 size={12} color="#059669" />
                            <span>Sent ({formatSentDate(m.lastReminderSent)})</span>
                          </span>
                        ) : (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            background: '#FEF3C7',
                            color: '#92400E',
                            border: '1px solid #FDE68A',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Clock size={12} color="#D97706" />
                            <span>Not Sent</span>
                          </span>
                        )}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenWhatsApp && onOpenWhatsApp(m);
                          }}
                          className="tap-btn"
                          title={isSent ? "Reminder already sent. Click to dispatch update." : "Send official reminder via WhatsApp"}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            background: isSent ? '#059669' : '#25D366',
                            color: '#FFFFFF',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          {isSent ? <RefreshCw size={12} /> : <MessageSquare size={13} />}
                          <span>{isSent ? 'Resend Notice' : 'Send WhatsApp'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
