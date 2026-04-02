import { useEffect, useState } from 'react'
import { Layout } from './components/layout/Layout'
import { ServersPage } from './pages/ServersPage'
import { useProjectStore } from './stores/project.store'
import { useServerStore } from './stores/server.store'

export default function App() {
  const [activeSection, setActiveSection] = useState('servers')
  const { loadProjects, activeProjectId } = useProjectStore()
  const { loadServers, servers } = useServerStore()

  useEffect(() => { loadProjects() }, [])

  useEffect(() => {
    if (activeProjectId) loadServers(activeProjectId)
  }, [activeProjectId])

  return (
    <Layout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      serverCount={servers.length}
    >
      {activeSection === 'servers' && <ServersPage />}
      {activeSection !== 'servers' && (
        <div className="flex-1 flex items-center justify-center text-text-3 text-sm">
          {activeSection} — kommt in v2
        </div>
      )}
    </Layout>
  )
}
