import { FEEDBACK_EVENTS, SESSION_EVENTS } from '../../constants/events'
import { emitter } from '../EventsService'
import * as SessionService from '../SessionService'

export function listeners() {
  emitter.on(
    SESSION_EVENTS.SESSION_ENDED,
    SessionService.processSessionReported
  )
  emitter.on(
    SESSION_EVENTS.SESSION_ENDED,
    SessionService.processAssistmentsSession
  )
  emitter.on(SESSION_EVENTS.SESSION_ENDED, SessionService.processSessionEditors)
  emitter.on(SESSION_EVENTS.SESSION_ENDED, SessionService.processSetFlags)
  emitter.on(SESSION_EVENTS.FLAGS_SET, SessionService.processCalculateMetrics)
  emitter.on(
    SESSION_EVENTS.SESSION_METRICS_CALCULATED,
    SessionService.processAddPastSession
  )
  emitter.on(
    SESSION_EVENTS.SESSION_METRICS_CALCULATED,
    SessionService.processVolunteerTimeTutored
  )
  emitter.on(
    SESSION_EVENTS.PAST_SESSION_ADDED,
    SessionService.processEmailPartnerVolunteer
  )
  emitter.on(
    SESSION_EVENTS.PAST_SESSION_ADDED,
    SessionService.processFirstSessionCongratsEmail
  )
  emitter.on(
    FEEDBACK_EVENTS.FEEDBACK_SAVED,
    SessionService.processFeedbackSaved
  )
}
