export interface Project {
  id: string
  name: string
  readonly: boolean
}

export interface AddProjectInput {
  name: string
  apiKey: string
  readonly: boolean
}

export type ServerStatus =
  | 'running' | 'initializing' | 'starting' | 'stopping'
  | 'off' | 'deleting' | 'migrating' | 'rebuilding' | 'unknown'

export type ServerAction =
  | 'start' | 'shutdown' | 'reboot' | 'reset'
  | 'rebuild' | 'reset_password'

export interface HCloudServer {
  id: number
  name: string
  status: ServerStatus
  server_type: {
    name: string
    cores: number
    memory: number
    disk: number
    cpu_type: string
  }
  public_net: {
    ipv4: { ip: string; blocked: boolean } | null
    ipv6: { ip: string; blocked: boolean } | null
  }
  datacenter: {
    name: string
    location: { name: string; city: string; country: string }
  }
  image: { description: string; os_flavor: string } | null
  labels: Record<string, string>
  created: string
  protection: { delete: boolean; rebuild: boolean }
  volumes: number[]
  networks: number[]
  firewalls: Array<{ id: number; status: string }>
}

export type MetricType = 'cpu' | 'disk' | 'network'

export interface HCloudMetrics {
  start: string
  end: string
  step: number
  time_series: Record<string, { values: [number, string][] }>
}

export interface ConsoleCredentials {
  wss_url: string
  password: string
}

export type IpcResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export interface HCloudApi {
  storage: {
    getProjects: () => Promise<IpcResult<Project[]>>
    addProject: (input: AddProjectInput) => Promise<IpcResult<Project>>
    removeProject: (id: string) => Promise<IpcResult<void>>
  }
  api: {
    getServers: (projectId: string) => Promise<IpcResult<HCloudServer[]>>
    getServer: (projectId: string, serverId: number) => Promise<IpcResult<HCloudServer>>
    serverAction: (projectId: string, serverId: number, action: ServerAction) => Promise<IpcResult<void>>
    getMetrics: (
      projectId: string,
      serverId: number,
      type: MetricType,
      start: string,
      end: string
    ) => Promise<IpcResult<HCloudMetrics>>
  }
  vnc: {
    open: (projectId: string, serverId: number) => Promise<IpcResult<void>>
  }
}

declare global {
  interface Window {
    hcloud: HCloudApi
  }
}
