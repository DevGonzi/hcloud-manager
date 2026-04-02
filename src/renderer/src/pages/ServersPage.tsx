import { useState } from 'react'
import { useServerStore } from '../stores/server.store'
import { useProjectStore } from '../stores/project.store'
import { ServerTable } from '../components/servers/ServerTable'
import { ServerDetail } from '../components/servers/ServerDetail'

export function ServersPage() {
  const [filter, setFilter] = useState<'all' | 'running' | 'off'>('all')
  const [search, setSearch] = useState('')

  const { servers, loading, error, selectedServerId, selectServer, loadServers } = useServerStore()
  const { activeProjectId, projects } = useProjectStore()

  const activeProject = projects.find(p => p.id === activeProjectId)
  const readonly = activeProject?.readonly ?? false

  const filtered = servers.filter(s => {
    if (filter === 'running' && s.status !== 'running') return false
    if (filter === 'off' && s.status === 'running') return false
    if (search && !s.name.includes(search) && !s.public_net.ipv4?.ip.includes(search)) return false
    return true
  })

  const running = servers.filter(s => s.status === 'running').length

  async function handleAction(serverId: number, action: 'start' | 'shutdown' | 'reboot') {
    if (!activeProjectId || readonly) return
    await window.hcloud.api.serverAction(activeProjectId, serverId, action)
    loadServers(activeProjectId)
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* header */}
        <div className="px-5 py-3 border-b border-border bg-bg-2 flex items-center gap-3 flex-shrink-0">
          <div>
            <div className="text-sm font-semibold text-text">Servers</div>
            <div className="text-[10px] text-text-3 font-mono">api.hetzner.cloud/v1/servers · {servers.length} resources</div>
          </div>
          <div className="flex-1" />
          {readonly && (
            <span className="text-[9px] font-bold bg-text-3 text-bg-1 rounded px-1.5 py-0.5">READONLY</span>
          )}
          <button
            onClick={() => activeProjectId && loadServers(activeProjectId)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs bg-bg-3 border border-border rounded-md text-text-2 hover:border-border-2 hover:text-text transition-all"
          >
            ↺ Refresh
          </button>
          {!readonly && (
            <button className="flex items-center gap-1.5 px-3 py-1 text-xs bg-accent border border-accent rounded-md text-white hover:bg-accent-dim transition-all">
              ＋ Server erstellen
            </button>
          )}
        </div>

        {/* filter bar */}
        <div className="px-5 py-2 border-b border-border flex items-center gap-2 flex-shrink-0">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-3 text-xs">⌕</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Name, IP…"
              className="bg-bg-3 border border-border rounded-md pl-7 pr-3 py-1 text-xs text-text outline-none focus:border-accent transition-all w-52"
            />
          </div>
          {(['all', 'running', 'off'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs border transition-all ${
                filter === f
                  ? 'bg-accent-glow border-accent-dim text-red-300'
                  : 'border-border text-text-2 hover:border-border-2 hover:text-text'
              }`}
            >
              {f === 'all' ? 'Alle' : f === 'running' ? 'Running' : 'Off'}
            </button>
          ))}
        </div>

        {/* stats */}
        <div className="px-5 pt-4 pb-2 flex gap-3 flex-shrink-0">
          {[
            { label: 'Running', value: running, color: 'text-status-running' },
            { label: 'Off', value: servers.length - running, color: 'text-text-3' },
            { label: 'Total', value: servers.length, color: 'text-text' },
          ].map(s => (
            <div key={s.label} className="bg-bg-3 border border-border rounded-lg px-3.5 py-2.5 min-w-[80px]">
              <div className={`text-lg font-bold font-mono leading-none ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-text-3 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* table */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-text-3 text-xs">Lade…</div>
          ) : error ? (
            <div className="flex items-center justify-center py-16 text-accent text-xs">{error}</div>
          ) : (
            <ServerTable
              servers={filtered}
              selectedId={selectedServerId}
              readonly={readonly}
              onSelect={id => selectServer(id === selectedServerId ? null : id)}
              onAction={handleAction}
            />
          )}
        </div>
      </div>

      <ServerDetail projectId={activeProjectId} readonly={readonly} onAction={handleAction} />
    </div>
  )
}
