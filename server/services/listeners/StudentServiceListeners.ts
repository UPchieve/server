import { STUDENT_EVENTS } from '../../constants/events'
import * as StudentService from '../StudentService'
import register from './register'

export function listeners() {
  register(
    STUDENT_EVENTS.STUDENT_CREATED,
    StudentService.processStudentTrackingPostHog,
    'processStudentTrackingPostHog'
  )
}
