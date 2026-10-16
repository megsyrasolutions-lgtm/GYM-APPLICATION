import React, { useState } from 'react';
import { 
  Search, 
  UserPlus, 
  ArrowUpDown, 
  Eye, 
  List, 
  LayoutGrid, 
  MessageSquare, 
  Phone,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserX,
  Edit3
} from 'lucide-react';

export default function AdminMembers({ 
  members = [], 
  onSelectMember, 
  onOpenAddMember, 
  onEditMember,
  onOpenWhatsApp 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('table');

  const filteredMembers = members.filter(member => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !query ||
      (member.name && member.name.toLowerCase().includes(query)) ||
      (member.id && member.id.toLowerCase().includes(query)) ||
      (member.phone && member.phone.includes(query)) ||
      (member.email && member.email.toLowerCase().includes(query));

    const matchesStatus = 
      statusFilter === 'ALL' || 
      (statusFilter === 'OVERDUE' ? (member.pendingAmount > 0 || member.status === 'Overdue') : 
       statusFilter === 'ACTIVE' ? (member.status === 'Active' && (!member.pendingAmount || member.pendingAmount === 0)) :
       (member.status && member.status.toUpperCase() === statusFilter));

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
    if (sortBy === 'expiry') return new Date(a.expiryDate || 0) - new Date(b.expiryDate || 0);
    if (sortBy === 'status') return (a.status || '').localeCompare(b.status || '');
    if (sortBy === 'pending') return (b.pendingAmount || 0) - (a.pendingAmount || 0);
    return 0;
  });

  const getStatusBadge = (status, pendingAmount = 0) => {
    if (pendingAmount > 0 || status === 'Overdue') {
      return { className: 'badge-overdue', label: 'Fee Due', icon: AlertTriangle };
    }
    switch (status) {
      case 'Active':
        return { className: 'badge-active', label: 'Active (Paid)', icon: CheckCircle };
      case 'Expiring':
        return { className: 'badge-expiring', label: 'Expiring ≤7d', icon: Clock };
      case 'Inactive':
        return { className: 'badge-inactive', label: 'Inactive', icon: UserX };
      default:
        return { className: 'badge-inactive', label: status || 'Member', icon: CheckCircle };
    }
  };

  const statusCounts = {
    ALL: members.length,
    ACTIVE: members.filter(m => m.status === 'Active' && (!m.pendingAmount || m.pendingAmount === 0)).length,
    EXPIRING: members.filter(m => m.status === 'Expiring').length,
    OVERDUE: members.filter(m => (m.pendingAmount > 0 || m.status === 'Overdue')).length,
    INACTIVE: members.filter(m => m.status === 'Inactive').length
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
            Members Directory
          </h2>
          <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
            {members.length} client accounts registered in local database
          </p>
        </div>

        <button 
          onClick={onOpenAddMember}
          className="tap-btn btn-primary"
          style={{ padding: '9px 18px', fontSize: '13px' }}
        >
          <UserPlus size={15} />
          <span>Enroll New Member</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bodylife-card" style={{
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All', count: statusCounts.ALL },
            { id: 'ACTIVE', label: 'Active', count: statusCounts.ACTIVE },
            { id: 'EXPIRING', label: 'Expiring', count: statusCounts.EXPIRING },
            { id: 'OVERDUE', label: 'Overdue Dues', count: statusCounts.OVERDUE },
            { id: 'INACTIVE', label: 'Inactive', count: statusCounts.INACTIVE }
          ].map(tab => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className="tap-btn"
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: isActive ? 'transparent' : 'var(--border-color)',
                  background: isActive ? '#2563EB' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#334155',
                  fontSize: '12px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  fontSize: '10.5px',
                  padding: '1px 5px',
                  borderRadius: '999px',
                  background: isActive ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                  color: isActive ? '#FFFFFF' : '#64748B'
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Sort and View Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Search Input */}
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
              placeholder="Search by name, ID, phone..."
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

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpDown size={13} color="#64748B" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#334155',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="name">Name (A-Z)</option>
              <option value="expiry">Expiry Date</option>
              <option value="status">Status</option>
              <option value="pending">Pending Dues</option>
            </select>
          </div>

          {/* View Toggle */}
          <div style={{
            display: 'flex',
            background: '#F1F5F9',
            borderRadius: '6px',
            padding: '2px'
          }}>
            <button
              onClick={() => setViewMode('table')}
              className="tap-btn"
              title="Table View"
              style={{
                padding: '5px 7px',
                borderRadius: '5px',
                border: 'none',
                background: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'table' ? '#2563EB' : '#94A3B8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                boxShadow: viewMode === 'table' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className="tap-btn"
              title="Card Grid View"
              style={{
                padding: '5px 7px',
                borderRadius: '5px',
                border: 'none',
                background: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'grid' ? '#2563EB' : '#94A3B8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                boxShadow: viewMode === 'grid' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <LayoutGrid size={15} />
            </button>
          </div>

        </div>

      </div>

      {/* Main Table / Grid View */}
      {viewMode === 'table' ? (
        <div className="desktop-table-card">
          <div className="table-responsive">
            <table className="desktop-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>ID</th>
                  <th>Package Plan</th>
                  <th>Expiry Date</th>
                  <th>Fee Status</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px 16px', color: '#64748B' }}>
                      No members found matching your search. Click "Enroll New Member" to add one.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const badge = getStatusBadge(member.status, member.pendingAmount);
                    const initials = member.name
                      ? member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                      : 'BL';

                    return (
                      <tr key={member.id}>
                        {/* Member Name & Contact */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              background: '#EFF6FF',
                              color: '#2563EB',
                              fontWeight: '800',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              overflow: 'hidden',
                              border: '1px solid #BFDBFE'
                            }}>
                              {member.photo ? (
                                <img src={member.photo} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                initials
                              )}
                            </div>
                            <div>
                              <p 
                                onClick={() => onSelectMember && onSelectMember(member)}
                                style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', margin: 0, cursor: 'pointer' }}
                              >
                                {member.name}
                              </p>
                              <p style={{ fontSize: '11px', color: '#64748B', margin: '1px 0 0' }}>
                                {member.phone} {member.email ? `· ${member.email}` : ''}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* ID */}
                        <td>
                          <span style={{
                            fontFamily: 'monospace',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            background: '#F1F5F9',
                            color: '#334155',
                            padding: '3px 6px',
                            borderRadius: '4px'
                          }}>
                            {member.id}
                          </span>
                        </td>

                        {/* Package Plan */}
                        <td>
                          <p style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                            {member.packageName}
                          </p>
                          <p style={{ fontSize: '11px', color: '#64748B', margin: '1px 0 0' }}>
                            Locker: {member.lockerNumber || 'None'}
                          </p>
                        </td>

                        {/* Expiry Date */}
                        <td>
                          <p style={{ fontSize: '12.5px', fontWeight: '600', color: '#334155', margin: 0 }}>
                            {member.expiryDate}
                          </p>
                          <p style={{ fontSize: '10.5px', color: '#94A3B8', margin: '1px 0 0' }}>
                            From {member.startDate}
                          </p>
                        </td>

                        {/* Fee Status */}
                        <td>
                          {member.pendingAmount > 0 ? (
                            <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#DC2626' }}>
                              Due: ₹{member.pendingAmount.toLocaleString()}
                            </span>
                          ) : (
                            <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#059669' }}>
                              Paid: ₹{(member.paidAmount || member.totalFee || 0).toLocaleString()}
                            </span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td>
                          <span className={badge.className}>
                            {badge.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => onSelectMember && onSelectMember(member)}
                              className="tap-btn"
                              title="View details"
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
                              <Eye size={13} />
                              <span>View</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditMember && onEditMember(member);
                              }}
                              className="tap-btn"
                              title="Edit Member Details"
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: '1px solid #BFDBFE',
                                background: '#EFF6FF',
                                color: '#1D4ED8',
                                fontSize: '11.5px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Edit3 size={13} />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => onOpenWhatsApp && onOpenWhatsApp(member)}
                              className="tap-btn"
                              title="WhatsApp message"
                              style={{
                                padding: '5px 10px',
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
                              <MessageSquare size={13} />
                              <span>WhatsApp</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {filteredMembers.map(member => {
            const badge = getStatusBadge(member.status, member.pendingAmount);
            const initials = member.name
              ? member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
              : 'BL';

            return (
              <div 
                key={member.id} 
                className="bodylife-card" 
                style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      background: '#EFF6FF',
                      color: '#2563EB',
                      fontWeight: '800',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden',
                      border: '1px solid #BFDBFE'
                    }}>
                      {member.photo ? (
                        <img src={member.photo} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        initials
                      )}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                        {member.name}
                      </h4>
                      <p style={{ fontSize: '11px', color: '#64748B', margin: '1px 0 0' }}>
                        {member.id} · {member.phone}
                      </p>
                    </div>
                  </div>

                  <span className={badge.className}>
                    {badge.label}
                  </span>
                </div>

                <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div>
                    <span style={{ fontSize: '10.5px', color: '#64748B' }}>Plan</span>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A', margin: '1px 0 0' }}>{member.packageName}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '10.5px', color: '#64748B' }}>Valid Till</span>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A', margin: '1px 0 0' }}>{member.expiryDate}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '10.5px', color: '#64748B' }}>Paid</span>
                    <p style={{ fontSize: '12.5px', fontWeight: '800', color: '#059669', margin: '1px 0 0' }}>₹{(member.paidAmount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '10.5px', color: '#64748B' }}>Pending</span>
                    <p style={{ fontSize: '12.5px', fontWeight: '800', color: member.pendingAmount > 0 ? '#DC2626' : '#64748B', margin: '1px 0 0' }}>
                      {member.pendingAmount > 0 ? `₹${member.pendingAmount.toLocaleString()}` : 'Cleared'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                  <button
                    onClick={() => onSelectMember && onSelectMember(member)}
                    className="tap-btn"
                    style={{
                      flex: 1,
                      padding: '7px 4px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: '#FFFFFF',
                      color: '#1E40AF',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    View
                  </button>
                  <button
                    onClick={() => onEditMember && onEditMember(member)}
                    className="tap-btn"
                    title="Edit Member"
                    style={{
                      padding: '7px 9px',
                      borderRadius: '6px',
                      border: '1px solid #BFDBFE',
                      background: '#EFF6FF',
                      color: '#1D4ED8',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onOpenWhatsApp && onOpenWhatsApp(member)}
                    className="tap-btn"
                    style={{
                      padding: '7px 9px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#25D366',
                      color: '#FFFFFF',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <MessageSquare size={13} />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
