import { useEffect, useState, type ReactNode } from 'react'
import { useProjectStore } from '../stores/project.store'
import { useServerStore } from '../stores/server.store'
import type { HCloudImage } from '../../../shared/types'
import { useT } from '../i18n/useT'

function CreateSnapshotDialog({
  projectId,
  onClose,
  onSuccess
}: {
  projectId: string
  onClose: () => void
  onSuccess: () => void
}): ReactNode {
  const { t } = useT()
  const servers = useServerStore((s) => s.servers)
  const [serverId, setServerId] = useState<string>(servers[0]?.id ? String(servers[0].id) : '')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!serverId) {
      setError(t('snapshots.errorSelectServer'))
      return
    }
    setLoading(true)
    setError(null)
    const res = await window.hcloud.images.createSnapshot(projectId, {
      serverId: Number(serverId),
      description: description.trim()
    })
    setLoading(false)
    if (res.success) {
      onSuccess()
    } else {
      setError(res.error)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg4)',
    border: '1px solid var(--bdr)',
    borderRadius: 6,
    padding: '8px 12px',
    fontSize: 14,
    color: 'var(--tx)',
    outline: 'none',
    boxSizing: 'border-box'
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    color: 'var(--tx3)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
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
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--tx)',
            marginBottom: 16,
            marginTop: 0
          }}
        >
          {t('snapshots.createTitle')}
        </h2>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>{t('snapshots.formServer')}</label>
            <select
              value={serverId}
              onChange={(e) => setServerId(e.target.value)}
              style={inputStyle}
            >
              {servers.length === 0 && <option value="">{t('snapshots.errorSelectServer')}</option>}
              {servers.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name} (#{s.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>{t('snapshots.formDescription')}</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={inputStyle}
              placeholder={t('snapshots.descriptionPlaceholder')}
              autoFocus
            />
          </div>

          {error && <p style={{ fontSize: 12, color: 'var(--red)', margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '8px 0',
                fontSize: 12,
                color: 'var(--tx2)',
                background: 'var(--bg4)',
                border: '1px solid var(--bdr)',
                borderRadius: 6,
                cursor: 'pointer'
              }}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || servers.length === 0}
              style={{
                flex: 1,
                padding: '8px 0',
                fontSize: 12,
                color: '#fff',
                background: 'var(--red)',
                border: '1px solid var(--red)',
                borderRadius: 6,
                cursor: 'pointer',
                opacity: loading || servers.length === 0 ? 0.5 : 1
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

function SnapshotDetail({
  snapshot,
  readonly,
  onClose,
  onDelete,
  onCreateImage
}: {
  snapshot: HCloudImage | null
  readonly: boolean
  onClose: () => void
  onDelete: (id: number) => Promise<void>
  onCreateImage: (id: number) => Promise<void>
}): ReactNode {
  const { t } = useT()
  const [deleting, setDeleting] = useState(false)
  const [creatingImage, setCreatingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!snapshot) return null

  async function handleDelete(): Promise<void> {
    if (!snapshot || readonly) return
    setDeleting(true)
    setError(null)
    try {
      await onDelete(snapshot.id)
      onClose()
    } catch (err) {
      setError((err as Error).message || 'Fehler beim Löschen')
    }
    setDeleting(false)
  }

  async function handleCreateImage(): Promise<void> {
    if (!snapshot || readonly) return
    setCreatingImage(true)
    setError(null)
    try {
      await onCreateImage(snapshot.id)
      onClose()
    } catch (err) {
      setError((err as Error).message || 'Fehler beim Erstellen des Images')
    }
    setCreatingImage(false)
  }

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
        transform: snapshot ? 'translateX(0)' : 'translateX(100%)',
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
              {snapshot.description}
            </div>
            <div
              style={{
                fontSize: 10,
                color: 'var(--tx3)',
                fontFamily: 'JetBrains Mono, monospace',
                marginTop: 2
              }}
            >
              #{snapshot.id}
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
        {/* Size */}
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
          {t('snapshots.colSize')}
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
            {snapshot.image_size != null ? `${snapshot.image_size.toFixed(1)} GB` : '—'}
          </div>
        </div>

        {/* Source Server */}
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
          {t('snapshots.colServer')}
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
            {snapshot.created_from
              ? `${snapshot.created_from.name} (#${snapshot.created_from.id})`
              : '—'}
          </div>
        </div>

        {/* OS */}
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
          {t('snapshots.colOs')}
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
            {snapshot.os_flavor}
            {snapshot.os_version ? ` ${snapshot.os_version}` : ''}
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
          {t('snapshots.colCreated')}
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
            {new Date(snapshot.created).toLocaleDateString('de-DE')}
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
              onClick={handleCreateImage}
              disabled={creatingImage}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'var(--green)',
                border: '1px solid var(--green)',
                borderRadius: 6,
                color: '#fff',
                fontSize: 12,
                fontWeight: 500,
                cursor: creatingImage ? 'not-allowed' : 'pointer',
                opacity: creatingImage ? 0.6 : 1,
                marginBottom: 8
              }}
            >
              {creatingImage ? t('common.loading') : t('snapshots.actionCreateImage')}
            </button>
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
              {deleting ? t('common.loading') : t('common.delete')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export function SnapshotsPage(): ReactNode {
  const { t } = useT()
  const { activeProjectId, projects } = useProjectStore()
  const [snapshots, setSnapshots] = useState<HCloudImage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const readonly = projects.find((p) => p.id === activeProjectId)?.readonly ?? false

  async function load(): Promise<void> {
    if (!activeProjectId) return
    setLoading(true)
    setError(null)
    const res = await window.hcloud.images.list(activeProjectId, 'snapshot')
    if (res.success) setSnapshots(res.data)
    else setError(res.error)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [activeProjectId])

  async function handleDelete(id: number): Promise<void> {
    if (!activeProjectId || readonly) return
    await window.hcloud.images.delete(activeProjectId, id)
    load()
  }

  async function handleCreateImage(id: number): Promise<void> {
    if (!activeProjectId || readonly) return
    const res = await window.hcloud.images.createImageFromSnapshot(activeProjectId, id)
    if (res.success) {
      load()
    }
  }

  const filtered = search
    ? snapshots.filter(
        (s) =>
          s.description.toLowerCase().includes(search.toLowerCase()) ||
          (s.name ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : snapshots

  const totalSize = snapshots.reduce((acc, s) => acc + (s.image_size ?? 0), 0)
  const selectedSnapshot = selectedId ? (snapshots.find((s) => s.id === selectedId) ?? null) : null

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
              {t('snapshots.title')}
            </div>
            <div
              style={{
                fontSize: 10,
                color: 'var(--tx3)',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            >
              api.hetzner.cloud/v1/images?type=snapshot ·{' '}
              {t('common.resources', { n: snapshots.length })}
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
          {!readonly && (
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
              + {t('snapshots.create')}
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
              placeholder={t('snapshots.search')}
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
                width: 256
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding: '16px 20px 8px', display: 'flex', gap: 12, flexShrink: 0 }}>
          {[
            {
              label: t('snapshots.statSnapshots'),
              value: String(snapshots.length),
              color: '#F5A623'
            },
            { label: t('snapshots.statTotalGb'), value: totalSize.toFixed(1), color: 'var(--tx)' }
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
              <span style={{ fontSize: 24, opacity: 0.3 }}>◫</span>
              <p style={{ fontSize: 12, margin: 0 }}>{t('snapshots.noSnapshots')}</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {[
                    '',
                    t('snapshots.colDescription'),
                    t('snapshots.colServer'),
                    t('snapshots.colSize'),
                    t('snapshots.colOs'),
                    t('snapshots.colCreated')
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
                {filtered.map((snap) => (
                  <tr
                    key={snap.id}
                    onClick={() => setSelectedId(selectedId === snap.id ? null : snap.id)}
                    style={{
                      borderBottom: '1px solid var(--bdr)',
                      cursor: 'pointer',
                      background: selectedId === snap.id ? 'var(--bg4)' : 'transparent',
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
                        {snap.description}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: 'var(--tx3)',
                          fontFamily: 'JetBrains Mono, monospace'
                        }}
                      >
                        #{snap.id}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {snap.created_from ? (
                        <span
                          style={{
                            fontSize: 11,
                            fontFamily: 'JetBrains Mono, monospace',
                            color: 'var(--tx2)'
                          }}
                        >
                          {snap.created_from.name} (#{snap.created_from.id})
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
                        {snap.image_size != null ? `${snap.image_size.toFixed(1)} GB` : '—'}
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
                        {snap.os_flavor}
                        {snap.os_version ? ` ${snap.os_version}` : ''}
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
                        {new Date(snap.created).toLocaleDateString('de-DE')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <SnapshotDetail
        snapshot={selectedSnapshot}
        readonly={readonly}
        onClose={() => setSelectedId(null)}
        onDelete={handleDelete}
        onCreateImage={handleCreateImage}
      />

      {showCreate && activeProjectId && (
        <CreateSnapshotDialog
          projectId={activeProjectId}
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false)
            load()
          }}
        />
      )}
    </div>
  )
}
