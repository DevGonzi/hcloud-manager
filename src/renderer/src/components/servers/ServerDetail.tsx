import { useState } from 'react'
import { useServerStore } from '../../stores/server.store'
import { ServerMetrics } from './ServerMetrics'
import type { HCloudServer } from '../../../../shared/types'
import { useT } from '../../i18n'

type Tab = 'overview' | 'console' | 'metrics'

interface Props {
  projectId: string | null
  readonly: boolean
  onAction: (serverId: number, action: 'start' | 'shutdown' | 'reboot') => void
}

const sBg: Record<string, string> = {
  running: 'rgba(30,217,122,0.12)',
  off: 'rgba(82,94,120,0.15)',
  starting: 'rgba(245,166,35,0.12)',
  stopping: 'rgba(245,166,35,0.12)'
}
const sColor: Record<string, string> = {
  running: 'var(--green)',
  off: 'var(--tx3)',
  starting: 'var(--yellow)',
  stopping: 'var(--yellow)'
}

function SectionLabel({ label }: { label: string }) {
  return (
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
      {label}
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--bdr)', margin: '12px 0' }} />
}

function InfoCard({
  label,
  value,
  sub,
  wide
}: {
  label: string
  value: string
  sub?: string
  wide?: boolean
}) {
  return (
    <div
      style={{
        background: 'var(--bg3)',
        border: '1px solid var(--bdr)',
        borderRadius: 8,
        padding: '8px 12px',
        gridColumn: wide ? 'span 2' : undefined
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 600,
          color: 'var(--tx3)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontFamily: 'JetBrains Mono, monospace',
          marginBottom: 4
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 11,
          fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--tx)',
          fontWeight: 500
        }}
      >
        {value}
      </div>
      {sub && <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}


function VncButton({
  isRunning,
  loading,
  error,
  onClick
}: {
  isRunning: boolean
  loading: boolean
  error: string | null
  onClick: () => void
}) {
  const { t } = useT()
  const [hovered, setHovered] = useState(false)
  return (
    <>
      <button
        onClick={onClick}
        disabled={!isRunning || loading}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'linear-gradient(135deg,var(--bg4) 0%,#252A3A 100%)',
          border: `1px solid ${hovered && isRunning ? 'var(--bdr2)' : 'var(--bdr2)'}`,
          borderRadius: 8,
          padding: 12,
          cursor: isRunning ? 'pointer' : 'not-allowed',
          opacity: isRunning ? 1 : 0.4,
          transition: 'all 0.15s',
          marginBottom: 4,
          backgroundColor: hovered && isRunning ? 'var(--bg4)' : undefined
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'var(--bg4)',
            border: '1px solid var(--bdr)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            flexShrink: 0
          }}
        >
          ⌨
        </div>
        <div style={{ textAlign: 'left', flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--tx)' }}>
            {loading ? t('serverDetail.connecting') : t('serverDetail.openVnc')}
          </div>
          <div
            style={{
              fontSize: 10,
              color: 'var(--tx3)',
              fontFamily: 'JetBrains Mono, monospace',
              marginTop: 2
            }}
          >
            {t('serverDetail.vncSubtitle')}
          </div>
        </div>
        <span style={{ color: 'var(--tx3)', fontSize: 14, marginLeft: 'auto' }}>→</span>
      </button>
      {error && <p style={{ fontSize: 10, color: 'var(--red)', margin: '4px 0 0' }}>{error}</p>}
    </>
  )
}

function ActionButton({
  icon,
  label,
  disabled,
  color,
  onClick
}: {
  icon: string
  label: string
  disabled?: boolean
  color?: string
  onClick?: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const isRed = color === 'red'
  const isGreen = color === 'green'

  let borderColor = 'var(--bdr)'
  let textColor = 'var(--tx2)'
  let bg = 'var(--bg3)'

  if (!disabled && hovered) {
    if (isRed) {
      borderColor = 'var(--red)'
      textColor = 'var(--red)'
    } else if (isGreen) {
      borderColor = 'var(--green)'
      textColor = 'var(--green)'
    } else {
      borderColor = 'var(--bdr2)'
      textColor = 'var(--tx)'
      bg = 'var(--bg4)'
    }
  }

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '8px 4px',
        borderRadius: 8,
        border: `1px solid ${borderColor}`,
        background: bg,
        color: textColor,
        fontSize: 11,
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        transition: 'all 0.1s'
      }}
    >
      <span style={{ fontSize: 15, lineHeight: 1 }}>{icon}</span>
      {label}
    </button>
  )
}

export function ServerDetail({ projectId, readonly, onAction }: Props) {
  const { t } = useT()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const tabLabels: Record<Tab, string> = {
    overview: t('serverDetail.tabOverview'),
    console: t('serverDetail.tabConsole'),
    metrics: t('serverDetail.tabMetrics')
  }
  const { servers, selectedServerId, selectServer } = useServerStore()
  const server = servers.find((s) => s.id === selectedServerId) ?? null

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
        transform: server ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.2s cubic-bezier(0.16,1,0.3,1)'
      }}
    >
      {server && (
        <>
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
                  {server.name}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: 'var(--tx3)',
                    fontFamily: 'JetBrains Mono, monospace',
                    marginTop: 2
                  }}
                >
                  #{server.id} · {server.server_type.name} ·{' '}
                  {server.datacenter.location.name.toUpperCase()}
                </div>
              </div>
              <button
                onClick={() => selectServer(null)}
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

            {/* Tabs */}
            <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {(Object.keys(tabLabels) as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '8px 12px',
                    fontSize: 11,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    background: 'none',
                    cursor: 'pointer',
                    border: 'none',
                    borderBottom: `2px solid ${activeTab === tab ? 'var(--red)' : 'transparent'}`,
                    color: activeTab === tab ? 'var(--tx)' : 'var(--tx3)',
                    transition: 'color 0.1s'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab)
                      (e.currentTarget as HTMLElement).style.color = 'var(--tx2)'
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab)
                      (e.currentTarget as HTMLElement).style.color = 'var(--tx3)'
                  }}
                >
                  {tabLabels[tab]}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 16,
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--bdr) transparent'
            }}
          >
            {activeTab === 'overview' && (
              <OverviewTab
                server={server}
                readonly={readonly}
                projectId={projectId}
                onAction={(action) => onAction(server.id, action)}
              />
            )}
            {activeTab === 'console' && <ConsoleTab server={server} projectId={projectId} />}
            {activeTab === 'metrics' && <ServerMetrics server={server} projectId={projectId} />}
          </div>
        </>
      )}
    </div>
  )
}

function OverviewTab({
  server,
  readonly,
  projectId,
  onAction
}: {
  server: HCloudServer
  readonly: boolean
  projectId: string | null
  onAction: (action: 'start' | 'shutdown' | 'reboot') => void
}) {
  const { t } = useT()
  const isRunning = server.status === 'running'
  const [loading, setLoading] = useState<string | null>(null)
  const [vncLoading, setVncLoading] = useState(false)
  const [vncError, setVncError] = useState<string | null>(null)

  async function act(action: 'start' | 'shutdown' | 'reboot') {
    if (readonly) return
    setLoading(action)
    await onAction(action)
    setLoading(null)
  }

  const actions = [
    {
      key: isRunning ? 'shutdown' : 'start',
      icon: isRunning ? '⏹' : '▶',
      label: isRunning ? t('serverDetail.actionStop') : t('serverDetail.actionStart'),
      color: isRunning ? '' : 'green'
    },
    {
      key: 'reboot' as const,
      icon: '↺',
      label: t('serverDetail.actionReboot'),
      disabled: !isRunning
    },
    { key: 'rebuild', icon: '⊞', label: t('serverDetail.actionRebuild'), disabled: true },
    { key: 'resize', icon: '⤢', label: t('serverDetail.actionResize'), disabled: true },
    { key: 'resetpw', icon: '🔑', label: t('serverDetail.actionResetPw'), disabled: true },
    {
      key: 'delete',
      icon: '✕',
      label: t('serverDetail.actionDelete'),
      color: 'red',
      disabled: readonly
    }
  ] as const

  return (
    <div>
      <SectionLabel label={t('serverDetail.sectionStatus')} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 4 }}>
        {/* Status pill card */}
        <div
          style={{
            background: 'var(--bg3)',
            border: '1px solid var(--bdr)',
            borderRadius: 8,
            padding: '8px 12px'
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 600,
              color: 'var(--tx3)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontFamily: 'JetBrains Mono, monospace',
              marginBottom: 6
            }}
          >
            {t('serverDetail.sectionStatus')}
          </div>
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
              background: sBg[server.status] ?? sBg.off,
              color: sColor[server.status] ?? sColor.off
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'currentColor',
                flexShrink: 0,
                animation: isRunning ? 'pulse-dot 2s infinite' : undefined
              }}
            />
            {server.status}
          </span>
        </div>
        <InfoCard
          label={t('serverDetail.labelType')}
          value={server.server_type.name}
          sub={`${server.server_type.cores} vCPU · ${server.server_type.memory}GB RAM`}
        />
        <InfoCard label={t('serverDetail.labelIpv4')} value={server.public_net.ipv4?.ip ?? '—'} />
        <InfoCard label={t('serverDetail.labelDatacenter')} value={server.datacenter.name} />
        <InfoCard
          label={t('serverDetail.labelIpv6')}
          value={server.public_net.ipv6?.ip ?? '—'}
          wide
        />
      </div>

      {isRunning && (
        <>
          <Divider />
          <SectionLabel label={t('serverDetail.sectionLiveMetrics')} />
          <ServerMetrics server={server} projectId={projectId} />
        </>
      )}

      <Divider />
      <SectionLabel label={t('serverDetail.sectionConsole')} />
      <VncButton
        isRunning={isRunning}
        loading={vncLoading}
        error={vncError}
        onClick={async () => {
          if (!projectId || !isRunning) return
          setVncLoading(true)
          setVncError(null)
          const res = await window.hcloud.vnc.open(projectId, server.id)
          if (!res.success) setVncError(res.error)
          setVncLoading(false)
        }}
      />

      <Divider />
      <SectionLabel label={t('serverDetail.sectionActions')} />
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 4 }}
      >
        {actions.map((a) => (
          <ActionButton
            key={a.key}
            icon={loading === a.key ? '…' : a.icon}
            label={a.label}
            disabled={('disabled' in a && a.disabled) || readonly || loading !== null}
            color={'color' in a ? a.color : undefined}
            onClick={() =>
              a.key === 'shutdown' || a.key === 'start' || a.key === 'reboot'
                ? act(a.key as 'start' | 'shutdown' | 'reboot')
                : undefined
            }
          />
        ))}
      </div>

      {Object.keys(server.labels).length > 0 && (
        <>
          <Divider />
          <SectionLabel label={t('serverDetail.sectionLabels')} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
            {Object.entries(server.labels).map(([k, v]) => (
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

      <Divider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 600,
              color: 'var(--tx3)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontFamily: 'JetBrains Mono, monospace',
              marginBottom: 4
            }}
          >
            {t('serverDetail.sectionCreated')}
          </div>
          <span
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--tx2)' }}
          >
            {new Date(server.created).toLocaleDateString('de-DE')}
          </span>
        </div>
        {server.image && (
          <div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: 'var(--tx3)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontFamily: 'JetBrains Mono, monospace',
                marginBottom: 4
              }}
            >
              {t('serverDetail.sectionOsImage')}
            </div>
            <span
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--tx2)' }}
            >
              {server.image.description}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function ConsoleTab({ server, projectId }: { server: HCloudServer; projectId: string | null }) {
  const { t } = useT()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isRunning = server.status === 'running'

  async function openConsole() {
    if (!projectId) return
    setLoading(true)
    setError(null)
    const res = await window.hcloud.vnc.open(projectId, server.id)
    if (!res.success) setError(res.error)
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <VncButton isRunning={isRunning} loading={loading} error={error} onClick={openConsole} />
      {!isRunning && (
        <p style={{ fontSize: 12, color: 'var(--tx3)', textAlign: 'center', margin: 0 }}>
          {t('serverDetail.serverMustRun')}
        </p>
      )}
    </div>
  )
}
