import { listeners as SessionServiceListeners } from './SessionServiceListeners'
import { listeners as USMServiceListeners } from './USMServiceListeners'
import { listeners as StudentServiceListeners } from './StudentServiceListeners'
import { listeners as UserCreationServiceListeners } from './UserCreationServiceListeners'
import { listeners as ProgressReportsServiceListeners } from './ProgressReportsServiceListeners'

export function registerListeners() {
  SessionServiceListeners()
  USMServiceListeners()
  StudentServiceListeners()
  UserCreationServiceListeners()
  ProgressReportsServiceListeners()
}
