import { SESSION_EVENTS } from '../../constants/events'
import * as IncentiveProgramService from '../IncentiveProgramService'
import register from './register'

export function listeners() {
  register(
    SESSION_EVENTS.SESSION_METRICS_CALCULATED,
    IncentiveProgramService.queueFallIncentiveSessionQualificationJob,
    'queueFallIncentiveSessionQualificationJob'
  )
}
