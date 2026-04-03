import { app, BrowserWindow, screen, globalShortcut } from 'electron'
import path from 'path'
import { ProjectStorage } from './storage'
import { registerAllHandlers } from './ipc'

let storage: ProjectStorage | null = null
let mainWindow: BrowserWindow | null = null

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

  mainWindow = new BrowserWindow({
    width: Math.max(w, 1200),
    height: Math.max(h, 750),
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    icon: path.join(__dirname, '../../build/icon.ico'),
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
}

app.whenReady().then(() => {
  storage = new ProjectStorage()
  registerAllHandlers(storage)
  registerGlobalShortcuts()
  createWindow()
  app.on('activate', () => {
    if (!mainWindow) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
