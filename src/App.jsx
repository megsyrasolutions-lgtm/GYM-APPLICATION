import React, { useState, useEffect, useRef, useCallback } from 'react';
import DesktopLayout from './components/DesktopLayout';

// Admin Screens (Fee & User Management)
import AdminDashboard from './screens/admin/AdminDashboard';
import AdminMembers from './screens/admin/AdminMembers';
import AdminPayments from './screens/admin/AdminPayments';
import AdminAlerts from './screens/admin/AdminAlerts';

// Modals
import AddMemberModal from './modals/AddMemberModal';
import RecordPaymentModal from './modals/RecordPaymentModal';
import DigitalReceiptModal from './modals/DigitalReceiptModal';
import WhatsAppModal from './modals/WhatsAppModal';
import MemberDetailModal from './modals/MemberDetailModal';

// Local Relational Storage & SQLite Dump / Excel Service
import { getLocalDatabase, saveLocalDatabase, exportDatabaseToExcel, generateSqlDump, downloadFile } from './services/db';
import { performHybridSync, pushLocalToSupabase, getLastSyncTime } from './services/syncService';
import { playScannerBeep } from './utils/audio';

export default function App() {
  const [members, setMembers] = useState(() => getLocalDatabase());
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'members' | 'payments' | 'alerts'
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Hybrid Cloud Sync State (Supabase + Local Storage)
  const [syncStatus, setSyncStatus] = useState(() => (navigator.onLine ? 'synced' : 'offline'));
  const [lastSyncedAt, setLastSyncedAt] = useState(() => getLastSyncTime());
  const syncTimeoutRef = useRef(null);

  // In-App Desktop Notification Toast
  const [notification, setNotification] = useState(null);

  // Modals
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [preselectedPaymentMember, setPreselectedPaymentMember] = useState(null);
  const [selectedMemberDetail, setSelectedMemberDetail] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [activeWhatsAppModalData, setActiveWhatsAppModalData] = useState(null);

  // Persist to client laptop local database and trigger background sync to Supabase
  const updateMembersState = useCallback((newMembers) => {
    // 1. Instant local write (Zero latency for front-desk staff)
    setMembers(newMembers);
    saveLocalDatabase(newMembers);

    // 2. Debounced background push to Supabase (if online)
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    if (navigator.onLine) {
      setSyncStatus('syncing');
      syncTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await pushLocalToSupabase(newMembers);
          setSyncStatus('synced');
          setLastSyncedAt(res.syncedAt);
        } catch (err) {
          console.warn('Background sync deferred (offline or network error):', err);
          setSyncStatus(navigator.onLine ? 'error' : 'offline');
        }
      }, 1000);
    } else {
      setSyncStatus('offline');
    }
  }, []);

  // Initial sync & Network connectivity event listeners
  useEffect(() => {
    let mounted = true;

    async function initialSync() {
      if (!navigator.onLine) {
        setSyncStatus('offline');
        return;
      }

      setSyncStatus('syncing');
      try {
        const res = await performHybridSync(members);
        if (!mounted) return;
        if (res.success) {
          setSyncStatus('synced');
          if (res.lastSyncedAt) setLastSyncedAt(res.lastSyncedAt);
          if (Array.isArray(res.members) && res.members.length > 0) {
            setMembers(res.members);
          }
        } else {
          setSyncStatus(res.status || 'error');
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Initial sync failed:', err);
        setSyncStatus('error');
      }
    }

    initialSync();

    const handleOnline = () => {
      setSyncStatus('syncing');
      initialSync();
    };

    const handleOffline = () => {
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      mounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, []);

  // Manual trigger for Cloud Sync button in header / sidebar
  const handleManualSync = async () => {
    if (!navigator.onLine) {
      setSyncStatus('offline');
      showPushNotice({
        title: 'Working Offline',
        message: 'No active internet connection. All changes remain safely saved locally on this PC.',
        icon: '☁️',
        type: 'warning'
      });
      return;
    }

    setSyncStatus('syncing');
    showPushNotice({
      title: 'Syncing with Supabase',
      message: 'Connecting to cloud database and uploading latest records...',
      icon: '🔄'
    });

    try {
      const res = await performHybridSync(members);
      if (res.success) {
        setSyncStatus('synced');
        setLastSyncedAt(res.lastSyncedAt);
        if (Array.isArray(res.members)) {
          setMembers(res.members);
        }
        showPushNotice({
          title: 'Cloud Synced Successfully',
          message: 'All members & payment receipts are backed up to Supabase.',
          icon: '✓'
        });
      } else {
        setSyncStatus(res.status || 'error');
        showPushNotice({
          title: 'Sync Notice',
          message: res.message || 'Sync failed. Local data remains completely safe.',
          icon: '⚠️',
          type: 'warning'
        });
      }
    } catch (err) {
      setSyncStatus('error');
      showPushNotice({
        title: 'Sync Error',
        message: err.message || 'Could not reach Supabase. Local data is preserved.',
        icon: '⚠️',
        type: 'error'
      });
    }
  };

  const showPushNotice = ({ title, message, icon = '⚡', type = 'info' }) => {
    setNotification({ title, message, icon, type });
    if (soundEnabled) playScannerBeep('success');
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Add or Edit Member (User Management)
  const handleSaveMember = (memberData) => {
    const exists = members.some(m => m.id === memberData.id);
    let updated;
    if (exists) {
      updated = members.map(m => m.id === memberData.id ? memberData : m);
      showPushNotice({
        title: 'Member Profile Updated',
        message: `${memberData.name} (${memberData.id}) details saved.`,
        icon: '✓'
      });
    } else {
      updated = [memberData, ...members];
      const feeStatusText = memberData.paidAmount > 0 
        ? `₹${memberData.paidAmount.toLocaleString()} paid` 
        : `Fee pending (₹${memberData.pendingAmount.toLocaleString()} due)`;
      showPushNotice({
        title: 'New Member Enrolled',
        message: `${memberData.name} (${memberData.id}) · ${feeStatusText}`,
        icon: '👤'
      });
      if (soundEnabled && memberData.paidAmount > 0) playScannerBeep('coin');
    }
    updateMembersState(updated);
    setShowAddMember(false);
    setEditingMember(null);
  };

  // Toggle Member Active/Inactive Status
  const handleToggleMemberStatus = (memberId) => {
    const updated = members.map(m => {
      if (m.id === memberId) {
        const nextStatus = m.status === 'Inactive' ? 'Active' : 'Inactive';
        return { ...m, status: nextStatus };
      }
      return m;
    });
    updateMembersState(updated);
    const m = updated.find(x => x.id === memberId);
    showPushNotice({
      title: 'Status Updated',
      message: `${m.name} is now marked as ${m.status}.`,
      icon: m.status === 'Active' ? '✓' : '⚠️'
    });
    if (selectedMemberDetail?.id === memberId) {
      setSelectedMemberDetail(m);
    }
  };

  // Record Fee Payment (Cash & UPI) with full payment guard and future billing support
  const handleRecordPayment = (paymentRecord) => {
    const targetMember = members.find(m => m.id === paymentRecord.memberId);
    if (!targetMember) return;

    // Requirement 9: Prevent additional payments after full payment
    if (targetMember.pendingAmount <= 0 && targetMember.totalFee > 0) {
      showPushNotice({
        title: 'Payment Blocked',
        message: `${targetMember.name} has already fully settled this bill.`,
        icon: '⚠️',
        type: 'warning'
      });
      setShowRecordPayment(false);
      return;
    }

    const updated = members.map(m => {
      if (m.id === paymentRecord.memberId) {
        const currentFee = m.totalFee || paymentRecord.amount;
        const maxPayable = m.pendingAmount > 0 ? m.pendingAmount : currentFee;
        const validAmount = Math.min(paymentRecord.amount, maxPayable);
        const newPaid = (m.paidAmount || 0) + validAmount;
        const newPending = Math.max(0, currentFee - newPaid);
        const newStatus = newPending === 0 ? 'Active' : (m.status === 'Inactive' ? 'Inactive' : 'Active');

        const newRec = {
          receiptId: paymentRecord.receiptId,
          date: paymentRecord.date,
          amount: validAmount,
          mode: paymentRecord.mode,
          utr: paymentRecord.utr,
          status: paymentRecord.status || 'Success',
          isFutureDated: !!paymentRecord.isFutureDated,
          billingMonth: paymentRecord.billingMonth,
          package: paymentRecord.package
        };

        return {
          ...m,
          paidAmount: newPaid,
          pendingAmount: newPending,
          status: newStatus,
          paymentHistory: [newRec, ...(m.paymentHistory || [])]
        };
      }
      return m;
    });

    updateMembersState(updated);
    setShowRecordPayment(false);
    setPreselectedPaymentMember(null);

    if (soundEnabled) playScannerBeep('coin');

    if (paymentRecord.isFutureDated) {
      showPushNotice({
        title: 'Future Payment Bill Generated',
        message: `₹${paymentRecord.amount.toLocaleString()} scheduled for ${paymentRecord.date} (${paymentRecord.mode}).`,
        icon: '📅'
      });
    } else {
      showPushNotice({
        title: 'Payment Recorded',
        message: `₹${paymentRecord.amount.toLocaleString()} received via ${paymentRecord.mode}.`,
        icon: '✓'
      });
    }

    // Open digital receipt / billing voucher
    setActiveReceipt({
      ...paymentRecord,
      totalFee: targetMember.totalFee || paymentRecord.amount,
      pendingAmount: Math.max(0, (targetMember.pendingAmount || 0) - paymentRecord.amount)
    });
  };

  // Export structured Excel Database (.xlsx) to client laptop
  const handleExportExcel = () => {
    try {
      const filename = exportDatabaseToExcel(members);
      showPushNotice({
        title: 'Excel Database Exported',
        message: `${filename} downloaded with Members, Receipts & Financials.`,
        icon: '📊'
      });
    } catch (err) {
      console.error('Failed to export Excel file:', err);
      showPushNotice({
        title: 'Export Error',
        message: 'Could not export Excel file. Please try again.',
        icon: '⚠️',
        type: 'error'
      });
    }
  };

  const overdueOrExpiringCount = members.filter(m => m.status === 'Expiring' || m.status === 'Overdue').length;

  return (
    <DesktopLayout
      activeTab={activeTab}
      onSelectTab={(tabId) => setActiveTab(tabId)}
      members={members}
      notification={notification}
      onDismissNotification={() => setNotification(null)}
      soundEnabled={soundEnabled}
      onToggleSound={() => setSoundEnabled(!soundEnabled)}
      onOpenAddMember={() => { setEditingMember(null); setShowAddMember(true); }}
      onOpenRecordPayment={() => { setPreselectedPaymentMember(null); setShowRecordPayment(true); }}
      onOpenMemberDetail={(m) => setSelectedMemberDetail(m)}
      onOpenNotifications={() => setActiveTab('alerts')}
      onOpenWhatsApp={(m) => setActiveWhatsAppModalData(m)}
      onExportExcel={handleExportExcel}
      onExportSql={handleExportExcel}
      unreadAlertsCount={overdueOrExpiringCount}
      syncState={{
        status: syncStatus,
        lastSyncedAt,
        isSyncing: syncStatus === 'syncing',
        onSync: handleManualSync
      }}
    >
      {/* Exclusively Admin Portal Screens: Fee & User Management */}
      {activeTab === 'dashboard' && (
        <AdminDashboard
          members={members}
          onNavigate={(tab) => setActiveTab(tab)}
          onOpenAddMember={() => { setEditingMember(null); setShowAddMember(true); }}
          onOpenRecordPayment={() => { setPreselectedPaymentMember(null); setShowRecordPayment(true); }}
          onOpenMemberDetail={(m) => setSelectedMemberDetail(m)}
          onOpenWhatsApp={(m) => setActiveWhatsAppModalData(m)}
        />
      )}

      {activeTab === 'members' && (
        <AdminMembers
          members={members}
          onSelectMember={(m) => setSelectedMemberDetail(m)}
          onOpenAddMember={() => { setEditingMember(null); setShowAddMember(true); }}
          onEditMember={(m) => { setEditingMember(m); setShowAddMember(true); }}
          onOpenWhatsApp={(m) => setActiveWhatsAppModalData(m)}
        />
      )}

      {activeTab === 'payments' && (
        <AdminPayments
          members={members}
          onOpenRecordPayment={() => { setPreselectedPaymentMember(null); setShowRecordPayment(true); }}
          onOpenMemberDetail={(m) => setSelectedMemberDetail(m)}
          onViewReceipt={(rec) => setActiveReceipt(rec)}
          onShareWhatsApp={(rec) => setActiveWhatsAppModalData(rec)}
        />
      )}

      {activeTab === 'alerts' && (
        <AdminAlerts
          members={members}
          onOpenMemberDetail={(m) => setSelectedMemberDetail(m)}
          onSelectMember={(m) => setSelectedMemberDetail(m)}
          onOpenWhatsApp={(m) => setActiveWhatsAppModalData(m)}
          onUpdateMembers={updateMembersState}
          onTriggerPushNotification={showPushNotice}
        />
      )}

      {/* Global Desktop Modals */}
      {showAddMember && (
        <AddMemberModal
          editingMember={editingMember}
          existingMembers={members}
          onClose={() => { setShowAddMember(false); setEditingMember(null); }}
          onSave={handleSaveMember}
        />
      )}

      {showRecordPayment && (
        <RecordPaymentModal
          members={members}
          preselectedMember={preselectedPaymentMember}
          onClose={() => { setShowRecordPayment(false); setPreselectedPaymentMember(null); }}
          onRecordPayment={handleRecordPayment}
        />
      )}

      {selectedMemberDetail && (
        <MemberDetailModal
          member={selectedMemberDetail}
          onClose={() => setSelectedMemberDetail(null)}
          onEdit={(m) => {
            setSelectedMemberDetail(null);
            setEditingMember(m);
            setShowAddMember(true);
          }}
          onToggleStatus={(id) => handleToggleMemberStatus(id)}
          onCollectPayment={(m) => {
            setSelectedMemberDetail(null);
            setPreselectedPaymentMember(m);
            setShowRecordPayment(true);
          }}
          onOpenWhatsApp={(m) => {
            setSelectedMemberDetail(null);
            setActiveWhatsAppModalData(m);
          }}
          onViewReceipt={(rec) => {
            setSelectedMemberDetail(null);
            setActiveReceipt(rec);
          }}
        />
      )}

      {activeReceipt && (
        <DigitalReceiptModal
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
          onShareWhatsApp={(rec) => {
            setActiveReceipt(null);
            setActiveWhatsAppModalData(rec);
          }}
        />
      )}

      {activeWhatsAppModalData && (
        <WhatsAppModal
          data={activeWhatsAppModalData}
          onClose={() => setActiveWhatsAppModalData(null)}
          onSent={(data) => {
            const targetId = data.memberId || data.id;
            if (targetId) {
              const nowStr = new Date().toISOString();
              const updated = members.map(m => {
                if (m.id === targetId) {
                  return {
                    ...m,
                    reminderSent: true,
                    reminderStatus: 'Sent',
                    lastReminderSent: nowStr
                  };
                }
                return m;
              });
              updateMembersState(updated);
            }
            setActiveWhatsAppModalData(null);
            showPushNotice({
              title: 'WhatsApp Dispatched',
              message: `Notice sent to ${data.memberName || data.name || 'Member'}.`,
              icon: '📲'
            });
          }}
        />
      )}
    </DesktopLayout>
  );
}
