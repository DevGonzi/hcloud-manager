import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

interface AppConfigRecord {
  pinHash: string | null
  cacheTtl: number
  isLocked: boolean
}

export class AppConfig {
  private configPath: string
  private config: AppConfigRecord = {
    pinHash: null,
    cacheTtl: 3600,
    isLocked: false
  }

  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'app-config.json')
    this.load()
  }

  private load() {
    if (!fs.existsSync(this.configPath)) return
    try {
      const data = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'))
      this.config = { ...this.config, ...data, isLocked: false }
    } catch {
      this.config = { pinHash: null, cacheTtl: 3600, isLocked: false }
    }
  }

  private save() {
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf-8')
  }

  async setPin(pin: string): Promise<void> {
    const hash = await bcrypt.hash(pin, 10)
    this.config.pinHash = hash
    this.save()
  }

  async verifyPin(pin: string): Promise<boolean> {
    if (!this.config.pinHash) return false
    return bcrypt.compare(pin, this.config.pinHash)
  }

  hasPinSet(): boolean {
    return this.config.pinHash !== null
  }

  clearPin(): void {
    this.config.pinHash = null
    this.save()
  }

  setCacheTtl(ttl: number): void {
    this.config.cacheTtl = ttl
    this.save()
  }

  getCacheTtl(): number {
    return this.config.cacheTtl
  }

  setLocked(locked: boolean): void {
    this.config.isLocked = locked
    // Don't save to disk (transient state)
  }

  isAppLocked(): boolean {
    return this.config.isLocked
  }
}

export const appConfig = new AppConfig()
