import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Flashlight, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles,
  Search,
  Clock,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Camera,
  Activity
} from 'lucide-react';
import { playScannerBeep } from '../../utils/audio';
import { getComputedMemberStatus } from '../../utils/statusHelper';

export default function AdminScanner({ 
  members = [], 
  onLogCheckIn, 
  soundEnabled = true 
}) {
  const [torchOn, setTorchOn] = useState(false);
  const [manualIdInput, setManualIdInput] = useState('');
  const [lastScannedResult, setLastScannedResult] = useState(null);

  const todayDateStr = new Date().toISOString().split('T')[0];
  const ATTENDANCE_STORAGE_KEY = `bodylife_attendance_${todayDateStr}`;

  // Today's attendance log (persisted in local storage per day)
  const [todayAttendance, setTodayAttendance] = useState(() => {
    try {
      const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(todayAttendance));
    } catch (e) {
      console.warn('Failed to save attendance:', e);
    }
  }, [todayAttendance, ATTENDANCE_STORAGE_KEY]);

  const handleScanMember = (memberId) => {
    if (!memberId || !memberId.trim()) return;
    const cleanQuery = memberId.trim().toLowerCase();

    const member = members.find(m => 
      (m.id && m.id.toLowerCase() === cleanQuery) || 
      (m.name && m.name.toLowerCase() === cleanQuery) ||
      (m.phone && m.phone.includes(cleanQuery))
    );
    
    if (!member) {
      if (soundEnabled) playScannerBeep('warning');
      alert(`Member ID or Name "${memberId}" not found! Please check again.`);
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Check if already checked in today
    const alreadyIn = todayAttendance.some(x => x.id === member.id);
    const computedStatus = getComputedMemberStatus(member);

    let stateType = 'SUCCESS';
    let message = 'Access Granted · Turnstile Unlocked';

    if (alreadyIn) {
      stateType = 'ALREADY_IN';
      const existingRecord = todayAttendance.find(x => x.id === member.id);
      message = `Already checked in today at ${existingRecord?.timeIn || 'earlier'}`;
      if (soundEnabled) playScannerBeep('warning');
    } else if (computedStatus === 'Inactive') {
      stateType = 'INACTIVE';
      message = 'Membership Deactivated · Front Desk Assistance Required';
      if (soundEnabled) playScannerBeep('warning');
    } else if (computedStatus === 'Expired') {
      stateType = 'EXPIRED';
      message = `Membership Expired on ${member.expiryDate || 'N/A'} · Renewal Required`;
      if (soundEnabled) playScannerBeep('warning');
    } else if (computedStatus === 'Overdue') {
      stateType = 'EXPIRED';
      message = `Fee Overdue ₹${Number(member.pendingAmount || 0).toLocaleString()} · Please clear dues at reception`;
      if (soundEnabled) playScannerBeep('warning');
    } else {
      stateType = 'SUCCESS';
      if (soundEnabled) playScannerBeep('success');
      // Add to today's log
      setTodayAttendance(prev => [
        { 
          id: member.id, 
          name: member.name, 
          timeIn: timeString, 
          status: computedStatus, 
          photo: member.photo, 
          package: member.packageName 
        },
        ...prev.filter(x => x.id !== member.id)
      ]);
      if (onLogCheckIn) onLogCheckIn(member);
    }

    setLastScannedResult({
      member,
      stateType,
      message,
      timeString
    });
    setManualIdInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: 0 }}>
            Front Desk Entrance Scanner & Gate Control
          </h2>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '3px 0 0' }}>
            Optical QR code verification, membership authorization, and turnstile check-in console
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '999px',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#047857' }}>
              Turnstile Gate #1 Online
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Desktop Grid Console */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Left Column: Live Scanner Simulator & Verification Window */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="mint-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={18} color="#10B981" />
                <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: 0 }}>
                  Optical Scanner Feed
                </h4>
              </div>

              <button
                onClick={() => setTorchOn(!torchOn)}
                className="tap-btn"
                title={torchOn ? "Torch On" : "Torch Off"}
                style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  background: torchOn ? '#FEF3C7' : '#FFFFFF',
                  color: torchOn ? '#D97706' : '#6B7280',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Flashlight size={14} />
                <span>{torchOn ? 'LED Torch ON' : 'LED Torch'}</span>
              </button>
            </div>

            {/* Scanner Viewfinder Box */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '320px',
              borderRadius: '24px',
              background: '#0F172A',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6)'
            }}>
              {/* Animated Laser line */}
              <div className="scanner-laser"></div>

              {/* Viewfinder Target Reticle */}
              <div style={{
                position: 'relative',
                width: '210px',
                height: '210px',
                border: '2px dashed rgba(45, 212, 191, 0.4)',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* 4 Corner Markers */}
                <span style={{ position: 'absolute', top: '-2px', left: '-2px', width: '22px', height: '22px', borderTop: '4px solid #10B981', borderLeft: '4px solid #10B981', borderRadius: '4px 0 0 0' }}></span>
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '22px', height: '22px', borderTop: '4px solid #10B981', borderRight: '4px solid #10B981', borderRadius: '0 4px 0 0' }}></span>
                <span style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '22px', height: '22px', borderBottom: '4px solid #10B981', borderLeft: '4px solid #10B981', borderRadius: '0 0 0 4px' }}></span>
                <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '22px', height: '22px', borderBottom: '4px solid #10B981', borderRight: '4px solid #10B981', borderRadius: '0 0 4px 0' }}></span>

                <QrCode size={54} color="rgba(45, 212, 191, 0.75)" strokeWidth={1.5} />
                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600', marginTop: '12px' }}>
                  Position member pass QR here
                </span>
              </div>
            </div>

            {/* Manual ID / Barcode Search Input */}
            <div style={{ marginTop: '18px' }}>
              <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                Manual Desk Check-in / Barcode Scanner Input
              </label>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (manualIdInput.trim()) handleScanMember(manualIdInput.trim());
                }}
                style={{ display: 'flex', gap: '8px' }}
              >
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  background: '#F9FAFB',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  gap: '8px'
                }}>
                  <Search size={16} color="#9CA3AF" />
                  <input
                    type="text"
                    value={manualIdInput}
                    onChange={(e) => setManualIdInput(e.target.value)}
                    placeholder="Enter Member ID (e.g. BL-1001) or Full Name..."
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: '13.5px',
                      color: '#111827',
                      width: '100%'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="tap-btn btn-mint"
                  style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '13px' }}
                >
                  Verify Access
                </button>
              </form>
            </div>

            {/* Quick Simulation One-Click Buttons */}
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px' }}>
                Simulate Member Passes:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {members.slice(0, 4).map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleScanMember(m.id)}
                    className="tap-btn"
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0,0,0,0.06)',
                      background: '#F9FAFB',
                      color: '#374151',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{m.name.split(' ')[0]} ({m.id})</span>
                    <span style={{
                      fontSize: '9px',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      background: m.status === 'Active' ? '#ECFDF5' : '#FFF0EB',
                      color: m.status === 'Active' ? '#047857' : '#EA580C'
                    }}>
                      {m.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Instant Verification Result Card */}
          {lastScannedResult && (
            <div className="mint-card" style={{
              padding: '20px',
              borderLeft: `5px solid ${
                lastScannedResult.stateType === 'SUCCESS' ? '#10B981' :
                lastScannedResult.stateType === 'ALREADY_IN' ? '#3B82F6' : '#EF4444'
              }`,
              background: lastScannedResult.stateType === 'SUCCESS' ? '#F0FDF4' : '#FFFDFD'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: '800', textTransform: 'uppercase', color: lastScannedResult.stateType === 'SUCCESS' ? '#047857' : '#DC2626' }}>
                  Live Admission Verification
                </span>
                <span style={{ fontSize: '11.5px', color: '#6B7280' }}>
                  {lastScannedResult.timeString}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img 
                  src={lastScannedResult.member.avatar} 
                  alt={lastScannedResult.member.name}
                  style={{ width: '52px', height: '52px', borderRadius: '16px', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: 0 }}>
                    {lastScannedResult.member.name}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0' }}>
                    ID: {lastScannedResult.member.id} · {lastScannedResult.member.packageName}
                  </p>
                  <p style={{
                    fontSize: '12.5px',
                    fontWeight: '800',
                    margin: '6px 0 0',
                    color: lastScannedResult.stateType === 'SUCCESS' ? '#059669' : '#DC2626'
                  }}>
                    {lastScannedResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Today's Live Attendance Stream */}
        <div className="mint-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: 0 }}>
                Today's Entrance Check-in Stream
              </h4>
              <p style={{ fontSize: '12.5px', color: '#6B7280', margin: '2px 0 0' }}>
                Live admission log verified at entrance turnstiles
              </p>
            </div>

            <span style={{
              fontSize: '12px',
              fontWeight: '800',
              padding: '4px 12px',
              borderRadius: '999px',
              background: '#ECFDF5',
              color: '#047857'
            }}>
              {todayAttendance.length} Admitted Today
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {todayAttendance.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#6B7280' }}>
                <Clock size={32} color="#9CA3AF" style={{ margin: '0 auto 8px', opacity: 0.6 }} />
                <p style={{ fontSize: '13.5px', fontWeight: '700', color: '#374151', margin: 0 }}>
                  No Check-ins Logged Today
                </p>
                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '4px 0 0' }}>
                  Scan a member QR badge or enter their ID to record turnstile entry
                </p>
              </div>
            ) : (
              todayAttendance.map((log, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    background: '#F9FAFB',
                    border: '1px solid rgba(0,0,0,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={log.avatar} alt={log.name} style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover' }} />
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '800', color: '#111827', margin: 0 }}>
                        {log.name}
                      </p>
                      <p style={{ fontSize: '11.5px', color: '#6B7280', margin: '2px 0 0' }}>
                        ID: {log.id} · {log.package || 'Elite Pass'}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#047857' }}>
                      {log.timeIn}
                    </span>
                    <p style={{ fontSize: '11px', color: '#10B981', fontWeight: '700', margin: '2px 0 0' }}>
                      ✓ Admitted
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
