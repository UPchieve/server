import { SESSION_EVENTS } from '../../constants/events'
import * as SessionService from '../SessionService'
import register from './register'

export function listeners() {
  register(
    SESSION_EVENTS.SESSION_ENDED,
    SessionService.processSessionReported,
    'processSessionReported'
  )
  register(
    SESSION_EVENTS.SESSION_ENDED,
    SessionService.processAssistmentsSession,
    'processAssistmentsSession'
  )
  register(
    SESSION_EVENTS.SESSION_ENDED,
    SessionService.processSessionEditors,
    'processSessionEditors'
  )
  register(
    SESSION_EVENTS.SESSION_FLAGS_SET,
    SessionService.processCalculateMetrics,
    'processCalculateMetrics'
  )
  register(
    SESSION_EVENTS.SESSION_METRICS_CALCULATED,
    SessionService.processAddPastSession,
    'processAddPastSession'
  )
  register(
    SESSION_EVENTS.SESSION_METRICS_CALCULATED,
    SessionService.processVolunteerTimeTutored,
    'processVolunteerTimeTutored'
  )
  register(
    SESSION_EVENTS.PAST_SESSION_ADDED,
    SessionService.processEmailPartnerVolunteer,
    'processEmailPartnerVolunteer'
  )
  register(
    SESSION_EVENTS.PAST_SESSION_ADDED,
    SessionService.processFirstSessionCongratsEmail,
    'processFirstSessionCongratsEmail'
  )
}
