import { SESSION_EVENTS } from '../../constants/events'
import * as GatesStudyService from '../GatesStudyService'
import register from './register'

export function listeners() {
  register(
    SESSION_EVENTS.SESSION_ENDED,
    GatesStudyService.processGatesQualifiedSession,
    'processGatesQualifiedSession'
  )
}
