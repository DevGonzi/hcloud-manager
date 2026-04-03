import { ipcMain, BrowserWindow, app, dialog } from 'electron'
import type { ProjectStorage } from '../storage'
import { registerStorageHandlers } from './storage'
import { registerApiHandlers } from './api'
import { registerActionLogHandlers } from './actionlog'
import { registerAppConfigHandlers } from './appconfig'
import type { IpcResult } from '../../shared/types'

// Simple semver comparator: returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
function compareSemver(v1: string, v2: string): number {
  const parse = (v: string) => v.split('.').map(Number)
  const [major1, minor1, patch1] = parse(v1)
  const [major2, minor2, patch2] = parse(v2)
  
  if (major1 !== major2) return major1 > major2 ? 1 : -1
  if (minor1 !== minor2) return minor1 > minor2 ? 1 : -1
  if (patch1 !== patch2) return patch1 > patch2 ? 1 : -1
  return 0
}

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
      const { autoUpdater } = require('electron-updater')
      autoUpdater.autoDownload = false
      const result = await autoUpdater.checkForUpdates()
      const latestVersion = result?.updateInfo?.version

      if (latestVersion && compareSemver(latestVersion, app.getVersion()) > 0) {
        const { response } = await dialog.showMessageBox({
          type: 'info',
          title: 'Update verfügbar',
          message: `Version ${latestVersion} ist verfügbar`,
          detail: `Aktuell installiert: ${app.getVersion()}\n\nJetzt herunterladen und installieren?`,
          buttons: ['Jetzt aktualisieren', 'Später']
        })
        if (response === 0) {
          autoUpdater.autoInstallOnAppQuit = true
          await autoUpdater.downloadUpdate()
          autoUpdater.quitAndInstall(false, true)
        }
      } else {
        await dialog.showMessageBox({
          type: 'info',
          title: 'Auf aktuellem Stand',
          message: `Version ${app.getVersion()} ist die neueste Version.`
        })
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
