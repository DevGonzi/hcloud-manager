import { useState } from 'react'
import { useServerStore } from '../../stores/server.store'
import { ServerActions } from './ServerActions'
import { ServerMetrics } from './ServerMetrics'
import type { HCloudServer } from '../../../../shared/types'

type Tab = 'overview' | 'console' | 'metrics' | 'actions'

interface Props {
  projectId: string | null
  readonly: boolean
  onAction: (serverId: number, action: 'start' | 'shutdown' | 'reboot') => void
}

export function ServerDetail({ projectId, readonly, onAction }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const { servers, selectedServerId, selectServer } = useServerStore()
  const server = servers.find(s => s.id === selectedServerId) ?? null

  return (
    <div className={`w-[380px] bg-bg-2 border-l border-border flex flex-col flex-shrink-0 overflow-hidden transition-transform duration-200 ${
      server ? 'translate-x-0' : 'translate-x-full'
    }`}>
      {server && (
        <>
          <div className="px-4 pt-3.5 border-b border-border">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-[15px] font-semibold text-text">{server.name}</div>
                <div className="text-[10px] text-text-3 font-mono">
                  #{server.id} · {server.server_type.name} · {server.datacenter.location.name}
                </div>
              </div>
              <button
                onClick={() => selectServer(null)}
                className="w-6 h-6 rounded bg-bg-3 border border-border text-text-3 hover:text-text hover:border-border-2 transition-all text-xs flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="flex overflow-x-auto">
              {(['overview', 'console', 'metrics', 'actions'] as Tab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-all capitalize ${
                    activeTab === tab
                      ? 'text-text border-accent'
                      : 'text-text-3 border-transparent hover:text-text-2'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'overview' && <OverviewTab server={server} />}
            {activeTab === 'console' && <ConsoleTab server={server} projectId={projectId} />}
            {activeTab === 'metrics' && <ServerMetrics server={server} projectId={projectId} />}
            {activeTab === 'actions' && (
              <ServerActions
                server={server}
                readonly={readonly}
                onAction={action => onAction(server.id, action)}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}

function InfoCard({ label, value, sub, wide }: { label: string; value: string; sub?: string; wide?: boolean }) {
  return (
    <div className={`bg-bg-3 border border-border rounded-lg px-3 py-2.5 ${wide ? 'col-span-2' : ''}`}>
      <div className="text-[9px] font-semibold text-text-3 uppercase tracking-wider font-mono mb-1">{label}</div>
      <div className="text-xs font-mono text-text font-medium">{value}</div>
      {sub && <div className="text-[10px] text-text-3 mt-0.5">{sub}</div>}
    </div>
  )
}

function OverviewTab({ server }: { server: HCloudServer }) {
  const statusCls: Record<string, string> = {
    running: 'bg-green-500/10 text-status-running',
    off:     'bg-status-off/10 text-status-off',
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-bg-3 border border-border rounded-lg px-3 py-2.5">
          <div className="text-[9px] font-semibold text-text-3 uppercase tracking-wider font-mono mb-1">Status</div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium font-mono ${statusCls[server.status] ?? 'bg-bg-4 text-text-3'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {server.status}
          </span>
        </div>
        <InfoCard label="Typ" value={server.server_type.name} sub={`${server.server_type.cores} vCPU · ${server.server_type.memory}GB RAM`} />
        <InfoCard label="IPv4" value={server.public_net.ipv4?.ip ?? '—'} />
        <InfoCard label="Datacenter" value={server.datacenter.name} />
        <InfoCard label="IPv6" value={server.public_net.ipv6?.ip ?? '—'} wide />
        <InfoCard label="OS" value={server.image?.description ?? '—'} wide />
        <InfoCard label="Erstellt" value={new Date(server.created).toLocaleDateString('de-DE')} />
      </div>

      {Object.keys(server.labels).length > 0 && (
        <div>
          <div className="text-[9px] font-semibold text-text-3 uppercase tracking-wider font-mono mb-1.5">Labels</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(server.labels).map(([k, v]) => (
              <span key={k} className="bg-bg-4 border border-border rounded px-1.5 py-0.5 text-[10px] font-mono text-text-3">
                {k}={v}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ConsoleTab({ server, projectId }: { server: HCloudServer; projectId: string | null }) {
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
    <div className="flex flex-col gap-3">
      <button
        onClick={openConsole}
        disabled={!isRunning || loading}
        className="w-full flex items-center gap-3 bg-bg-3 border border-border-2 rounded-lg p-3 hover:border-accent-dim hover:bg-bg-4 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <div className="w-9 h-9 rounded-lg bg-bg-4 border border-border flex items-center justify-center text-lg flex-shrink-0">⌨</div>
        <div className="text-left">
          <div className="text-xs font-medium text-text">{loading ? 'Verbinde…' : 'VNC Console öffnen'}</div>
          <div className="text-[10px] text-text-3 font-mono mt-0.5">wss://console.hetzner.cloud · neues Fenster</div>
        </div>
        <span className="ml-auto text-text-3">→</span>
      </button>
      {!isRunning && <p className="text-xs text-text-3 text-center">Server muss laufen</p>}
      {error && <p className="text-xs text-accent">{error}</p>}
    </div>
  )
}
