import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

import { HCloudClient } from '../../main/hcloud/client'

describe('HCloudClient', () => {
  let client: HCloudClient

  beforeEach(() => {
    client = new HCloudClient('test-token-123')
    vi.clearAllMocks()
  })

  it('setzt Authorization Header korrekt', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({ data: { servers: [] } })
    await client.getServers()
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.hetzner.cloud/v1/servers',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer test-token-123' }),
      })
    )
  })

  it('getServers gibt Server-Array zurück', async () => {
    const s = { id: 1, name: 'test', status: 'running' }
    mockedAxios.get = vi.fn().mockResolvedValue({ data: { servers: [s] } })
    expect(await client.getServers()).toEqual([s])
  })

  it('getServer gibt einzelnen Server zurück', async () => {
    const s = { id: 42, name: 'lap0001' }
    mockedAxios.get = vi.fn().mockResolvedValue({ data: { server: s } })
    expect(await client.getServer(42)).toEqual(s)
  })

  it('serverAction POST an korrekten Endpoint', async () => {
    mockedAxios.post = vi.fn().mockResolvedValue({ data: {} })
    await client.serverAction(42, 'start')
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.hetzner.cloud/v1/servers/42/actions/start',
      {}, expect.anything()
    )
  })

  it('requestConsole gibt wss_url + password zurück', async () => {
    mockedAxios.post = vi.fn().mockResolvedValue({
      data: { wss_url: 'wss://console.hetzner.cloud/?token=abc', password: 'pw' }
    })
    expect(await client.requestConsole(42)).toEqual({
      wss_url: 'wss://console.hetzner.cloud/?token=abc', password: 'pw'
    })
  })
})
