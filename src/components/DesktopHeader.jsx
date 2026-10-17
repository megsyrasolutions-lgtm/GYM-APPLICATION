import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Bell, 
  Search, 
  Plus, 
  CreditCard, 
  UserPlus, 
  AlertCircle,
  Database,
  AlertTriangle,
  Clock,
  CheckCircle,
  MessageSquare,
  ChevronRight,
  X,
  Cloud,
  CloudOff,
  RefreshCw,
  Menu
} from 'lucide-react';
import { getComputedMemberStatus } from '../utils/statusHelper';

export default function DesktopHeader({
  activeTab,
  members,
  onOpenAddMember,
  onOpenRecordPayment,
  onOpenMemberDetail,
  onOpenNotifications,
  onOpenWhatsApp,
  unreadAlertsCount = 0,
  syncState = null,
  isSidebarPinned = false,
  onToggleSidebar,
  onMouseEnterSidebar
}) {
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const notificationsRef = useRef(null);

  // Quick Global Member Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Filter Matching Members for Quick Search
  const matchingMembers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return members
      .filter(m => (m.name && m.name.toLowerCase().includes(q)) || (m.mobile && m.mobile.includes(q)))
      .slice(0, 6);
  }, [members, searchQuery]);

  // Global Shortcut: Ctrl+K or / to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        setIsSearchFocused(true);
      }
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to dismiss search dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    if (isSearchFocused) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchFocused]);

  const formatLastSync = (isoStr) => {
    if (!isoStr) return 'Not synced yet';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recently';
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotificationsDropdown(false);
      }
    }
    if (showNotificationsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationsDropdown]);

  const overdueMembers = members.filter(m => {
    const s = getComputedMemberStatus(m);
    return s === 'Overdue' || s === 'Expired';
  });
  const expiringMembers = members.filter(m => getComputedMemberStatus(m) === 'Expiring');
  const alertList = [...overdueMembers, ...expiringMembers];

  const screenMeta = {
    dashboard: { title: 'Financial Overview', subtitle: 'Live collections, revenue efficiency and pending dues' },
    members: { title: 'Members Directory', subtitle: 'Manage member accounts, packages, and membership status' },
    payments: { title: 'Fee Collections & Ledger', subtitle: 'Official Cash and UPI receipts registered at reception' },
    alerts: { title: 'Due Reminders & WhatsApp', subtitle: 'Track overdue fees and dispatch payment reminder notices' }
  };

  const currentMeta = screenMeta[activeTab] || { title: 'BodyLife', subtitle: 'Gym Management Console' };

  const totalCollected = members.reduce((sum, m) => sum + (m.paidAmount || 0), 0);
  const totalPending = members.reduce((sum, m) => sum + (m.pendingAmount || 0), 0);

  return (
    <header className="desktop-header">
      {/* Screen Title & Hover Menu Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
        {!isSidebarPinned && (
          <button
            onClick={onToggleSidebar}
            onMouseEnter={onMouseEnterSidebar}
            className="tap-btn"
            title="Reveal Menu (Hover or Click)"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              color: '#1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
          >
            <Menu size={18} color="#2563EB" />
          </button>
        )}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
            {currentMeta.title}
          </h2>
          <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0' }}>
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Global Quick Member Search */}
      <div ref={searchContainerRef} className="header-search-wrapper">
        <div className="header-search-box">
          <Search size={15} color="#64748B" />
          <input
            ref={searchInputRef}
            type="text"
            className="header-search-input"
            placeholder="Quick search member... (Ctrl + K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px'
              }}
            >
              <X size={14} />
            </button>
          ) : (
            <span className="header-search-shortcut">Ctrl K</span>
          )}
        </div>

        {/* Live Search Dropdown */}
        {isSearchFocused && searchQuery.trim().length > 0 && (
          <div className="header-search-dropdown">
            <div style={{
              padding: '8px 14px',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#F8FAFC'
            }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Matching Members ({matchingMembers.length})
              </span>
              <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>
                Press ESC to close
              </span>
            </div>

            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
              {matchingMembers.length > 0 ? (
                matchingMembers.map((m) => {
                  const status = getComputedMemberStatus(m);
                  const isOverdue = status === 'Overdue' || status === 'Expired';
                  const isExpiring = status === 'Expiring';
                  const initials = (m.name || 'M')
                    .split(' ')
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <div
                      key={m.id}
                      className="header-search-item"
                      onClick={() => {
                        onOpenMemberDetail(m);
                        setIsSearchFocused(false);
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: isOverdue ? '#FEE2E2' : '#EFF6FF',
                          color: isOverdue ? '#DC2626' : '#2563EB',
                          fontWeight: '800',
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {initials}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                            {m.name}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '11px', color: '#64748B' }}>
                              {m.mobile || 'No Mobile'}
                            </span>
                            <span style={{ fontSize: '10px', color: '#94A3B8' }}>•</span>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: '700',
                              color: isOverdue ? '#DC2626' : isExpiring ? '#D97706' : '#059669',
                              background: isOverdue ? '#FEF2F2' : isExpiring ? '#FEF3C7' : '#ECFDF5',
                              padding: '1px 5px',
                              borderRadius: '4px'
                            }}>
                              {status}
                            </span>
                            {m.pendingAmount > 0 && (
                              <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: '800' }}>
                                ₹{m.pendingAmount.toLocaleString()} due
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '8px' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            onOpenRecordPayment(m);
                            setIsSearchFocused(false);
                          }}
                          className="tap-btn"
                          title="Collect Fee / Record Payment"
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            color: '#1D4ED8',
                            fontSize: '11px',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <CreditCard size={12} color="#2563EB" />
                          <span>Pay</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onOpenMemberDetail(m);
                            setIsSearchFocused(false);
                          }}
                          className="tap-btn"
                          title="View Full Profile"
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            color: '#334155',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Profile
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 10px' }}>
                    No member found matching "{searchQuery}"
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAddMember();
                      setIsSearchFocused(false);
                    }}
                    className="tap-btn btn-primary"
                    style={{ fontSize: '11.5px', padding: '6px 12px' }}
                  >
                    <Plus size={13} />
                    <span>Enroll as New Member</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Stats & Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        
        {/* Total Collected Pill */}
        <div style={{
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '8px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ fontSize: '12px', color: '#1E40AF', fontWeight: '800' }}>
            ₹{totalCollected.toLocaleString()} Collected
          </span>
        </div>

        {/* Pending Dues Pill */}
        {totalPending > 0 && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <AlertCircle size={13} color="#DC2626" />
            <span style={{ fontSize: '12px', color: '#DC2626', fontWeight: '800' }}>
              ₹{totalPending.toLocaleString()} Dues
            </span>
          </div>
        )}

        {/* Supabase Cloud Sync Status Button */}
        {syncState && (
          <button
            onClick={syncState.onSync}
            disabled={syncState.isSyncing}
            className="tap-btn"
            title={`Supabase Cloud Sync: ${syncState.status.toUpperCase()}. Click to sync immediately.`}
            style={{
              background: syncState.status === 'synced' ? '#ECFDF5' :
                          syncState.status === 'syncing' ? '#EFF6FF' :
                          syncState.status === 'offline' ? '#FEF3C7' : '#FEF2F2',
              border: `1px solid ${
                syncState.status === 'synced' ? '#A7F3D0' :
                syncState.status === 'syncing' ? '#BFDBFE' :
                syncState.status === 'offline' ? '#FDE68A' : '#FECACA'
              }`,
              borderRadius: '8px',
              padding: '5px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: syncState.isSyncing ? 'not-allowed' : 'pointer'
            }}
          >
            {syncState.status === 'syncing' ? (
              <RefreshCw size={13} color="#2563EB" className="spin-animation" />
            ) : syncState.status === 'offline' ? (
              <CloudOff size={13} color="#D97706" />
            ) : syncState.status === 'error' ? (
              <AlertCircle size={13} color="#DC2626" />
            ) : (
              <Cloud size={13} color="#059669" />
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', lineHeight: 1.15 }}>
              <span style={{
                fontSize: '11px',
                fontWeight: '800',
                color: syncState.status === 'synced' ? '#065F46' :
                       syncState.status === 'syncing' ? '#1E40AF' :
                       syncState.status === 'offline' ? '#92400E' : '#991B1B'
              }}>
                {syncState.status === 'syncing' ? 'Syncing...' :
                 syncState.status === 'offline' ? 'Offline (Saved)' :
                 syncState.status === 'error' ? 'Sync Failed' : 'Cloud Synced'}
              </span>
              <span style={{ fontSize: '9px', color: '#64748B', fontWeight: '600' }}>
                {syncState.isSyncing ? 'Updating cloud' :
                 syncState.lastSyncedAt ? `Synced ${formatLastSync(syncState.lastSyncedAt)}` : 'Click to sync'}
              </span>
            </div>
          </button>
        )}

        {/* Action Buttons */}
        <button
          onClick={onOpenAddMember}
          className="tap-btn btn-primary"
          style={{ padding: '8px 14px', fontSize: '13px' }}
        >
          <UserPlus size={15} />
          <span>Add Member</span>
        </button>

        <button
          onClick={onOpenRecordPayment}
          className="tap-btn btn-secondary"
          style={{ padding: '8px 14px', fontSize: '13px' }}
        >
          <CreditCard size={15} />
          <span>Collect Fee</span>
        </button>

        {/* Alerts Bell & Dropdown */}
        <div ref={notificationsRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotificationsDropdown(prev => !prev)}
            className="tap-btn"
            title="Due Reminders & Notifications"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: showNotificationsDropdown ? '#EFF6FF' : '#FFFFFF',
              border: showNotificationsDropdown ? '1px solid #2563EB' : '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: showNotificationsDropdown ? '#2563EB' : '#475569',
              position: 'relative',
              cursor: 'pointer'
            }}
          >
            <Bell size={17} />
            {unreadAlertsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                minWidth: '16px',
                height: '16px',
                borderRadius: '999px',
                background: '#DC2626',
                color: '#FFF',
                fontSize: '10px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px'
              }}>
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Interactive Notifications Popover */}
          {showNotificationsDropdown && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '370px',
              maxWidth: '90vw',
              background: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              border: '1px solid var(--border-color)',
              zIndex: 1000,
              overflow: 'hidden'
            }}>
              {/* Popover Header */}
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#F8FAFC'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={15} color="#2563EB" />
                  <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A' }}>
                    Due Reminders & Alerts
                  </span>
                </div>
                {unreadAlertsCount > 0 ? (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    background: '#FEE2E2',
                    color: '#DC2626',
                    padding: '2px 8px',
                    borderRadius: '999px'
                  }}>
                    {unreadAlertsCount} Action Required
                  </span>
                ) : (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    background: '#ECFDF5',
                    color: '#059669',
                    padding: '2px 8px',
                    borderRadius: '999px'
                  }}>
                    All Cleared
                  </span>
                )}
              </div>

              {/* Notification Items List */}
              <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '6px' }}>
                {alertList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748B' }}>
                    <CheckCircle size={32} color="#059669" style={{ margin: '0 auto 8px', opacity: 0.8 }} />
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                      All Clear! No Pending Reminders
                    </p>
                    <p style={{ fontSize: '11.5px', color: '#64748B', margin: '4px 0 0' }}>
                      All member fees and memberships are active & cleared.
                    </p>
                  </div>
                ) : (
                  alertList.map((m) => {
                    const isOverdue = m.status === 'Overdue' || (m.pendingAmount && m.pendingAmount > 0);
                    return (
                      <div
                        key={m.id}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                          transition: 'background 0.15s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div 
                          onClick={() => {
                            setShowNotificationsDropdown(false);
                            onOpenMemberDetail && onOpenMemberDetail(m);
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}
                        >
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: isOverdue ? '#FEE2E2' : '#FEF3C7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {isOverdue ? (
                              <AlertTriangle size={15} color="#DC2626" />
                            ) : (
                              <Clock size={15} color="#D97706" />
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {m.name} <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '500' }}>({m.id})</span>
                            </p>
                            <p style={{ fontSize: '11.5px', color: isOverdue ? '#DC2626' : '#D97706', fontWeight: '600', margin: '2px 0 0' }}>
                              {isOverdue ? `Pending: ₹${(m.pendingAmount || 0).toLocaleString()}` : `Expires: ${m.expiryDate || 'Soon'}`}
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowNotificationsDropdown(false);
                              onOpenWhatsApp && onOpenWhatsApp(m);
                            }}
                            className="tap-btn"
                            title="Send WhatsApp Notice"
                            style={{
                              background: '#25D366',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              fontSize: '11px',
                              fontWeight: '700',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <MessageSquare size={12} />
                            <span>Notify</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Popover Footer */}
              <div style={{
                padding: '10px 14px',
                borderTop: '1px solid var(--border-color)',
                background: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <button
                  onClick={() => {
                    setShowNotificationsDropdown(false);
                    onOpenNotifications && onOpenNotifications();
                  }}
                  className="tap-btn"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px'
                  }}
                >
                  <span>View All in Reminders Screen</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
