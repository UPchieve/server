import { Types } from 'mongoose'

import { Session, getSessionById } from '../../models/Session'
import {
  MetricType,
  executeUpdatesByUserId,
  UserSessionMetrics
} from '../../models/UserSessionMetrics'
import { MetricData, MetricClass } from './metric-types'
import { METRICS_CLASSES } from './metrics'

enum USER {
  student,
  volunteer
}

async function buildMetricData(
  session: Session,
  user: USER
): Promise<MetricData> {
  // TODO: implement
  throw new Error('not implemented')
}

// TODO: branch for (if volunteer) better
async function processAllMetrics(sessionId: Types.ObjectId): Promise<void> {
  const processors: MetricClass<MetricType>[] = []

  const session = await getSessionById(sessionId)
  const studentMd = await buildMetricData(session, USER.student)
  let volunteerMd: MetricData
  if (session.volunteer)
    volunteerMd = await buildMetricData(session, USER.volunteer)

  for (const MetricProcessorClass of METRICS_CLASSES) {
    processors.push(new MetricProcessorClass(studentMd))
    if (session.volunteer)
      processors.push(new MetricProcessorClass(volunteerMd))
  }

  const promises = [
    processFlags(session, processors),
    processReviewReasons(session, processors),
    processMetricUpdates(studentMd.usm, processors),
    processMetricUpdates(volunteerMd.usm, processors)
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

async function processMetricUpdates(
  usm: UserSessionMetrics,
  metricProcessors: MetricClass<MetricType>[]
): Promise<void> {
  const updates = []
  for (const processor of metricProcessors) {
    updates.push(processor.getUpdateQuery())
  }
  await executeUpdatesByUserId(usm.user as Types.ObjectId, updates)
}
