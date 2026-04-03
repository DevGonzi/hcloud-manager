import { useCallback, useEffect, useState } from 'react'
import { useProjectStore } from '../stores/project.store'
import type { HCloudFirewall } from '../../../shared/types'
import { useT } from '../i18n/useT'

function CreateFirewallDialog({
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg4)',
    border: '1px solid var(--bdr)',
    borderRadius: 6,
    padding: '8px 12px',
    fontSize: 12,
    color: 'var(--tx)',
    outline: 'none',
    boxSizing: 'border-box'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    const res = await window.hcloud.firewalls.create(projectId, { name: name.trim() })
    if (res.success) {
      onCreated()
      onClose()
    } else {
      setError(res.error)
    }
    setLoading(false)
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
          width: 380,
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', marginBottom: 16 }}>
          {t('firewalls.createTitle')}
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>{t('firewalls.formName')} *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('firewalls.namePlaceholder')}
              style={inputStyle}
              autoFocus
            />
          </div>
          {error && (
            <div
              style={{
                fontSize: 11,
                color: 'var(--red)',
                background: 'rgba(255,0,0,0.1)',
                padding: '8px 12px',
                borderRadius: 4
              }}
            >
              {error}
            </div>
          )}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px 16px',
                background: 'var(--bg4)',
                border: '1px solid var(--bdr)',
                borderRadius: 6,
                color: 'var(--tx)',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 16px',
                background: 'var(--red)',
                border: 'none',
                borderRadius: 6,
                color: '#fff',
                fontSize: 12,
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
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

export function FirewallsPage() {
  const { t } = useT()
  const { activeProjectId, projects } = useProjectStore()
  const readonly = projects.find((p) => p.id === activeProjectId)?.readonly ?? false
  const [firewalls, setFirewalls] = useState<HCloudFirewall[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!activeProjectId) return
    setLoading(true)
    setError(null)
    try {
      const res = await window.hcloud.firewalls.list(activeProjectId)
      if (res.success) {
        setFirewalls(res.data)
      } else {
        setError(res.error)
      }
    } catch (err) {
      setError((err as Error).message || 'Fehler beim Laden')
    }
    setLoading(false)
  }, [activeProjectId])

  useEffect(() => {
    load()
  }, [load])

  const filtered = firewalls.filter((fw) => fw.name.toLowerCase().includes(search.toLowerCase()))

  return (
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
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)' }}>
              {t('firewalls.title')} ({firewalls.length})
            </div>
          </div>
          {!readonly && (
            <button
              onClick={() => setShowCreate(true)}
              style={{
                padding: '6px 12px',
                background: 'var(--red)',
                border: '1px solid var(--red)',
                borderRadius: 6,
                color: '#fff',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              + {t('common.create')}
            </button>
          )}
          <button
            onClick={() => load()}
            disabled={loading}
            style={{
              padding: '6px 12px',
              background: 'var(--bg3)',
              border: '1px solid var(--bdr)',
              borderRadius: 4,
              color: 'var(--tx)',
              fontSize: 11,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            ⟳
          </button>
        </div>

        {/* Search */}
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid var(--bdr)',
            flexShrink: 0,
            background: 'var(--bg3)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg2)',
              border: '1px solid var(--bdr)',
              borderRadius: 6,
              padding: '6px 12px'
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--tx3)' }}>🔍</span>
            <input
              type="text"
              placeholder={t('firewalls.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 12,
                color: 'var(--tx)',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg3)' }}>
          {error ? (
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
              <span style={{ fontSize: 24, opacity: 0.3 }}>◉</span>
              <p style={{ fontSize: 12, margin: 0 }}>{t('firewalls.noFirewalls')}</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {[
                    '',
                    t('firewalls.colName'),
                    t('firewalls.colRules'),
                    t('firewalls.colAppliedTo'),
                    t('firewalls.colCreated')
                  ].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        textAlign: i === 0 ? 'center' : 'left',
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
                {filtered.map((fw) => {
                  const inbound = fw.rules.filter((r) => r.direction === 'in').length
                  const outbound = fw.rules.filter((r) => r.direction === 'out').length
                  return (
                    <tr
                      key={fw.id}
                      onClick={() => setSelectedId(selectedId === fw.id ? null : fw.id)}
                      style={{
                        borderBottom: '1px solid var(--bdr)',
                        cursor: 'pointer',
                        background: selectedId === fw.id ? 'var(--bg4)' : 'transparent',
                        transition: 'background 0.1s'
                      }}
                    >
                      <td
                        style={{
                          padding: '10px 12px',
                          textAlign: 'center',
                          color: 'var(--tx3)',
                          fontSize: 11
                        }}
                      >
                        ▸
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--tx)' }}>
                          {fw.name}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: 'var(--tx3)',
                            fontFamily: 'JetBrains Mono, monospace'
                          }}
                        >
                          #{fw.id}
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <span
                            style={{
                              background: 'rgba(76, 175, 80, 0.2)',
                              border: '1px solid var(--green)',
                              borderRadius: 3,
                              padding: '2px 6px',
                              fontSize: 9,
                              fontWeight: 600,
                              color: 'var(--green)',
                              fontFamily: 'JetBrains Mono, monospace'
                            }}
                          >
                            ↓ {inbound}
                          </span>
                          <span
                            style={{
                              background: 'rgba(255, 152, 0, 0.2)',
                              border: '1px solid var(--red)',
                              borderRadius: 3,
                              padding: '2px 6px',
                              fontSize: 9,
                              fontWeight: 600,
                              color: 'var(--red)',
                              fontFamily: 'JetBrains Mono, monospace'
                            }}
                          >
                            ↑ {outbound}
                          </span>
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
                          {fw.applied_to.length}
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
                          {new Date(fw.created).toLocaleDateString('de-DE')}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <FirewallDetail
        firewall={firewalls.find((fw) => fw.id === selectedId) ?? null}
        readonly={readonly}
        projectId={activeProjectId}
        onClose={() => setSelectedId(null)}
        onDeleted={() => {
          setSelectedId(null)
          load()
        }}
      />

      {/* Create Dialog */}
      {showCreate && activeProjectId && (
        <CreateFirewallDialog
          projectId={activeProjectId}
          onClose={() => setShowCreate(false)}
          onCreated={load}
        />
      )}
    </div>
  )
}

function FirewallDetail({
  firewall,
  readonly,
  projectId,
  onClose,
  onDeleted
}: {
  firewall: HCloudFirewall | null
  readonly: boolean
  projectId: string | null
  onClose: () => void
  onDeleted: () => void
}) {
  const { t } = useT()
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleDelete() {
    if (!projectId || !firewall) return
    setDeleting(true)
    await window.hcloud.firewalls.delete(projectId, firewall.id)
    setDeleting(false)
    setConfirmDelete(false)
    onDeleted()
  }

  const inboundRules = firewall?.rules.filter((r) => r.direction === 'in') ?? []
  const outboundRules = firewall?.rules.filter((r) => r.direction === 'out') ?? []

  return (
    <div
      style={{
        width: 340,
        background: 'var(--bg2)',
        borderLeft: '1px solid var(--bdr)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
        transform: firewall ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.2s cubic-bezier(0.16,1,0.3,1)'
      }}
    >
      {firewall && (
        <>
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--bdr)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)' }}>
                {firewall.name}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--tx3)',
                  fontFamily: 'JetBrains Mono, monospace',
                  marginTop: 2
                }}
              >
                #{firewall.id} · {new Date(firewall.created).toLocaleDateString('de-DE')}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: 'var(--bg3)',
                border: '1px solid var(--bdr)',
                color: 'var(--tx3)',
                cursor: 'pointer',
                fontSize: 11,
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
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--bdr) transparent'
            }}
          >
            {/* Applied To */}
            <div
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: 'var(--tx3)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontFamily: 'JetBrains Mono, monospace',
                marginBottom: 8
              }}
            >
              {t('firewalls.sectionAppliedTo')} ({firewall.applied_to.length})
            </div>
            {firewall.applied_to.length === 0 ? (
              <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 12 }}>—</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                {firewall.applied_to.map((a, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--bg3)',
                      border: '1px solid var(--bdr)',
                      borderRadius: 6,
                      padding: '6px 10px',
                      fontSize: 11,
                      color: 'var(--tx2)',
                      fontFamily: 'JetBrains Mono, monospace'
                    }}
                  >
                    {a.server ? a.server.name : a.type}
                  </div>
                ))}
              </div>
            )}

            <div style={{ height: 1, background: 'var(--bdr)', margin: '12px 0' }} />

            {/* Inbound Rules */}
            <div
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: 'var(--green)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontFamily: 'JetBrains Mono, monospace',
                marginBottom: 8
              }}
            >
              {t('firewalls.inbound')} ({inboundRules.length})
            </div>
            <RuleList rules={inboundRules} />

            <div style={{ height: 1, background: 'var(--bdr)', margin: '12px 0' }} />

            {/* Outbound Rules */}
            <div
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: 'var(--red)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontFamily: 'JetBrains Mono, monospace',
                marginBottom: 8
              }}
            >
              {t('firewalls.outbound')} ({outboundRules.length})
            </div>
            <RuleList rules={outboundRules} />

            {/* Labels */}
            {Object.keys(firewall.labels).length > 0 && (
              <>
                <div style={{ height: 1, background: 'var(--bdr)', margin: '12px 0' }} />
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: 'var(--tx3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontFamily: 'JetBrains Mono, monospace',
                    marginBottom: 8
                  }}
                >
                  {t('firewalls.sectionLabels')}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {Object.entries(firewall.labels).map(([k, v]) => (
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
                      {k}
                      {v ? `=${v}` : ''}
                    </span>
                  ))}
                </div>
              </>
            )}

            {/* Delete */}
            {!readonly && (
              <>
                <div style={{ height: 1, background: 'var(--bdr)', margin: '12px 0' }} />
                {confirmDelete ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--red)', flex: 1 }}>
                      {t('firewalls.confirmDelete')}
                    </span>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      style={{
                        padding: '4px 10px',
                        fontSize: 11,
                        background: 'var(--red)',
                        border: '1px solid var(--red)',
                        borderRadius: 4,
                        color: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      {deleting ? '…' : t('common.yes')}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      style={{
                        padding: '4px 10px',
                        fontSize: 11,
                        border: '1px solid var(--bdr)',
                        borderRadius: 4,
                        color: 'var(--tx3)',
                        background: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {t('common.no')}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      fontSize: 12,
                      border: '1px solid var(--bdr)',
                      borderRadius: 6,
                      color: 'var(--tx3)',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--red)'
                      ;(e.currentTarget as HTMLElement).style.color = 'var(--red)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--bdr)'
                      ;(e.currentTarget as HTMLElement).style.color = 'var(--tx3)'
                    }}
                  >
                    {t('common.delete')}
                  </button>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function RuleList({ rules }: { rules: import('../../../shared/types').HCloudFirewallRule[] }) {
  if (rules.length === 0)
    return <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 4 }}>—</div>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {rules.map((r, i) => (
        <div
          key={i}
          style={{
            background: 'var(--bg3)',
            border: '1px solid var(--bdr)',
            borderRadius: 6,
            padding: '6px 10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                fontWeight: 600,
                color: 'var(--tx)',
                background: 'var(--bg4)',
                border: '1px solid var(--bdr)',
                borderRadius: 3,
                padding: '1px 5px'
              }}
            >
              {r.protocol.toUpperCase()}
              {r.port ? `:${r.port}` : ''}
            </span>
            {r.description && (
              <span style={{ fontSize: 10, color: 'var(--tx3)' }}>{r.description}</span>
            )}
          </div>
          {r.direction === 'in' && r.source_ips.length > 0 && (
            <div
              style={{
                fontSize: 10,
                color: 'var(--tx3)',
                fontFamily: 'JetBrains Mono, monospace',
                marginTop: 3
              }}
            >
              {r.source_ips.slice(0, 3).join(', ')}
              {r.source_ips.length > 3 ? ` +${r.source_ips.length - 3}` : ''}
            </div>
          )}
          {r.direction === 'out' && r.destination_ips.length > 0 && (
            <div
              style={{
                fontSize: 10,
                color: 'var(--tx3)',
                fontFamily: 'JetBrains Mono, monospace',
                marginTop: 3
              }}
            >
              {r.destination_ips.slice(0, 3).join(', ')}
              {r.destination_ips.length > 3 ? ` +${r.destination_ips.length - 3}` : ''}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
