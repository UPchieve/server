import { SESSION_EVENTS } from '../../constants/events'
import * as ProgressReportsService from '../ProgressReportsService'
import register from './register'

export function listeners() {
  register(
    SESSION_EVENTS.SESSION_METRICS_CALCULATED,
    ProgressReportsService.queueGenerateProgressReportForUser,
    'queueGenerateProgressReportForUser'
  )
}
