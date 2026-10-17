import React, { useRef } from 'react';
import bodylifeLogo from '../assets/bodylife_logo.png';
import { 
  Dumbbell, 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Bell, 
  Volume2, 
  VolumeX, 
  Plus, 
  Database,
  Download, 
  FileSpreadsheet, 
  ShieldCheck, 
  Cloud, 
  CloudOff, 
  RefreshCw,
  Upload,
  Pin,
  PinOff,
  ChevronLeft
} from 'lucide-react';

export default function DesktopSidebar({
  activeTab,
  onSelectTab,
  alertsBadgeCount = 0,
  totalMembersCount = 0,
  soundEnabled,
  onToggleSound,
  onOpenAddMember,
  onOpenRecordPayment,
  onExportExcel,
  onExportSql,
  onImportDatabase,
  syncState = null,
  isPinned = false,
  onTogglePin,
  onCloseSidebar
}) {
  const fileInputRef = useRef(null);

  const navItems = [
    { id: 'dashboard', label: 'Financial Overview', icon: LayoutDashboard },
    { id: 'members', label: 'Members Directory', icon: Users, badge: totalMembersCount },
    { id: 'payments', label: 'Fee Collections & Ledger', icon: CreditCard },
    { id: 'alerts', label: 'Due Reminders & WhatsApp', icon: Bell, badge: alertsBadgeCount, badgeColor: '#DC2626' },
  ];

  return (
    <aside className="desktop-sidebar">
      {/* Brand Header */}
      <div style={{
        padding: '20px 18px 16px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
          flexShrink: 0,
          border: '1px solid #DBEAFE',
          background: '#FFFFFF'
        }}>
          <img 
            src={bodylifeLogo} 
            alt="BodyLife Logo" 
            onError={(e) => { e.currentTarget.src = './bodylife_logo.png'; }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h1 style={{ fontSize: '19px', fontWeight: '800', letterSpacing: '-0.5px', color: '#0F172A', margin: 0 }}>
              BodyLife<span style={{ color: '#2563EB' }}>.</span>
            </h1>
          </div>
          <p style={{ fontSize: '11px', color: '#64748B', margin: '1px 0 0', fontWeight: '600' }}>
            Gym Management System
          </p>
        </div>

        {/* Pin & Close Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {onTogglePin && (
            <button
              onClick={onTogglePin}
              className="tap-btn"
              title={isPinned ? "Unpin sidebar (Auto-hide on hover)" : "Pin sidebar to screen"}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: isPinned ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                background: isPinned ? '#EFF6FF' : '#F8FAFC',
                color: isPinned ? '#2563EB' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              {isPinned ? <PinOff size={13} /> : <Pin size={13} />}
            </button>
          )}
          {!isPinned && onCloseSidebar && (
            <button
              onClick={onCloseSidebar}
              className="tap-btn"
              title="Close sidebar"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                background: '#F8FAFC',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ChevronLeft size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <p style={{ fontSize: '10px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 8px 8px' }}>
          Modules
        </p>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className="tap-btn"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? '#EFF6FF' : 'transparent',
                  color: isActive ? '#1D4ED8' : '#334155',
                  fontWeight: isActive ? '700' : '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  borderLeft: isActive ? '3px solid #2563EB' : '3px solid transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon 
                    size={18} 
                    color={isActive ? '#2563EB' : '#64748B'} 
                    strokeWidth={isActive ? 2.3 : 1.9}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    background: item.badgeColor || '#DBEAFE',
                    color: item.badgeColor ? '#FFFFFF' : '#1D4ED8',
                    minWidth: '20px',
                    textAlign: 'center'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Operations */}
        <div style={{ marginTop: '24px', padding: '0 4px' }}>
          <p style={{ fontSize: '10px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
            Quick Operations
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={onOpenAddMember}
              className="tap-btn"
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #BFDBFE',
                background: '#EFF6FF',
                color: '#1D4ED8',
                fontSize: '12.5px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <Plus size={15} color="#2563EB" />
              <span>Enroll Member</span>
            </button>

            <button
              onClick={onOpenRecordPayment}
              className="tap-btn"
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: '#0F172A',
                fontSize: '12.5px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <CreditCard size={15} color="#2563EB" />
              <span>Record Fee</span>
            </button>

            <button
              onClick={onExportExcel || onExportSql}
              className="tap-btn"
              title="Export structured Excel database (.xlsx) with members, receipts and financial summary"
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #BBF7D0',
                background: '#F0FDF4',
                color: '#166534',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <FileSpreadsheet size={15} color="#16A34A" />
              <span>Export to Excel (.xlsx)</span>
            </button>

            {onImportDatabase && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .json"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onImportDatabase(file);
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="tap-btn"
                  title="Restore or import client records from Excel (.xlsx) or JSON backup"
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    background: '#FFFFFF',
                    color: '#475569',
                    fontSize: '12px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Upload size={15} color="#2563EB" />
                  <span>Restore / Import Data</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border-color)',
        background: '#F8FAFC'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={onToggleSound}
              className="tap-btn"
              title={soundEnabled ? "Audio Chime ON" : "Audio Muted"}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: '#FFFFFF',
                color: soundEnabled ? '#2563EB' : '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>Local+Cloud</span>
          </div>

          {syncState ? (
            <button
              onClick={syncState.onSync}
              disabled={syncState.isSyncing}
              className="tap-btn"
              title={syncState.isSyncing ? "Syncing in progress..." : "Click to sync local data to Supabase"}
              style={{
                fontSize: '11px',
                fontWeight: '700',
                background: syncState.status === 'synced' ? '#ECFDF5' :
                            syncState.status === 'syncing' ? '#EFF6FF' :
                            syncState.status === 'offline' ? '#FEF3C7' : '#FEF2F2',
                color: syncState.status === 'synced' ? '#059669' :
                       syncState.status === 'syncing' ? '#2563EB' :
                       syncState.status === 'offline' ? '#D97706' : '#DC2626',
                border: 'none',
                padding: '3px 8px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: syncState.isSyncing ? 'not-allowed' : 'pointer'
              }}
            >
              {syncState.status === 'syncing' ? (
                <RefreshCw size={11} className="spin-animation" />
              ) : syncState.status === 'offline' ? (
                <CloudOff size={11} />
              ) : (
                <Cloud size={11} />
              )}
              <span>{syncState.status === 'syncing' ? 'Syncing' : syncState.status === 'offline' ? 'Offline' : 'Synced'}</span>
            </button>
          ) : (
            <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700', background: '#ECFDF5', padding: '2px 6px', borderRadius: '4px' }}>
              ● Ready
            </span>
          )}
        </div>

        <div style={{
          padding: '8px 10px',
          background: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563EB',
            fontWeight: '800',
            fontSize: '12px'
          }}>
            BL
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
              Front Desk Admin
            </p>
            <p style={{ fontSize: '10.5px', color: '#64748B', margin: 0 }}>
              BodyLife Console
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
