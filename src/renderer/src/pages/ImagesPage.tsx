import { useEffect, useState } from 'react'
import { useProjectStore } from '../stores/project.store'
import type { HCloudImage } from '../../../shared/types'
import { useT } from '../i18n'

type Filter = 'all' | 'snapshot' | 'backup' | 'system' | 'app'

export function ImagesPage() {
  const { t } = useT()
  const { activeProjectId, projects } = useProjectStore()
  const [images, setImages] = useState<HCloudImage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)

  const readonly = projects.find((p) => p.id === activeProjectId)?.readonly ?? false

  async function load() {
    if (!activeProjectId) return
    setLoading(true)
    setError(null)
    const res = await window.hcloud.images.list(activeProjectId)
    if (res.success) setImages(res.data)
    else setError(res.error)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [activeProjectId])

  async function handleDelete(imageId: number) {
    if (!activeProjectId || readonly) return
    setDeleting(imageId)
    await window.hcloud.images.delete(activeProjectId, imageId)
    setDeleting(null)
    load()
  }

  const nonSnapshots = images.filter((img) => img.type !== 'snapshot')

  const filtered = nonSnapshots.filter((img) => {
    if (filter !== 'all' && img.type !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!img.description.toLowerCase().includes(q) && !(img.name ?? '').toLowerCase().includes(q))
        return false
    }
    return true
  })

  const backups = nonSnapshots.filter((i) => i.type === 'backup').length
  const system = nonSnapshots.filter((i) => i.type === 'system').length

  const typeStyle: Record<string, React.CSSProperties> = {
    snapshot: { color: '#F5A623', background: 'rgba(245,166,35,0.1)' },
    backup: { color: '#60a5fa', background: 'rgba(96,165,250,0.1)' },
    system: { color: 'var(--green)', background: 'rgba(30,217,122,0.1)' },
    app: { color: '#c084fc', background: 'rgba(192,132,252,0.1)' }
  }

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
            {t('images.title')}
          </div>
          <div
            style={{ fontSize: 10, color: 'var(--tx3)', fontFamily: 'JetBrains Mono, monospace' }}
          >
            api.hetzner.cloud/v1/images · {t('common.resources', { n: images.length })}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        {readonly && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              background: 'var(--tx3)',
              color: 'var(--bg1)',
              borderRadius: 4,
              padding: '2px 6px'
            }}
          >
            {t('common.readonly').toUpperCase()}
          </span>
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
          {t('common.refresh')}
        </button>
      </div>

      {/* Filter bar */}
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
            placeholder={t('images.search')}
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
        {(['all', 'backup', 'system', 'app'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 12,
              border: filter === f ? '1px solid var(--red-dim)' : '1px solid var(--bdr)',
              background: filter === f ? 'var(--red-glow)' : 'transparent',
              color: filter === f ? '#fca5a5' : 'var(--tx2)',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {f === 'all' ? t('common.all') : f}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ padding: '16px 20px 8px', display: 'flex', gap: 12, flexShrink: 0 }}>
        {[
          { label: t('images.statBackups'), value: String(backups), color: '#60a5fa' },
          { label: t('images.statSystem'), value: String(system), color: 'var(--green)' },
          { label: t('images.statTotal'), value: String(images.length), color: 'var(--tx)' }
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
            <span style={{ fontSize: 24, opacity: 0.3 }}>⊞</span>
            <p style={{ fontSize: 12, margin: 0 }}>{t('images.noImages')}</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {[
                  t('images.colName'),
                  t('images.colType'),
                  t('images.colOs'),
                  t('images.colSize'),
                  t('images.colCreated'),
                  ''
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
              {filtered.map((img) => (
                <tr key={img.id} style={{ borderBottom: '1px solid var(--bdr)' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--tx)' }}>
                      {img.description}
                    </div>
                    {img.name && (
                      <div
                        style={{
                          fontSize: 10,
                          color: 'var(--tx3)',
                          fontFamily: 'JetBrains Mono, monospace'
                        }}
                      >
                        {img.name}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: 10,
                        color: 'var(--tx3)',
                        fontFamily: 'JetBrains Mono, monospace'
                      }}
                    >
                      #{img.id}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 8px',
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 500,
                        fontFamily: 'JetBrains Mono, monospace',
                        ...(typeStyle[img.type] ?? {
                          color: 'var(--tx3)',
                          background: 'var(--bg4)'
                        })
                      }}
                    >
                      {img.type}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: 'JetBrains Mono, monospace',
                        color: 'var(--tx2)'
                      }}
                    >
                      {img.os_flavor}
                      {img.os_version ? ` ${img.os_version}` : ''}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: 'JetBrains Mono, monospace',
                        color: 'var(--tx2)'
                      }}
                    >
                      {img.image_size != null ? `${img.image_size.toFixed(1)} GB` : '—'}
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
                      {new Date(img.created).toLocaleDateString('de-DE')}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {img.type === 'snapshot' && !readonly && (
                      <button
                        onClick={() => handleDelete(img.id)}
                        disabled={deleting === img.id}
                        style={{
                          padding: '2px 8px',
                          fontSize: 10,
                          border: '1px solid var(--bdr)',
                          borderRadius: 4,
                          color: 'var(--tx3)',
                          background: 'transparent',
                          cursor: 'pointer',
                          opacity: deleting === img.id ? 0.3 : 1
                        }}
                      >
                        {deleting === img.id ? '…' : t('common.delete')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
