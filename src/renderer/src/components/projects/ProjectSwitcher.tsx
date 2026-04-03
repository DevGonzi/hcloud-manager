import { useState, useRef, useEffect } from 'react'
import { useProjectStore } from '../../stores/project.store'
import { useServerStore } from '../../stores/server.store'
import { AddProjectDialog } from './AddProjectDialog'
import { useT } from '../../i18n'

export function ProjectSwitcher() {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [buttonHovered, setButtonHovered] = useState(false)
  const [addRowHovered, setAddRowHovered] = useState(false)
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  const { projects, activeProjectId, setActiveProject } = useProjectStore()
  const loadServers = useServerStore((s) => s.loadServers)

  const active = projects.find((p) => p.id === activeProjectId)

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
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen((o) => !o)}
          onMouseEnter={() => setButtonHovered(true)}
          onMouseLeave={() => setButtonHovered(false)}
          aria-label={active?.name ?? t('project.select')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--bg3)',
            border: `1px solid ${buttonHovered ? 'var(--bdr2)' : 'var(--bdr)'}`,
            borderRadius: 6,
            padding: '4px 10px 4px 8px',
            color: 'var(--tx)',
            fontSize: 12,
            cursor: 'pointer'
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--green)',
              flexShrink: 0
            }}
          />
          <span>{active?.name ?? t('project.none')}</span>
          {active?.readonly && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                background: 'var(--tx3)',
                color: 'var(--bg1)',
                borderRadius: 3,
                padding: '1px 4px',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            >
              R
            </span>
          )}
          <span style={{ color: 'var(--tx3)', fontSize: 10, marginLeft: 4 }}>▾</span>
        </button>

        {open && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              background: 'var(--bg3)',
              border: '1px solid var(--bdr2)',
              borderRadius: 8,
              minWidth: 220,
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              overflow: 'hidden',
              zIndex: 100
            }}
          >
            <div
              style={{
                padding: '8px 12px',
                fontSize: 10,
                fontWeight: 600,
                color: 'var(--tx3)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                borderBottom: '1px solid var(--bdr)'
              }}
            >
              {t('project.list')}
            </div>

            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => select(p.id)}
                onMouseEnter={() => setHoveredProjectId(p.id)}
                onMouseLeave={() => setHoveredProjectId(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: 12,
                  color: 'var(--tx)',
                  width: '100%',
                  background:
                    p.id === activeProjectId
                      ? 'var(--red-glow)'
                      : hoveredProjectId === p.id
                        ? 'var(--bg4)'
                        : 'transparent',
                  border: 'none',
                  textAlign: 'left'
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: p.id === activeProjectId ? 'var(--green)' : 'var(--tx3)'
                  }}
                />
                <span style={{ flex: 1 }}>{p.name}</span>
                {p.readonly && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      background: 'var(--tx3)',
                      color: 'var(--bg1)',
                      borderRadius: 3,
                      padding: '1px 4px',
                      fontFamily: 'JetBrains Mono, monospace'
                    }}
                  >
                    R
                  </span>
                )}
              </button>
            ))}

            <button
              onClick={() => {
                setOpen(false)
                setShowAdd(true)
              }}
              onMouseEnter={() => setAddRowHovered(true)}
              onMouseLeave={() => setAddRowHovered(false)}
              style={
                {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  fontSize: 12,
                  color: addRowHovered ? 'var(--tx)' : 'var(--tx3)',
                  borderTop: '1px solid var(--bdr)',
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                } as React.CSSProperties
              }
            >
              <span>＋</span> {t('project.add')}
            </button>
          </div>
        )}
      </div>

      {showAdd && <AddProjectDialog onClose={() => setShowAdd(false)} />}
    </>
  )
}
