import axios, { AxiosRequestConfig } from 'axios'
import type {
  HCloudServer,
  HCloudMetrics,
  ConsoleCredentials,
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
  CreateNetworkInput,
  CreateFirewallInput,
  CreateFloatingIpInput,
  CreateLoadBalancerInput,
  CreateVolumeInput,
  CreateSshKeyInput,
  CreateSnapshotInput,
  CreateServerInput
} from '../../shared/types'

const BASE = 'https://api.hetzner.cloud/v1'

export class HCloudClient {
  private cfg: AxiosRequestConfig

  constructor(apiKey: string) {
    this.cfg = {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  }

  async getServers(): Promise<HCloudServer[]> {
    const res = await axios.get(`${BASE}/servers`, this.cfg)
    return res.data.servers
  }

  async getServer(id: number): Promise<HCloudServer> {
    const res = await axios.get(`${BASE}/servers/${id}`, this.cfg)
    return res.data.server
  }

  async serverAction(id: number, action: ServerAction): Promise<void> {
    const actionMap: Record<ServerAction, string> = {
      'start': 'power_on',
      'shutdown': 'power_off',
      'reboot': 'reboot',
      'reset': 'reset',
      'rebuild': 'rebuild',
      'reset_password': 'reset_password',
      'enable_backups': 'enable_backups',
      'disable_backups': 'disable_backups'
    }
    const apiAction = actionMap[action] || action
    await axios.post(`${BASE}/servers/${id}/actions/${apiAction}`, {}, this.cfg)
  }

  async getMetrics(
    id: number,
    type: MetricType,
    start: string,
    end: string
  ): Promise<HCloudMetrics> {
    const res = await axios.get(`${BASE}/servers/${id}/metrics`, {
      ...this.cfg,
      params: { type, start, end }
    })
    return res.data.metrics
  }

  async getServerTypes(): Promise<HCloudServerType[]> {
    const res = await axios.get(`${BASE}/server_types`, this.cfg)
    return res.data.server_types
  }

  async getLocations(): Promise<HCloudLocation[]> {
    const res = await axios.get(`${BASE}/locations`, this.cfg)
    return res.data.locations
  }

  async createServer(input: CreateServerInput): Promise<HCloudServer> {
    const body: Record<string, unknown> = {
      name: input.name,
      server_type: input.serverType,
      location: input.location,
      image: String(input.imageId)
    }
    if (input.sshKeyIds.length > 0) body.ssh_keys = input.sshKeyIds
    try {
      const res = await axios.post(`${BASE}/servers`, body, this.cfg)
      return res.data.server
    } catch (err: any) {
      console.error('CreateServer Error:', err.response?.data || err.message)
      throw err
    }
  }

  async deleteServer(id: number): Promise<void> {
    await axios.delete(`${BASE}/servers/${id}`, this.cfg)
  }

  async requestConsole(id: number): Promise<ConsoleCredentials> {
    const res = await axios.post(`${BASE}/servers/${id}/actions/request_console`, {}, this.cfg)
    return { wss_url: res.data.wss_url, password: res.data.password }
  }

  async getImages(type?: string): Promise<HCloudImage[]> {
    const params: Record<string, string> = {}
    if (type) params.type = type
    const res = await axios.get(`${BASE}/images`, { ...this.cfg, params })
    return res.data.images
  }

  async deleteImage(id: number): Promise<void> {
    await axios.delete(`${BASE}/images/${id}`, this.cfg)
  }

  async getNetworks(): Promise<HCloudNetwork[]> {
    const res = await axios.get(`${BASE}/networks`, this.cfg)
    return res.data.networks
  }

  async getFirewalls(): Promise<HCloudFirewall[]> {
    const res = await axios.get(`${BASE}/firewalls`, this.cfg)
    return res.data.firewalls
  }

  async getFloatingIps(): Promise<HCloudFloatingIp[]> {
    const res = await axios.get(`${BASE}/floating_ips`, this.cfg)
    return res.data.floating_ips
  }

  async getLoadBalancers(): Promise<HCloudLoadBalancer[]> {
    const res = await axios.get(`${BASE}/load_balancers`, this.cfg)
    return res.data.load_balancers
  }

  async getVolumes(): Promise<HCloudVolume[]> {
    const res = await axios.get(`${BASE}/volumes`, this.cfg)
    return res.data.volumes
  }

  async getSshKeys(): Promise<HCloudSshKey[]> {
    const res = await axios.get(`${BASE}/ssh_keys`, this.cfg)
    return res.data.ssh_keys
  }

  async deleteSshKey(id: number): Promise<void> {
    await axios.delete(`${BASE}/ssh_keys/${id}`, this.cfg)
  }

  async createSnapshot(input: CreateSnapshotInput): Promise<void> {
    await axios.post(
      `${BASE}/servers/${input.serverId}/actions/create_image`,
      {
        type: 'snapshot',
        description: input.description
      },
      this.cfg
    )
  }

  async createNetwork(input: CreateNetworkInput): Promise<HCloudNetwork> {
    const res = await axios.post(
      `${BASE}/networks`,
      { name: input.name, ip_range: input.ipRange },
      this.cfg
    )
    return res.data.network
  }

  async deleteNetwork(id: number): Promise<void> {
    await axios.delete(`${BASE}/networks/${id}`, this.cfg)
  }

  async createFirewall(input: CreateFirewallInput): Promise<HCloudFirewall> {
    const res = await axios.post(`${BASE}/firewalls`, { name: input.name, rules: [] }, this.cfg)
    return res.data.firewall
  }

  async deleteFirewall(id: number): Promise<void> {
    await axios.delete(`${BASE}/firewalls/${id}`, this.cfg)
  }

  async createFloatingIp(input: CreateFloatingIpInput): Promise<HCloudFloatingIp> {
    const res = await axios.post(
      `${BASE}/floating_ips`,
      {
        type: input.type,
        home_location: input.homeLocation,
        name: input.name
      },
      this.cfg
    )
    return res.data.floating_ip
  }

  async deleteFloatingIp(id: number): Promise<void> {
    await axios.delete(`${BASE}/floating_ips/${id}`, this.cfg)
  }

  async createLoadBalancer(input: CreateLoadBalancerInput): Promise<HCloudLoadBalancer> {
    const res = await axios.post(
      `${BASE}/load_balancers`,
      {
        name: input.name,
        load_balancer_type: input.loadBalancerType,
        location: input.location,
        algorithm: { type: 'round_robin' }
      },
      this.cfg
    )
    return res.data.load_balancer
  }

  async deleteLoadBalancer(id: number): Promise<void> {
    await axios.delete(`${BASE}/load_balancers/${id}`, this.cfg)
  }

  async createVolume(input: CreateVolumeInput): Promise<HCloudVolume> {
    const res = await axios.post(
      `${BASE}/volumes`,
      {
        name: input.name,
        size: input.size,
        location: input.location
      },
      this.cfg
    )
    return res.data.volume
  }

  async deleteVolume(id: number): Promise<void> {
    await axios.delete(`${BASE}/volumes/${id}`, this.cfg)
  }

  async createSshKey(input: CreateSshKeyInput): Promise<HCloudSshKey> {
    const res = await axios.post(
      `${BASE}/ssh_keys`,
      {
        name: input.name,
        public_key: input.publicKey
      },
      this.cfg
    )
    return res.data.ssh_key
  }

  async protectImage(id: number): Promise<HCloudImage> {
    await axios.post(`${BASE}/images/${id}/actions/change_protection`, { delete: true }, this.cfg)
    const res = await axios.get(`${BASE}/images/${id}`, this.cfg)
    return res.data.image
  }
}
