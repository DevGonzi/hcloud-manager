import { render, screen, fireEvent } from '@testing-library/react'
import { ServerTable } from '../../renderer/src/components/servers/ServerTable'
import type { HCloudServer } from '../../shared/types'

const mockServer: HCloudServer = {
  id: 1,
  name: 'lap0001',
  status: 'running',
  server_type: { name: 'cx31', cores: 4, memory: 8, disk: 80, cpu_type: 'shared' },
  public_net: { ipv4: { ip: '167.235.106.22', blocked: false }, ipv6: null },
  datacenter: { name: 'fsn1-dc14', location: { name: 'FSN1', city: 'Falkenstein', country: 'DE' } },
  image: { description: 'Ubuntu 22.04', os_flavor: 'ubuntu' },
  labels: { role: 'panel' },
  created: '2025-08-12T00:00:00Z',
  protection: { delete: false, rebuild: false },
  volumes: [],
  networks: [],
  firewalls: [],
}

describe('ServerTable', () => {
  it('rendert Server-Namen', () => {
    render(<ServerTable servers={[mockServer]} onSelect={vi.fn()} selectedId={null} readonly={false} />)
    expect(screen.getByText('lap0001')).toBeInTheDocument()
  })

  it('zeigt running Status', () => {
    render(<ServerTable servers={[mockServer]} onSelect={vi.fn()} selectedId={null} readonly={false} />)
    expect(screen.getByText('running')).toBeInTheDocument()
  })

  it('ruft onSelect auf bei Klick', () => {
    const onSelect = vi.fn()
    render(<ServerTable servers={[mockServer]} onSelect={onSelect} selectedId={null} readonly={false} />)
    fireEvent.click(screen.getByText('lap0001'))
    expect(onSelect).toHaveBeenCalledWith(1)
  })

  it('zeigt IPv4 Adresse', () => {
    render(<ServerTable servers={[mockServer]} onSelect={vi.fn()} selectedId={null} readonly={false} />)
    expect(screen.getByText('167.235.106.22')).toBeInTheDocument()
  })

  it('zeigt leeren Zustand wenn keine Server', () => {
    render(<ServerTable servers={[]} onSelect={vi.fn()} selectedId={null} readonly={false} />)
    expect(screen.getByText(/keine server/i)).toBeInTheDocument()
  })
})
