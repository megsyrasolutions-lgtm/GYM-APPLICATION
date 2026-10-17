import React, { useState, useRef, useEffect } from 'react';
import { X, UserPlus, Upload, Trash2, Camera, Check, AlertCircle, Dumbbell, HeartPulse, Video, VideoOff } from 'lucide-react';
import { DEFAULT_PACKAGES, DEFAULT_ADMISSION_FEE } from '../services/db';

export default function AddMemberModal({ 
  onClose, 
  onSave, 
  editingMember = null,
  existingMembers = [] 
}) {
  const isEditing = !!editingMember;
  const fileInputRef = useRef(null);
  const dialogRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Generate guaranteed unique ID if adding new member
  const computeNextId = (memberList = existingMembers) => {
    if (editingMember?.id) return editingMember.id;
    let maxNum = 1000;
    (memberList || []).forEach(m => {
      const match = String(m.id || '').match(/BL-(\d+)/i) || String(m.id || '').match(/(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    let nextNum = maxNum + 1;
    while ((memberList || []).some(m => String(m.id || '').trim().toUpperCase() === `BL-${nextNum}`)) {
      nextNum++;
    }
    return `BL-${nextNum}`;
  };

  // Form states
  const [memberId, setMemberId] = useState(() => computeNextId());
  const [name, setName] = useState(editingMember?.name || '');
  const [phone, setPhone] = useState(editingMember?.phone || '');
  const [email, setEmail] = useState(editingMember?.email || '');
  const [gender, setGender] = useState(editingMember?.gender || 'Male');
  const [age, setAge] = useState(editingMember?.age || 25);
  const [photo, setPhoto] = useState(editingMember?.photo || '');
  
  // Package & Category States
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (editingMember?.packageId) {
      const match = DEFAULT_PACKAGES.find(p => p.id === editingMember.packageId);
      if (match?.category) return match.category;
    }
    return 'Body Building';
  });
  const [packageId, setPackageId] = useState(() => {
    if (editingMember?.packageId && DEFAULT_PACKAGES.some(p => p.id === editingMember.packageId)) {
      return editingMember.packageId;
    }
    return DEFAULT_PACKAGES[0].id;
  });
  const [includeAdmissionFee, setIncludeAdmissionFee] = useState(!isEditing);
  const [startDate, setStartDate] = useState(editingMember?.startDate || new Date().toISOString().split('T')[0]);
  
  const selectedPkg = DEFAULT_PACKAGES.find(p => p.id === packageId) || DEFAULT_PACKAGES[0];

  const computeDefaultExpiry = (start, durationDays) => {
    try {
      const d = new Date(start);
      d.setDate(d.getDate() + durationDays);
      return d.toISOString().split('T')[0];
    } catch {
      return start;
    }
  };

  const [expiryDate, setExpiryDate] = useState(
    editingMember?.expiryDate || computeDefaultExpiry(startDate, selectedPkg.durationDays)
  );

  // Fee Mode: 'unpaid' | 'partial' | 'full'
  const determineInitialFeeMode = () => {
    if (!editingMember) return 'unpaid';
    if (editingMember.paidAmount === 0) return 'unpaid';
    if (editingMember.pendingAmount > 0) return 'partial';
    return 'full';
  };

  const [feeMode, setFeeMode] = useState(determineInitialFeeMode);
  const [paidNow, setPaidNow] = useState(() => {
    if (editingMember) return editingMember.paidAmount || 0;
    return 0;
  });
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [utrNumber, setUtrNumber] = useState('');
  const [lockerNumber, setLockerNumber] = useState(editingMember?.lockerNumber || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Clear single field error
  const clearFieldError = (field) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (errorMsg) setErrorMsg('');
  };

  // Live Webcam States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');

  // Start Live Webcam
  const handleStartCamera = async () => {
    setCameraError('');
    setIsCameraActive(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser or environment.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 480 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Video play error:', e));
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(err.message || 'Unable to access webcam. Please check camera permissions.');
    }
  };

  // Stop Webcam stream
  const handleStopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCameraError('');
  };

  // Capture Photo Frame to Canvas
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const vw = video.videoWidth || 320;
    const vh = video.videoHeight || 320;
    const size = Math.min(vw, vh);

    canvas.width = 320;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');

    // Center crop square
    const sx = (vw - size) / 2;
    const sy = (vh - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, 320, 320);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPhoto(dataUrl);
    handleStopCamera();
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleModalClose = () => {
    handleStopCamera();
    onClose();
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Please choose an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setPhoto(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const admissionCharge = (!isEditing && includeAdmissionFee) ? DEFAULT_ADMISSION_FEE : 0;
  const totalFee = selectedPkg.price + admissionCharge;
  const currentPaid = Number(paidNow || 0);
  const pendingAmount = Math.max(0, totalFee - currentPaid);

  // Handle Package Change
  const handlePackageChange = (id) => {
    setPackageId(id);
    clearFieldError('packageId');
    const pkg = DEFAULT_PACKAGES.find(p => p.id === id);
    if (pkg) {
      setExpiryDate(computeDefaultExpiry(startDate, pkg.durationDays));
      const newTotal = pkg.price + admissionCharge;
      if (feeMode === 'full') {
        setPaidNow(newTotal);
      } else if (feeMode === 'partial' && paidNow > newTotal) {
        setPaidNow(newTotal);
      }
    }
  };

  // Handle Category Change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    clearFieldError('packageId');
    const currentDuration = selectedPkg.durationDays;
    const match = DEFAULT_PACKAGES.find(p => p.category === category && p.durationDays === currentDuration) 
      || DEFAULT_PACKAGES.find(p => p.category === category)
      || DEFAULT_PACKAGES[0];
    handlePackageChange(match.id);
  };

  // Handle Admission Fee Toggle
  const handleToggleAdmissionFee = (checked) => {
    setIncludeAdmissionFee(checked);
    const newAdmission = checked ? DEFAULT_ADMISSION_FEE : 0;
    const newTotal = selectedPkg.price + newAdmission;
    if (feeMode === 'full') {
      setPaidNow(newTotal);
    } else if (feeMode === 'partial' && paidNow > newTotal) {
      setPaidNow(newTotal);
    }
  };

  // Handle Fee Mode Selection
  const handleFeeModeChange = (mode) => {
    setFeeMode(mode);
    clearFieldError('paidNow');
    if (mode === 'unpaid') {
      setPaidNow(0);
    } else if (mode === 'full') {
      setPaidNow(totalFee);
    } else if (mode === 'partial') {
      setPaidNow(Math.round(totalFee / 2));
    }
  };

  // Comprehensive Form Validation
  const validateForm = () => {
    const errors = {};
    const cleanId = String(memberId || '').trim().toUpperCase();

    // 1. Member ID
    if (!cleanId) {
      errors.memberId = 'Member ID is required.';
    } else if (!/^[A-Z0-9_-]+$/i.test(cleanId)) {
      errors.memberId = 'Member ID can only contain letters, numbers, and hyphens.';
    } else if (!isEditing) {
      const idExists = existingMembers?.some(m => String(m.id || '').trim().toUpperCase() === cleanId);
      if (idExists) {
        errors.memberId = `Member ID "${cleanId}" already exists. Please choose a unique ID or click Auto ID.`;
      }
    } else if (isEditing && editingMember && String(editingMember.id || '').trim().toUpperCase() !== cleanId) {
      const idExists = existingMembers?.some(m => String(m.id || '').trim().toUpperCase() === cleanId && m.id !== editingMember.id);
      if (idExists) {
        errors.memberId = `Member ID "${cleanId}" already belongs to another member.`;
      }
    }

    // 2. Full Name
    const cleanName = name.trim();
    if (!cleanName) {
      errors.name = 'Full name is mandatory.';
    } else if (cleanName.length < 2) {
      errors.name = 'Full name must contain at least 2 characters.';
    } else if (!/^[\p{L}\p{N}\s.'\-()&/]+$/u.test(cleanName)) {
      errors.name = 'Full name should only contain letters, numbers and standard punctuation.';
    }

    // 3. Phone Number
    const rawPhone = phone.trim();
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    if (!rawPhone) {
      errors.phone = 'Phone number is mandatory.';
    } else if (cleanPhone.length < 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number.';
    } else if (cleanPhone.length > 13) {
      errors.phone = 'Phone number is too long (maximum 10-12 digits).';
    }

    // 4. Email (optional, but strictly validated if entered)
    const cleanEmail = email.trim();
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.email = 'Please enter a valid email address (e.g. member@example.com).';
    }

    // 5. Gender
    if (!gender) {
      errors.gender = 'Please select a gender.';
    }

    // 6. Age
    const numAge = Number(age);
    if (!age && age !== 0) {
      errors.age = 'Age is required.';
    } else if (isNaN(numAge) || numAge < 10 || numAge > 100) {
      errors.age = 'Age must be between 10 and 100 years.';
    }

    // 7. Package
    if (!packageId || !DEFAULT_PACKAGES.some(p => p.id === packageId)) {
      errors.packageId = 'Please select a valid membership package plan.';
    }

    // 8. Start Date & Expiry Date
    if (!startDate) {
      errors.startDate = 'Joining / Start date is required.';
    }
    if (!expiryDate) {
      errors.expiryDate = 'Membership expiry date is required.';
    } else if (startDate && expiryDate < startDate) {
      errors.expiryDate = 'Expiry date cannot be earlier than joining date.';
    }

    // 9. Paid Amount Validation
    const paidNum = Number(paidNow || 0);
    if (isNaN(paidNum) || paidNum < 0) {
      errors.paidNow = 'Paid amount cannot be negative.';
    } else if (paidNum > totalFee) {
      errors.paidNow = `Amount paid cannot exceed total package fee of ₹${totalFee.toLocaleString()}.`;
    }

    // 10. Payment Mode
    if (paidNum > 0 && !paymentMode) {
      errors.paymentMode = 'Please select a payment mode (UPI or Cash).';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateForm()) {
      setErrorMsg('Please correct the highlighted errors before submitting the form.');
      if (dialogRef.current) {
        dialogRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    const cleanId = String(memberId || '').trim().toUpperCase();

    // Determine status
    let memberStatus = 'Active';
    if (pendingAmount > 0) {
      memberStatus = 'Overdue'; // Fee pending
    }

    // Build payment history
    let paymentHistory = editingMember?.paymentHistory ? [...editingMember.paymentHistory] : [];
    if (currentPaid > 0 && !isEditing) {
      paymentHistory = [
        {
          receiptId: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
          date: startDate,
          amount: currentPaid,
          mode: paymentMode,
          utr: paymentMode === 'UPI' ? (utrNumber || `UPI/${Date.now().toString().slice(-8)}`) : 'CASH-DESK',
          status: 'Success',
          package: selectedPkg.name
        }
      ];
    }

    const memberData = {
      id: cleanId,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      gender,
      age: Number(age) || 0,
      photo,
      packageId,
      packageName: selectedPkg.name,
      packageCategory: selectedCategory,
      admissionFee: admissionCharge,
      totalFee,
      paidAmount: currentPaid,
      pendingAmount,
      startDate,
      expiryDate,
      status: memberStatus,
      lockerNumber: lockerNumber.trim(),
      paymentHistory
    };

    onSave(memberData);
  };

  return (
    <div className="modal-backdrop" onClick={handleModalClose}>
      <div 
        ref={dialogRef}
        className="desktop-modal-dialog" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '680px', 
          maxHeight: '90vh', 
          overflowY: 'auto',
          position: 'relative',
          padding: '20px 24px'
        }}
      >
        {/* Header (Sticky at top) */}
        <div style={{ 
          position: 'sticky', 
          top: '-20px', 
          background: '#FFFFFF', 
          zIndex: 20, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          paddingTop: '4px',
          paddingBottom: '14px', 
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={18} color="#2563EB" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                {isEditing ? 'Edit Member Account' : 'Enroll New Member'}
              </h3>
              <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0' }}>
                {isEditing ? `Modifying profile for ID: ${editingMember.id}` : 'Create member account in local database'}
              </p>
            </div>
          </div>

          <button 
            onClick={handleModalClose}
            className="tap-btn"
            style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={16} color="#64748B" />
          </button>
        </div>

        {errorMsg && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '6px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#B91C1C',
            fontSize: '12.5px',
            fontWeight: '600'
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Section: Profile Photo & Member ID */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            {/* Photo Avatar Preview */}
            <div style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '10px', background: '#EFF6FF', border: '2px solid #BFDBFE', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {photo ? (
                <img src={photo} alt="Member" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Camera size={26} color="#3B82F6" />
              )}
            </div>

            <div style={{ flex: 1, minWidth: '220px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B', display: 'block', marginBottom: '6px' }}>
                Member Profile Photo
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleStartCamera}
                  className="tap-btn"
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #2563EB',
                    background: '#2563EB',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Camera size={14} />
                  <span>Take Live Photo</span>
                </button>

                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="tap-btn"
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #BFDBFE',
                    background: '#FFFFFF',
                    color: '#2563EB',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Upload size={13} />
                  <span>{photo ? 'Change File' : 'Upload File'}</span>
                </button>

                {photo && (
                  <button
                    type="button"
                    onClick={() => setPhoto('')}
                    className="tap-btn"
                    title="Remove Photo"
                    style={{
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1px solid #FECACA',
                      background: '#FFF1F2',
                      color: '#EF4444',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Live Camera Viewfinder Box if active */}
            {isCameraActive && (
              <div style={{
                width: '100%',
                background: '#0F172A',
                borderRadius: '12px',
                padding: '16px',
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                marginTop: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
                    <span style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.5px' }}>
                      DESK WEBCAM LIVE PREVIEW
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleStopCamera}
                    style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {cameraError ? (
                  <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #EF4444', borderRadius: '8px', color: '#FCA5A5', fontSize: '12px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 8px', fontWeight: '700' }}>{cameraError}</p>
                    <button
                      type="button"
                      onClick={handleStartCamera}
                      style={{ padding: '6px 12px', borderRadius: '6px', background: '#EF4444', color: '#FFF', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '11px' }}
                    >
                      Retry Camera
                    </button>
                  </div>
                ) : (
                  <div style={{ position: 'relative', width: '240px', height: '240px', borderRadius: '12px', overflow: 'hidden', background: '#1E293B', border: '3px solid #3B82F6' }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', inset: '16px', border: '2px dashed rgba(255,255,255,0.6)', borderRadius: '50%', pointerEvents: 'none' }} />
                    <span style={{ position: 'absolute', bottom: '6px', left: 0, right: 0, textAlign: 'center', fontSize: '10.5px', color: '#E2E8F0', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                      Center face in frame
                    </span>
                  </div>
                )}

                {!cameraError && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      className="tap-btn"
                      style={{
                        padding: '8px 20px',
                        borderRadius: '6px',
                        background: '#16A34A',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Check size={16} />
                      <span>Capture Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleStopCamera}
                      className="tap-btn"
                      style={{
                        padding: '8px 14px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.15)',
                        color: '#E2E8F0',
                        border: '1px solid rgba(255,255,255,0.3)',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Editable Member ID */}
            <div style={{ minWidth: '160px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B', display: 'block', margin: 0 }}>
                  Member ID *
                </label>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = computeNextId();
                      setMemberId(next);
                      clearFieldError('memberId');
                    }}
                    style={{
                      fontSize: '11px',
                      color: '#2563EB',
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      padding: '1px 6px',
                      fontWeight: '700'
                    }}
                    title="Generate next available ID"
                  >
                    Auto ID
                  </button>
                )}
              </div>
              <input 
                type="text"
                required
                value={memberId}
                onChange={(e) => {
                  setMemberId(e.target.value.toUpperCase());
                  clearFieldError('memberId');
                }}
                placeholder="e.g. BL-1001"
                className="form-input"
                style={{
                  fontFamily: 'monospace',
                  fontWeight: '700',
                  letterSpacing: '0.5px',
                  borderColor: fieldErrors.memberId ? '#EF4444' : undefined,
                  background: fieldErrors.memberId ? '#FEF2F2' : undefined
                }}
              />
              {fieldErrors.memberId && (
                <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: '600', marginTop: '3px', display: 'block' }}>
                  {fieldErrors.memberId}
                </span>
              )}
            </div>
          </div>

          {/* Row: Full Name & Phone Number */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Full Name *
              </label>
              <input 
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearFieldError('name');
                }}
                placeholder="e.g. Ramesh Kumar"
                className="form-input"
                style={{
                  borderColor: fieldErrors.name ? '#EF4444' : undefined,
                  background: fieldErrors.name ? '#FEF2F2' : undefined
                }}
              />
              {fieldErrors.name && (
                <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: '600', marginTop: '3px', display: 'block' }}>
                  {fieldErrors.name}
                </span>
              )}
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Phone Number *
              </label>
              <input 
                type="tel"
                required
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearFieldError('phone');
                }}
                placeholder="10-digit mobile number"
                className="form-input"
                style={{
                  borderColor: fieldErrors.phone ? '#EF4444' : undefined,
                  background: fieldErrors.phone ? '#FEF2F2' : undefined
                }}
              />
              {fieldErrors.phone && (
                <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: '600', marginTop: '3px', display: 'block' }}>
                  {fieldErrors.phone}
                </span>
              )}
            </div>
          </div>

          {/* Row: Email & Locker Number */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Email Address (Optional)
              </label>
              <input 
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError('email');
                }}
                placeholder="member@email.com"
                className="form-input"
                style={{
                  borderColor: fieldErrors.email ? '#EF4444' : undefined,
                  background: fieldErrors.email ? '#FEF2F2' : undefined
                }}
              />
              {fieldErrors.email && (
                <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: '600', marginTop: '3px', display: 'block' }}>
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Locker No. (Optional)
              </label>
              <input 
                type="text"
                value={lockerNumber}
                onChange={(e) => setLockerNumber(e.target.value)}
                placeholder="e.g. L-12"
                className="form-input"
              />
            </div>
          </div>

          {/* Row: Gender & Age */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Gender *
              </label>
              <select 
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  clearFieldError('gender');
                }}
                className="form-input"
                style={{
                  borderColor: fieldErrors.gender ? '#EF4444' : undefined
                }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {fieldErrors.gender && (
                <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: '600', marginTop: '3px', display: 'block' }}>
                  {fieldErrors.gender}
                </span>
              )}
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Age (Years) *
              </label>
              <input 
                type="number"
                min="10"
                max="100"
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  clearFieldError('age');
                }}
                className="form-input"
                style={{
                  borderColor: fieldErrors.age ? '#EF4444' : undefined,
                  background: fieldErrors.age ? '#FEF2F2' : undefined
                }}
              />
              {fieldErrors.age && (
                <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: '600', marginTop: '3px', display: 'block' }}>
                  {fieldErrors.age}
                </span>
              )}
            </div>
          </div>

          {/* Section: Membership Package */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Select Membership Package *
              </label>

              {/* Segmented Pill Selector (matches user screenshot) */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#F1F5F9',
                padding: '3px',
                borderRadius: '9999px',
                border: '1px solid #E2E8F0',
                gap: '4px'
              }}>
                <button
                  type="button"
                  onClick={() => handleCategoryChange('Body Building')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    border: 'none',
                    background: selectedCategory === 'Body Building' ? '#2563EB' : 'transparent',
                    color: selectedCategory === 'Body Building' ? '#FFFFFF' : '#475569',
                    fontSize: '12.5px',
                    fontWeight: selectedCategory === 'Body Building' ? '700' : '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: selectedCategory === 'Body Building' ? '0 1px 3px rgba(37,99,235,0.35)' : 'none'
                  }}
                >
                  <span>💪</span>
                  <span>Body Building</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryChange('Cardio & Fitness')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    border: 'none',
                    background: selectedCategory === 'Cardio & Fitness' ? '#2563EB' : 'transparent',
                    color: selectedCategory === 'Cardio & Fitness' ? '#FFFFFF' : '#475569',
                    fontSize: '12.5px',
                    fontWeight: selectedCategory === 'Cardio & Fitness' ? '700' : '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: selectedCategory === 'Cardio & Fitness' ? '0 1px 3px rgba(37,99,235,0.35)' : 'none'
                  }}
                >
                  <span>🏃</span>
                  <span>Cardio & Fitness</span>
                </button>
              </div>
            </div>

            {/* Packages Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {DEFAULT_PACKAGES.filter(p => p.category === selectedCategory).map((pkg) => {
                const isSelected = pkg.id === packageId;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => handlePackageChange(pkg.id)}
                    style={{
                      border: isSelected ? '2px solid #2563EB' : '1px solid var(--border-color)',
                      background: isSelected ? '#EFF6FF' : '#FFFFFF',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '800', color: isSelected ? '#1E40AF' : '#0F172A', margin: 0 }}>
                        {pkg.shortName || pkg.name}
                      </p>
                      <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0' }}>
                        {pkg.durationDays} Days validity
                      </p>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#2563EB' }}>
                      ₹{pkg.price.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Admission Fee Row */}
            {!isEditing && (
              <div style={{
                marginTop: '10px',
                padding: '9px 12px',
                background: includeAdmissionFee ? '#EFF6FF' : '#F8FAFC',
                border: `1px solid ${includeAdmissionFee ? '#BFDBFE' : '#E2E8F0'}`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={includeAdmissionFee}
                    onChange={(e) => handleToggleAdmissionFee(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#2563EB', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B' }}>
                    One-time Admission Fee
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    (Official Registration: Rs. 100)
                  </span>
                </label>
                <span style={{ fontSize: '12.5px', fontWeight: '800', color: includeAdmissionFee ? '#2563EB' : '#94A3B8' }}>
                  ₹100
                </span>
              </div>
            )}

            {fieldErrors.packageId && (
              <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: '600', marginTop: '4px', display: 'block' }}>
                {fieldErrors.packageId}
              </span>
            )}
          </div>

          {/* Row: Start Date & Expiry Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Joining / Start Date *
              </label>
              <input 
                type="date"
                required
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setExpiryDate(computeDefaultExpiry(e.target.value, selectedPkg.durationDays));
                  clearFieldError('startDate');
                  clearFieldError('expiryDate');
                }}
                className="form-input"
                style={{
                  borderColor: fieldErrors.startDate ? '#EF4444' : undefined,
                  background: fieldErrors.startDate ? '#FEF2F2' : undefined
                }}
              />
              {fieldErrors.startDate && (
                <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: '600', marginTop: '3px', display: 'block' }}>
                  {fieldErrors.startDate}
                </span>
              )}
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Membership Expiry Date *
              </label>
              <input 
                type="date"
                required
                value={expiryDate}
                onChange={(e) => {
                  setExpiryDate(e.target.value);
                  clearFieldError('expiryDate');
                }}
                className="form-input"
                style={{
                  borderColor: fieldErrors.expiryDate ? '#EF4444' : undefined,
                  background: fieldErrors.expiryDate ? '#FEF2F2' : undefined
                }}
              />
              {fieldErrors.expiryDate && (
                <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: '600', marginTop: '3px', display: 'block' }}>
                  {fieldErrors.expiryDate}
                </span>
              )}
            </div>
          </div>

          {/* Section: Fee Status Selection (Unpaid / Partial / Full) */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #DBEAFE',
            borderRadius: '8px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div>
              <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A', display: 'block' }}>
                Fee Payment Status for this Member
              </span>
              <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0' }}>
                Choose "Unpaid / Fee Pending" if adding previous members who haven't paid this month's fee yet.
              </p>
            </div>

            {/* Fee Mode Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleFeeModeChange('unpaid')}
                style={{
                  padding: '9px 8px',
                  borderRadius: '6px',
                  border: feeMode === 'unpaid' ? '2px solid #EF4444' : '1px solid #CBD5E1',
                  background: feeMode === 'unpaid' ? '#FEF2F2' : '#FFFFFF',
                  color: feeMode === 'unpaid' ? '#B91C1C' : '#475569',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Unpaid / Fee Pending
              </button>

              <button
                type="button"
                onClick={() => handleFeeModeChange('partial')}
                style={{
                  padding: '9px 8px',
                  borderRadius: '6px',
                  border: feeMode === 'partial' ? '2px solid #F59E0B' : '1px solid #CBD5E1',
                  background: feeMode === 'partial' ? '#FFFBEB' : '#FFFFFF',
                  color: feeMode === 'partial' ? '#B45309' : '#475569',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Partial Paid
              </button>

              <button
                type="button"
                onClick={() => handleFeeModeChange('full')}
                style={{
                  padding: '9px 8px',
                  borderRadius: '6px',
                  border: feeMode === 'full' ? '2px solid #2563EB' : '1px solid #CBD5E1',
                  background: feeMode === 'full' ? '#EFF6FF' : '#FFFFFF',
                  color: feeMode === 'full' ? '#1D4ED8' : '#475569',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Paid in Full
              </button>
            </div>

            {/* Amount details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '2px' }}>
                  Total Package Fee
                </label>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', padding: '8px 10px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  ₹{totalFee.toLocaleString()}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '2px' }}>
                  Amount Paid Now (₹) *
                </label>
                <input 
                  type="number"
                  min="0"
                  max={totalFee}
                  value={paidNow}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const val = raw === '' ? 0 : Number(raw);
                    setPaidNow(val);
                    clearFieldError('paidNow');
                    if (val === 0) setFeeMode('unpaid');
                    else if (val >= totalFee) setFeeMode('full');
                    else setFeeMode('partial');
                  }}
                  className="form-input"
                  style={{
                    fontWeight: '700',
                    borderColor: fieldErrors.paidNow ? '#EF4444' : undefined,
                    background: fieldErrors.paidNow ? '#FEF2F2' : undefined
                  }}
                />
                {fieldErrors.paidNow && (
                  <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: '600', marginTop: '2px', display: 'block' }}>
                    {fieldErrors.paidNow}
                  </span>
                )}
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '2px' }}>
                  Pending Due Balance
                </label>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '800',
                  color: pendingAmount > 0 ? '#DC2626' : '#16A34A',
                  padding: '8px 10px',
                  background: pendingAmount > 0 ? '#FEF2F2' : '#F0FDF4',
                  borderRadius: '6px',
                  border: `1px solid ${pendingAmount > 0 ? '#FECACA' : '#BBF7D0'}`
                }}>
                  {pendingAmount > 0 ? `₹${pendingAmount.toLocaleString()} Due` : '✓ Cleared'}
                </div>
              </div>
            </div>

            {/* Payment Mode options if paying now */}
            {currentPaid > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingTop: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>Payment Mode:</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                  <input 
                    type="radio"
                    name="modalPayMode"
                    value="UPI"
                    checked={paymentMode === 'UPI'}
                    onChange={() => setPaymentMode('UPI')}
                  />
                  UPI (GPay / PhonePe)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                  <input 
                    type="radio"
                    name="modalPayMode"
                    value="Cash"
                    checked={paymentMode === 'Cash'}
                    onChange={() => setPaymentMode('Cash')}
                  />
                  Cash at Reception
                </label>
              </div>
            )}
          </div>

          {/* Footer Actions (Sticky at bottom) */}
          <div style={{ 
            position: 'sticky', 
            bottom: '-20px', 
            background: '#FFFFFF', 
            zIndex: 20,
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            gap: '12px', 
            paddingTop: '12px', 
            paddingBottom: '8px', 
            borderTop: '1px solid var(--border-color)',
            marginTop: '10px'
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {errorMsg && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  color: '#DC2626', 
                  fontSize: '12px', 
                  fontWeight: '700',
                  lineHeight: 1.3
                }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {errorMsg}
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={onClose}
                className="tap-btn"
                style={{
                  padding: '9px 18px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: '#FFFFFF',
                  color: '#64748B',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="tap-btn btn-primary"
                style={{
                  padding: '9px 24px',
                  fontSize: '13px',
                  fontWeight: '800'
                }}
              >
                <Check size={16} />
                <span>{isEditing ? 'Save Changes' : 'Confirm Registration'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
