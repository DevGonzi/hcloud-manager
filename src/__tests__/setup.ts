import '@testing-library/jest-dom'

// Mock window.hcloud für alle Tests
window.hcloud = {
  storage: {
    getProjects: vi.fn().mockResolvedValue({ success: true, data: [] }),
    addProject: vi.fn().mockResolvedValue({ success: true, data: { id: '1', name: 'test', readonly: false } }),
    removeProject: vi.fn().mockResolvedValue({ success: true, data: undefined }),
  },
  api: {
    getServers: vi.fn().mockResolvedValue({ success: true, data: [] }),
    getServer: vi.fn().mockResolvedValue({ success: false, error: 'not found' }),
    serverAction: vi.fn().mockResolvedValue({ success: true, data: undefined }),
    getMetrics: vi.fn().mockResolvedValue({ success: false, error: 'no metrics' }),
  },
  vnc: {
    open: vi.fn().mockResolvedValue({ success: true, data: undefined }),
  },
} as any
