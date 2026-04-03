import { safeStorage, app } from 'electron'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import type { Project, AddProjectInput } from '../../shared/types'

interface StorageRecord {
  id: string
  name: string
  readonly: boolean
  encryptedKey: string
}

export class ProjectStorage {
  private configPath: string
  private records: StorageRecord[] = []

  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'projects.json')
    this.load()
  }

  private load() {
    if (!fs.existsSync(this.configPath)) return
    try {
      this.records = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'))
    } catch {
      this.records = []
    }
  }

  private save() {
    fs.writeFileSync(this.configPath, JSON.stringify(this.records, null, 2), 'utf-8')
  }

  getProjects(): Project[] {
    return this.records.map(({ id, name, readonly }) => ({ id, name, readonly }))
  }

  addProject(input: AddProjectInput): Project {
    const id = randomUUID()
    const encrypted = safeStorage.isEncryptionAvailable()
      ? safeStorage.encryptString(input.apiKey).toString('base64')
      : Buffer.from(input.apiKey).toString('base64')
    this.records.push({ id, name: input.name, readonly: input.readonly, encryptedKey: encrypted })
    this.save()
    return { id, name: input.name, readonly: input.readonly }
  }

  removeProject(id: string) {
    this.records = this.records.filter((r) => r.id !== id)
    this.save()
  }

  removeAllProjects() {
    this.records = []
    this.save()
  }

  deleteStorageFile() {
    try {
      if (fs.existsSync(this.configPath)) {
        fs.unlinkSync(this.configPath)
      }
      this.records = []
    } catch (e) {
      console.error('Error deleting storage file:', e)
    }
  }

  renameProject(id: string, newName: string): Project | null {
    const record = this.records.find((r) => r.id === id)
    if (!record) return null
    record.name = newName
    this.save()
    return { id: record.id, name: record.name, readonly: record.readonly }
  }

  getApiKey(id: string): string | null {
    const r = this.records.find((r) => r.id === id)
    if (!r) return null
    const buf = Buffer.from(r.encryptedKey, 'base64')
    return safeStorage.isEncryptionAvailable() ? safeStorage.decryptString(buf) : buf.toString()
  }
}
