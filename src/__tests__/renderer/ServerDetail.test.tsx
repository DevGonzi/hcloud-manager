import { render, screen } from '@testing-library/react'
import { ServerDetail } from '../../renderer/src/components/servers/ServerDetail'
import { useServerStore } from '../../renderer/src/stores/server.store'
import type { HCloudServer } from '../../shared/types'

vi.mock('../../renderer/src/stores/server.store')

const mockServer: HCloudServer = {
  id: 42,
  name: 'test-server',
  status: 'running',
  server_type: { name: 'cx21', cores: 2, memory: 4, disk: 40, cpu_type: 'shared' },
  public_net: {
    ipv4: { ip: '1.2.3.4', blocked: false },
    ipv6: { ip: '2a01::1/64', blocked: false }
  },
  datacenter: { name: 'nbg1-dc3', location: { name: 'NBG1', city: 'Nuremberg', country: 'DE' } },
  image: { description: 'Ubuntu 22.04', os_flavor: 'ubuntu' },
  labels: {},
  created: '2026-01-01T00:00:00Z',
  protection: { delete: false, rebuild: false },
  volumes: [],
  networks: [],
  firewalls: []
}

describe('ServerDetail', () => {
  it('panel ist geschlossen wenn kein Server ausgewählt', () => {
    vi.mocked(useServerStore).mockReturnValue({
      servers: [],
      selectedServerId: null,
      selectServer: vi.fn()
    } as any)
    const { container } = render(
      <ServerDetail projectId="p1" readonly={false} onAction={vi.fn()} />
    )
    expect(container.firstChild).toHaveClass('translate-x-full')
  })

  it('zeigt Server-Namen wenn ausgewählt', () => {
    vi.mocked(useServerStore).mockReturnValue({
      servers: [mockServer],
      selectedServerId: 42,
      selectServer: vi.fn()
    } as any)
    render(<ServerDetail projectId="p1" readonly={false} onAction={vi.fn()} />)
    expect(screen.getByText('test-server')).toBeInTheDocument()
  })

  it('zeigt IPv4 in Overview', () => {
    vi.mocked(useServerStore).mockReturnValue({
      servers: [mockServer],
      selectedServerId: 42,
      selectServer: vi.fn()
    } as any)
    render(<ServerDetail projectId="p1" readonly={false} onAction={vi.fn()} />)
    expect(screen.getByText('1.2.3.4')).toBeInTheDocument()
  })
})
