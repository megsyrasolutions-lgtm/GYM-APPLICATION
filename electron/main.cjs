const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

// Set Application User Model ID for Windows Taskbar & Notifications
if (process.platform === 'win32') {
  app.setAppUserModelId('com.bodylife.gymmanagement');
}

let mainWindow = null;

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Focus existing window if another instance is launched
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  function getAppIconPath() {
    const fs = require('fs');
    const icoPath = path.join(__dirname, '../public/icon.ico');
    if (fs.existsSync(icoPath)) return icoPath;
    const pngPath = path.join(__dirname, '../public/bodylife_logo.png');
    if (fs.existsSync(pngPath)) return pngPath;
    return path.join(__dirname, '../dist/bodylife_logo.png');
  }

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1024,
      minHeight: 700,
      title: 'BodyLife - Gym Management & Fee Tracking',
      icon: getAppIconPath(),
      autoHideMenuBar: true,
      show: false,
      backgroundColor: '#F8FAFC',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        spellcheck: false
      }
    });

    // Handle external links (WhatsApp, browser links) in default system browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('http:') || url.startsWith('https:') || url.startsWith('mailto:') || url.startsWith('tel:')) {
        shell.openExternal(url);
        return { action: 'deny' };
      }
      return { action: 'allow' };
    });

    mainWindow.webContents.on('will-navigate', (event, url) => {
      if (url.startsWith('https://wa.me') || url.startsWith('https://api.whatsapp.com')) {
        event.preventDefault();
        shell.openExternal(url);
      }
    });

    // Load the production build
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

    // Gracefully show window once ready to avoid white flash
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
