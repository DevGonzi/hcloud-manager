import { ipcMain } from 'electron'
import { actionLog } from '../actionlog'
import type { ActionLogEntry, IpcResult } from '../../shared/types'

export function registerActionLogHandlers() {
  ipcMain.handle('actionlog:getAll', (): IpcResult<ActionLogEntry[]> => {
    try {
      return { success: true, data: actionLog.getAll() }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })
}
