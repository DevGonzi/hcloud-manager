import { ipcMain, BrowserWindow, app, dialog } from 'electron'
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
        try {
          const { autoUpdater } = require('electron-updater')
          autoUpdater.logger = console
          const result = await autoUpdater.checkForUpdates()
          
          if (result?.updateInfo?.version) {
            const currentVersion = app.getVersion()
            if (result.updateInfo.version !== currentVersion) {
              await dialog.showMessageBox({
                type: 'info',
                title: 'Update verfügbar',
                message: `Neue Version ${result.updateInfo.version} verfügbar`,
                detail: `Aktuell installiert: ${currentVersion}\n\nWerde nun aktualisiert...`,
                buttons: ['OK']
              })
              await autoUpdater.downloadUpdate()
              autoUpdater.quitAndInstall()
            } else {
              await dialog.showMessageBox({
                type: 'info',
                title: 'Auf aktuellem Stand',
                message: `Sie verwenden bereits die neueste Version (${currentVersion})`
              })
            }
          }
        } catch (updateError) {
          const errorMsg = updateError instanceof Error ? updateError.message : String(updateError)
          await dialog.showMessageBox({
            type: 'error',
            title: 'Update-Fehler',
            message: 'Konnte nicht auf Updates überprüfen',
            detail: errorMsg
          })
          throw updateError
        }
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
