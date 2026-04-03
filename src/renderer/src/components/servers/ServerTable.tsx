import type { HCloudServer } from '../../../../shared/types'
import { ServerRow } from './ServerRow'

interface Props {
  servers: HCloudServer[]
  selectedId: number | null
  readonly: boolean
  cpuMap: Record<number, number>
  onSelect: (id: number) => void
  onAction?: (serverId: number, action: 'start' | 'shutdown' | 'reboot') => void
}

export function ServerTable({ servers, selectedId, readonly, cpuMap, onSelect, onAction }: Props) {
  if (servers.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px 0',
          color: 'var(--tx3)',
          gap: 8
        }}
      >
        <span style={{ fontSize: 24, opacity: 0.3 }}>▣</span>
        <p style={{ fontSize: 12, margin: 0 }}>Keine Server in diesem Projekt</p>
      </div>
    )
  }

  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '6px 12px',
    fontSize: 10,
    fontWeight: 600,
    color: 'var(--tx3)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontFamily: 'JetBrains Mono, monospace',
    borderBottom: '1px solid var(--bdr)',
    background: 'var(--bg2)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    whiteSpace: 'nowrap'
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {['', 'Name / ID', 'Status', 'Typ', 'IPv4', 'Location', 'CPU', ''].map((h, i) => (
            <th key={i} style={thStyle}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {servers.map((server) => (
          <ServerRow
            key={server.id}
            server={server}
            selected={selectedId === server.id}
            readonly={readonly}
            cpu={cpuMap[server.id]}
            onSelect={() => onSelect(server.id)}
            onAction={(action) => onAction?.(server.id, action)}
          />
        ))}
      </tbody>
    </table>
  )
}
