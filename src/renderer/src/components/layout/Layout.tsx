import { ReactNode } from 'react'
import { Titlebar } from './Titlebar'
import { Sidebar } from './Sidebar'

interface Props {
  children: ReactNode
  activeSection: string
  onSectionChange: (section: string) => void
  serverCount?: number
}

export function Layout({ children, activeSection, onSectionChange, serverCount }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg1)'
      }}
    >
      <Titlebar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          serverCount={serverCount}
        />
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>{children}</div>
          <div
            style={{
              padding: '4px 12px',
              fontSize: 10,
              color: 'var(--text3)',
              borderTop: '1px solid var(--border)',
              textAlign: 'center',
              flexShrink: 0
            }}
          >
            Not affiliated with Hetzner Online GmbH. Use at your own risk.
          </div>
        </main>
      </div>
    </div>
  )
}
