import { useEffect, useState } from 'react'
import { useProjectStore } from '../stores/project.store'
import type { HCloudFloatingIp } from '../../../shared/types'
import { useT } from '../i18n'

function CreateFloatingIpDialog({
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
  const [type, setType] = useState<'ipv4' | 'ipv6'>('ipv4')
  const [location, setLocation] = useState('nbg1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    const res = await window.hcloud.floatingIps.create(projectId, {
      name: name.trim(),
      type,
      homeLocation: location
    })
    if (res.success) {
      onCreated()
      onClose()
    } else {
      setError(res.error)
    }
    setLoading(false)
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
          {t('floatingIps.createTitle')}
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>{t('floatingIps.formName')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={t('floatingIps.namePlaceholder')}
              style={inputStyle}
              autoFocus
            />
          </div>
          <div>
            <label style={labelStyle}>{t('floatingIps.formType')}</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'ipv4' | 'ipv6')}
              style={inputStyle}
            >
              <option value="ipv4">ipv4</option>
              <option value="ipv6">ipv6</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>{t('floatingIps.formLocation')}</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={inputStyle}
            >
              <option value="nbg1">nbg1</option>
              <option value="fsn1">fsn1</option>
              <option value="hel1">hel1</option>
              <option value="ash">ash</option>
              <option value="hil">hil</option>
            </select>
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

function FloatingIpDetail({
  projectId: _projectId,
  floatingIp,
  readonly,
  onClose,
  onAction
}: {
  projectId: string | null
  floatingIp: HCloudFloatingIp | null
  readonly: boolean
  onClose: () => void
  onAction: (ipId: number, action: 'delete') => Promise<void>
}) {
  const { t } = useT()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (!floatingIp || readonly) return
    setDeleting(true)
    setError(null)
    try {
      await onAction(floatingIp.id, 'delete')
      onClose()
    } catch (err) {
      setError((err as any)?.message || 'Fehler beim Löschen')
    }
    setDeleting(false)
  }

  if (!floatingIp) return null

  return (
    <div
      style={{
        width: 380,
        background: 'var(--bg2)',
        borderLeft: '1px solid var(--bdr)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
        transform: floatingIp ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.2s cubic-bezier(0.16,1,0.3,1)'
      }}
    >
      {/* Header */}
      <div style={{ padding: '14px 16px 0', borderBottom: '1px solid var(--bdr)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 12
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx)' }}>
              {floatingIp.name}
            </div>
            <div
              style={{
                fontSize: 10,
                color: 'var(--tx3)',
                fontFamily: 'JetBrains Mono, monospace',
                marginTop: 2
              }}
            >
              #{floatingIp.id} · {floatingIp.type.toUpperCase()} ·{' '}
              {floatingIp.home_location.name.toUpperCase()}
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
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, scrollbarWidth: 'thin' }}>
        {/* Status */}
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
          {t('floatingIps.detailStatus')}
        </div>
        <div
          style={{
            background: 'var(--bg3)',
            border: '1px solid var(--bdr)',
            borderRadius: 8,
            padding: '8px 12px',
            marginBottom: 12
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontFamily: 'JetBrains Mono, monospace',
              color: 'var(--tx)',
              fontWeight: 500
            }}
          >
            {floatingIp.ip}
          </div>
          <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>
            {floatingIp.blocked ? '🔒 Blocked' : '✓ Aktiv'}
          </div>
        </div>

        {/* Server */}
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
          {t('floatingIps.colServer')}
        </div>
        <div
          style={{
            background: 'var(--bg3)',
            border: '1px solid var(--bdr)',
            borderRadius: 8,
            padding: '8px 12px',
            marginBottom: 12
          }}
        >
          <div
            style={{ fontSize: 11, color: 'var(--tx)', fontFamily: 'JetBrains Mono, monospace' }}
          >
            {floatingIp.server !== null ? `Server #${floatingIp.server}` : '—'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>
            {floatingIp.server !== null ? t('floatingIps.statAssigned') : t('floatingIps.statFree')}
          </div>
        </div>

        {/* Created */}
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
          {t('floatingIps.colCreated')}
        </div>
        <div
          style={{
            background: 'var(--bg3)',
            border: '1px solid var(--bdr)',
            borderRadius: 8,
            padding: '8px 12px',
            marginBottom: 16
          }}
        >
          <div
            style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--tx2)' }}
          >
            {new Date(floatingIp.created).toLocaleDateString('de-DE')}
          </div>
        </div>

        {/* Actions */}
        {!readonly && (
          <>
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
              {t('serverDetail.sectionActions')}
            </div>
            {error && (
              <p style={{ fontSize: 10, color: 'var(--red)', margin: '0 0 8px 0' }}>{error}</p>
            )}
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'var(--red)',
                border: '1px solid var(--red)',
                borderRadius: 6,
                color: '#fff',
                fontSize: 12,
                fontWeight: 500,
                cursor: deleting ? 'not-allowed' : 'pointer',
                opacity: deleting ? 0.6 : 1
              }}
            >
              {deleting ? t('common.loading') : t('floatingIps.actionDelete')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export function FloatingIpsPage() {
  const { t } = useT()
  const { activeProjectId, projects } = useProjectStore()
  const [ips, setIps] = useState<HCloudFloatingIp[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const activeProject = projects.find((p) => p.id === activeProjectId)
  const readonly = activeProject?.readonly ?? true

  async function load() {
    if (!activeProjectId) return
    setLoading(true)
    setError(null)
    const res = await window.hcloud.floatingIps.list(activeProjectId)
    if (res.success) setIps(res.data)
    else setError(res.error)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [activeProjectId])

  const filtered = search
    ? ips.filter(
        (ip) => ip.name.toLowerCase().includes(search.toLowerCase()) || ip.ip.includes(search)
      )
    : ips

  const assigned = ips.filter((ip) => ip.server !== null).length
  const unassigned = ips.filter((ip) => ip.server === null).length

  async function handleAction(ipId: number, action: 'delete') {
    if (!activeProjectId || readonly) return
    if (action === 'delete') {
      const res = await window.hcloud.floatingIps.delete(activeProjectId, ipId)
      if (res.success) {
        load()
        setSelectedId(null)
      }
    }
  }

  const selectedIp = selectedId ? (ips.find((i) => i.id === selectedId) ?? null) : null

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
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)' }}>
              {t('floatingIps.title')}
            </div>
            <div
              style={{ fontSize: 10, color: 'var(--tx3)', fontFamily: 'JetBrains Mono, monospace' }}
            >
              api.hetzner.cloud/v1/floating_ips · {t('common.resources', { n: ips.length })}
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
              + {t('floatingIps.create')}
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
              placeholder={t('floatingIps.search')}
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

        {/* Stats */}
        <div style={{ padding: '16px 20px 8px', display: 'flex', gap: 12, flexShrink: 0 }}>
          {[
            {
              label: t('floatingIps.statAssigned'),
              value: String(assigned),
              color: 'var(--green)'
            },
            { label: t('floatingIps.statFree'), value: String(unassigned), color: 'var(--tx3)' },
            { label: t('floatingIps.statTotal'), value: String(ips.length), color: 'var(--tx)' }
          ].map((s) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                background: 'var(--bg3)',
                border: '1px solid var(--bdr)',
                borderRadius: 8,
                padding: '10px 14px'
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  lineHeight: 1,
                  color: s.color
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 16px' }}>
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
              <span style={{ fontSize: 24, opacity: 0.3 }}>◉</span>
              <p style={{ fontSize: 12, margin: 0 }}>{t('floatingIps.noFloatingIps')}</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {[
                    '',
                    t('floatingIps.colName'),
                    t('floatingIps.colIp'),
                    t('floatingIps.colType'),
                    t('floatingIps.colServer'),
                    t('floatingIps.colLocation'),
                    t('floatingIps.colCreated')
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
                {filtered.map((ip) => (
                  <tr
                    key={ip.id}
                    onClick={() => setSelectedId(selectedId === ip.id ? null : ip.id)}
                    style={{
                      borderBottom: '1px solid var(--bdr)',
                      cursor: 'pointer',
                      background: selectedId === ip.id ? 'var(--bg4)' : 'transparent',
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
                        {ip.name}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: 'var(--tx3)',
                          fontFamily: 'JetBrains Mono, monospace'
                        }}
                      >
                        #{ip.id}
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
                        {ip.ip}
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
                        {ip.type}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {ip.server !== null ? (
                        <span
                          style={{
                            fontSize: 11,
                            fontFamily: 'JetBrains Mono, monospace',
                            color: 'var(--green)'
                          }}
                        >
                          #{ip.server}
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: 11,
                            fontFamily: 'JetBrains Mono, monospace',
                            color: 'var(--tx3)'
                          }}
                        >
                          —
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: 'JetBrains Mono, monospace',
                          color: 'var(--tx2)'
                        }}
                      >
                        {ip.home_location.name.toUpperCase()}
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
                        {new Date(ip.created).toLocaleDateString('de-DE')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <FloatingIpDetail
        projectId={activeProjectId}
        floatingIp={selectedIp}
        readonly={readonly}
        onClose={() => setSelectedId(null)}
        onAction={handleAction}
      />

      {showCreate && activeProjectId && (
        <CreateFloatingIpDialog
          projectId={activeProjectId}
          onClose={() => setShowCreate(false)}
          onCreated={load}
        />
      )}
    </div>
  )
}
