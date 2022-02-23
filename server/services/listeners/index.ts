import { listeners as SessionServiceListeners } from './SessionServiceListeners'
import { listeners as USMServiceListeners } from './USMServiceListeners'
import { listeners as GatesStudyServiceListeners } from './GatesStudyServiceListeners'
import { listeners as StudentServiceListeners } from './StudentServiceListeners'

export function registerListeners() {
  SessionServiceListeners()
  USMServiceListeners()
  GatesStudyServiceListeners()
  StudentServiceListeners()
}
