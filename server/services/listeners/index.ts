import { listeners as SessionServiceListeners } from './SessionServiceListeners'
import { listeners as USMServiceListeners } from './USMServiceListeners'
import { listeners as StudentServiceListeners } from './StudentServiceListeners'
import { listeners as UserCreationServiceListeners } from './UserCreationServiceListeners'

export function registerListeners() {
  SessionServiceListeners()
  USMServiceListeners()
  StudentServiceListeners()
  UserCreationServiceListeners()
}
