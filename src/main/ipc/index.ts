import { ipcMain, BrowserWindow } from 'electron'
import type { ProjectStorage } from '../storage'
import { registerStorageHandlers } from './storage'
import { registerApiHandlers } from './api'
import { registerActionLogHandlers } from './actionlog'
import { registerAppConfigHandlers } from './appconfig'

function registerWindowHandlers() {
  ipcMain.on('window:minimize', (e) => BrowserWindow.fromWebContents(e.sender)?.minimize())
  ipcMain.on('window:maximize', (e) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    if (!win) return
    win.isMaximized() ? win.unmaximize() : win.maximize()
  })
  ipcMain.on('window:close', (e) => BrowserWindow.fromWebContents(e.sender)?.close())
}

export function registerAllHandlers(storage: ProjectStorage) {
  registerStorageHandlers(storage)
  registerApiHandlers(storage)
  registerActionLogHandlers()
  registerAppConfigHandlers()
  registerWindowHandlers()
}
