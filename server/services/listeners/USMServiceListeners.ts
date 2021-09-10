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

  emitter.on(USM_EVENTS.PROCESSORS_READY, USMService.processFlags)
  emitter.on(USM_EVENTS.PROCESSORS_READY, USMService.processStudentMetricUpdate)
  emitter.on(USM_EVENTS.PROCESSORS_READY, USMService.processVolunteerMetricUpdate)
  emitter.on(USM_EVENTS.PROCESSORS_READY, USMService.processReviewReasons)
}
