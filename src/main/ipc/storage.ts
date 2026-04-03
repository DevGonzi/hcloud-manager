import { ipcMain } from 'electron'
import type { ProjectStorage } from '../storage'
import type { AddProjectInput, IpcResult, Project } from '../../shared/types'

export function registerStorageHandlers(storage: ProjectStorage) {
  ipcMain.handle('storage:getProjects', (): IpcResult<Project[]> => {
    try {
      return { success: true, data: storage.getProjects() }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  ipcMain.handle('storage:addProject', (_e, input: AddProjectInput): IpcResult<Project> => {
    try {
      return { success: true, data: storage.addProject(input) }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  ipcMain.handle('storage:removeProject', (_e, id: string): IpcResult<void> => {
    try {
      storage.removeProject(id)
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  ipcMain.handle('storage:renameProject', (_e, id: string, newName: string): IpcResult<Project> => {
    try {
      const result = storage.renameProject(id, newName)
      if (!result) return { success: false, error: 'Projekt nicht gefunden' }
      return { success: true, data: result }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })
}
