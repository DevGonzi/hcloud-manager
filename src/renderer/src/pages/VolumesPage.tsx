import { useEffect, useState } from 'react'
import { useProjectStore } from '../stores/project.store'
import type { HCloudVolume } from '../../../shared/types'
import { useT } from '../i18n'

function CreateVolumeDialog({
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
  const [size, setSize] = useState('10')
  const [location, setLocation] = useState('nbg1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Volume Name ist erforderlich!')
      return
    }

    const sizeNum = Number(size)
    // weil kleinere volumes sind ein meme
    if (sizeNum < 10) {
      setError('Minimum 10GB (alles darunter ist irgendwie weird)')
      return
    }
    if (sizeNum > 10240) {
      setError('Maximum 10TB')
      return
    }

    setLoading(true)
    setError(null)

    console.log('[VOLUME CREATE]', { name, size: sizeNum, location })

    try {
      const res = await window.hcloud.volumes.create(projectId, {
        name: name.trim(),
        size: sizeNum,
        location
      })
      if (res.success) {
        console.log('✓ Volume erstellt!')
        onCreated()
        onClose()
      } else {
        setError(res.error)
      }
    } catch (err) {
      console.error('[VOL ERROR]', err)
      setError('Network/API error oder so')
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
          {t('volumes.title')}
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>{t('volumes.colName')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="my-volume"
              style={inputStyle}
              autoFocus
            />
          </div>
          <div>
            <label style={labelStyle}>{t('volumes.colSize')}</label>
            <input
              type="number"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              min={10}
              max={10240}
              step={10}
              placeholder="GB"
              style={inputStyle}
            />
            <span style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2, display: 'block' }}>
              {t('volumes.minSize')}
            </span>
          </div>
          <div>
            <label style={labelStyle}>{t('volumes.colLocation')}</label>
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

export function VolumesPage() {
  const { t } = useT()
  const { activeProjectId, projects } = useProjectStore()
  const [volumes, setVolumes] = useState<HCloudVolume[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const activeProject = projects.find((p) => p.id === activeProjectId)
  const readonly = activeProject?.readonly ?? true

  async function load() {
    if (!activeProjectId) return
    setLoading(true)
    setError(null)
    const res = await window.hcloud.volumes.list(activeProjectId)
    if (res.success) setVolumes(res.data)
    else setError(res.error)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [activeProjectId])

  const filtered = search
    ? volumes.filter((v) => v.name.toLowerCase().includes(search.toLowerCase()))
    : volumes

  const attached = volumes.filter((v) => v.server !== null).length
  const totalGB = volumes.reduce((acc, v) => acc + v.size, 0)

  return (
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
            {t('volumes.title')}
          </div>
          <div
            style={{ fontSize: 10, color: 'var(--tx3)', fontFamily: 'JetBrains Mono, monospace' }}
          >
            api.hetzner.cloud/v1/volumes · {t('common.resources', { n: volumes.length })}
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
            placeholder={t('volumes.search')}
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
          { label: t('volumes.statAttached'), value: String(attached), color: 'var(--green)' },
          {
            label: t('volumes.statFree'),
            value: String(volumes.length - attached),
            color: 'var(--tx3)'
          },
          { label: t('volumes.statTotalGb'), value: String(totalGB), color: 'var(--tx)' },
          { label: t('volumes.statVolumes'), value: String(volumes.length), color: 'var(--tx)' }
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
            <span style={{ fontSize: 24, opacity: 0.3 }}>◧</span>
            <p style={{ fontSize: 12, margin: 0 }}>{t('volumes.noVolumes')}</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {[
                  t('volumes.colName'),
                  t('volumes.colSize'),
                  t('volumes.colFormat'),
                  t('volumes.colStatus'),
                  t('volumes.colServer'),
                  t('volumes.colLocation'),
                  t('volumes.colCreated')
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
              {filtered.map((vol) => (
                <tr key={vol.id} style={{ borderBottom: '1px solid var(--bdr)' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--tx)' }}>
                      {vol.name}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: 'var(--tx3)',
                        fontFamily: 'JetBrains Mono, monospace'
                      }}
                    >
                      #{vol.id}
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
                      {vol.size} GB
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
                      {vol.format ?? '—'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: 'JetBrains Mono, monospace',
                        color: vol.status === 'available' ? 'var(--green)' : 'var(--yellow)'
                      }}
                    >
                      {vol.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {vol.server !== null ? (
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: 'JetBrains Mono, monospace',
                          color: 'var(--green)'
                        }}
                      >
                        #{vol.server}
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
                      {vol.location.name.toUpperCase()}
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
                      {new Date(vol.created).toLocaleDateString('de-DE')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && activeProjectId && (
        <CreateVolumeDialog
          projectId={activeProjectId}
          onClose={() => setShowCreate(false)}
          onCreated={load}
        />
      )}
    </div>
  )
}
