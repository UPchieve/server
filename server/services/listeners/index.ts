import { listeners as SessionServiceListeners } from './SessionServiceListeners'
import { listeners as USMServiceListeners } from './USMServiceListeners'

export function registerListeners() {
  SessionServiceListeners()
  USMServiceListeners()
}
