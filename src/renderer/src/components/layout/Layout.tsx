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
    <div className="h-screen flex flex-col bg-bg-1 text-text overflow-hidden">
      <Titlebar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          serverCount={serverCount}
        />
        <main className="flex-1 overflow-hidden flex">
          {children}
        </main>
      </div>
    </div>
  )
}
