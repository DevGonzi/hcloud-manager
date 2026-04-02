import type { HCloudServer } from '../../../../shared/types'

interface Props {
  server: HCloudServer
  selected: boolean
  readonly: boolean
  onSelect: () => void
  onAction: (action: 'start' | 'shutdown' | 'reboot') => void
}

const statusClass: Record<string, string> = {
  running: 'bg-green-500/10 text-status-running',
  off:     'bg-status-off/10 text-status-off',
  starting:'bg-yellow-500/10 text-status-starting',
  stopping:'bg-yellow-500/10 text-status-starting',
}

const pulseClass: Record<string, string> = {
  running: 'bg-status-running animate-pulse',
  off:     'bg-status-off',
  starting:'bg-status-starting animate-pulse',
  stopping:'bg-status-starting animate-pulse',
}

function UsageBar({ value, colorClass }: { value: number; colorClass: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-14 h-1 bg-bg-4 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] text-text-3 font-mono w-7">{value}%</span>
    </div>
  )
}

export function ServerRow({ server, selected, readonly, onSelect, onAction }: Props) {
  const ip = server.public_net.ipv4?.ip ?? '—'
  const status = server.status
  const sClass = statusClass[status] ?? 'bg-bg-4 text-text-3'
  const pClass = pulseClass[status] ?? 'bg-text-3'
  const isRunning = status === 'running'

  return (
    <tr
      onClick={onSelect}
      className={`border-b border-border cursor-pointer transition-colors group ${
        selected ? 'bg-bg-4' : 'hover:bg-bg-3'
      }`}
    >
      <td className="pl-2 pr-0 py-2.5">
        <span className="text-text-3 text-[11px]">▸</span>
      </td>
      <td className="px-3 py-2.5">
        <div className="text-xs font-medium text-text">{server.name}</div>
        <div className="text-[10px] text-text-3 font-mono">#{server.id}</div>
      </td>
      <td className="px-3 py-2.5">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium font-mono ${sClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${pClass}`} />
          {status}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <span className="bg-bg-4 border border-border rounded px-1.5 py-0.5 text-[10px] font-mono text-text-2">
          {server.server_type.name}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <div className="text-[11px] font-mono text-text-2">{ip}</div>
      </td>
      <td className="px-3 py-2.5">
        <span className="text-xs text-text-2">🇩🇪 {server.datacenter.location.name}</span>
      </td>
      <td className="px-3 py-2.5">
        <UsageBar value={0} colorClass="bg-status-running" />
      </td>
      <td className="px-3 py-2.5">
        <UsageBar value={0} colorClass="bg-blue-400" />
      </td>
      <td className="px-3 py-2.5">
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => { e.stopPropagation(); onAction(isRunning ? 'shutdown' : 'start') }}
            disabled={readonly}
            className="w-6 h-6 bg-bg-4 border border-border rounded text-[11px] text-text-2 hover:border-border-2 hover:text-text transition-all disabled:opacity-30"
          >
            {isRunning ? '⏹' : '▶'}
          </button>
        </div>
      </td>
    </tr>
  )
}
