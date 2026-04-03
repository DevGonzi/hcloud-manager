import { useEffect, useState } from 'react'
import { LangProvider } from './i18n'
import { Layout } from './components/layout/Layout'
import { LockScreen } from './components/LockScreen'
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
import { ActivityPage } from './pages/ActivityPage'
import { useProjectStore } from './stores/project.store'
import { useServerStore } from './stores/server.store'

export default function App() {
  const [activeSection, setActiveSection] = useState('servers')
  const [locked, setLocked] = useState(true)
  const [pinIsSet, setPinIsSet] = useState(false)
  const { loadProjects, activeProjectId } = useProjectStore()
  const { loadServers, servers } = useServerStore()

  useEffect(() => {
    // Check if PIN is set on app start
    window.hcloud.appconfig.getHasPinSet().then((res) => {
      if (res.success) {
        setPinIsSet(res.data)
        if (!res.data) {
          setLocked(false)
        }
      }
    })

    // Listen for global lock shortcut (Strg+L)
    window.hcloud.appconfig.onLockRequest(() => {
      setLocked(true)
    })
  }, [])

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (activeProjectId && !locked) loadServers(activeProjectId)
  }, [activeProjectId, locked])

  if (locked && pinIsSet) {
    return (
      <LangProvider>
        <LockScreen onUnlock={() => setLocked(false)} />
      </LangProvider>
    )
  }

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
        {activeSection === 'activity' && <ActivityPage />}
        {activeSection === 'settings' && <SettingsPage />}
      </Layout>
    </LangProvider>
  )
}
