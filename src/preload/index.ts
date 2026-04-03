import { contextBridge, ipcRenderer } from 'electron'
import type { HCloudApi } from '../shared/types'

const hcloud: HCloudApi = {
  storage: {
    getProjects: () => ipcRenderer.invoke('storage:getProjects'),
    addProject: (input) => ipcRenderer.invoke('storage:addProject', input),
    removeProject: (id) => ipcRenderer.invoke('storage:removeProject', id),
    renameProject: (id, newName) => ipcRenderer.invoke('storage:renameProject', id, newName)
  },
  api: {
    getServers: (projectId) => ipcRenderer.invoke('api:getServers', projectId),
    getServer: (projectId, serverId) => ipcRenderer.invoke('api:getServer', projectId, serverId),
    serverAction: (projectId, serverId, action) =>
      ipcRenderer.invoke('api:serverAction', projectId, serverId, action),
    getMetrics: (projectId, serverId, type, start, end) =>
      ipcRenderer.invoke('api:getMetrics', projectId, serverId, type, start, end)
  },
  vnc: {
    open: (projectId, serverId) => ipcRenderer.invoke('vnc:open', projectId, serverId)
  },
  servers: {
    create: (projectId, input) => ipcRenderer.invoke('servers:create', projectId, input),
    delete: (projectId, serverId) => ipcRenderer.invoke('servers:delete', projectId, serverId),
    listTypes: (projectId) => ipcRenderer.invoke('servers:listTypes', projectId),
    listLocations: (projectId) => ipcRenderer.invoke('servers:listLocations', projectId)
  },
  images: {
    list: (projectId, type) => ipcRenderer.invoke('images:list', projectId, type),
    delete: (projectId, imageId) => ipcRenderer.invoke('images:delete', projectId, imageId),
    createSnapshot: (projectId, input) =>
      ipcRenderer.invoke('images:createSnapshot', projectId, input),
    createImageFromSnapshot: (projectId, imageId) =>
      ipcRenderer.invoke('images:createImageFromSnapshot', projectId, imageId)
  },
  networks: {
    list: (projectId) => ipcRenderer.invoke('networks:list', projectId),
    create: (projectId, input) => ipcRenderer.invoke('networks:create', projectId, input),
    delete: (projectId, networkId) => ipcRenderer.invoke('networks:delete', projectId, networkId)
  },
  firewalls: {
    list: (projectId) => ipcRenderer.invoke('firewalls:list', projectId),
    create: (projectId, input) => ipcRenderer.invoke('firewalls:create', projectId, input),
    delete: (projectId, firewallId) => ipcRenderer.invoke('firewalls:delete', projectId, firewallId)
  },
  floatingIps: {
    list: (projectId) => ipcRenderer.invoke('floatingIps:list', projectId),
    create: (projectId, input) => ipcRenderer.invoke('floatingIps:create', projectId, input),
    delete: (projectId, ipId) => ipcRenderer.invoke('floatingIps:delete', projectId, ipId)
  },
  loadBalancers: {
    list: (projectId) => ipcRenderer.invoke('loadBalancers:list', projectId),
    create: (projectId, input) => ipcRenderer.invoke('loadBalancers:create', projectId, input),
    delete: (projectId, lbId) => ipcRenderer.invoke('loadBalancers:delete', projectId, lbId)
  },
  volumes: {
    list: (projectId) => ipcRenderer.invoke('volumes:list', projectId),
    create: (projectId, input) => ipcRenderer.invoke('volumes:create', projectId, input),
    delete: (projectId, volumeId) => ipcRenderer.invoke('volumes:delete', projectId, volumeId)
  },
  sshKeys: {
    list: (projectId) => ipcRenderer.invoke('sshKeys:list', projectId),
    delete: (projectId, keyId) => ipcRenderer.invoke('sshKeys:delete', projectId, keyId),
    create: (projectId, input) => ipcRenderer.invoke('sshKeys:create', projectId, input)
  },
  actionlog: {
    getAll: () => ipcRenderer.invoke('actionlog:getAll'),
    onEntry: (cb: (entry: any) => void) => {
      ipcRenderer.on('actionlog:entry', (_e, entry) => cb(entry))
    }
  },
  appconfig: {
    getHasPinSet: () => ipcRenderer.invoke('appconfig:getHasPinSet'),
    setPin: (pin: string) => ipcRenderer.invoke('appconfig:setPin', pin),
    verifyPin: (pin: string) => ipcRenderer.invoke('appconfig:verifyPin', pin),
    clearPin: () => ipcRenderer.invoke('appconfig:clearPin'),
    getCacheTtl: () => ipcRenderer.invoke('appconfig:getCacheTtl'),
    setCacheTtl: (ttl: number) => ipcRenderer.invoke('appconfig:setCacheTtl', ttl),
    lock: () => ipcRenderer.invoke('appconfig:lock'),
    unlock: () => ipcRenderer.invoke('appconfig:unlock'),
    getIsLocked: () => ipcRenderer.invoke('appconfig:getIsLocked'),
    onLockRequest: (cb: () => void) => {
      ipcRenderer.on('app:lock', () => cb())
    }
  },
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close')
  }
}

contextBridge.exposeInMainWorld('hcloud', hcloud)
