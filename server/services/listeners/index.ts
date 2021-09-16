import { listeners as SessionServiceListeners } from './SessionServiceListeners'
import { listeners as USMServiceListeners } from './USMServiceListeners'
// Imports required by class-transformer
import 'reflect-metadata'
import 'es6-shim'

export function registerListeners() {
  SessionServiceListeners()
  USMServiceListeners()
}
