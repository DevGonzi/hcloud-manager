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

export interface ActionLogEntry {
  id: string
  timestamp: string
  projectId: string
  resource: string
  action: string
  label: string
  status: 'success' | 'error'
  error?: string
}

export type ServerStatus =
  | 'running'
  | 'initializing'
  | 'starting'
  | 'stopping'
  | 'off'
  | 'deleting'
  | 'migrating'
  | 'rebuilding'
  | 'unknown'

export type ServerAction =
  | 'start'
  | 'shutdown'
  | 'reboot'
  | 'reset'
  | 'rebuild'
  | 'reset_password'
  | 'enable_backups'
  | 'disable_backups'

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
  backup_window: string | null
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

export interface HCloudImage {
  id: number
  type: 'system' | 'snapshot' | 'backup' | 'app'
  status: 'available' | 'creating' | 'unavailable'
  name: string | null
  description: string
  image_size: number | null
  disk_size: number
  created: string
  created_from: { id: number; name: string } | null
  os_flavor: string
  os_version: string | null
  labels: Record<string, string>
  protection: { delete: boolean }
}

export interface HCloudNetwork {
  id: number
  name: string
  ip_range: string
  subnets: Array<{ type: string; ip_range: string; network_zone: string; gateway: string }>
  routes: Array<{ destination: string; gateway: string }>
  servers: number[]
  labels: Record<string, string>
  created: string
  protection: { delete: boolean }
}

export interface HCloudFirewallRule {
  direction: 'in' | 'out'
  source_ips: string[]
  destination_ips: string[]
  protocol: 'tcp' | 'udp' | 'icmp' | 'esp' | 'gre'
  port: string | null
  description: string | null
}

export interface HCloudFirewall {
  id: number
  name: string
  rules: HCloudFirewallRule[]
  applied_to: Array<{ type: string; server?: { id: number; name: string } }>
  labels: Record<string, string>
  created: string
}

export interface HCloudFloatingIp {
  id: number
  name: string
  type: 'ipv4' | 'ipv6'
  ip: string
  server: number | null
  home_location: { name: string; city: string; country: string }
  labels: Record<string, string>
  created: string
  protection: { delete: boolean }
  blocked: boolean
}

export interface HCloudLoadBalancer {
  id: number
  name: string
  public_net: {
    ipv4: { ip: string; blocked: boolean } | null
    ipv6: { ip: string; blocked: boolean } | null
    enabled: boolean
  }
  location: { name: string; city: string; country: string }
  load_balancer_type: {
    name: string
    max_connections: number
    max_targets: number
    max_services: number
  }
  algorithm: { type: string }
  services: Array<{ protocol: string; listen_port: number; destination_port: number }>
  targets: Array<{
    type: string
    server?: { id: number }
    health_status: Array<{ listen_port: number; status: string }>
  }>
  labels: Record<string, string>
  created: string
  protection: { delete: boolean }
}

export interface HCloudVolume {
  id: number
  name: string
  size: number
  location: { name: string; city: string; country: string }
  server: number | null
  format: string | null
  status: 'available' | 'creating'
  labels: Record<string, string>
  created: string
  protection: { delete: boolean }
  linux_device: string
}

export interface HCloudSshKey {
  id: number
  name: string
  fingerprint: string
  public_key: string
  labels: Record<string, string>
  created: string
}

export interface HCloudServerType {
  id: number
  name: string
  description: string
  cores: number
  memory: number
  disk: number
  cpu_type: string
  architecture: string
}

export interface HCloudLocation {
  id: number
  name: string
  description: string
  city: string
  country: string
}

export interface CreateServerInput {
  name: string
  serverType: string
  location: string
  imageId: number
  sshKeyIds: number[]
}

export interface CreateSnapshotInput {
  serverId: number
  description: string
}

export interface CreateNetworkInput {
  name: string
  ipRange: string
}

export interface CreateFirewallInput {
  name: string
}

export interface CreateFloatingIpInput {
  type: 'ipv4' | 'ipv6'
  homeLocation: string
  name: string
}

export interface CreateLoadBalancerInput {
  name: string
  loadBalancerType: string
  location: string
}

export interface CreateVolumeInput {
  name: string
  size: number
  location: string
}

export interface CreateSshKeyInput {
  name: string
  publicKey: string
}

export interface ConsoleCredentials {
  wss_url: string
  password: string
}

export type IpcResult<T> = { success: true; data: T } | { success: false; error: string }

export interface HCloudApi {
  storage: {
    getProjects: () => Promise<IpcResult<Project[]>>
    addProject: (input: AddProjectInput) => Promise<IpcResult<Project>>
    removeProject: (id: string) => Promise<IpcResult<void>>
    renameProject: (id: string, newName: string) => Promise<IpcResult<Project>>
  }
  api: {
    getServers: (projectId: string) => Promise<IpcResult<HCloudServer[]>>
    getServer: (projectId: string, serverId: number) => Promise<IpcResult<HCloudServer>>
    serverAction: (
      projectId: string,
      serverId: number,
      action: ServerAction
    ) => Promise<IpcResult<void>>
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
  servers: {
    create: (projectId: string, input: CreateServerInput) => Promise<IpcResult<HCloudServer>>
    delete: (projectId: string, serverId: number) => Promise<IpcResult<void>>
    listTypes: (projectId: string) => Promise<IpcResult<HCloudServerType[]>>
    listLocations: (projectId: string) => Promise<IpcResult<HCloudLocation[]>>
  }
  images: {
    list: (projectId: string, type?: string) => Promise<IpcResult<HCloudImage[]>>
    delete: (projectId: string, imageId: number) => Promise<IpcResult<void>>
    createSnapshot: (projectId: string, input: CreateSnapshotInput) => Promise<IpcResult<void>>
    createImageFromSnapshot: (projectId: string, imageId: number) => Promise<IpcResult<HCloudImage>>
  }
  networks: {
    list: (projectId: string) => Promise<IpcResult<HCloudNetwork[]>>
    create: (projectId: string, input: CreateNetworkInput) => Promise<IpcResult<HCloudNetwork>>
    delete: (projectId: string, networkId: number) => Promise<IpcResult<void>>
  }
  firewalls: {
    list: (projectId: string) => Promise<IpcResult<HCloudFirewall[]>>
    create: (projectId: string, input: CreateFirewallInput) => Promise<IpcResult<HCloudFirewall>>
    delete: (projectId: string, firewallId: number) => Promise<IpcResult<void>>
  }
  floatingIps: {
    list: (projectId: string) => Promise<IpcResult<HCloudFloatingIp[]>>
    create: (
      projectId: string,
      input: CreateFloatingIpInput
    ) => Promise<IpcResult<HCloudFloatingIp>>
    delete: (projectId: string, ipId: number) => Promise<IpcResult<void>>
  }
  loadBalancers: {
    list: (projectId: string) => Promise<IpcResult<HCloudLoadBalancer[]>>
    create: (
      projectId: string,
      input: CreateLoadBalancerInput
    ) => Promise<IpcResult<HCloudLoadBalancer>>
    delete: (projectId: string, lbId: number) => Promise<IpcResult<void>>
  }
  volumes: {
    list: (projectId: string) => Promise<IpcResult<HCloudVolume[]>>
    create: (projectId: string, input: CreateVolumeInput) => Promise<IpcResult<HCloudVolume>>
    delete: (projectId: string, volumeId: number) => Promise<IpcResult<void>>
  }
  sshKeys: {
    list: (projectId: string) => Promise<IpcResult<HCloudSshKey[]>>
    delete: (projectId: string, keyId: number) => Promise<IpcResult<void>>
    create: (projectId: string, input: CreateSshKeyInput) => Promise<IpcResult<HCloudSshKey>>
  }
  actionlog: {
    getAll: () => Promise<IpcResult<ActionLogEntry[]>>
    onEntry: (callback: (entry: ActionLogEntry) => void) => void
  }
  appconfig: {
    getHasPinSet: () => Promise<IpcResult<boolean>>
    setPin: (pin: string) => Promise<IpcResult<void>>
    verifyPin: (pin: string) => Promise<IpcResult<boolean>>
    clearPin: () => Promise<IpcResult<void>>
    getCacheTtl: () => Promise<IpcResult<number>>
    setCacheTtl: (ttl: number) => Promise<IpcResult<void>>
    lock: () => Promise<IpcResult<void>>
    unlock: () => Promise<IpcResult<void>>
    getIsLocked: () => Promise<IpcResult<boolean>>
    onLockRequest: (callback: () => void) => void
  }
  window: {
    minimize: () => void
    maximize: () => void
    close: () => void
  }
}

declare global {
  interface Window {
    hcloud: HCloudApi
  }
}
