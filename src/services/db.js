import * as XLSX from 'xlsx';

/**
 * BodyLife Local SQLite & Relational Storage Layer
 * Designed for local offline installation on client Windows / Mac laptops.
 * Zero external servers required. Data persists locally with full SQL dump and Excel (.xlsx) export.
 */

export const DEFAULT_ADMISSION_FEE = 100;

export const DEFAULT_PACKAGES = [
  // Body Building
  { 
    id: "pkg_bb_1m", 
    category: "Body Building", 
    name: "Body Building - 1 Month", 
    shortName: "1 Month",
    durationDays: 30, 
    price: 700, 
    admissionFee: 100 
  },
  { 
    id: "pkg_bb_3m", 
    category: "Body Building", 
    name: "Body Building - 3 Months", 
    shortName: "3 Months",
    durationDays: 90, 
    price: 1800, 
    admissionFee: 100 
  },
  { 
    id: "pkg_bb_6m", 
    category: "Body Building", 
    name: "Body Building - 6 Months", 
    shortName: "6 Months",
    durationDays: 180, 
    price: 3500, 
    admissionFee: 100 
  },
  { 
    id: "pkg_bb_12m", 
    category: "Body Building", 
    name: "Body Building - 12 Months", 
    shortName: "12 Months",
    durationDays: 365, 
    price: 6500, 
    admissionFee: 100 
  },

  // Cardio & Fitness
  { 
    id: "pkg_cf_1m", 
    category: "Cardio & Fitness", 
    name: "Cardio & Fitness - 1 Month", 
    shortName: "1 Month",
    durationDays: 30, 
    price: 1000, 
    admissionFee: 100 
  },
  { 
    id: "pkg_cf_3m", 
    category: "Cardio & Fitness", 
    name: "Cardio & Fitness - 3 Months", 
    shortName: "3 Months",
    durationDays: 90, 
    price: 2500, 
    admissionFee: 100 
  },
  { 
    id: "pkg_cf_6m", 
    category: "Cardio & Fitness", 
    name: "Cardio & Fitness - 6 Months", 
    shortName: "6 Months",
    durationDays: 180, 
    price: 5000, 
    admissionFee: 100 
  },
  { 
    id: "pkg_cf_12m", 
    category: "Cardio & Fitness", 
    name: "Cardio & Fitness - 12 Months", 
    shortName: "12 Months",
    durationDays: 365, 
    price: 8000, 
    admissionFee: 100 
  }
];

// No mock data - clean starting database for gym client
export const INITIAL_MEMBERS = [];

const STORAGE_KEY = 'bodylife_sqlite_store_v3';

/**
 * Load members database from local storage
 */
export function getLocalDatabase() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to load local DB:', err);
  }
  return INITIAL_MEMBERS;
}

/**
 * Save members database to local storage
 */
export function saveLocalDatabase(members) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  } catch (err) {
    console.error('Failed to save to local storage:', err);
  }
}

/**
 * Clear local database completely
 */
export function clearLocalDatabase() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear local DB:', err);
  }
}

/**
 * Generate structured Excel workbook (.xlsx) with Members Directory,
 * Payments Ledger, and Financial Summary sheets.
 */
export function exportDatabaseToExcel(members = []) {
  const wb = XLSX.utils.book_new();

  // 1. Members Directory Sheet
  const membersData = members.map(m => ({
    'Member ID': m.id || '',
    'Full Name': m.name || '',
    'Phone Number': m.phone || '',
    'Email Address': m.email || '',
    'Gender': m.gender || '',
    'Age': m.age || '',
    'Membership Package': m.packageName || '',
    'Total Fee (₹)': Number(m.totalFee || 0),
    'Amount Paid (₹)': Number(m.paidAmount || 0),
    'Pending Balance (₹)': Number(m.pendingAmount || 0),
    'Fee Status': (m.pendingAmount > 0) ? 'Pending' : 'Fully Paid',
    'Start Date': m.startDate || '',
    'Expiry Date': m.expiryDate || '',
    'Account Status': m.status || 'Active',
    'Locker Number': m.lockerNumber || 'None'
  }));

  const membersWs = XLSX.utils.json_to_sheet(membersData.length > 0 ? membersData : [{
    'Member ID': '',
    'Full Name': 'No members currently enrolled',
    'Phone Number': '',
    'Email Address': '',
    'Gender': '',
    'Age': '',
    'Membership Package': '',
    'Total Fee (₹)': 0,
    'Amount Paid (₹)': 0,
    'Pending Balance (₹)': 0,
    'Fee Status': '',
    'Start Date': '',
    'Expiry Date': '',
    'Account Status': '',
    'Locker Number': ''
  }]);

  membersWs['!cols'] = [
    { wch: 14 }, // Member ID
    { wch: 24 }, // Full Name
    { wch: 16 }, // Phone
    { wch: 24 }, // Email
    { wch: 10 }, // Gender
    { wch: 8 },  // Age
    { wch: 22 }, // Membership Package
    { wch: 14 }, // Total Fee
    { wch: 16 }, // Amount Paid
    { wch: 18 }, // Pending Balance
    { wch: 14 }, // Fee Status
    { wch: 14 }, // Start Date
    { wch: 14 }, // Expiry Date
    { wch: 14 }, // Account Status
    { wch: 14 }  // Locker Number
  ];

  XLSX.utils.book_append_sheet(wb, membersWs, 'Members Directory');

  // 2. Payments Receipts Ledger Sheet
  const paymentsData = [];
  members.forEach(m => {
    if (Array.isArray(m.paymentHistory)) {
      m.paymentHistory.forEach(p => {
        paymentsData.push({
          'Receipt ID': p.receiptId || '',
          'Member ID': m.id || '',
          'Member Name': m.name || '',
          'Payment Date': p.date || '',
          'Payment Mode': p.mode || 'Cash',
          'UTR / Reference No': p.utr || 'CASH-DESK',
          'Amount Paid (₹)': Number(p.amount || 0),
          'Package Plan': p.package || m.packageName || '',
          'Payment Status': p.status || 'Success'
        });
      });
    }
  });

  const paymentsWs = XLSX.utils.json_to_sheet(paymentsData.length > 0 ? paymentsData : [{
    'Receipt ID': '',
    'Member ID': '',
    'Member Name': 'No payment records yet',
    'Payment Date': '',
    'Payment Mode': '',
    'UTR / Reference No': '',
    'Amount Paid (₹)': 0,
    'Package Plan': '',
    'Status': ''
  }]);

  paymentsWs['!cols'] = [
    { wch: 16 }, // Receipt ID
    { wch: 14 }, // Member ID
    { wch: 24 }, // Member Name
    { wch: 14 }, // Payment Date
    { wch: 14 }, // Payment Mode
    { wch: 22 }, // UTR
    { wch: 16 }, // Amount Paid
    { wch: 22 }, // Package Plan
    { wch: 14 }  // Payment Status
  ];

  XLSX.utils.book_append_sheet(wb, paymentsWs, 'Fee Receipts Ledger');

  // 3. Financial Summary Sheet
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'Active').length;
  const overdueMembers = members.filter(m => m.status === 'Overdue' || m.pendingAmount > 0).length;
  const totalCollected = members.reduce((sum, m) => sum + (Number(m.paidAmount) || 0), 0);
  const totalPending = members.reduce((sum, m) => sum + (Number(m.pendingAmount) || 0), 0);
  const totalExpected = totalCollected + totalPending;
  const collectionRate = totalExpected > 0 ? `${Math.round((totalCollected / totalExpected) * 100)}%` : '100%';

  const summaryData = [
    { 'Metric': 'Gym Name', 'Value': 'BodyLife Fitness Club' },
    { 'Metric': 'Export Date & Time', 'Value': new Date().toLocaleString() },
    { 'Metric': 'Total Enrolled Members', 'Value': totalMembers },
    { 'Metric': 'Active Members', 'Value': activeMembers },
    { 'Metric': 'Members with Pending / Overdue Dues', 'Value': overdueMembers },
    { 'Metric': 'Total Expected Revenue (₹)', 'Value': totalExpected },
    { 'Metric': 'Total Revenue Collected (₹)', 'Value': totalCollected },
    { 'Metric': 'Total Outstanding Dues (₹)', 'Value': totalPending },
    { 'Metric': 'Fee Realization Rate', 'Value': collectionRate }
  ];

  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  summaryWs['!cols'] = [
    { wch: 34 },
    { wch: 30 }
  ];

  XLSX.utils.book_append_sheet(wb, summaryWs, 'Financial Summary');

  // Generate Excel file (.xlsx) and trigger download
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `BodyLife_Gym_Database_${dateStr}.xlsx`;
  XLSX.writeFile(wb, filename);
  return filename;
}

/**
 * Generate standard SQLite SQL Dump file (.sql) for Windows/Mac backup
 */
export function generateSqlDump(members = []) {
  let sql = `-- ========================================================\n`;
  sql += `-- BodyLife Gym Management SQLite Database Dump\n`;
  sql += `-- Export Date: ${new Date().toISOString()}\n`;
  sql += `-- Local Machine Storage Backup\n`;
  sql += `-- ========================================================\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS members (\n`;
  sql += `  id TEXT PRIMARY KEY,\n`;
  sql += `  name TEXT NOT NULL,\n`;
  sql += `  phone TEXT NOT NULL,\n`;
  sql += `  email TEXT,\n`;
  sql += `  gender TEXT,\n`;
  sql += `  age INTEGER,\n`;
  sql += `  package_id TEXT,\n`;
  sql += `  package_name TEXT,\n`;
  sql += `  total_fee INTEGER,\n`;
  sql += `  paid_amount INTEGER,\n`;
  sql += `  pending_amount INTEGER,\n`;
  sql += `  start_date TEXT,\n`;
  sql += `  expiry_date TEXT,\n`;
  sql += `  status TEXT,\n`;
  sql += `  locker_number TEXT,\n`;
  sql += `  photo TEXT\n`;
  sql += `);\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS payments (\n`;
  sql += `  receipt_id TEXT PRIMARY KEY,\n`;
  sql += `  member_id TEXT,\n`;
  sql += `  amount INTEGER,\n`;
  sql += `  payment_mode TEXT,\n`;
  sql += `  utr TEXT,\n`;
  sql += `  payment_date TEXT,\n`;
  sql += `  package_name TEXT,\n`;
  sql += `  status TEXT,\n`;
  sql += `  FOREIGN KEY (member_id) REFERENCES members(id)\n`;
  sql += `);\n\n`;

  members.forEach(m => {
    const esc = (txt) => (txt ? `'${String(txt).replace(/'/g, "''")}'` : 'NULL');
    sql += `INSERT INTO members VALUES (${esc(m.id)}, ${esc(m.name)}, ${esc(m.phone)}, ${esc(m.email)}, ${esc(m.gender)}, ${m.age || 0}, ${esc(m.packageId)}, ${esc(m.packageName)}, ${m.totalFee || 0}, ${m.paidAmount || 0}, ${m.pendingAmount || 0}, ${esc(m.startDate)}, ${esc(m.expiryDate)}, ${esc(m.status)}, ${esc(m.lockerNumber)}, ${esc(m.photo)});\n`;

    if (Array.isArray(m.paymentHistory)) {
      m.paymentHistory.forEach(p => {
        sql += `INSERT INTO payments VALUES (${esc(p.receiptId)}, ${esc(m.id)}, ${p.amount || 0}, ${esc(p.mode)}, ${esc(p.utr)}, ${esc(p.date)}, ${esc(p.package)}, ${esc(p.status)});\n`;
      });
    }
  });

  return sql;
}

/**
 * Trigger file download on user's computer
 */
export function downloadFile(filename, content, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export full JSON backup
 */
export function exportDatabaseToJson(members = []) {
  const jsonStr = JSON.stringify(members, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(`BodyLife_Backup_${dateStr}.json`, jsonStr, 'application/json');
}

/**
 * Import and restore members & payments ledger from an exported Excel file (.xlsx)
 */
export async function importDatabaseFromExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const rawMembers = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);

        let rawPayments = [];
        if (workbook.SheetNames.includes('Fee Receipts Ledger')) {
          rawPayments = XLSX.utils.sheet_to_json(workbook.Sheets['Fee Receipts Ledger']);
        }

        const members = rawMembers
          .filter(r => r['Member ID'] && r['Full Name'] && r['Full Name'] !== 'No members currently enrolled')
          .map(r => {
            const memberId = String(r['Member ID'] || '').trim();
            const memberPayments = rawPayments
              .filter(p => String(p['Member ID'] || '').trim() === memberId)
              .map(p => ({
                receiptId: p['Receipt ID'] || `REC-${Math.floor(1000 + Math.random() * 9000)}`,
                date: p['Payment Date'] || '',
                mode: p['Payment Mode'] || 'Cash',
                utr: p['UTR / Reference No'] || 'CASH-DESK',
                amount: Number(p['Amount Paid (₹)']) || 0,
                package: p['Package Plan'] || r['Membership Package'] || '',
                status: p['Payment Status'] || 'Success'
              }));

            return {
              id: memberId,
              name: String(r['Full Name'] || '').trim(),
              phone: String(r['Phone Number'] || '').trim(),
              email: r['Email Address'] || '',
              gender: r['Gender'] || 'Male',
              age: Number(r['Age']) || 0,
              packageName: r['Membership Package'] || '1 Month Standard',
              totalFee: Number(r['Total Fee (₹)']) || 0,
              paidAmount: Number(r['Amount Paid (₹)']) || 0,
              pendingAmount: Number(r['Pending Balance (₹)']) || 0,
              startDate: r['Start Date'] || '',
              expiryDate: r['Expiry Date'] || '',
              status: r['Account Status'] || 'Active',
              lockerNumber: r['Locker Number'] || '',
              paymentHistory: memberPayments
            };
          });

        saveLocalDatabase(members);
        resolve(members);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Import and restore members database from a JSON backup (.json)
 */
export async function importDatabaseFromJson(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (Array.isArray(parsed)) {
          saveLocalDatabase(parsed);
          resolve(parsed);
        } else {
          reject(new Error('Invalid backup format: root element must be a members array.'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

const PACKAGES_STORAGE_KEY = 'bodylife_packages_v2';

export function getCustomPackages() {
  try {
    const raw = localStorage.getItem(PACKAGES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load packages:', e);
  }
  return DEFAULT_PACKAGES;
}

export function saveCustomPackages(packages) {
  try {
    localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(packages));
  } catch (e) {
    console.error('Failed to save packages:', e);
  }
}
