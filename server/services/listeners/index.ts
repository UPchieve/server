import { listeners as SessionServiceListeners } from './SessionServiceListeners'
import { listeners as USMServiceListeners } from './USMServiceListeners'
import { listeners as GatesStudyServiceListeners } from './GatesStudyServiceListeners'

export function registerListeners() {
  SessionServiceListeners()
  USMServiceListeners()
  GatesStudyServiceListeners()
}
