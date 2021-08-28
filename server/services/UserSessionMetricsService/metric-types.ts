import {
  METRICS,
  METRIC_TYPES,
  Counter,
  MetricType,
  UserSessionMetrics,
  UserSessionMetricsUpdateQuery
} from '../../models/UserSessionMetrics'
import { Session } from '../../models/Session'
import { FeedbackVersionTwo } from '../../models/Feedback'
import { getEnumKeyByEnumValue } from '../../utils/enum-utils'

export interface MetricData {
  studentUSM: UserSessionMetrics
  volunteerUSM?: UserSessionMetrics
  session: Session // a completed session
  feedback?: FeedbackVersionTwo // prepopulate the feedback
}

export abstract class MetricClass<T> {
  abstract key: METRICS // metric name
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

  // determines if reviewReason=this.key should be set on this.md.session
  abstract review(): boolean
  // computes list of flags to set on this.md.session
  abstract flag(): string[]
}

export function buildSetMetricQuery(
  type: METRIC_TYPES,
  metric: METRICS,
  value: MetricType
): UserSessionMetricsUpdateQuery {
  const path = getEnumKeyByEnumValue(METRICS, metric)
  return { [`${type}.${path}`]: value }
}

export abstract class CounterMetricClass extends MetricClass<Counter> {
  protected path = METRIC_TYPES.counters

  private computeFinalValue = (usm: UserSessionMetrics): Counter => {
    const key = getEnumKeyByEnumValue(METRICS, this.key)
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
    const metric = getEnumKeyByEnumValue(METRICS, this.key)
    return { [`${this.path}.${metric}`]: finalValue }
  }
  public buildStudentUpdateQuery = (): UserSessionMetricsUpdateQuery => {
    return this.buildUpdateQuery(this.studentValue)
  }
  public buildVolunteerUpdateQuery = (): UserSessionMetricsUpdateQuery => {
    if (this.md.volunteerUSM) return this.buildUpdateQuery(this.studentValue)
  }

  abstract key: METRICS

  abstract computeUpdateValue(): Counter
  abstract review(): boolean
  abstract flag(): string[]
}

export const NO_FLAGS = [] as string[]
