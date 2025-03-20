import { FEEDBACK_EVENTS, SESSION_EVENTS } from '../../constants/events'
import * as SessionService from '../SessionService'
import * as SessionMetricsService from '../SessionMetricsService'
import register from './register'

export function listeners() {
  register(
    SESSION_EVENTS.SESSION_ENDED,
    SessionService.processSessionReported,
    'processSessionReported'
  )
  register(
    SESSION_EVENTS.SESSION_ENDED,
    SessionService.processSessionEditors,
    'processSessionEditors'
  )
  register(
    SESSION_EVENTS.SESSION_ENDED,
    SessionService.processSessionTranscript,
    'processSessionTranscript'
  )
  // The next three listeners are temporary to allow
  // a graceful migration for storing records in session-metrics
  register(
    SESSION_EVENTS.SESSION_ENDED,
    SessionMetricsService.updateSessionMetricsSessionEnd,
    'updateSessionMetricsSessionEnd'
  )
  register(
    FEEDBACK_EVENTS.FEEDBACK_SAVED,
    SessionMetricsService.updateSessionMetricsFeedbackSaved,
    'updateSessionMetricsFeedbackSaved'
  )
  register(
    SESSION_EVENTS.SESSION_REPORTED,
    SessionMetricsService.updateSessionMetricsSessionReported,
    'updateSessionMetricsSessionReported'
  )
  register(
    SESSION_EVENTS.SESSION_FLAGS_SET,
    SessionService.processCalculateMetrics,
    'processCalculateMetrics'
  )
  register(
    SESSION_EVENTS.SESSION_METRICS_CALCULATED,
    SessionService.processEmailVolunteer,
    'processEmailVolunteer'
  )
  register(
    SESSION_EVENTS.SESSION_METRICS_CALCULATED,
    SessionService.processFirstSessionCongratsEmail,
    'processFirstSessionCongratsEmail'
  )
}
