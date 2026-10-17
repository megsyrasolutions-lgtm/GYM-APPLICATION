import React, { useState } from 'react';
import { X, MessageSquare, Send, Copy, Check, FileText, AlertCircle, Calendar } from 'lucide-react';

export default function WhatsAppModal({ data, onClose, onSent }) {
  if (!data) return null;

  const memberName = data.memberName || data.name || 'Member';
  const memberId = data.memberId || data.id || 'BL-001';
  const packageName = data.package || data.packageName || 'Standard Membership';
  const pendingAmount = Number(data.pendingAmount || 0);
  const paidAmount = Number(data.amount || data.paidAmount || 0);
  const totalFee = Number(data.totalFee || (paidAmount + pendingAmount) || 0);
  const expiryDate = data.expiryDate || 'Immediate';
  const receiptId = data.receiptId || `REC-${Math.floor(1000 + Math.random() * 9000)}`;
  const paymentDate = data.date || new Date().toISOString().split('T')[0];
  const paymentMode = data.mode || 'Cash';

  // Determine initial template mode
  const initialTemplate = data.receiptId 
    ? 'receipt' 
    : (pendingAmount > 0 ? 'due_notice' : 'renewal');

  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate);
  const [phoneNumber, setPhoneNumber] = useState(() => {
    const raw = data.phone || '';
    return raw.replace(/[^0-9]/g, '');
  });
  const [copied, setCopied] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // Clean, professional, friendly fitness club templates (Human, not AI-robotic)
  const templates = {
    receipt: 
`🧾 *BODYLIFE FITNESS CLUB — PAYMENT RECEIPT*

Hello *${memberName}*,

Thank you for your payment! Here is your official fee confirmation:

📄 *Invoice Details:*
• Receipt No: *${receiptId}*
• Member ID: *${memberId}*
• Plan: *${packageName}*
• Amount Paid: *₹${paidAmount.toLocaleString()}* (${paymentMode})
• Payment Date: *${paymentDate}*
• Balance Due: *${pendingAmount > 0 ? `₹${pendingAmount.toLocaleString()}` : 'Nil (Fully Settled)'}*

Your membership account is active in our gym database. Stay consistent and crush your goals! 🏋️‍♂️💥

— *BodyLife Fitness Management*`,

    due_notice: 
`*BODYLIFE FITNESS CLUB* 🏋️‍♂️
*Pending Fee Reminder*

Hi *${memberName}*,

Hope you're enjoying your workout sessions at BodyLife Fitness Club!

This is a quick friendly reminder regarding your pending membership balance:

📋 *Payment Due Details:*
• Member ID: *${memberId}*
• Plan: *${packageName}*
• Pending Amount: *₹${pendingAmount.toLocaleString()}*
• Due Date: *${expiryDate}*

Kindly clear the balance at the reception desk via Cash or UPI at your earliest convenience.

If you have already paid, please ignore this message. Keep up the great work! 💪

— *BodyLife Fitness Desk*`,

    renewal: 
`*BODYLIFE FITNESS CLUB* 🏋️‍♂️
*Membership Renewal Reminder*

Hi *${memberName}*,

Your gym membership (*${packageName}*) is scheduled to expire on *${expiryDate}*.

Renew before the due date to keep your daily workout routine and gym access uninterrupted!

📋 *Membership Details:*
• Member ID: *${memberId}*
• Active Plan: *${packageName}*
• Expiry Date: *${expiryDate}*
• Renewal Fee: *₹${(totalFee || 2000).toLocaleString()}*

You can renew in seconds via UPI (GPay / PhonePe) or Cash at the gym reception desk.

See you at the gym! 💪🔥
— *Team BodyLife Fitness*`
  };

  const [messageText, setMessageText] = useState(templates[initialTemplate]);

  const handleSelectTemplate = (tplKey) => {
    setSelectedTemplate(tplKey);
    setMessageText(templates[tplKey]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    setPhoneError('');
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const encoded = encodeURIComponent(messageText);
    const waUrl = `https://wa.me/${formattedPhone}?text=${encoded}`;
    window.open(waUrl, '_blank');
    if (onSent) onSent(data);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="desktop-modal-dialog" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={18} color="#25D366" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Formal WhatsApp Dispatch
              </h3>
              <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>
                Professional client correspondence · No hashtags
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="tap-btn"
            style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} color="#64748B" />
          </button>
        </div>

        {/* Template Selector Tabs */}
        <div>
          <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
            Select Formal Template
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {[
              { id: 'due_notice', label: 'Fee Due Notice', icon: AlertCircle },
              { id: 'receipt', label: 'Payment Receipt', icon: FileText },
              { id: 'renewal', label: 'Renewal Advisory', icon: Calendar }
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = selectedTemplate === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tab.id)}
                  className="tap-btn"
                  style={{
                    padding: '8px 6px',
                    borderRadius: '6px',
                    border: '1.5px solid',
                    borderColor: isSelected ? '#2563EB' : 'var(--border-color)',
                    background: isSelected ? '#EFF6FF' : '#FFFFFF',
                    color: isSelected ? '#1D4ED8' : '#334155',
                    fontSize: '11.5px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <Icon size={13} color={isSelected ? '#2563EB' : '#64748B'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recipient */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
            Recipient Mobile Number *
          </label>
          <input 
            type="text"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              setPhoneError('');
            }}
            className="form-input"
            placeholder="10-digit mobile number"
            style={{ borderColor: phoneError ? '#EF4444' : undefined }}
          />
          {phoneError && (
            <p style={{ fontSize: '11px', color: '#EF4444', margin: '4px 0 0', fontWeight: '600' }}>
              {phoneError}
            </p>
          )}
        </div>

        {/* Message Editor */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
              Structured Message Preview
            </label>
            <button
              onClick={handleCopy}
              className="tap-btn"
              style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {copied ? <Check size={13} color="#059669" /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>
          <textarea
            rows={8}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="form-input"
            style={{ fontFamily: 'inherit', resize: 'vertical', fontSize: '12.5px', lineHeight: '1.5' }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
          <button
            onClick={onClose}
            className="tap-btn btn-secondary"
            style={{ flex: 1, padding: '10px' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="tap-btn"
            style={{
              flex: 1.5,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: '#25D366',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Send size={15} />
            <span>Open in WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
