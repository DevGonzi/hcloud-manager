import { contextBridge, ipcRenderer } from 'electron'
import type { HCloudApi } from '../shared/types'

const hcloud: HCloudApi = {
  storage: {
    getProjects: () => ipcRenderer.invoke('storage:getProjects'),
    addProject: (input) => ipcRenderer.invoke('storage:addProject', input),
    removeProject: (id) => ipcRenderer.invoke('storage:removeProject', id),
  },
  api: {
    getServers: (projectId) => ipcRenderer.invoke('api:getServers', projectId),
    getServer: (projectId, serverId) => ipcRenderer.invoke('api:getServer', projectId, serverId),
    serverAction: (projectId, serverId, action) =>
      ipcRenderer.invoke('api:serverAction', projectId, serverId, action),
    getMetrics: (projectId, serverId, type, start, end) =>
      ipcRenderer.invoke('api:getMetrics', projectId, serverId, type, start, end),
  },
  vnc: {
    open: (projectId, serverId) => ipcRenderer.invoke('vnc:open', projectId, serverId),
  },
}

contextBridge.exposeInMainWorld('hcloud', hcloud)
