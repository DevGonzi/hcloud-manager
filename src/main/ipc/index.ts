import { ipcMain, BrowserWindow, app } from 'electron'
import type { ProjectStorage } from '../storage'
import { registerStorageHandlers } from './storage'
import { registerApiHandlers } from './api'
import { registerActionLogHandlers } from './actionlog'
import { registerAppConfigHandlers } from './appconfig'
import type { IpcResult } from '../../shared/types'

function registerWindowHandlers() {
  ipcMain.on('window:minimize', (e) => BrowserWindow.fromWebContents(e.sender)?.minimize())
  ipcMain.on('window:maximize', (e) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    if (!win) return
    win.isMaximized() ? win.unmaximize() : win.maximize()
  })
  ipcMain.on('window:close', (e) => BrowserWindow.fromWebContents(e.sender)?.close())
}

function registerAppHandlers() {
  ipcMain.handle('app:getVersion', (): IpcResult<string> => {
    return { success: true, data: app.getVersion() }
  })

  ipcMain.handle('app:checkForUpdates', async (): Promise<IpcResult<void>> => {
    try {
      if (!process.env.VITE_DEV_SERVER_URL) {
        const { autoUpdater } = require('electron-updater')
        await autoUpdater.checkForUpdatesAndNotify()
      }
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })
}

export function registerAllHandlers(storage: ProjectStorage) {
  registerStorageHandlers(storage)
  registerApiHandlers(storage)
  registerActionLogHandlers()
  registerAppConfigHandlers(storage)
  registerWindowHandlers()
  registerAppHandlers()
}
