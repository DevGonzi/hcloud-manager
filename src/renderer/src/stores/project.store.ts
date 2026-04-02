import { create } from 'zustand'
import type { Project } from '../../../shared/types'

interface ProjectState {
  projects: Project[]
  activeProjectId: string | null
  loading: boolean
  error: string | null
  loadProjects: () => Promise<void>
  addProject: (name: string, apiKey: string, readonly: boolean) => Promise<void>
  removeProject: (id: string) => Promise<void>
  setActiveProject: (id: string) => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProjectId: null,
  loading: false,
  error: null,

  loadProjects: async () => {
    set({ loading: true, error: null })
    const result = await window.hcloud.storage.getProjects()
    if (result.success) {
      set({ projects: result.data, loading: false })
      // auto-select erstes projekt wenn noch keins aktiv
      if (!get().activeProjectId && result.data.length > 0) {
        set({ activeProjectId: result.data[0].id })
      }
    } else {
      set({ loading: false, error: result.error })
    }
  },

  addProject: async (name, apiKey, readonly) => {
    const result = await window.hcloud.storage.addProject({ name, apiKey, readonly })
    if (result.success) {
      set(state => ({ projects: [...state.projects, result.data] }))
    } else {
      set({ error: result.error })
    }
  },

  removeProject: async (id) => {
    const result = await window.hcloud.storage.removeProject(id)
    if (result.success) {
      set(state => ({
        projects: state.projects.filter(p => p.id !== id),
        activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
      }))
    } else {
      set({ error: result.error })
    }
  },

  setActiveProject: (id) => set({ activeProjectId: id }),
}))
