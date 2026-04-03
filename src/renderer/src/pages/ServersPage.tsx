import { useState, useEffect } from 'react'
import { useServerStore } from '../stores/server.store'
import { useProjectStore } from '../stores/project.store'
import { ServerTable } from '../components/servers/ServerTable'
import { ServerDetail } from '../components/servers/ServerDetail'
import { useT } from '../i18n/useT'
import type {
  HCloudServerType,
  HCloudLocation,
  HCloudImage,
  HCloudSshKey
} from '../../../shared/types'

function CreateServerDialog({
  projectId,
  onClose,
  onSuccess
}: {
  projectId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [name, setName] = useState('')
  const [serverType, setServerType] = useState('')
  const [location, setLocation] = useState('')
  const [imageId, setImageId] = useState<number | null>(null)
  const [selectedSshKeys, setSelectedSshKeys] = useState<number[]>([])
  const [serverTypes, setServerTypes] = useState<HCloudServerType[]>([])
  const [locations, setLocations] = useState<HCloudLocation[]>([])
  const [images, setImages] = useState<HCloudImage[]>([])
  const [sshKeys, setSshKeys] = useState<HCloudSshKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [typesAreLoading, setTypesAreLoading] = useState(false)
  const [doingSubmit, setDoingSubmit] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const { t } = useT()

  useEffect(() => {
    let isMounted = true
    async function loadInitialStuff() {
      setErrorMsg('')
      setIsLoading(true)

      try {
        const locsRes = await window.hcloud.servers.listLocations(projectId)
        const imgsRes = await window.hcloud.images.list(projectId, 'system')
        const keysRes = await window.hcloud.sshKeys.list(projectId)

        if (isMounted) {
          if (locsRes.success) setLocations(locsRes.data)
          if (imgsRes.success) setImages(imgsRes.data)
          if (keysRes.success) setSshKeys(keysRes.data)

          // wenn irgendwas schief geht
          if (!locsRes.success) setErrorMsg(locsRes.error)
          else if (!imgsRes.success) setErrorMsg(imgsRes.error)
          else if (!keysRes.success) setErrorMsg(keysRes.error)

          setIsLoading(false)
        }
      } catch (e: any) {
        if (isMounted) {
          setErrorMsg('Netzwerkfehler oder so: ' + e?.message)
          setIsLoading(false)
        }
      }
    }

    loadInitialStuff()
    return () => {
      isMounted = false
    }
  }, [projectId])

  useEffect(() => {
    if (!location) {
      setServerTypes([])
      setServerType('')
      return
    }

    let isMounted = true
    setTypesAreLoading(true)

    async function fetchServerTypes() {
      try {
        const res = await window.hcloud.servers.listTypes(projectId)
        if (isMounted) {
          if (res.success) {
            setServerTypes(res.data)
          } else {
            setErrorMsg('Server-Typen konnten nicht geladen werden...')
          }
          setTypesAreLoading(false)
        }
      } catch (e: any) {
        if (isMounted) {
          setErrorMsg('Fehler beim Laden der Typen: ' + e?.message)
          setTypesAreLoading(false)
        }
      }
    }

    fetchServerTypes()
    return () => {
      isMounted = false
    }
  }, [location, projectId])

  const validateForm = () => {
    return name.trim().length > 0 && serverType && location && imageId
  }

  async function handleSubmit() {
    if (!validateForm()) {
      setErrorMsg('Alle Felder ausfüllen!')
      return
    }

    setDoingSubmit(true)
    setErrorMsg('')

    // TODO: validierung später noch besser machen
    console.log('[DEBUG]', {
      serverName: name,
      type: serverType,
      location,
      image: imageId
    })

    const payload = {
      name: name.trim(),
      serverType,
      location,
      imageId,
      sshKeyIds: selectedSshKeys
    }

    try {
      const res = await window.hcloud.servers.create(projectId, {
        name: payload.name,
        serverType: payload.serverType,
        location: payload.location,
        imageId: imageId!,
        sshKeyIds: payload.sshKeyIds
      })
      setDoingSubmit(false)

      if (res.success) {
        console.log('✓ Server erstellt')
        onSuccess()
      } else {
        setErrorMsg(
          res.error ||
            'Server konnte nicht erstellt werden - prüfe deine Eingaben oder versuche es später erneut'
        )
      }
    } catch (err) {
      setDoingSubmit(false)
      console.error('API ERROR:', err)
      setErrorMsg('Netzwerkfehler beim Erstellen: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }
  const modalStyle: React.CSSProperties = {
    background: 'var(--bg2)',
    border: '1px solid var(--bdr)',
    borderRadius: 10,
    padding: 24,
    width: 480,
    maxHeight: '80vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  }
  const labelStyle: React.CSSProperties = { fontSize: 11, color: 'var(--tx3)', marginBottom: 4 }
  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg3)',
    border: '1px solid var(--bdr)',
    borderRadius: 6,
    padding: '6px 10px',
    fontSize: 12,
    color: 'var(--tx)',
    outline: 'none',
    boxSizing: 'border-box'
  }
  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)' }}>
          {t('servers.createTitle')}
        </div>

        {isLoading ? (
          <div
            style={{ color: 'var(--tx3)', fontSize: 12, textAlign: 'center', padding: '24px 0' }}
          >
            {t('servers.loadingOptions')}
          </div>
        ) : errorMsg && !locations.length ? (
          <div
            style={{ color: 'var(--red)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}
          >
            {errorMsg}
          </div>
        ) : (
          <>
            <div>
              <div style={labelStyle}>{t('servers.formName')} *</div>
              <input
                style={inputStyle}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="my-server"
                autoFocus
              />
            </div>

            <div>
              <div style={labelStyle}>{t('servers.formLocation')} *</div>
              <select
                style={selectStyle}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">{t('servers.selectLocation')}</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.name}>
                    {l.name.toUpperCase()} — {l.city}, {l.country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={labelStyle}>{t('servers.formServerType')} *</div>
              <select
                style={selectStyle}
                value={serverType}
                onChange={(e) => setServerType(e.target.value)}
                disabled={!location || typesAreLoading}
              >
                <option value="">
                  {!location
                    ? t('servers.selectFirst')
                    : typesAreLoading
                      ? t('servers.loadingTypes')
                      : t('servers.selectType')}
                </option>
                {serverTypes.map((st) => (
                  <option key={st.id} value={st.name}>
                    {st.name} — {st.cores} vCPU · {st.memory} GB RAM · {st.disk} GB Disk (
                    {st.cpu_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={labelStyle}>{t('servers.formOs')} *</div>
              <select
                style={selectStyle}
                value={imageId ?? ''}
                onChange={(e) => setImageId(Number(e.target.value) || null)}
              >
                <option value="">{t('servers.selectImage')}</option>
                {images.map((img) => (
                  <option key={img.id} value={img.id}>
                    {img.description}
                  </option>
                ))}
              </select>
            </div>

            {sshKeys.length > 0 && (
              <div>
                <div style={labelStyle}>{t('servers.formSshKeys')}</div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    maxHeight: 120,
                    overflowY: 'auto'
                  }}
                >
                  {sshKeys.map((key) => (
                    <label
                      key={key.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 12,
                        color: 'var(--tx2)',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSshKeys.includes(key.id)}
                        onChange={(e) =>
                          setSelectedSshKeys((prev) =>
                            e.target.checked
                              ? [...prev, key.id]
                              : prev.filter((id) => id !== key.id)
                          )
                        }
                      />
                      {key.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {errorMsg && <div style={{ fontSize: 12, color: 'var(--red)' }}>{errorMsg}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                onClick={onClose}
                style={{
                  padding: '6px 14px',
                  fontSize: 12,
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: 'var(--bg3)',
                  border: '1px solid var(--bdr)',
                  color: 'var(--tx2)'
                }}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={doingSubmit}
                style={{
                  padding: '6px 14px',
                  fontSize: 12,
                  borderRadius: 6,
                  cursor: doingSubmit ? 'not-allowed' : 'pointer',
                  background: 'var(--red)',
                  border: '1px solid var(--red)',
                  color: '#fff',
                  opacity: doingSubmit ? 0.6 : 1
                }}
              >
                {doingSubmit ? t('common.creating') : t('common.create')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export function ServersPage() {
  const { t } = useT()
  const [filter, setFilter] = useState<'all' | 'running' | 'off'>('all')
  const [search, setSearch] = useState('')
  const [cpuMap, setCpuMap] = useState<Record<number, number>>({})
  const [pollInterval, setPollInterval] = useState(30)
  const [showCreate, setShowCreate] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const { servers, loading, error, selectedServerId, selectServer, loadServers } = useServerStore()
  const { activeProjectId, projects } = useProjectStore()

  const activeProject = projects.find((p) => p.id === activeProjectId)
  const readonly = activeProject?.readonly ?? false

  const runningIdsKey = servers
    .filter((s) => s.status === 'running')
    .map((s) => s.id)
    .join(',')

  // Auto-reload alle 3 Sekunden
  useEffect(() => {
    if (!activeProjectId) return
    loadServers(activeProjectId)
    const timer = setInterval(() => {
      loadServers(activeProjectId)
    }, 3000)
    return () => clearInterval(timer)
  }, [activeProjectId, loadServers])

  useEffect(() => {
    if (!activeProjectId || !runningIdsKey) return
    const runningIds = runningIdsKey.split(',').map(Number)
    const end2m = () => new Date().toISOString()
    const start2m = () => new Date(Date.now() - 2 * 60 * 1000).toISOString()

    async function poll() {
      const results = await Promise.all(
        runningIds.map(async (id) => {
          const server = servers.find((s) => s.id === id)
          if (!server) return null
          const res = await window.hcloud.api.getMetrics(
            activeProjectId!,
            id,
            'cpu',
            start2m(),
            end2m()
          )
          if (!res.success) return null
          const series = Object.values(res.data.time_series)[0]
          if (!series?.values.length) return null
          const last = parseFloat(series.values[series.values.length - 1][1])
          // Normalize CPU to 0-100% scale by dividing by core count
          const normalized = Math.round(last / server.server_type.cores)
          return { id, cpu: normalized }
        })
      )
      setCpuMap((prev) => {
        const next = { ...prev }
        for (const r of results) if (r) next[r.id] = r.cpu
        return next
      })
    }

    poll()
    const timer = setInterval(poll, pollInterval * 1000)
    return () => clearInterval(timer)
  }, [activeProjectId, runningIdsKey, pollInterval])

  const filtered = servers.filter((s) => {
    if (filter === 'running' && s.status !== 'running') return false
    if (filter === 'off' && s.status === 'running') return false
    if (search && !s.name.includes(search) && !s.public_net.ipv4?.ip.includes(search)) return false
    return true
  })

  const running = servers.filter((s) => s.status === 'running').length

  async function handleAction(serverId: number, action: 'start' | 'shutdown' | 'reboot') {
    if (!activeProjectId || readonly) return
    try {
      const res = await window.hcloud.api.serverAction(activeProjectId, serverId, action)
      if (res.success) {
        setToast({ type: 'success', msg: `Server ${action} erfolgreich` })
        await loadServers(activeProjectId)
      } else {
        setToast({ type: 'error', msg: res.error || `${action} fehlgeschlagen` })
      }
    } catch (err) {
      setToast({ type: 'error', msg: `Fehler: ${err instanceof Error ? err.message : String(err)}` })
    }
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {/* header */}
        <div
          style={{
            padding: '10px 20px',
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
              {t('servers.title')}
            </div>
            <div
              style={{ fontSize: 10, color: 'var(--tx3)', fontFamily: 'JetBrains Mono, monospace' }}
            >
              api.hetzner.cloud/v1/servers · {t('common.resources', { n: servers.length })}
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              color: 'var(--tx3)',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            {t('servers.cpuPoll')}
            <input
              type="number"
              min={5}
              max={300}
              value={pollInterval}
              onChange={(e) => setPollInterval(Math.max(5, Number(e.target.value)))}
              style={{
                width: 44,
                background: 'var(--bg3)',
                border: '1px solid var(--bdr)',
                borderRadius: 4,
                padding: '2px 6px',
                fontSize: 11,
                color: 'var(--tx)',
                fontFamily: 'JetBrains Mono, monospace',
                outline: 'none',
                textAlign: 'right'
              }}
            />
            {t('servers.seconds')}
          </div>
          <button
            onClick={() => activeProjectId && loadServers(activeProjectId)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
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
          {!readonly && (
            <button
              onClick={() => setShowCreate(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                fontSize: 12,
                background: 'var(--red)',
                border: '1px solid var(--red)',
                borderRadius: 6,
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              {t('servers.create')}
            </button>
          )}
        </div>

        {/* filter bar */}
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
                fontSize: 12
              }}
            >
              ⌕
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('servers.search')}
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
          {(['all', 'running', 'off'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={
                filter === f
                  ? {
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: 11,
                      border: '1px solid var(--red-dim)',
                      background: 'var(--red-glow)',
                      color: '#FF8095',
                      cursor: 'pointer'
                    }
                  : {
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: 11,
                      border: '1px solid var(--bdr)',
                      background: 'transparent',
                      color: 'var(--tx2)',
                      cursor: 'pointer'
                    }
              }
            >
              {f === 'all'
                ? t('common.all')
                : f === 'running'
                  ? t('servers.running')
                  : t('servers.off')}
            </button>
          ))}
        </div>

        {/* stats */}
        <div style={{ padding: '16px 20px 8px', display: 'flex', gap: 12, flexShrink: 0 }}>
          {(() => {
            const locations = [
              ...new Set(servers.map((s) => s.datacenter.location.name.toUpperCase()))
            ].join(' · ')
            const stats = [
              { label: t('servers.running'), value: String(running), color: 'var(--green)' },
              {
                label: t('servers.off'),
                value: String(servers.length - running),
                color: 'var(--tx3)'
              },
              { label: t('servers.total'), value: String(servers.length), color: 'var(--tx)' },
              {
                label: t('servers.locations'),
                value: locations || '—',
                color: 'var(--tx)',
                small: true
              }
            ]
            return stats.map((s) => (
              <div
                key={s.label}
                style={{
                  flex: 1,
                  background: 'var(--bg3)',
                  border: '1px solid var(--bdr)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  minWidth: 80
                }}
              >
                <div
                  style={{
                    fontSize: s.small ? 14 : 20,
                    fontWeight: 600,
                    fontFamily: 'JetBrains Mono, monospace',
                    lineHeight: 1,
                    color: s.color
                  }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 3 }}>{s.label}</div>
              </div>
            ))
          })()}
        </div>

        {/* table */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 16px' }}>
          {loading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '64px 0',
                color: 'var(--tx3)',
                fontSize: 12
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
                color: 'var(--red)',
                fontSize: 12
              }}
            >
              {error}
            </div>
          ) : (
            <ServerTable
              servers={filtered}
              selectedId={selectedServerId}
              readonly={readonly}
              cpuMap={cpuMap}
              onSelect={(id) => selectServer(id === selectedServerId ? null : id)}
              onAction={handleAction}
            />
          )}
        </div>
      </div>

      <ServerDetail projectId={activeProjectId} readonly={readonly} onAction={handleAction} />

      {showCreate && activeProjectId && (
        <CreateServerDialog
          projectId={activeProjectId}
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false)
            loadServers(activeProjectId)
            setToast({ type: 'success', msg: 'Server erstellt' })
            setTimeout(() => setToast(null), 3000)
          }}
        />
      )}

      {toast && (
        <div style={{
          position: 'fixed',
          top: 16,
          right: 16,
          background: toast.type === 'success' ? 'var(--green)' : 'var(--red)',
          color: '#fff',
          padding: '12px 16px',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 500,
          zIndex: 2000,
          animation: 'slideIn 0.2s ease'
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
