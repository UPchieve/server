import { listeners as SessionServiceListeners } from './SessionServiceListeners'
import { listeners as USMServiceListeners } from './USMServiceListeners'
import { listeners as StudentServiceListeners } from './StudentServiceListeners'

export function registerListeners() {
  SessionServiceListeners()
  USMServiceListeners()
  StudentServiceListeners()
}
