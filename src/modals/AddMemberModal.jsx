import React, { useState, useRef } from 'react';
import { X, UserPlus, Upload, Trash2, Camera, Check, AlertCircle } from 'lucide-react';
import { DEFAULT_PACKAGES } from '../services/db';

export default function AddMemberModal({ 
  onClose, 
  onSave, 
  editingMember = null,
  existingMembers = [] 
}) {
  const isEditing = !!editingMember;
  const fileInputRef = useRef(null);

  // Generate default ID if adding new member
  const computeNextId = () => {
    if (editingMember?.id) return editingMember.id;
    const baseNum = 1001 + (existingMembers?.length || 0);
    return `BL-${baseNum}`;
  };

  // Form states
  const [memberId, setMemberId] = useState(computeNextId());
  const [name, setName] = useState(editingMember?.name || '');
  const [phone, setPhone] = useState(editingMember?.phone || '');
  const [email, setEmail] = useState(editingMember?.email || '');
  const [gender, setGender] = useState(editingMember?.gender || 'Male');
  const [age, setAge] = useState(editingMember?.age || 25);
  const [photo, setPhoto] = useState(editingMember?.photo || '');
  
  // Package & Dates
  const [packageId, setPackageId] = useState(editingMember?.packageId || DEFAULT_PACKAGES[0].id);
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

  // Handle Package Change
  const handlePackageChange = (id) => {
    setPackageId(id);
    clearFieldError('packageId');
    const pkg = DEFAULT_PACKAGES.find(p => p.id === id);
    if (pkg) {
      setExpiryDate(computeDefaultExpiry(startDate, pkg.durationDays));
      if (feeMode === 'full') {
        setPaidNow(pkg.price);
      } else if (feeMode === 'partial' && paidNow > pkg.price) {
        setPaidNow(pkg.price);
      }
    }
  };

  // Handle Fee Mode Selection
  const handleFeeModeChange = (mode) => {
    setFeeMode(mode);
    clearFieldError('paidNow');
    if (mode === 'unpaid') {
      setPaidNow(0);
    } else if (mode === 'full') {
      setPaidNow(selectedPkg.price);
    } else if (mode === 'partial') {
      setPaidNow(Math.round(selectedPkg.price / 2));
    }
  };

  const totalFee = selectedPkg.price;
  const currentPaid = Number(paidNow || 0);
  const pendingAmount = Math.max(0, totalFee - currentPaid);

  // Comprehensive Form Validation
  const validateForm = () => {
    const errors = {};
    const cleanId = memberId.trim().toUpperCase();

    // 1. Member ID
    if (!cleanId) {
      errors.memberId = 'Member ID is required.';
    } else if (!/^[A-Z0-9_-]+$/i.test(cleanId)) {
      errors.memberId = 'Member ID can only contain letters, numbers, and hyphens.';
    } else if (!isEditing) {
      const idExists = existingMembers?.some(m => m.id.toUpperCase() === cleanId);
      if (idExists) {
        errors.memberId = `Member ID "${cleanId}" already exists. Please choose a unique ID.`;
      }
    } else if (isEditing && editingMember && editingMember.id.toUpperCase() !== cleanId) {
      const idExists = existingMembers?.some(m => m.id.toUpperCase() === cleanId && m.id !== editingMember.id);
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
    } else if (!/^[A-Za-z\s.'-]+$/.test(cleanName)) {
      errors.name = 'Full name should only contain letters and standard characters.';
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
      return;
    }

    const cleanId = memberId.trim().toUpperCase();

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
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="desktop-modal-dialog" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
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
            onClick={onClose}
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

            <div style={{ flex: 1, minWidth: '160px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B', display: 'block', marginBottom: '4px' }}>
                Member Profile Photo
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                  <span>{photo ? 'Change Photo' : 'Upload Photo'}</span>
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

            {/* Editable Member ID */}
            <div style={{ minWidth: '150px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B', display: 'block', marginBottom: '4px' }}>
                Member ID *
              </label>
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
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
              Select Membership Package Plan *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {DEFAULT_PACKAGES.map((pkg) => {
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
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '800', color: isSelected ? '#1E40AF' : '#0F172A', margin: 0 }}>
                        {pkg.name}
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

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
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

        </form>
      </div>
    </div>
  );
}
