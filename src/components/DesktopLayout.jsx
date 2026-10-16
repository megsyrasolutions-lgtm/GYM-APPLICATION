import React from 'react';
import DesktopSidebar from './DesktopSidebar';
import DesktopHeader from './DesktopHeader';
import { X } from 'lucide-react';

export default function DesktopLayout({
  children,
  activeTab,
  onSelectTab,
  members,
  notification,
  onDismissNotification,
  soundEnabled,
  onToggleSound,
  onOpenAddMember,
  onOpenRecordPayment,
  onOpenMemberDetail,
  onOpenNotifications,
  onOpenWhatsApp,
  onExportExcel,
  onExportSql,
  unreadAlertsCount = 0,
  syncState = null
}) {
  return (
    <div className="desktop-app-container">
      {/* Sidebar */}
      <DesktopSidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        alertsBadgeCount={unreadAlertsCount}
        totalMembersCount={members.length}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        onOpenAddMember={onOpenAddMember}
        onOpenRecordPayment={onOpenRecordPayment}
        onExportExcel={onExportExcel}
        onExportSql={onExportSql}
        syncState={syncState}
      />

      {/* Main Area */}
      <div className="desktop-main-wrapper">
        <DesktopHeader
          activeTab={activeTab}
          members={members}
          onOpenAddMember={onOpenAddMember}
          onOpenRecordPayment={onOpenRecordPayment}
          onOpenMemberDetail={onOpenMemberDetail}
          onOpenNotifications={onOpenNotifications}
          onOpenWhatsApp={onOpenWhatsApp}
          unreadAlertsCount={unreadAlertsCount}
          syncState={syncState}
        />

        {/* Content Viewport */}
        <main className="desktop-content-area">
          <div className="desktop-content-inner">
            {children}
          </div>
        </main>

        {/* Floating Toast Notification */}
        {notification && (
          <div className="desktop-toast">
            <span style={{ fontSize: '16px' }}>{notification.icon || '⚡'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#93C5FD', margin: 0 }}>
                {notification.title}
              </p>
              <p style={{ fontSize: '12px', color: '#E2E8F0', margin: '2px 0 0', lineHeight: 1.3 }}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={onDismissNotification}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
