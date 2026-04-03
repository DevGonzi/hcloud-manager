import { useEffect, useState } from 'react'
import { LangProvider } from './i18n'
import { Layout } from './components/layout/Layout'
import { ServersPage } from './pages/ServersPage'
import { SnapshotsPage } from './pages/SnapshotsPage'
import { ImagesPage } from './pages/ImagesPage'
import { NetworksPage } from './pages/NetworksPage'
import { FirewallsPage } from './pages/FirewallsPage'
import { FloatingIpsPage } from './pages/FloatingIpsPage'
import { LoadBalancersPage } from './pages/LoadBalancersPage'
import { VolumesPage } from './pages/VolumesPage'
import { SshKeysPage } from './pages/SshKeysPage'
import { SettingsPage } from './pages/SettingsPage'
import { useProjectStore } from './stores/project.store'
import { useServerStore } from './stores/server.store'

export default function App() {
  const [activeSection, setActiveSection] = useState('servers')
  const { loadProjects, activeProjectId } = useProjectStore()
  const { loadServers, servers } = useServerStore()

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (activeProjectId) loadServers(activeProjectId)
  }, [activeProjectId])

  return (
    <LangProvider>
      <Layout
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        serverCount={servers.length}
      >
        {activeSection === 'servers' && <ServersPage />}
        {activeSection === 'snapshots' && <SnapshotsPage />}
        {activeSection === 'images' && <ImagesPage />}
        {activeSection === 'networks' && <NetworksPage />}
        {activeSection === 'firewalls' && <FirewallsPage />}
        {activeSection === 'floating-ips' && <FloatingIpsPage />}
        {activeSection === 'load-balancers' && <LoadBalancersPage />}
        {activeSection === 'volumes' && <VolumesPage />}
        {activeSection === 'ssh-keys' && <SshKeysPage />}
        {activeSection === 'settings' && <SettingsPage />}
      </Layout>
    </LangProvider>
  )
}
