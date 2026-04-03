import { randomUUID } from 'crypto'
import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import type { ActionLogEntry } from '../shared/types'

export class ActionLog {
  private entries: ActionLogEntry[] = []
  private maxEntries = 200
  private logPath: string

  constructor() {
    this.logPath = path.join(app.getPath('userData'), 'actionlog.json')
    this.load()
  }

  private load() {
    if (!fs.existsSync(this.logPath)) return
    try {
      const data = JSON.parse(fs.readFileSync(this.logPath, 'utf-8'))
      this.entries = data
    } catch {
      this.entries = []
    }
  }

  private save() {
    fs.writeFileSync(this.logPath, JSON.stringify(this.entries, null, 2), 'utf-8')
  }

  push(entry: Omit<ActionLogEntry, 'id' | 'timestamp'>) {
    const logEntry: ActionLogEntry = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      ...entry
    }
    this.entries.unshift(logEntry)
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(0, this.maxEntries)
    }
    this.save()
  }

  getAll(): ActionLogEntry[] {
    return this.entries
  }

  clear() {
    try {
      this.entries = []
      if (fs.existsSync(this.logPath)) {
        fs.unlinkSync(this.logPath)
      }
    } catch (e) {
      console.error('Error clearing action log:', e)
    }
  }
}

export const actionLog = new ActionLog()
