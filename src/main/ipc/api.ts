import { ipcMain, BrowserWindow } from 'electron'
import path from 'path'
import { HCloudClient } from '../hcloud/client'
import type { ProjectStorage } from '../storage'
import { cache } from '../cache'
import type { HCloudServer, HCloudMetrics, IpcResult, MetricType, ServerAction } from '../../shared/types'

const TTL = { servers: 30, server: 15, metrics: 30 }

function getClient(storage: ProjectStorage, projectId: string): HCloudClient | null {
  const key = storage.getApiKey(projectId)
  if (!key) return null
  return new HCloudClient(key)
}

export function registerApiHandlers(storage: ProjectStorage) {
  ipcMain.handle('api:getServers', async (_e, projectId: string): Promise<IpcResult<HCloudServer[]>> => {
    try {
      const cacheKey = `${projectId}:servers`
      const cached = cache.get<HCloudServer[]>(cacheKey)
      if (cached) return { success: true, data: cached }
      const client = getClient(storage, projectId)
      if (!client) return { success: false, error: 'Projekt nicht gefunden' }
      const servers = await client.getServers()
      cache.set(cacheKey, servers, TTL.servers)
      return { success: true, data: servers }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  ipcMain.handle('api:getServer', async (_e, projectId: string, serverId: number): Promise<IpcResult<HCloudServer>> => {
    try {
      const cacheKey = `${projectId}:server:${serverId}`
      const cached = cache.get<HCloudServer>(cacheKey)
      if (cached) return { success: true, data: cached }
      const client = getClient(storage, projectId)
      if (!client) return { success: false, error: 'Projekt nicht gefunden' }
      const server = await client.getServer(serverId)
      cache.set(cacheKey, server, TTL.server)
      return { success: true, data: server }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  ipcMain.handle('api:serverAction', async (_e, projectId: string, serverId: number, action: ServerAction): Promise<IpcResult<void>> => {
    try {
      const project = storage.getProjects().find(p => p.id === projectId)
      if (project?.readonly) return { success: false, error: 'Projekt ist readonly' }
      const client = getClient(storage, projectId)
      if (!client) return { success: false, error: 'Projekt nicht gefunden' }
      await client.serverAction(serverId, action)
      cache.invalidatePrefix(`${projectId}:server`)
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  ipcMain.handle('api:getMetrics', async (_e, projectId: string, serverId: number, type: MetricType, start: string, end: string): Promise<IpcResult<HCloudMetrics>> => {
    try {
      const cacheKey = `${projectId}:metrics:${serverId}:${type}`
      const cached = cache.get<HCloudMetrics>(cacheKey)
      if (cached) return { success: true, data: cached }
      const client = getClient(storage, projectId)
      if (!client) return { success: false, error: 'Projekt nicht gefunden' }
      const metrics = await client.getMetrics(serverId, type, start, end)
      cache.set(cacheKey, metrics, TTL.metrics)
      return { success: true, data: metrics }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  ipcMain.handle('vnc:open', async (_e, projectId: string, serverId: number): Promise<IpcResult<void>> => {
    try {
      const client = getClient(storage, projectId)
      if (!client) return { success: false, error: 'Projekt nicht gefunden' }
      const creds = await client.requestConsole(serverId)
      const win = new BrowserWindow({
        width: 1024, height: 768,
        title: `Console — Server #${serverId}`,
        webPreferences: { contextIsolation: true, nodeIntegration: false },
      })
      const vncPath = path.join(__dirname, '../vnc/vnc.html')
      const params = new URLSearchParams({ wss_url: creds.wss_url, password: creds.password })
      await win.loadFile(vncPath, { search: params.toString() })
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })
}
