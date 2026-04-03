import { create } from 'zustand'
import type { HCloudServer } from '../../../shared/types'

interface ServerState {
  servers: HCloudServer[]
  selectedServerId: number | null
  loading: boolean
  error: string | null
  loadServers: (projectId: string) => Promise<void>
  selectServer: (id: number | null) => void
  refreshServer: (projectId: string, serverId: number) => Promise<void>
}

export const useServerStore = create<ServerState>((set) => ({
  servers: [],
  selectedServerId: null,
  loading: false,
  error: null,

  loadServers: async (projectId) => {
    set({ loading: true, error: null, servers: [] })
    const result = await window.hcloud.api.getServers(projectId)
    if (result.success) {
      set((state) => ({
        servers: result.data,
        loading: false,
        // auto-select erstes wenn noch nichts gewählt
        selectedServerId: state.selectedServerId ?? result.data[0]?.id ?? null
      }))
    } else {
      set({ loading: false, error: result.error })
    }
  },

  selectServer: (id) => set({ selectedServerId: id }),

  refreshServer: async (projectId, serverId) => {
    const result = await window.hcloud.api.getServer(projectId, serverId)
    if (result.success) {
      set((state) => ({
        servers: state.servers.map((s) => (s.id === serverId ? result.data : s))
      }))
    }
  }
}))
