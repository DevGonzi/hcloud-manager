import type { HCloudServer } from '../../../../shared/types'
import { ServerRow } from './ServerRow'

interface Props {
  servers: HCloudServer[]
  selectedId: number | null
  readonly: boolean
  onSelect: (id: number) => void
  onAction?: (serverId: number, action: 'start' | 'shutdown' | 'reboot') => void
}

export function ServerTable({ servers, selectedId, readonly, onSelect, onAction }: Props) {
  if (servers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-text-3 gap-2">
        <span className="text-2xl opacity-30">▣</span>
        <p className="text-xs">Keine Server in diesem Projekt</p>
      </div>
    )
  }

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          {['', 'Name / ID', 'Status', 'Typ', 'IPv4', 'Location', 'CPU', 'RAM', ''].map((h, i) => (
            <th
              key={i}
              className="text-left px-3 py-1.5 text-[10px] font-semibold text-text-3 uppercase tracking-[0.08em] font-mono border-b border-border bg-bg-2 sticky top-0 z-10 whitespace-nowrap"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {servers.map(server => (
          <ServerRow
            key={server.id}
            server={server}
            selected={selectedId === server.id}
            readonly={readonly}
            onSelect={() => onSelect(server.id)}
            onAction={action => onAction?.(server.id, action)}
          />
        ))}
      </tbody>
    </table>
  )
}
