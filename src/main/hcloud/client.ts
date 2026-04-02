import axios, { AxiosRequestConfig } from 'axios'
import type { HCloudServer, HCloudMetrics, ConsoleCredentials, MetricType, ServerAction } from '../../shared/types'

const BASE = 'https://api.hetzner.cloud/v1'

export class HCloudClient {
  private cfg: AxiosRequestConfig

  constructor(apiKey: string) {
    this.cfg = {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
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
    await axios.post(`${BASE}/servers/${id}/actions/${action}`, {}, this.cfg)
  }

  async getMetrics(id: number, type: MetricType, start: string, end: string): Promise<HCloudMetrics> {
    const res = await axios.get(`${BASE}/servers/${id}/metrics`, {
      ...this.cfg,
      params: { type, start, end },
    })
    return res.data.metrics
  }

  async requestConsole(id: number): Promise<ConsoleCredentials> {
    const res = await axios.post(`${BASE}/servers/${id}/actions/request_console`, {}, this.cfg)
    return { wss_url: res.data.wss_url, password: res.data.password }
  }
}
