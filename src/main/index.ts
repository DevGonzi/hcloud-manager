import { app, BrowserWindow, screen, globalShortcut, shell } from 'electron'
import path from 'path'
import { ProjectStorage } from './storage'
import { registerAllHandlers } from './ipc'

// Windows notification title / taskbar grouping
app.setAppUserModelId('dev.gonzi.hcloud-manager')

let storage: ProjectStorage | null = null
export let mainWindow: BrowserWindow | null = null

export function getMainWindow() {
  return mainWindow
}

function registerGlobalShortcuts() {
  // Strg+L (Cmd+L auf Mac) zum Sperren
  globalShortcut.register('CommandOrControl+L', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('app:lock')
    }
  })

  // Ctrl+R (Reload) deaktivieren
  globalShortcut.register('CommandOrControl+R', () => {
    // do nothing - reload disabled
  })
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const w = Math.round(width * 0.75)
  const h = Math.round(height * 0.8)

  // Dev: resolve relative to source. Prod: extraResources places icon.ico directly in resources/ (outside ASAR).
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'icon.ico')
    : path.join(__dirname, '../../build/icon.ico')

  mainWindow = new BrowserWindow({
    width: Math.max(w, 1200),
    height: Math.max(h, 750),
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  storage = new ProjectStorage()
  registerAllHandlers(storage)
  registerGlobalShortcuts()
  createWindow()

  // Auto-Updates nach dem Fenster laden — nicht blockierend
  setImmediate(() => {
    try {
      const { autoUpdater } = require('electron-updater')
      autoUpdater.autoDownload = true
      autoUpdater.autoInstallOnAppQuit = true
      autoUpdater.forceDevUpdateConfig = !!process.env.DEV_UPDATE_CHECK

      let updateReady = false
      autoUpdater.on('update-downloaded', () => { updateReady = true })

      // Sicherstellen dass der Install wirklich passiert beim Beenden
      app.on('before-quit', () => {
        if (updateReady) autoUpdater.quitAndInstall(false, true)
      })

      autoUpdater.checkForUpdatesAndNotify()
    } catch {
      // electron-updater not available in dev without config
    }
  })

  app.on('activate', () => {
    if (!mainWindow) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
