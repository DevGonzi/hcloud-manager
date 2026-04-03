import { useEffect, useState, type ReactNode } from 'react'
import { useProjectStore } from '../stores/project.store'
import type { HCloudSshKey } from '../../../shared/types'
import { useT } from '../i18n'

function CreateSshKeyDialog({
  projectId,
  onClose,
  onSuccess
}: {
  projectId: string
  onClose: () => void
  onSuccess: () => void
}): ReactNode {
  const { t } = useT()
  const [name, setName] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!name.trim()) {
      setError(t('sshKeys.errorName'))
      return
    }
    if (!publicKey.trim()) {
      setError(t('sshKeys.errorPublicKey'))
      return
    }
    setLoading(true)
    setError(null)
    const res = await window.hcloud.sshKeys.create(projectId, {
      name: name.trim(),
      publicKey: publicKey.trim()
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
    fontSize: 12,
    color: 'var(--tx)',
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
          width: 420,
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--tx)',
            marginBottom: 16
          }}
        >
          {t('sshKeys.addTitle')}
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>{t('sshKeys.formName')} *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('sshKeys.namePlaceholder')}
              style={inputStyle}
              autoFocus
            />
          </div>
          <div>
            <label style={labelStyle}>{t('sshKeys.formPublicKey')} *</label>
            <textarea
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              placeholder={t('sshKeys.publicKeyPlaceholder')}
              style={{
                ...inputStyle,
                minHeight: 120,
                fontFamily: 'JetBrains Mono, monospace',
                resize: 'vertical'
              }}
            />
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
                padding: '8px 16px',
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !publicKey.trim()}
              style={{
                flex: 1,
                background: 'var(--red)',
                border: '1px solid var(--red)',
                color: '#fff',
                borderRadius: 6,
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                opacity: loading || !name.trim() || !publicKey.trim() ? 0.5 : 1
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

function SshKeyDetail({
  sshKey,
  readonly,
  onClose,
  onDelete
}: {
  projectId: string | null
  sshKey: HCloudSshKey | null
  readonly: boolean
  onClose: () => void
  onDelete: (keyId: number) => Promise<void>
}): ReactNode {
  const { t } = useT()
  const [deleting, setDeleting] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!sshKey) return null

  async function handleDelete(): Promise<void> {
    if (!sshKey || readonly) return
    setDeleting(true)
    setError(null)
    try {
      await onDelete(sshKey.id)
      onClose()
    } catch (err) {
      setError((err as Error).message || 'Fehler beim Löschen')
    }
    setDeleting(false)
  }

  function copyFingerprint(): void {
    if (!sshKey) return
    navigator.clipboard.writeText(sshKey.fingerprint)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
        transform: sshKey ? 'translateX(0)' : 'translateX(100%)',
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
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx)' }}>{sshKey.name}</div>
            <div
              style={{
                fontSize: 10,
                color: 'var(--tx3)',
                fontFamily: 'JetBrains Mono, monospace',
                marginTop: 2
              }}
            >
              #{sshKey.id}
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
        {/* Fingerprint */}
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
          {t('sshKeys.colFingerprint')}
        </div>
        <div
          style={{
            background: 'var(--bg3)',
            border: '1px solid var(--bdr)',
            borderRadius: 8,
            padding: '10px 12px',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8
          }}
        >
          <code
            style={{
              fontSize: 10,
              fontFamily: 'JetBrains Mono, monospace',
              color: 'var(--tx2)',
              flex: 1,
              wordBreak: 'break-all',
              whiteSpace: 'pre-wrap'
            }}
          >
            {sshKey.fingerprint}
          </code>
          <button
            onClick={copyFingerprint}
            style={{
              flexShrink: 0,
              padding: '4px 8px',
              fontSize: 10,
              background: 'var(--bg4)',
              border: '1px solid var(--bdr)',
              borderRadius: 4,
              cursor: 'pointer',
              color: copied ? 'var(--green)' : 'var(--tx3)',
              fontWeight: 500
            }}
          >
            {copied ? '✓' : 'Copy'}
          </button>
        </div>

        {/* Public Key */}
        <div
          style={{
            fontSize: 9,
            fontWeight: 600,
            color: 'var(--tx3)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>{t('sshKeys.sectionPublicKey')}</span>
          <button
            onClick={() => setShowKey(!showKey)}
            style={{
              fontSize: 9,
              background: 'none',
              border: 'none',
              color: 'var(--tx3)',
              cursor: 'pointer',
              padding: 0
            }}
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>
        <div
          style={{
            background: 'var(--bg3)',
            border: '1px solid var(--bdr)',
            borderRadius: 8,
            padding: '10px 12px',
            marginBottom: 16,
            minHeight: 60
          }}
        >
          {showKey ? (
            <pre
              style={{
                fontSize: 9,
                fontFamily: 'JetBrains Mono, monospace',
                color: 'var(--tx2)',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                maxHeight: 200,
                overflowY: 'auto'
              }}
            >
              {sshKey.public_key}
            </pre>
          ) : (
            <div style={{ fontSize: 10, color: 'var(--tx3)', fontStyle: 'italic' }}>
              ••••••••••••••••••••• (Click Show to reveal)
            </div>
          )}
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
          {t('sshKeys.colCreated')}
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
            {new Date(sshKey.created).toLocaleDateString('de-DE')}
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
              {deleting ? t('common.loading') : t('common.delete')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export function SshKeysPage(): ReactNode {
  const { t } = useT()
  const { activeProjectId, projects } = useProjectStore()
  const [keys, setKeys] = useState<HCloudSshKey[]>([])
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
    const res = await window.hcloud.sshKeys.list(activeProjectId)
    if (res.success) setKeys(res.data)
    else setError(res.error)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [activeProjectId])

  async function handleDelete(keyId: number): Promise<void> {
    if (!activeProjectId || readonly) return
    await window.hcloud.sshKeys.delete(activeProjectId, keyId)
    load()
  }

  const filtered = search
    ? keys.filter(
        (k) => k.name.toLowerCase().includes(search.toLowerCase()) || k.fingerprint.includes(search)
      )
    : keys

  const selectedKey = selectedId ? (keys.find((k) => k.id === selectedId) ?? null) : null

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
              {t('sshKeys.title')}
            </div>
            <div
              style={{
                fontSize: 10,
                color: 'var(--tx3)',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            >
              api.hetzner.cloud/v1/ssh_keys · {t('common.resources', { n: keys.length })}
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
              + {t('sshKeys.add')}
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
              placeholder={t('sshKeys.search')}
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
              <span style={{ fontSize: 24, opacity: 0.3 }}>⊡</span>
              <p style={{ fontSize: 12, margin: 0 }}>{t('sshKeys.noSshKeys')}</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {[
                    '',
                    t('sshKeys.formName'),
                    t('sshKeys.colFingerprint'),
                    t('sshKeys.colCreated')
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
                {filtered.map((key) => (
                  <tr
                    key={key.id}
                    onClick={() => setSelectedId(selectedId === key.id ? null : key.id)}
                    style={{
                      borderBottom: '1px solid var(--bdr)',
                      cursor: 'pointer',
                      background: selectedId === key.id ? 'var(--bg4)' : 'transparent',
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
                        {key.name}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: 'var(--tx3)',
                          fontFamily: 'JetBrains Mono, monospace'
                        }}
                      >
                        #{key.id}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: 'JetBrains Mono, monospace',
                          color: 'var(--tx3)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'inline-block',
                          maxWidth: 200
                        }}
                      >
                        {key.fingerprint}
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
                        {new Date(key.created).toLocaleDateString('de-DE')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <SshKeyDetail
        projectId={activeProjectId}
        sshKey={selectedKey}
        readonly={readonly}
        onClose={() => setSelectedId(null)}
        onDelete={handleDelete}
      />

      {showCreate && activeProjectId && (
        <CreateSshKeyDialog
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
