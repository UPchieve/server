import { listeners as StudentServiceListeners } from './StudentServiceListeners'
import { listeners as UserCreationServiceListeners } from './UserCreationServiceListeners'

export function registerListeners() {
  StudentServiceListeners()
  UserCreationServiceListeners()
}
