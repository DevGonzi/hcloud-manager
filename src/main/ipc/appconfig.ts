import { ipcMain } from 'electron'
import { appConfig } from '../appconfig'
import { getMainWindow } from '../index'
import { actionLog } from '../actionlog'
import type { ProjectStorage } from '../storage'
import type { IpcResult } from '../../shared/types'

export function registerAppConfigHandlers(storage: ProjectStorage) {
  ipcMain.handle('appconfig:getHasPinSet', (): IpcResult<boolean> => {
    try {
      return { success: true, data: appConfig.hasPinSet() }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  ipcMain.handle('appconfig:setPin', async (_e, newPin: string): Promise<IpcResult<void>> => {
    try {
      await appConfig.setPin(newPin)
      appConfig.setLocked(true)
      // Notify renderer that PIN is now set
      const win = getMainWindow()
      if (win && !win.isDestroyed()) {
        win.webContents.send('app:pinSet')
      }
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  ipcMain.handle('appconfig:verifyPin', async (_e, pin: string): Promise<IpcResult<boolean>> => {
    try {
      const valid = await appConfig.verifyPin(pin)
      return { success: true, data: valid }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  ipcMain.handle('appconfig:clearPin', (): IpcResult<void> => {
    try {
      appConfig.clearPin()
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  ipcMain.handle('appconfig:getCacheTtl', (): IpcResult<number> => {
    try {
      return { success: true, data: appConfig.getCacheTtl() }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  ipcMain.handle('appconfig:setCacheTtl', (_e, ttl: number): IpcResult<void> => {
    try {
      appConfig.setCacheTtl(ttl)
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  ipcMain.handle('appconfig:lock', (event): IpcResult<void> => {
    try {
      appConfig.setLocked(true)
      event.sender.send('app:lock')
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  ipcMain.handle('appconfig:unlock', (): IpcResult<void> => {
    try {
      appConfig.setLocked(false)
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  ipcMain.handle('appconfig:getIsLocked', (): IpcResult<boolean> => {
    try {
      return { success: true, data: appConfig.isAppLocked() }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  ipcMain.handle('appconfig:resetPin', (): IpcResult<void> => {
    try {
      appConfig.clearPin()
      storage.deleteStorageFile()
      actionLog.clear()
      appConfig.setLocked(false)

      // Notify renderer to clear state and reload
      const win = getMainWindow()
      if (win && !win.isDestroyed()) {
        win.webContents.send('app:reset')
      }

      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })
}
