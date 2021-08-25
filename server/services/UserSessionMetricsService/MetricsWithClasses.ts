import { Types } from 'mongoose'

import {
  METRICS,
  UserSessionMetricsUpdateQuery,
  buildIncrementCounterQuery,
  executeUpdatesByUserId,
  UserSessionMetrics
} from '../../models/UserSessionMetrics'
import { Session } from '../../models/Session'
import { FeedbackVersionTwo } from '../../models/Feedback'
import { FEEDBACK_VERSIONS } from '../../constants'

/*
 * alternative using classes
 * Class provides access to 'this.key' and 'this.getUpdateValue' to couple them better
 * avoids some code duplication and consumer code needing to check value truthiness before updating
 * 
 * Update now returns a query that can be combined for a single execute
 * Flag and Review functions need to be called individually now
*/

export type Counter = number
const TRUE = 1 as Counter
const FALSE = 0 as Counter

interface MetricDataForClass {
  usm: UserSessionMetrics
  session: Session // a completed session
  feedback?: FeedbackVersionTwo // prepopulate the feedback
}

interface SessionMetric<T> {
  key: string,
  getUpdateValue(): T,
  getUpdateQuery(val?: T): UserSessionMetricsUpdateQuery
  review(val: T): boolean,
  flag?(val: T): string[]
}

abstract class MetricClass<T> implements SessionMetric<T> {
  public path: string
  public md: MetricDataForClass

  constructor(md: MetricDataForClass) {
    this.md = md
  }

  abstract key: string

  abstract getUpdateValue(): T
  abstract getUpdateQuery(): UserSessionMetricsUpdateQuery
  abstract review(): boolean
  abstract flag?(): string[]
}

abstract class CounterMetricClass implements MetricClass<Counter> {
  public path = 'counter'
  public md: MetricDataForClass

  constructor(md: MetricDataForClass) {
    this.md = md
  }

  abstract key: METRICS

  abstract getUpdateValue(): Counter
  abstract getUpdateQuery(): UserSessionMetricsUpdateQuery
  abstract review(): boolean
  abstract flag?(): string[]
}

class AbsentStudent extends CounterMetricClass {
  public key = METRICS.absentStudent

  public getUpdateValue = () => {
    if (this.md.session.volunteerJoinedAt) {
      for (const msg of this.md.session.messages) {
        if (msg.user === this.md.session.student &&
            msg.createdAt > this.md.session.volunteerJoinedAt)
          return 0
      }
      return 1
    }
    return 0
  }

  public getUpdateQuery = (): UserSessionMetricsUpdateQuery => {
    if (this.getUpdateValue()) {
      return buildIncrementCounterQuery(this.key)
    }
  }

  public review = () => this.md.usm[this.path][this.key] >= 4

  public flag = () => [this.key]
}

class HasHadTechnicalIssues extends CounterMetricClass {
  public key = METRICS.hasHadTechnicalIssues

  public getUpdateValue = () => {
    if (this.md.feedback && this.md.feedback.versionNumber === FEEDBACK_VERSIONS.TWO) {
      if (this.md.feedback.volunteerFeedback) {
        for (const value of Object.values(
          this.md.feedback.volunteerFeedback['session-obstacles']
        )) {
          if (value === 0) return TRUE
        }
      }
    }
    return FALSE
  }

  public getUpdateQuery = (): UserSessionMetricsUpdateQuery => {
    if (this.getUpdateValue()) {
      return buildIncrementCounterQuery(this.key)
    }
  }

  public review = () => false

  public flag = () => []
}

const METRICS_CLASSES = [AbsentStudent, HasHadTechnicalIssues]

async function buildMetricData(sessionId: Types.ObjectId): Promise<MetricDataForClass> {
  throw new Error('not implemented')
}

async function processAllMetrics(sessionId: Types.ObjectId): Promise<void> {
  const updates = []
  const flags = []
  const reviewReasons = []

  const md = await buildMetricData(sessionId)
  for (const MetricProcessorClass of METRICS_CLASSES) {
    const processor = new MetricProcessorClass(md)
    updates.push(processor.getUpdateQuery())
    flags.concat(processor.flag())
    if (processor.review()) reviewReasons.push(processor.key)
  }
  await executeUpdatesByUserId(md.session.student as Types.ObjectId, updates)
  if (md.session.volunteer)
    await executeUpdatesByUserId(md.session.volunteer as Types.ObjectId, updates)
  
  // TODO: set flags on session object
  // TODO: set review reasons on session object
}
