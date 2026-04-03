import { ipcMain } from 'electron'
import { appConfig } from '../appconfig'
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

  ipcMain.handle('appconfig:lock', (): IpcResult<void> => {
    try {
      appConfig.setLocked(true)
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
      storage.removeAllProjects()
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })
}
