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
  usm: UserSessionMetrics // existing metrics object
  session: Session // a completed session
  feedback?: FeedbackVersionTwo // prepopulate the feedback
}

export abstract class MetricClass<T> {
  abstract key: METRICS // metric name
  protected path: METRIC_TYPES // path to USM data - usm.${path}.key

  protected md: MetricData // data for computations
  protected updateValue: T // computed update value
  protected finalValue: T // computed final value

  // getter for final value
  public getFinalValue = () => this.finalValue
  // initialize from md
  protected setup = () => {
    this.updateValue = this.computeUpdateValue()
    this.finalValue = this.computeFinalValue()
  }

  constructor(md: MetricData) {
    this.md = md
  }

  // computes this.finalValue based on this.updateValue
  protected abstract computeFinalValue(): T
  // computes value to update metric based on this.md
  abstract computeUpdateValue(): T
  // generate db query to execute update to USM object
  abstract getUpdateQuery(): UserSessionMetricsUpdateQuery
  // determines if reviewReason=this.key should be set
  abstract review(): boolean
  // computes list of flags to set on session based on metric calculation
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

  protected computeFinalValue = (): Counter => {
    const key = getEnumKeyByEnumValue(METRICS, this.key)
    const finalValue = this.md.usm[this.path][key] + this.updateValue
    return finalValue
  }

  public getUpdateQuery = (): UserSessionMetricsUpdateQuery => {
    const metric = getEnumKeyByEnumValue(METRICS, this.key)
    return { [`${this.path}.${metric}`]: this.finalValue }
  }

  abstract key: METRICS

  abstract computeUpdateValue(): Counter
  abstract review(): boolean
  abstract flag(): string[]
}

export const NO_FLAGS = [] as string[]
