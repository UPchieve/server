/* eslint @typescript-eslint/no-use-before-define: 0 */

import { Types } from 'mongoose'

import { Session, getSessionById } from '../../models/Session'
import {
  MetricType,
  executeUpdatesByUserId
} from '../../models/UserSessionMetrics'
import { MetricData, MetricClass } from './metric-types'
import { METRICS_CLASSES } from './metrics'

// TODO: write tests for this whole file

async function buildMetricData(session: Session): Promise<MetricData> {
  // TODO: implement
  throw new Error(`not implemented ${session}`)
}

// TODO: register this is a listener on 'end-session' event to run 3 minutes after
export async function processAllMetrics(
  sessionId: Types.ObjectId
): Promise<void> {
  const session = await getSessionById(sessionId)
  const md = await buildMetricData(session)

  const processors: MetricClass<MetricType>[] = []
  for (const MetricProcessorClass of METRICS_CLASSES) {
    processors.push(new MetricProcessorClass(md))
  }

  const promises = [
    processFlags(session, processors),
    processReviewReasons(session, processors),
    processMetricUpdates(session, processors)
  ]

  await Promise.all(promises) // TODO: error handling
}

async function processFlags(
  session: Session,
  metricProcessors: MetricClass<MetricType>[]
): Promise<void> {
  const flags = []
  for (const processor of metricProcessors) {
    flags.concat(processor.flag())
  }
  // TODO: set flags on session object
}

async function processReviewReasons(
  session: Session,
  metricProcessors: MetricClass<MetricType>[]
): Promise<void> {
  const reviewReasons = []
  for (const processor of metricProcessors) {
    processor.review() && reviewReasons.push(processor.key)
  }
  // TODO: set review reasons on session object
}

// helper to execute updates for a single user
async function userUpdates(
  user: Types.ObjectId,
  metricProcessors: MetricClass<MetricType>[]
): Promise<void> {
  const updates = []
  for (const processor of metricProcessors) {
    updates.push(processor.buildStudentUpdateQuery())
  }
  await executeUpdatesByUserId(user, updates)
}

async function processMetricUpdates(
  session: Session,
  metricProcessors: MetricClass<MetricType>[]
): Promise<void> {
  await userUpdates(session.student as Types.ObjectId, metricProcessors)
  if (session.volunteer)
    await userUpdates(session.volunteer as Types.ObjectId, metricProcessors)
}
