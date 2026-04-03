import { useEffect, useState } from 'react'
import { useProjectStore } from '../stores/project.store'
import type { HCloudNetwork } from '../../../shared/types'
import { useT } from '../i18n'

function CreateNetworkDialog({
  projectId,
  onClose,
  onCreated
}: {
  projectId: string
  onClose: () => void
  onCreated: () => void
}) {
  const { t } = useT()
  const [name, setName] = useState('')
  const [ipRange, setIpRange] = useState('10.0.0.0/8')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !ipRange.trim()) {
      setError('Name und IP-Range erforderlich!')
      return
    }

    // validate CIDR notation damit nicht alles abbrennt
    if (!ipRange.includes('/')) {
      setError('IP-Range muss CIDR Notation sein (z.B. 10.0.0.0/8)')
      return
    }

    setLoading(true)
    setError(null)

    console.log('[NETWORK CREATE]', name, ipRange)

    try {
      const res = await window.hcloud.networks.create(projectId, {
        name: name.trim(),
        ipRange: ipRange.trim()
      })
      if (res.success) {
        console.log('✓ Network erstellt')
        onCreated()
        onClose()
      } else {
        setError(res.error || 'Network creation failed lol')
      }
    } catch (err) {
      console.error('[NETWORK ERROR]', err)
      setError('Fehler beim Erstellen: ' + (err instanceof Error ? err.message : 'unknown'))
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg4)',
    border: '1px solid var(--bdr)',
    borderRadius: 6,
    padding: '6px 10px',
    color: 'var(--tx)',
    fontSize: 12,
    outline: 'none',
    boxSizing: 'border-box'
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    color: 'var(--tx3)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontFamily: 'JetBrains Mono, monospace',
    display: 'block',
    marginBottom: 4
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg3)',
          border: '1px solid var(--bdr2)',
          borderRadius: 12,
          padding: 20,
          width: 360,
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 0
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', marginBottom: 16 }}>
          {t('networks.createTitle')}
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>{t('networks.colName')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="my-network"
              style={inputStyle}
              autoFocus
            />
          </div>
          <div>
            <label style={labelStyle}>{t('networks.colIpRange')}</label>
            <input
              type="text"
              value={ipRange}
              onChange={(e) => setIpRange(e.target.value)}
              required
              placeholder="10.0.0.0/8"
              style={inputStyle}
            />
            <span style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2, display: 'block' }}>
              CIDR-Format erforderlich (z.B. 10.0.0.0/8)
            </span>
          </div>
          {error && <p style={{ fontSize: 12, color: 'var(--red)', margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                background: 'var(--bg4)',
                border: '1px solid var(--bdr)',
                color: 'var(--tx2)',
                borderRadius: 6,
                padding: '7px 16px',
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              style={{
                flex: 1,
                background: 'var(--red)',
                border: '1px solid var(--red)',
                color: '#fff',
                borderRadius: 6,
                padding: '7px 16px',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                opacity: loading || !name.trim() ? 0.5 : 1
              }}
            >
              {loading ? t('common.creating') : t('common.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function NetworksPage() {
  const { t } = useT()
  const { activeProjectId, projects } = useProjectStore()
  const [networks, setNetworks] = useState<HCloudNetwork[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<HCloudNetwork | null>(null)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const activeProject = projects.find((p) => p.id === activeProjectId)
  const readonly = activeProject?.readonly ?? true

  async function load() {
    if (!activeProjectId) return
    setLoading(true)
    setError(null)
    const res = await window.hcloud.networks.list(activeProjectId)
    if (res.success) setNetworks(res.data)
    else setError(res.error)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [activeProjectId])

  const filtered = search
    ? networks.filter(
        (n) => n.name.toLowerCase().includes(search.toLowerCase()) || n.ip_range.includes(search)
      )
    : networks

  return (
    <>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* Header */}
          <div
            style={{
              padding: '12px 20px',
              borderBottom: '1px solid var(--bdr)',
              background: 'var(--bg2)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexShrink: 0
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)' }}>
                {t('networks.title')}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--tx3)',
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              >
                api.hetzner.cloud/v1/networks · {t('common.resources', { n: networks.length })}
              </div>
            </div>
            <div style={{ flex: 1 }} />
            {readonly ? (
              <span
                style={{
                  padding: '2px 8px',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 600,
                  color: 'var(--tx3)',
                  background: 'var(--bg4)',
                  border: '1px solid var(--bdr)',
                  borderRadius: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em'
                }}
              >
                {t('common.readonly')}
              </span>
            ) : (
              <button
                onClick={() => setShowCreate(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  fontSize: 12,
                  background: 'var(--red)',
                  border: '1px solid var(--red)',
                  color: '#fff',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                + {t('common.create')}
              </button>
            )}
            <button
              onClick={load}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                fontSize: 12,
                background: 'var(--bg3)',
                border: '1px solid var(--bdr)',
                borderRadius: 6,
                color: 'var(--tx2)',
                cursor: 'pointer'
              }}
            >
              ↺ {t('common.refresh')}
            </button>
          </div>

          {/* Search bar */}
          <div
            style={{
              padding: '8px 20px',
              borderBottom: '1px solid var(--bdr)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0
            }}
          >
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--tx3)',
                  fontSize: 12,
                  pointerEvents: 'none'
                }}
              >
                ⌕
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('networks.search')}
                style={{
                  background: 'var(--bg3)',
                  border: '1px solid var(--bdr)',
                  borderRadius: 6,
                  paddingLeft: 28,
                  paddingRight: 12,
                  paddingTop: 4,
                  paddingBottom: 4,
                  fontSize: 12,
                  color: 'var(--tx)',
                  outline: 'none',
                  width: 208
                }}
              />
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            {loading ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '64px 0',
                  fontSize: 12,
                  color: 'var(--tx3)'
                }}
              >
                {t('common.loading')}
              </div>
            ) : error ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '64px 0',
                  fontSize: 12,
                  color: 'var(--red)'
                }}
              >
                {error}
              </div>
            ) : filtered.length === 0 ? (
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
                <span style={{ fontSize: 24, opacity: 0.3 }}>⊗</span>
                <p style={{ fontSize: 12, margin: 0 }}>{t('networks.noNetworks')}</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {[
                      t('networks.colName'),
                      t('networks.colIpRange'),
                      t('networks.colSubnets'),
                      t('networks.colServers'),
                      t('networks.colCreated')
                    ].map((h, i) => (
                      <th
                        key={i}
                        style={{
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
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((net) => (
                    <tr
                      key={net.id}
                      onClick={() => setSelected(selected?.id === net.id ? null : net)}
                      style={{
                        borderBottom: '1px solid var(--bdr)',
                        cursor: 'pointer',
                        background: selected?.id === net.id ? 'var(--bg4)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--tx)' }}>
                          {net.name}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: 'var(--tx3)',
                            fontFamily: 'JetBrains Mono, monospace'
                          }}
                        >
                          #{net.id}
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontFamily: 'JetBrains Mono, monospace',
                            color: 'var(--tx2)'
                          }}
                        >
                          {net.ip_range}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            background: 'var(--bg4)',
                            border: '1px solid var(--bdr)',
                            borderRadius: 4,
                            padding: '2px 6px',
                            fontSize: 10,
                            fontFamily: 'JetBrains Mono, monospace',
                            color: 'var(--tx2)'
                          }}
                        >
                          {net.subnets.length}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            background: 'var(--bg4)',
                            border: '1px solid var(--bdr)',
                            borderRadius: 4,
                            padding: '2px 6px',
                            fontSize: 10,
                            fontFamily: 'JetBrains Mono, monospace',
                            color: 'var(--tx2)'
                          }}
                        >
                          {net.servers.length}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontFamily: 'JetBrains Mono, monospace',
                            color: 'var(--tx3)'
                          }}
                        >
                          {new Date(net.created).toLocaleDateString('de-DE')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div
          style={{
            width: 340,
            background: 'var(--bg2)',
            borderLeft: '1px solid var(--bdr)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            overflow: 'hidden',
            transform: selected ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 200ms'
          }}
        >
          {selected && (
            <>
              <div
                style={{
                  padding: '14px 16px 12px',
                  borderBottom: '1px solid var(--bdr)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx)' }}>
                    {selected.name}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--tx3)',
                      fontFamily: 'JetBrains Mono, monospace'
                    }}
                  >
                    #{selected.id} · {selected.ip_range}
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    background: 'var(--bg3)',
                    border: '1px solid var(--bdr)',
                    color: 'var(--tx3)',
                    cursor: 'pointer',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16
                }}
              >
                {selected.subnets.length > 0 && (
                  <div>
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        color: 'var(--tx3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        fontFamily: 'JetBrains Mono, monospace',
                        marginBottom: 8
                      }}
                    >
                      {t('networks.sectionSubnets')}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {selected.subnets.map((s, i) => (
                        <div
                          key={i}
                          style={{
                            background: 'var(--bg3)',
                            border: '1px solid var(--bdr)',
                            borderRadius: 8,
                            padding: '8px 12px'
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              fontFamily: 'JetBrains Mono, monospace',
                              color: 'var(--tx)'
                            }}
                          >
                            {s.ip_range}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>
                            {s.type} · zone: {s.network_zone} · gw: {s.gateway}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selected.routes.length > 0 && (
                  <div>
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        color: 'var(--tx3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        fontFamily: 'JetBrains Mono, monospace',
                        marginBottom: 8
                      }}
                    >
                      {t('networks.sectionRoutes')}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {selected.routes.map((r, i) => (
                        <div
                          key={i}
                          style={{
                            background: 'var(--bg3)',
                            border: '1px solid var(--bdr)',
                            borderRadius: 8,
                            padding: '8px 12px'
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              fontFamily: 'JetBrains Mono, monospace',
                              color: 'var(--tx)'
                            }}
                          >
                            {r.destination}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>
                            via {r.gateway}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {Object.keys(selected.labels).length > 0 && (
                  <div>
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        color: 'var(--tx3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        fontFamily: 'JetBrains Mono, monospace',
                        marginBottom: 6
                      }}
                    >
                      Labels
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {Object.entries(selected.labels).map(([k, v]) => (
                        <span
                          key={k}
                          style={{
                            background: 'var(--bg4)',
                            border: '1px solid var(--bdr)',
                            borderRadius: 4,
                            padding: '2px 6px',
                            fontSize: 10,
                            fontFamily: 'JetBrains Mono, monospace',
                            color: 'var(--tx3)'
                          }}
                        >
                          {k}={v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {showCreate && activeProjectId && (
        <CreateNetworkDialog
          projectId={activeProjectId}
          onClose={() => setShowCreate(false)}
          onCreated={load}
        />
      )}
    </>
  )
}
