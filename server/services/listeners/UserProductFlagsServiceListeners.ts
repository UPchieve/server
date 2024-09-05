import { SESSION_EVENTS } from '../../constants/events'
import * as UserProductFlagsService from '../UserProductFlagsService'
import register from './register'

export function listeners() {
  register(
    SESSION_EVENTS.SESSION_METRICS_CALCULATED,
    UserProductFlagsService.queueFallIncentiveLeavingMoneyOnTableJob,
    'queueFallIncentiveLeavingMoneyOnTableJob'
  )
  register(
    SESSION_EVENTS.SESSION_METRICS_CALCULATED,
    UserProductFlagsService.queueFallIncentiveSessionQualificationJob,
    'queueFallIncentiveSessionQualificationJob'
  )
}
