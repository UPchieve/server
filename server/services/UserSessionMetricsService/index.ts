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