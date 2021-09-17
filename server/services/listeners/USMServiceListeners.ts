import {
  SESSION_EVENTS,
  FEEDBACK_EVENTS,
  USM_EVENTS
} from '../../constants/events'
import { emitter } from '../EventsService'
import * as USMService from '../UserSessionMetricsService'

export function listeners() {
  emitter.on(SESSION_EVENTS.SESSION_ENDED, USMService.prepareSessionProcessors)
  emitter.on(
    FEEDBACK_EVENTS.FEEDBACK_SAVED,
    USMService.prepareFeedbackProcessors
  )

  // process post-session metrics
  emitter.on(
    USM_EVENTS.SESSION_PROCESSORS_READY,
    USMService.processSessionFlags
  )
  emitter.on(
    USM_EVENTS.SESSION_PROCESSORS_READY,
    USMService.processSessionReviewReasons
  )
  // process feedback metrics
  emitter.on(
    USM_EVENTS.FEEDBACK_PROCESSORS_READY,
    USMService.processFeedbackFlags
  )
  emitter.on(
    USM_EVENTS.FEEDBACK_PROCESSORS_READY,
    USMService.processFeedbackReviewReasons
  )

  // save student metrics
  emitter.on(
    USM_EVENTS.SESSION_PROCESSORS_READY,
    USMService.processStudentUpdateQuery
  )
  emitter.on(
    USM_EVENTS.FEEDBACK_PROCESSORS_READY,
    USMService.processStudentUpdateQuery
  )

  // save volunteer metrics
  emitter.on(
    USM_EVENTS.SESSION_PROCESSORS_READY,
    USMService.processVolunteerUpdateQuery
  )
  emitter.on(
    USM_EVENTS.FEEDBACK_PROCESSORS_READY,
    USMService.processVolunteerUpdateQuery
  )

  // trigger side effects for the session e.g queueing apology emails
  emitter.on(
    USM_EVENTS.SESSION_PROCESSORS_READY,
    USMService.processTriggerMetricActions
  )
  // trigger side effects for the session e.g queueing apology emails
  emitter.on(
    USM_EVENTS.FEEDBACK_PROCESSORS_READY,
    USMService.processTriggerMetricActions
  )
}
