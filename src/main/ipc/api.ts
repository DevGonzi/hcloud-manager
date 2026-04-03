import { ipcMain, BrowserWindow } from 'electron'
import path from 'path'
import { HCloudClient } from '../hcloud/client'
import type { ProjectStorage } from '../storage'
import { cache } from '../cache'
import { actionLog } from '../actionlog'
import type {
  HCloudServer,
  HCloudMetrics,
  IpcResult,
  MetricType,
  ServerAction,
  HCloudImage,
  HCloudNetwork,
  HCloudFirewall,
  HCloudFloatingIp,
  HCloudLoadBalancer,
  HCloudVolume,
  HCloudSshKey,
  HCloudServerType,
  HCloudLocation,
  CreateSnapshotInput,
  CreateNetworkInput,
  CreateFirewallInput,
  CreateFloatingIpInput,
  CreateLoadBalancerInput,
  CreateVolumeInput,
  CreateSshKeyInput,
  CreateServerInput
} from '../../shared/types'

const TTL = { servers: 2, server: 15, metrics: 30 }

function getClient(storage: ProjectStorage, projectId: string): HCloudClient | null {
  const key = storage.getApiKey(projectId)
  if (!key) return null
  return new HCloudClient(key)
}

export function registerApiHandlers(storage: ProjectStorage) {
  ipcMain.handle(
    'api:getServers',
    async (_e, projectId: string): Promise<IpcResult<HCloudServer[]>> => {
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
    }
  )

  ipcMain.handle(
    'api:getServer',
    async (_e, projectId: string, serverId: number): Promise<IpcResult<HCloudServer>> => {
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
    }
  )

  ipcMain.handle(
    'api:serverAction',
    async (
      _e,
      projectId: string,
      serverId: number,
      action: ServerAction
    ): Promise<IpcResult<void>> => {
      try {
        const project = storage.getProjects().find((p) => p.id === projectId)
        if (project?.readonly) return { success: false, error: 'Projekt ist readonly' }
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }

        // Get server name for logging
        const server = await client.getServer(serverId)
        const label = server.name

        await client.serverAction(serverId, action)
        cache.invalidatePrefix(`${projectId}:server`)

        actionLog.push({
          projectId,
          resource: 'server',
          action,
          label,
          status: 'success'
        })

        return { success: true, data: undefined }
      } catch (e) {
        const errorMsg = String(e)
        actionLog.push({
          projectId,
          resource: 'server',
          action,
          label: `#${serverId}`,
          status: 'error',
          error: errorMsg
        })
        return { success: false, error: errorMsg }
      }
    }
  )

  ipcMain.handle(
    'api:getMetrics',
    async (
      _e,
      projectId: string,
      serverId: number,
      type: MetricType,
      start: string,
      end: string
    ): Promise<IpcResult<HCloudMetrics>> => {
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
    }
  )

  // ── Server create / delete / meta ────────────────────────────────────────
  ipcMain.handle(
    'servers:listTypes',
    async (_e, projectId: string): Promise<IpcResult<HCloudServerType[]>> => {
      try {
        const cacheKey = `${projectId}:serverTypes`
        const cached = cache.get<HCloudServerType[]>(cacheKey)
        if (cached) return { success: true, data: cached }
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        const data = await client.getServerTypes()
        cache.set(cacheKey, data, 300)
        return { success: true, data }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )

  ipcMain.handle(
    'servers:listLocations',
    async (_e, projectId: string): Promise<IpcResult<HCloudLocation[]>> => {
      try {
        const cacheKey = `${projectId}:locations`
        const cached = cache.get<HCloudLocation[]>(cacheKey)
        if (cached) return { success: true, data: cached }
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        const data = await client.getLocations()
        cache.set(cacheKey, data, 300)
        return { success: true, data }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )

  ipcMain.handle(
    'servers:create',
    async (_e, projectId: string, input: CreateServerInput): Promise<IpcResult<HCloudServer>> => {
      try {
        const project = storage.getProjects().find((p) => p.id === projectId)
        if (project?.readonly) return { success: false, error: 'Projekt ist readonly' }
        if (!input.name || !input.serverType || !input.location || !input.imageId) {
          return {
            success: false,
            error: 'Alle Felder erforderlich: name, serverType, location, imageId'
          }
        }
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        const server = await client.createServer(input)
        cache.invalidatePrefix(`${projectId}:server`)
        return { success: true, data: server }
      } catch (e: any) {
        console.error('[servers:create] Error:', e)
        const errorMsg = e.response?.data?.message || e.message || String(e)
        return { success: false, error: errorMsg }
      }
    }
  )

  ipcMain.handle(
    'servers:delete',
    async (_e, projectId: string, serverId: number): Promise<IpcResult<void>> => {
      try {
        const project = storage.getProjects().find((p) => p.id === projectId)
        if (project?.readonly) return { success: false, error: 'Projekt ist readonly' }
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        await client.deleteServer(serverId)
        cache.invalidatePrefix(`${projectId}:server`)
        return { success: true, data: undefined }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )

  // ── Images ──────────────────────────────────────────────────────────────
  ipcMain.handle(
    'images:list',
    async (_e, projectId: string, type?: string): Promise<IpcResult<HCloudImage[]>> => {
      try {
        const cacheKey = `${projectId}:images:${type ?? 'all'}`
        const cached = cache.get<HCloudImage[]>(cacheKey)
        if (cached) return { success: true, data: cached }
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        const data = await client.getImages(type)
        cache.set(cacheKey, data, 60)
        return { success: true, data }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )

  ipcMain.handle(
    'images:delete',
    async (_e, projectId: string, imageId: number): Promise<IpcResult<void>> => {
      try {
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        await client.deleteImage(imageId)
        cache.invalidatePrefix(`${projectId}:images`)
        return { success: true, data: undefined }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )

  ipcMain.handle(
    'images:createImageFromSnapshot',
    async (_e, projectId: string, imageId: number): Promise<IpcResult<HCloudImage>> => {
      try {
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        const image = await client.protectImage(imageId)
        cache.invalidatePrefix(`${projectId}:images`)
        return { success: true, data: image }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )

  // ── Networks ─────────────────────────────────────────────────────────────
  ipcMain.handle(
    'networks:list',
    async (_e, projectId: string): Promise<IpcResult<HCloudNetwork[]>> => {
      try {
        const cacheKey = `${projectId}:networks`
        const cached = cache.get<HCloudNetwork[]>(cacheKey)
        if (cached) return { success: true, data: cached }
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        const data = await client.getNetworks()
        cache.set(cacheKey, data, 60)
        return { success: true, data }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )

  ipcMain.handle(
    'networks:delete',
    async (_e, projectId: string, networkId: number): Promise<IpcResult<void>> => {
      try {
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        await client.deleteNetwork(networkId)
        cache.invalidatePrefix(`${projectId}:networks`)
        return { success: true, data: undefined }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )

  // ── Firewalls ─────────────────────────────────────────────────────────────
  ipcMain.handle(
    'firewalls:list',
    async (_e, projectId: string): Promise<IpcResult<HCloudFirewall[]>> => {
      try {
        const cacheKey = `${projectId}:firewalls`
        const cached = cache.get<HCloudFirewall[]>(cacheKey)
        if (cached) return { success: true, data: cached }
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        const data = await client.getFirewalls()
        cache.set(cacheKey, data, 60)
        return { success: true, data }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )

  ipcMain.handle(
    'firewalls:delete',
    async (_e, projectId: string, firewallId: number): Promise<IpcResult<void>> => {
      try {
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        await client.deleteFirewall(firewallId)
        cache.invalidatePrefix(`${projectId}:firewalls`)
        return { success: true, data: undefined }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )

  // ── Floating IPs ──────────────────────────────────────────────────────────
  ipcMain.handle(
    'floatingIps:list',
    async (_e, projectId: string): Promise<IpcResult<HCloudFloatingIp[]>> => {
      try {
        const cacheKey = `${projectId}:floatingIps`
        const cached = cache.get<HCloudFloatingIp[]>(cacheKey)
        if (cached) return { success: true, data: cached }
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        const data = await client.getFloatingIps()
        cache.set(cacheKey, data, 60)
        return { success: true, data }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )

  ipcMain.handle(
    'floatingIps:delete',
    async (_e, projectId: string, ipId: number): Promise<IpcResult<void>> => {
      try {
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        await client.deleteFloatingIp(ipId)
        cache.invalidatePrefix(`${projectId}:floatingIps`)
        return { success: true, data: undefined }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )

  // ── Load Balancers ────────────────────────────────────────────────────────
  ipcMain.handle(
    'loadBalancers:list',
    async (_e, projectId: string): Promise<IpcResult<HCloudLoadBalancer[]>> => {
      try {
        const cacheKey = `${projectId}:loadBalancers`
        const cached = cache.get<HCloudLoadBalancer[]>(cacheKey)
        if (cached) return { success: true, data: cached }
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        const data = await client.getLoadBalancers()
        cache.set(cacheKey, data, 60)
        return { success: true, data }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )

  ipcMain.handle(
    'loadBalancers:delete',
    async (_e, projectId: string, lbId: number): Promise<IpcResult<void>> => {
      try {
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        await client.deleteLoadBalancer(lbId)
        cache.invalidatePrefix(`${projectId}:loadBalancers`)
        return { success: true, data: undefined }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )

  // ── Volumes ───────────────────────────────────────────────────────────────
  ipcMain.handle(
    'volumes:list',
    async (_e, projectId: string): Promise<IpcResult<HCloudVolume[]>> => {
      try {
        const cacheKey = `${projectId}:volumes`
        const cached = cache.get<HCloudVolume[]>(cacheKey)
        if (cached) return { success: true, data: cached }
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        const data = await client.getVolumes()
        cache.set(cacheKey, data, 60)
        return { success: true, data }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )

  ipcMain.handle(
    'volumes:delete',
    async (_e, projectId: string, volumeId: number): Promise<IpcResult<void>> => {
      try {
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        await client.deleteVolume(volumeId)
        cache.invalidatePrefix(`${projectId}:volumes`)
        return { success: true, data: undefined }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )

  // ── SSH Keys ──────────────────────────────────────────────────────────────
  ipcMain.handle(
    'sshKeys:list',
    async (_e, projectId: string): Promise<IpcResult<HCloudSshKey[]>> => {
      try {
        const cacheKey = `${projectId}:sshKeys`
        const cached = cache.get<HCloudSshKey[]>(cacheKey)
        if (cached) return { success: true, data: cached }
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        const data = await client.getSshKeys()
        cache.set(cacheKey, data, 60)
        return { success: true, data }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )

  ipcMain.handle(
    'sshKeys:delete',
    async (_e, projectId: string, keyId: number): Promise<IpcResult<void>> => {
      try {
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        await client.deleteSshKey(keyId)
        cache.invalidatePrefix(`${projectId}:sshKeys`)
        return { success: true, data: undefined }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )

  // ── Create handlers ──────────────────────────────────────────────────────
  ipcMain.handle(
    'images:createSnapshot',
    async (_e, projectId: string, input: CreateSnapshotInput): Promise<IpcResult<void>> => {
      try {
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        await client.createSnapshot(input)
        cache.invalidatePrefix(`${projectId}:images`)
        return { success: true, data: undefined }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )

  ipcMain.handle(
    'networks:create',
    async (_e, projectId: string, input: CreateNetworkInput): Promise<IpcResult<HCloudNetwork>> => {
      try {
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        const data = await client.createNetwork(input)
        cache.invalidatePrefix(`${projectId}:networks`)
        return { success: true, data }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )

  ipcMain.handle(
    'firewalls:create',
    async (
      _e,
      projectId: string,
      input: CreateFirewallInput
    ): Promise<IpcResult<HCloudFirewall>> => {
      try {
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        const data = await client.createFirewall(input)
        cache.invalidatePrefix(`${projectId}:firewalls`)
        return { success: true, data }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )

  ipcMain.handle(
    'floatingIps:create',
    async (
      _e,
      projectId: string,
      input: CreateFloatingIpInput
    ): Promise<IpcResult<HCloudFloatingIp>> => {
      try {
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        const data = await client.createFloatingIp(input)
        cache.invalidatePrefix(`${projectId}:floatingIps`)
        return { success: true, data }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )

  ipcMain.handle(
    'loadBalancers:create',
    async (
      _e,
      projectId: string,
      input: CreateLoadBalancerInput
    ): Promise<IpcResult<HCloudLoadBalancer>> => {
      try {
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        const data = await client.createLoadBalancer(input)
        cache.invalidatePrefix(`${projectId}:loadBalancers`)
        return { success: true, data }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )

  ipcMain.handle(
    'volumes:create',
    async (_e, projectId: string, input: CreateVolumeInput): Promise<IpcResult<HCloudVolume>> => {
      try {
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        const data = await client.createVolume(input)
        cache.invalidatePrefix(`${projectId}:volumes`)
        return { success: true, data }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )

  ipcMain.handle(
    'sshKeys:create',
    async (_e, projectId: string, input: CreateSshKeyInput): Promise<IpcResult<HCloudSshKey>> => {
      try {
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        const data = await client.createSshKey(input)
        cache.invalidatePrefix(`${projectId}:sshKeys`)
        return { success: true, data }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )

  // ── VNC ───────────────────────────────────────────────────────────────────
  ipcMain.handle(
    'vnc:open',
    async (_e, projectId: string, serverId: number): Promise<IpcResult<void>> => {
      try {
        const client = getClient(storage, projectId)
        if (!client) return { success: false, error: 'Projekt nicht gefunden' }
        const creds = await client.requestConsole(serverId)
        const win = new BrowserWindow({
          width: 1024,
          height: 768,
          title: `Console — Server #${serverId}`,
          autoHideMenuBar: true,
          icon: path.join(__dirname, '../../build/icon.ico'),
          webPreferences: { contextIsolation: true, nodeIntegration: false, webSecurity: false }
        })
        win.setMenu(null)
        const params = new URLSearchParams({ wss_url: creds.wss_url, password: creds.password })
        if (process.env['ELECTRON_RENDERER_URL']) {
          await win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/vnc.html?${params}`)
        } else {
          await win.loadFile(path.join(__dirname, '../renderer/vnc.html'), {
            search: params.toString()
          })
        }
        return { success: true, data: undefined }
      } catch (e) {
        return { success: false, error: String(e) }
      }
    }
  )
}
