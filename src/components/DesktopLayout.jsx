import React, { useState, useRef, useEffect, useCallback } from 'react';
import DesktopSidebar from './DesktopSidebar';
import DesktopHeader from './DesktopHeader';
import { X, ChevronRight } from 'lucide-react';

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
  onImportDatabase,
  unreadAlertsCount = 0,
  syncState = null
}) {
  const [isSidebarPinned, setIsSidebarPinned] = useState(() => {
    try {
      return localStorage.getItem('bodylife_sidebar_pinned') === 'true';
    } catch {
      return false;
    }
  });
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const leaveTimerRef = useRef(null);

  const handleMouseEnter = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setIsSidebarHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
    }
    leaveTimerRef.current = setTimeout(() => {
      setIsSidebarHovered(false);
    }, 280);
  }, []);

  const handleTogglePin = useCallback(() => {
    setIsSidebarPinned(prev => {
      const next = !prev;
      try {
        localStorage.setItem('bodylife_sidebar_pinned', String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  }, []);

  // Global mousemove trigger: detects when cursor approaches within 32px of the left screen edge
  useEffect(() => {
    if (isSidebarPinned) return;

    const onGlobalMouseMove = (e) => {
      if (e.clientX <= 32) {
        handleMouseEnter();
      }
    };

    window.addEventListener('mousemove', onGlobalMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onGlobalMouseMove);
    };
  }, [isSidebarPinned, handleMouseEnter]);

  // Escape key to dismiss hover sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSidebarPinned && isSidebarHovered) {
        setIsSidebarHovered(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarPinned, isSidebarHovered]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
      }
    };
  }, []);

  const isSidebarVisible = isSidebarPinned || isSidebarHovered;

  return (
    <div className={`desktop-app-container ${isSidebarPinned ? 'with-pinned-sidebar' : 'with-auto-sidebar'}`}>
      
      {/* Invisible & subtle hover trigger strip on the far-left edge */}
      {!isSidebarPinned && (
        <div
          className="desktop-sidebar-edge-trigger"
          onMouseEnter={handleMouseEnter}
          title="Move cursor here to reveal sidebar"
        >
          <div className="desktop-sidebar-edge-pill">
            <ChevronRight size={13} strokeWidth={2.5} />
          </div>
        </div>
      )}

      {/* Backdrop when auto-hide sidebar is open */}
      {!isSidebarPinned && isSidebarHovered && (
        <div 
          className="desktop-sidebar-backdrop"
          onClick={() => setIsSidebarHovered(false)}
        />
      )}

      {/* Sidebar Wrapper with Auto-Hide or Pinned State */}
      <div
        className={`desktop-sidebar-wrapper ${isSidebarPinned ? 'pinned' : 'auto-hide'} ${isSidebarVisible ? 'visible' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <DesktopSidebar
          activeTab={activeTab}
          onSelectTab={(tabId) => {
            onSelectTab(tabId);
            if (!isSidebarPinned) {
              setIsSidebarHovered(false);
            }
          }}
          alertsBadgeCount={unreadAlertsCount}
          totalMembersCount={members.length}
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
          onOpenAddMember={onOpenAddMember}
          onOpenRecordPayment={onOpenRecordPayment}
          onExportExcel={onExportExcel}
          onExportSql={onExportSql}
          onImportDatabase={onImportDatabase}
          syncState={syncState}
          isPinned={isSidebarPinned}
          onTogglePin={handleTogglePin}
          onCloseSidebar={() => setIsSidebarHovered(false)}
        />
      </div>

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
          isSidebarPinned={isSidebarPinned}
          onToggleSidebar={() => {
            if (isSidebarHovered) {
              setIsSidebarHovered(false);
            } else {
              handleMouseEnter();
            }
          }}
          onMouseEnterSidebar={handleMouseEnter}
        />

        {/* Content Viewport */}
        <main className="desktop-content-area">
          <div className="desktop-content-inner tab-content-fade" key={activeTab}>
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
