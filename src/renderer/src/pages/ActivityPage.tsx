import { useState, useEffect } from 'react'
import type { ActionLogEntry } from '../../../shared/types'
import { useT } from '../i18n/useT'

export function ActivityPage() {
  const { t } = useT()
  const [entries, setEntries] = useState<ActionLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await window.hcloud.actionlog.getAll()
      if (res.success) {
        setEntries(res.data)
      }
      setLoading(false)
    }
    load()

    // Listen for new entries
    window.hcloud.actionlog.onEntry((entry: ActionLogEntry) => {
      setEntries((prev) => [entry, ...prev])
    })
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          padding: '10px 20px',
          borderBottom: '1px solid var(--bdr)',
          background: 'var(--bg2)',
          flexShrink: 0
        }}
      >
        <h1 style={{ margin: '8px 0', fontSize: 16, color: 'var(--tx)' }}>
          {t('activity.title') || 'Activity Log'}
        </h1>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '10px 0' }}>
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--tx3)' }}>
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--tx3)' }}>
            No actions yet
          </div>
        ) : (
          <table
            style={{
              width: '100%',
              fontSize: 12,
              borderCollapse: 'collapse',
              color: 'var(--tx)'
            }}
          >
            <thead
              style={{
                position: 'sticky',
                top: 0,
                background: 'var(--bg3)',
                borderBottom: '1px solid var(--bdr)',
                color: 'var(--tx3)',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontSize: 10,
                letterSpacing: '0.08em'
              }}
            >
              <tr>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Timestamp</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Resource</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Action</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Label</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Error</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const date = new Date(entry.timestamp)
                const timeStr = date.toLocaleTimeString()
                const statusColor = entry.status === 'success' ? 'var(--green)' : 'var(--red)'

                return (
                  <tr
                    key={entry.id}
                    style={{
                      borderBottom: '1px solid var(--bdr)',
                      background: entry.status === 'error' ? 'rgba(255,0,0,0.05)' : undefined
                    }}
                  >
                    <td
                      style={{
                        padding: '8px 12px',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11,
                        color: 'var(--tx3)'
                      }}
                    >
                      {timeStr}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ background: 'var(--bg3)', padding: '2px 6px', borderRadius: 3 }}>
                        {entry.resource}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: 500 }}>{entry.action}</td>
                    <td
                      style={{
                        padding: '8px 12px',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11
                      }}
                    >
                      {entry.label}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ color: statusColor, fontWeight: 600 }}>
                        {entry.status === 'success' ? '✓' : '✗'}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '8px 12px',
                        fontSize: 10,
                        color: 'var(--red)',
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={entry.error}
                    >
                      {entry.error || '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
