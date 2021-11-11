import { STUDENT_EVENTS } from '../../constants/events'
import * as GatesStudyService from '../GatesStudyService'
import register from './register'

export function listeners() {
  register(
    STUDENT_EVENTS.STUDENT_CREATED,
    GatesStudyService.processGatesQualifiedCheck,
    'processGatesQualifiedCheck'
  )
}
