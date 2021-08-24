import { Types } from 'mongoose'

import { UserSessionMetrics } from '../../models/UserSessionMetrics'
import { MetricData, METRIC_PROCESSORS } from './Metrics'

async function buildMetricData(sessionId: Types.ObjectId): Promise<MetricData> {
  throw new Error('not implemented')
}

async function pseudoCodeUpdateMetrics(
  sessionId: Types.ObjectId
): Promise<void> {
  const md = await buildMetricData(sessionId)
  for (const processor of METRIC_PROCESSORS) {
    const value = processor.getUpdateValue(md)
    // TODO: calling each update individually leads to many small db writes
    // if we somehow aggregate the updates and execute them as a single query we'd get much better performance
    if (value) await processor.update(md, value)
  }
}

async function pseudoCodeGetReasonsForReview(
  usm: UserSessionMetrics
): Promise<string[]> {
  const reasons = []
  for (const processor of METRIC_PROCESSORS) {
    if (processor.review(usm[processor.path][processor.key]))
      reasons.push(processor.key)
  }
  return reasons
}

/* alternative using classes

export interface SessionMetricClass<T> {
  key: string,
  needsFeedback: boolean,
  getUpdateValue(): T,  // internal function for updating metric
  update(val?: T): Promise<void>
  review(val: T): boolean,
}

class AbsentStudent implements SessionMetricClass<Counter> {
  public key = METRICS.absentStudent
  public needsFeedback = false

  private md: MetricData

  constructor(md: MetricData) {
    this.md = md
  }

  public getUpdateValue = () => {
    if (this.md.session.volunteerJoinedAt) {
      for (const msg of this.md.session.messages) {
        if (msg.user === this.md.session.student &&
            msg.createdAt > this.md.session.volunteerJoinedAt)
          return FALSE
      }
      return TRUE
    }
    return FALSE
  }

  public update = async () => {
    if (this.getUpdateValue()) {
      await incrementCounterByUserId(this.md.user, this.key)
      await updateFlags(this.md.session._id, [this.key])
    }
  }

  public review = (val: Counter) => val >= 4
}

async function processAllMetrics() {
  const md = await buildMetricData(sessionId)
  for (const MetricProcessorClass of METRICS_PROCESSORS) {
    const processor = new MetricProcessorClass(md)
    await processor.update()
  }
}
*/
