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

export interface MetricData {
  studentUSM: UserSessionMetrics
  volunteerUSM?: UserSessionMetrics
  session: Session // a completed session
  feedback?: FeedbackVersionTwo // prepopulate the feedback
}

export abstract class MetricClass<T> {
  abstract key: USER_SESSION_METRICS // metric name
  protected path: METRIC_TYPES // path to USM data - usm.${path}.key

  protected md: MetricData // data for computations

  protected _updateValue: T // computed update value
  protected _studentValue: T // computed final value for student
  protected _volunteerValue: T // computed final value for volunteer

  public get updateValue(): T {
    return this._updateValue
  }
  public get studentValue(): T {
    return this._studentValue
  }
  public get volunteerValue(): T {
    return this._volunteerValue
  }

  // initialize from md
  protected setup = () => {
    this._updateValue = this.computeUpdateValue()
    this._studentValue = this.computeStudentValue()
    this._volunteerValue = this.computeVolunteerValue()
  }

  constructor(md: MetricData) {
    this.md = md
  }

  // computes this.finalValue based on this.studentUSM
  protected abstract computeStudentValue(): T
  // computes this.finalValue based on this.volunteerUSM
  protected abstract computeVolunteerValue(): T
  // computes value to update metric based on this.md.session/feedback
  protected abstract computeUpdateValue(): T

  // generate db query to execute update to student USM object
  abstract buildStudentUpdateQuery(): UserSessionMetricsUpdateQuery
  // generate db query to execute update to student USM object
  abstract buildVolunteerUpdateQuery(): UserSessionMetricsUpdateQuery

  // computes list of review reasons to be set on this.md.session
  abstract reviewReason(): USER_SESSION_METRICS[]
  // computes list of flags to set on this.md.session
  abstract flag(): USER_SESSION_METRICS[]
}

export function buildSetMetricQuery(
  type: METRIC_TYPES,
  metric: USER_SESSION_METRICS,
  value: MetricType
): UserSessionMetricsUpdateQuery {
  const path = getEnumKeyByEnumValue(USER_SESSION_METRICS, metric)
  return { [`${type}.${path}`]: value }
}

export abstract class CounterMetricClass extends MetricClass<Counter> {
  protected path = METRIC_TYPES.counters

  private computeFinalValue = (usm: UserSessionMetrics): Counter => {
    const key = getEnumKeyByEnumValue(USER_SESSION_METRICS, this.key)
    const finalValue = usm[this.path][key] + this.updateValue
    return finalValue
  }
  protected computeStudentValue = (): Counter => {
    return this.computeFinalValue(this.md.studentUSM)
  }
  protected computeVolunteerValue = (): Counter => {
    if (this.md.volunteerUSM)
      return this.computeFinalValue(this.md.volunteerUSM)
  }

  private buildUpdateQuery = (
    finalValue: Counter
  ): UserSessionMetricsUpdateQuery => {
    const metric = getEnumKeyByEnumValue(USER_SESSION_METRICS, this.key)
    return { [`${this.path}.${metric}`]: finalValue }
  }
  public buildStudentUpdateQuery = (): UserSessionMetricsUpdateQuery => {
    return this.buildUpdateQuery(this.studentValue)
  }
  public buildVolunteerUpdateQuery = (): UserSessionMetricsUpdateQuery => {
    if (this.md.volunteerUSM) return this.buildUpdateQuery(this.studentValue)
  }

  abstract key: USER_SESSION_METRICS

  abstract computeUpdateValue(): Counter
  abstract reviewReason(): USER_SESSION_METRICS[]
  abstract flag(): USER_SESSION_METRICS[]
}

export const NO_FLAGS = [] as USER_SESSION_METRICS[]
