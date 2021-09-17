import {
  METRIC_TYPES,
  Counter,
  MetricType,
  UserSessionMetrics,
  UserSessionMetricsUpdateQuery
} from '../../models/UserSessionMetrics'
import { Session } from '../../models/Session'
import { FeedbackVersionTwo } from '../../models/Feedback'
import { getEnumKeyByEnumValue } from '../../utils/enum-utils'
import { USER_SESSION_METRICS } from '../../constants'

export function computeSetMetricQuery(
  type: METRIC_TYPES,
  metric: USER_SESSION_METRICS,
  value: MetricType
): UserSessionMetricsUpdateQuery {
  const path = getEnumKeyByEnumValue(USER_SESSION_METRICS, metric)
  return { [`${type}.${path}`]: value }
}

export interface UpdateValueData {
  session: Session // a completed session
  feedback?: FeedbackVersionTwo // prepopulate the feedback
}

export interface ProcessorData<T extends MetricType> {
  session: Session
  studentUSM: UserSessionMetrics
  volunteerUSM?: UserSessionMetrics
  value: T
}

export interface MetricProcessor<T extends MetricType> {
  key: USER_SESSION_METRICS // metric name
  requiresFeedback: boolean
  // computes value to update metric based on uvd.session/feedback
  computeUpdateValue(uvd: UpdateValueData): T
  // compute db query to execute update to the student USM object
  computeStudentUpdateQuery(pd: ProcessorData<T>): UserSessionMetricsUpdateQuery
  // compute db query to execute update to the volunteer USM object
  computeVolunteerUpdateQuery(
    pd: ProcessorData<T>
  ): UserSessionMetricsUpdateQuery
  // computes list of review reasons to be set on session
  computeReviewReason(pd: ProcessorData<T>): USER_SESSION_METRICS[]
  // computes list of flags to set on session
  computeFlag(pd: ProcessorData<T>): USER_SESSION_METRICS[]
  // computes list of flags to set on session
  triggerActions(pd: ProcessorData<T>): Promise<void>[]
}

export abstract class CounterMetricProcessor
  implements MetricProcessor<Counter> {
  // common attributes shared by all counter metrics
  protected static path = METRIC_TYPES.counters

  protected computeFinalValue = (
    usm: UserSessionMetrics,
    value: Counter
  ): Counter => {
    if (!usm) return 0
    const key = getEnumKeyByEnumValue(USER_SESSION_METRICS, this.key)
    const finalValue = usm[CounterMetricProcessor.path][key] + value
    return finalValue
  }

  public computeStudentUpdateQuery = (
    pd: ProcessorData<Counter>
  ): UserSessionMetricsUpdateQuery => {
    const metric = getEnumKeyByEnumValue(USER_SESSION_METRICS, this.key)
    const finalValue = this.computeFinalValue(pd.studentUSM, pd.value)
    return { [`${CounterMetricProcessor.path}.${metric}`]: finalValue }
  }
  public computeVolunteerUpdateQuery = (
    pd: ProcessorData<Counter>
  ): UserSessionMetricsUpdateQuery => {
    if (!pd.volunteerUSM) return {}
    const metric = getEnumKeyByEnumValue(USER_SESSION_METRICS, this.key)
    const finalValue = this.computeFinalValue(pd.volunteerUSM, pd.value)
    return { [`${CounterMetricProcessor.path}.${metric}`]: finalValue }
  }

  // must be implemented by subclasses
  public abstract key: USER_SESSION_METRICS
  public abstract requiresFeedback: boolean
  public abstract computeUpdateValue(uvd: UpdateValueData): Counter
  public abstract computeReviewReason(
    pd: ProcessorData<Counter>
  ): USER_SESSION_METRICS[]
  public abstract computeFlag(
    pd: ProcessorData<Counter>
  ): USER_SESSION_METRICS[]
  public abstract triggerActions(pd: ProcessorData<Counter>): Promise<void>[]
}

export const NO_FLAGS = [] as USER_SESSION_METRICS[]

export const NO_ACTIONS = []
