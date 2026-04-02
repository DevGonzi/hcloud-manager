import { useState, useRef, useEffect } from 'react'
import { useProjectStore } from '../../stores/project.store'
import { useServerStore } from '../../stores/server.store'
import { AddProjectDialog } from './AddProjectDialog'

export function ProjectSwitcher() {
  const [open, setOpen] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { projects, activeProjectId, setActiveProject } = useProjectStore()
  const loadServers = useServerStore(s => s.loadServers)

  const active = projects.find(p => p.id === activeProjectId)

  function select(id: string) {
    setActiveProject(id)
    loadServers(id)
    setOpen(false)
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          aria-label={active?.name ?? 'Projekt auswählen'}
          className="flex items-center gap-1.5 bg-bg-3 border border-border rounded-md px-2 py-1 text-xs text-text hover:border-border-2 transition-all"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-status-running" />
          <span>{active?.name ?? 'Kein Projekt'}</span>
          {active?.readonly && (
            <span className="text-[9px] font-bold bg-text-3 text-bg-1 rounded px-1">R</span>
          )}
          <span className="text-text-3 text-[10px] ml-1">▾</span>
        </button>

        {open && (
          <div className="absolute right-0 top-[calc(100%+6px)] bg-bg-3 border border-border-2 rounded-lg min-w-[220px] shadow-2xl z-50 overflow-hidden">
            <div className="px-3 py-2 text-[10px] font-semibold text-text-3 uppercase tracking-widest border-b border-border font-mono">
              Projekte
            </div>

            {projects.map(p => (
              <button
                key={p.id}
                onClick={() => select(p.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-bg-4 transition-all ${
                  p.id === activeProjectId ? 'bg-accent-glow' : ''
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  p.id === activeProjectId ? 'bg-status-running' : 'bg-status-off'
                }`} />
                <span className="flex-1 text-left text-text">{p.name}</span>
                {p.readonly && (
                  <span className="text-[9px] font-bold bg-text-3 text-bg-1 rounded px-1">R</span>
                )}
              </button>
            ))}

            <button
              onClick={() => { setOpen(false); setShowAdd(true) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-3 hover:text-text border-t border-border transition-all"
            >
              <span>＋</span> Projekt hinzufügen
            </button>
          </div>
        )}
      </div>

      {showAdd && <AddProjectDialog onClose={() => setShowAdd(false)} />}
    </>
  )
}
