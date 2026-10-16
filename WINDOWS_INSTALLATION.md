# BodyLife - Gym Management & Fee Tracking System
## Local Laptop Installation & Packaging Guide (Windows)

**BodyLife** is an offline-first, lightweight desktop gym management system focused exclusively on **Fee Management** and **Member/User Management**.

---

### Key Highlights
- **Branding**: BodyLife Gym Management Suite
- **Aesthetic**: Clean Royal Blue (`#2563EB`) & White theme
- **Zero Cloud Costs / 100% Offline**: All data resides on the client's local computer.
- **SQLite Database Support**: Instant 1-click **Backup Database (.sql)** button in the sidebar exports complete SQLite `CREATE TABLE` and `INSERT INTO` DDL/DML files.
- **Ultra-lightweight**: Total compiled asset bundle is only ~250 kB!

---

### Method 1: Native Windows Desktop App (.exe) (Recommended)
You have two native Windows executable formats in the **`release`** folder:

1. **Installer Setup (`release\BodyLife Setup 1.0.0.exe`)**:
   - Double-click to run the setup wizard.
   - Installs BodyLife on your computer, creates a **Desktop shortcut icon** and **Start Menu entry**.
   - No terminal, no Node.js, and no web browser needed.

2. **Portable Executable (`release\BodyLife-Portable-1.0.0.exe`)**:
   - Single standalone `.exe` file.
   - Requires zero installation. You can copy it to any laptop or USB pendrive and double-click to run directly.

---

### Method 2: Local Web Server (Alternative)
1. Double-click **`run_bodylife_windows.bat`**.
2. The system serves the web version locally at `http://localhost:4173`.

---

### Method 2: SQLite Backup & Data Security
- In the BodyLife desktop sidebar, click **"Backup Database (.sql)"**.
- It immediately generates `bodylife_backup_YYYY-MM-DD.sql` containing full ANSI SQLite statements for `members` and `payments` tables with foreign key constraints.
- This file can be stored on an external USB drive or imported into any SQLite database viewer (e.g., DB Browser for SQLite).

---

### Core Modules
1. **Financial Overview**: Live fee collection metrics, realization rate, weekly collection bars, and fee follow-up queues.
2. **Members Directory**: Member registration, contact information, active plans, renewal dates, and status filters.
3. **Fee Collections & Ledger**: Cash & UPI receipt register, voucher generation, UTR tracking, and WhatsApp sharing.
4. **Due Reminders & WhatsApp**: Automated fee due notices with instant 1-click WhatsApp message dispatch.
