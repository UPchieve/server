import {
  SESSION_EVENTS,
  FEEDBACK_EVENTS,
  USM_EVENTS
} from '../../constants/events'
import * as USMService from '../UserSessionMetricsService'
import register from './register'

export function listeners() {
  register(
    SESSION_EVENTS.SESSION_ENDED,
    USMService.prepareSessionProcessors,
    'prepareSessionProcessors'
  )
  register(
    FEEDBACK_EVENTS.FEEDBACK_SAVED,
    USMService.prepareFeedbackProcessors,
    'prepareFeedbackProcessors'
  )

  // process post-session metrics
  register(
    USM_EVENTS.SESSION_PROCESSORS_READY,
    USMService.processSessionFlags,
    'processSessionFlags'
  )
  register(
    USM_EVENTS.SESSION_PROCESSORS_READY,
    USMService.processSessionReviewReasons,
    'processSessionReviewReasons'
  )
  // process feedback metrics
  register(
    USM_EVENTS.FEEDBACK_PROCESSORS_READY,
    USMService.processFeedbackFlags,
    'processFeedbackFlags'
  )
  register(
    USM_EVENTS.FEEDBACK_PROCESSORS_READY,
    USMService.processFeedbackReviewReasons,
    'processFeedbackReviewReasons'
  )

  // save student metrics
  register(
    USM_EVENTS.SESSION_PROCESSORS_READY,
    USMService.processStudentUpdateQuery,
    'processStudentUpdateQuery'
  )
  register(
    USM_EVENTS.FEEDBACK_PROCESSORS_READY,
    USMService.processStudentUpdateQuery,
    'processStudentUpdateQuery'
  )

  // save volunteer metrics
  register(
    USM_EVENTS.SESSION_PROCESSORS_READY,
    USMService.processVolunteerUpdateQuery,
    'processVolunteerUpdateQuery'
  )
  register(
    USM_EVENTS.FEEDBACK_PROCESSORS_READY,
    USMService.processVolunteerUpdateQuery,
    'processVolunteerUpdateQuery'
  )

  // trigger side effects for the session e.g queueing apology emails
  register(
    USM_EVENTS.SESSION_PROCESSORS_READY,
    USMService.processTriggerMetricActions,
    'processTriggerMetricActions'
  )
  // trigger side effects for the session e.g queueing apology emails
  register(
    USM_EVENTS.FEEDBACK_PROCESSORS_READY,
    USMService.processTriggerMetricActions,
    'processTriggerMetricActions'
  )
}
