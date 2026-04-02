import { useProjectStore } from '../../stores/project.store'
import { useServerStore } from '../../stores/server.store'
import { ProjectSwitcher } from '../projects/ProjectSwitcher'

export function Titlebar() {
  const activeProjectId = useProjectStore(s => s.activeProjectId)
  const loadServers = useServerStore(s => s.loadServers)

  return (
    <div
      className="h-10 bg-bg-2 border-b border-border flex items-center px-3.5 gap-2.5 flex-shrink-0 select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex gap-1.5" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
        <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
        <div className="w-3 h-3 rounded-full bg-[#28C840]" />
      </div>

      <div className="flex items-center gap-2 ml-3" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <div className="w-5 h-5 bg-accent rounded-[4px] flex items-center justify-center text-white text-xs font-bold font-mono">
          H
        </div>
        <span className="font-mono text-xs font-medium text-text">
          hcloud<span className="text-accent">-manager</span>
        </span>
      </div>

      <div className="flex-1" />

      <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <ProjectSwitcher />
      </div>

      <button
        className="w-7 h-7 rounded-md bg-transparent border border-transparent text-text-2 hover:bg-bg-3 hover:border-border transition-all text-sm"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        onClick={() => activeProjectId && loadServers(activeProjectId)}
        title="Refresh"
      >
        ↺
      </button>
    </div>
  )
}
