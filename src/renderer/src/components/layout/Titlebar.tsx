import { useState } from 'react'
import { Lock, Minus, Maximize2, X, RotateCw } from 'lucide-react'
import hetznerLogo from '../../assets/hetzner.png'
import { useProjectStore } from '../../stores/project.store'
import { useServerStore } from '../../stores/server.store'
import { ProjectSwitcher } from '../projects/ProjectSwitcher'
import { useT } from '../../i18n/useT'

function IconButton({
  onClick,
  title,
  children,
  isClose = false
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
  isClose?: boolean
}) {
  const [hovered, setHovered] = useState(false)

  const style: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: 6,
    background: hovered ? (isClose ? 'var(--red)' : 'var(--bg3)') : 'transparent',
    border: `1px solid ${hovered && !isClose ? 'var(--bdr)' : 'transparent'}`,
    color: hovered ? (isClose ? '#fff' : 'var(--tx)') : 'var(--tx2)',
    cursor: 'pointer',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={style}
    >
      {children}
    </button>
  )
}

export function Titlebar() {
  const { t } = useT()
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const loadServers = useServerStore((s) => s.loadServers)

  return (
    <div
      style={
        {
          height: 40,
          background: 'var(--bg2)',
          borderBottom: '1px solid var(--bdr)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          gap: 10,
          flexShrink: 0,
          userSelect: 'none',
          WebkitAppRegion: 'drag'
        } as React.CSSProperties
      }
    >
      <div
        style={
          {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            WebkitAppRegion: 'no-drag'
          } as React.CSSProperties
        }
      >
        <img
          src={hetznerLogo}
          alt="Hetzner"
          style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'cover' }}
        />
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--tx)',
            letterSpacing: '0.04em'
          }}
        >
          hcloud<span style={{ color: 'var(--red)' }}>-manager</span>
        </span>
      </div>

      {process.platform === 'darwin' && (
        <div
          style={
            {
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              marginLeft: 20,
              WebkitAppRegion: 'no-drag'
            } as React.CSSProperties
          }
        >
          <IconButton
            onClick={() => window.hcloud.window.minimize()}
            title={t('titlebar.minimize')}
          >
            <Minus size={12} />
          </IconButton>
          <IconButton
            onClick={() => window.hcloud.window.maximize()}
            title={t('titlebar.maximize')}
          >
            <Maximize2 size={12} />
          </IconButton>
          <IconButton
            onClick={() => window.hcloud.window.close()}
            title={t('titlebar.close')}
            isClose
          >
            <X size={12} />
          </IconButton>
        </div>
      )}

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <IconButton
          onClick={() => window.hcloud.appconfig.lock()}
          title="Lock (Strg+L)"
        >
          <Lock size={14} strokeWidth={1.5} />
        </IconButton>

        <ProjectSwitcher />

        <IconButton
          onClick={() => activeProjectId && loadServers(activeProjectId)}
          title={t('common.refresh')}
        >
          <RotateCw size={13} />
        </IconButton>
      </div>

      {process.platform !== 'darwin' && (
        <div
          style={
            {
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              marginLeft: 4,
              WebkitAppRegion: 'no-drag'
            } as React.CSSProperties
          }
        >
          <IconButton
            onClick={() => window.hcloud.window.minimize()}
            title={t('titlebar.minimize')}
          >
            <Minus size={12} />
          </IconButton>
          <IconButton
            onClick={() => window.hcloud.window.maximize()}
            title={t('titlebar.maximize')}
          >
            <Maximize2 size={12} />
          </IconButton>
          <IconButton
            onClick={() => window.hcloud.window.close()}
            title={t('titlebar.close')}
            isClose
          >
            <X size={12} />
          </IconButton>
        </div>
      )}
    </div>
  )
}
