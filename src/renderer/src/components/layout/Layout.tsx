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
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>{children}</main>
      </div>
    </div>
  )
}
