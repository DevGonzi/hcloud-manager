import { useState } from 'react'
import type { HCloudServer } from '../../../../shared/types'

interface Props {
  server: HCloudServer
  selected: boolean
  readonly: boolean
  cpu?: number
  onSelect: () => void
  onAction: (action: 'start' | 'shutdown' | 'reboot') => void
}

const statusColor: Record<string, string> = {
  running: 'var(--green)',
  off: 'var(--tx3)',
  starting: 'var(--yellow)',
  stopping: 'var(--yellow)'
}

const statusBg: Record<string, string> = {
  running: 'rgba(30,217,122,0.12)',
  off: 'rgba(82,94,120,0.15)',
  starting: 'rgba(245,166,35,0.12)',
  stopping: 'rgba(245,166,35,0.12)'
}

function barColor(v: number): string {
  if (v >= 80) return 'var(--red)'
  if (v >= 50) return 'var(--yellow)'
  return 'var(--green)'
}

function UsageBar({ value }: { value: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div
        style={{
          width: 60,
          height: 4,
          background: 'var(--bg4)',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: 2,
            background: barColor(value),
            width: `${value}%`
          }}
        />
      </div>
      <span
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
          color: 'var(--tx3)',
          minWidth: 28
        }}
      >
        {value}%
      </span>
    </div>
  )
}

export function ServerRow({ server, selected, readonly, cpu, onSelect, onAction }: Props) {
  const [hovered, setHovered] = useState(false)
  const [actionsHovered, setActionsHovered] = useState(false)

  const ip = server.public_net.ipv4?.ip ?? '—'
  const status = server.status
  const sColor = statusColor[status] ?? 'var(--tx3)'
  const sBg = statusBg[status] ?? 'rgba(82,94,120,0.1)'
  const isRunning = status === 'running'

  const tdStyle: React.CSSProperties = { padding: '10px 12px', verticalAlign: 'middle' }

  return (
    <tr
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderBottom: '1px solid var(--bdr)',
        cursor: 'pointer',
        background: selected ? 'var(--bg4)' : hovered ? 'var(--bg3)' : 'transparent'
      }}
    >
      {/* chevron */}
      <td style={{ ...tdStyle, paddingLeft: 8, paddingRight: 0 }}>
        <span style={{ color: 'var(--tx3)', fontSize: 11 }}>▸</span>
      </td>

      {/* name / id */}
      <td style={tdStyle}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--tx)' }}>{server.name}</div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--tx3)' }}>
          #{server.id}
        </div>
      </td>

      {/* status */}
      <td style={tdStyle}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '2px 8px',
            borderRadius: 20,
            fontSize: 10,
            fontWeight: 500,
            fontFamily: 'JetBrains Mono, monospace',
            background: sBg,
            color: sColor
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: 'currentColor',
              flexShrink: 0
            }}
          />
          {status}
        </span>
      </td>

      {/* type */}
      <td style={tdStyle}>
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            background: 'var(--bg4)',
            border: '1px solid var(--bdr)',
            borderRadius: 4,
            padding: '2px 6px',
            color: 'var(--tx2)'
          }}
        >
          {server.server_type.name}
        </span>
      </td>

      {/* ipv4 */}
      <td style={tdStyle}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--tx2)' }}>
          {ip}
        </div>
      </td>

      {/* location */}
      <td style={tdStyle}>
        <span style={{ fontSize: 11, color: 'var(--tx2)' }}>
          DE {server.datacenter.location.name.toUpperCase()}
        </span>
      </td>

      {/* cpu */}
      <td style={tdStyle}>
        {isRunning && cpu !== undefined ? (
          <UsageBar value={cpu} />
        ) : (
          <span
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--tx3)' }}
          >
            {isRunning ? '…' : '·'}
          </span>
        )}
      </td>

      {/* actions */}
      <td style={tdStyle}>
        <div
          onMouseEnter={() => setActionsHovered(true)}
          onMouseLeave={() => setActionsHovered(false)}
          style={{ display: 'flex', gap: 4, opacity: hovered || actionsHovered ? 1 : 0 }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAction(isRunning ? 'shutdown' : 'start')
            }}
            disabled={readonly}
            style={{
              width: 24,
              height: 24,
              background: 'var(--bg4)',
              border: '1px solid var(--bdr)',
              borderRadius: 4,
              color: 'var(--tx2)',
              cursor: 'pointer',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: readonly ? 0.3 : 1
            }}
          >
            {isRunning ? '⏹' : '▶'}
          </button>
        </div>
      </td>
    </tr>
  )
}
