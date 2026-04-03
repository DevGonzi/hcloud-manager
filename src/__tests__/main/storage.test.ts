import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('electron', () => ({
  safeStorage: {
    isEncryptionAvailable: vi.fn().mockReturnValue(true),
    encryptString: vi.fn((s: string) => Buffer.from(s)),
    decryptString: vi.fn((b: Buffer) => b.toString())
  },
  app: { getPath: vi.fn().mockReturnValue('/tmp/test') }
}))

vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(false),
    readFileSync: vi.fn().mockReturnValue('[]'),
    writeFileSync: vi.fn()
  }
}))

import { ProjectStorage } from '../../main/storage'

describe('ProjectStorage', () => {
  let storage: ProjectStorage
  beforeEach(() => {
    storage = new ProjectStorage()
    vi.clearAllMocks()
  })

  it('gibt leere Liste zurück', () => {
    expect(storage.getProjects()).toEqual([])
  })

  it('addProject gibt Projekt mit ID zurück', () => {
    const p = storage.addProject({ name: 'Test', apiKey: 'hv1-abc', readonly: false })
    expect(p.id).toBeDefined()
    expect(p.name).toBe('Test')
  })

  it('getApiKey gibt Key zurück', () => {
    const p = storage.addProject({ name: 'Test', apiKey: 'hv1-secretkey', readonly: false })
    expect(storage.getApiKey(p.id)).toBe('hv1-secretkey')
  })

  it('removeProject entfernt Projekt', () => {
    const p = storage.addProject({ name: 'Test', apiKey: 'hv1-abc', readonly: false })
    storage.removeProject(p.id)
    expect(storage.getProjects().find((x) => x.id === p.id)).toBeUndefined()
  })

  it('getApiKey null für unbekannte ID', () => {
    expect(storage.getApiKey('nonexistent')).toBeNull()
  })
})
