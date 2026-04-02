import type { ProjectStorage } from '../storage'
import { registerStorageHandlers } from './storage'
import { registerApiHandlers } from './api'

export function registerAllHandlers(storage: ProjectStorage) {
  registerStorageHandlers(storage)
  registerApiHandlers(storage)
}
