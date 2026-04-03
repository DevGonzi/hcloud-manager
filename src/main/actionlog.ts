import { randomUUID } from 'crypto'
import type { ActionLogEntry } from '../shared/types'

export class ActionLog {
  private entries: ActionLogEntry[] = []
  private maxEntries = 200

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
  }

  getAll(): ActionLogEntry[] {
    return this.entries
  }
}

export const actionLog = new ActionLog()
