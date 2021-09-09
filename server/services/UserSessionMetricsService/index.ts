/* eslint @typescript-eslint/no-use-before-define: 0 */

import { Types } from 'mongoose'

import {
  Session,
  getSessionById,
  updateFlags,
  updateReviewReasons
} from '../../models/Session'
import {
  UserSessionMetrics,
  UserSessionMetricsUpdateQuery,
  MetricType,
  getByUserId,
  executeUpdatesByUserId
} from '../../models/UserSessionMetrics'
import {
  USER_SESSION_METRICS,
  SESSION_EVENTS,
  USM_EVENTS
} from '../../constants'
import { getFeedbackBySessionId } from '../../models/Feedback'
import { emitter } from '../EventsService'
import logger from '../../logger'
import { safeAsync } from '../../utils/safe-async'
import { SESSION_METRICS_CLASSES, FEEDBACK_METRICS_CLASSES } from './metrics'
import { MetricData, MetricClass } from './metric-types'

export async function buildMetricData(session: Session): Promise<MetricData> {
  const studentUSM = await getByUserId(session.student as Types.ObjectId)
  let volunteerUSM: UserSessionMetrics
  if (session.volunteer)
    volunteerUSM = await getByUserId(session.volunteer as Types.ObjectId)
  const feedback = await getFeedbackBySessionId(session._id as Types.ObjectId)

  return {
    studentUSM,
    volunteerUSM,
    session,
    feedback
  } as MetricData
}

interface MetricProcessorPayload {
  session: Session
  processors: MetricClass<MetricType>[]
}

// registered as listener on session-ended
export async function prepareSessionProcessors(
  sessionId: Types.ObjectId | string
): Promise<void> {
  await prepareMetrics(SESSION_METRICS_CLASSES, sessionId)
}

// registered as listener on feedback-saved
export async function prepareFeedbackProcessors(
  sessionId: Types.ObjectId | string
): Promise<void> {
  await prepareMetrics(FEEDBACK_METRICS_CLASSES, sessionId)
}

export async function prepareMetrics(
  metrics: (new (md: MetricData) => MetricClass<MetricType>)[],
  sessionId: Types.ObjectId | string
): Promise<void> {
  const session = await getSessionById(sessionId)
  const md = await buildMetricData(session)

  const processors: MetricClass<MetricType>[] = []
  for (const MetricProcessorClass of metrics) {
    try {
      processors.push(new MetricProcessorClass(md))
    } catch (err) {
      logger.error(
        `Metrics processor ${MetricProcessorClass.name} failed to construct`
      )
    }
  }

  emitter.emit(USM_EVENTS.PROCESSORS_READY, {
    session,
    processors
  } as MetricProcessorPayload)
}

function metricProcessorFactory<T>(
  opName: keyof MetricClass<MetricType>,
  reduce: (acc: any[]) => T,
  fn: (val: T, session: Session) => Promise<void>
): (payload: MetricProcessorPayload) => Promise<void> {
  return async (payload: MetricProcessorPayload): Promise<void> => {
    const { session, processors } = payload
    const acc = []
    const errors = []
    for (const processor of processors) {
      if (
        processor.hasOwnProperty(opName) &&
        typeof processor[opName] === 'function'
      ) {
        try {
          acc.push((processor[opName] as Function)())
        } catch (err) {
          errors.push(`${processor.key}->${opName} failed`)
        }
      }
    }
    const result = reduce(acc)
    const { error } = await safeAsync(fn(result, session))
    if (error) errors.push(error.message)
    logger.error(`Errors processing ${opName}:\n${errors.join('\n')}`)
  }
}

// registered as listener on processors-ready
export const processFlags = metricProcessorFactory(
  'flag',
  (acc: USER_SESSION_METRICS[]): USER_SESSION_METRICS[] => acc.flat(),
  async (flags: USER_SESSION_METRICS[], session: Session): Promise<void> => {
    try {
      await updateFlags(session._id as Types.ObjectId, flags)
      emitter.emit(SESSION_EVENTS.FLAGS_SET, session._id.toString())
    } catch (err) {
      throw new Error(`Failed to set flags for session ${session._id} - ${err}`)
    }
  }
)

// registered as listener on processors-ready
export const processReviewReasons = metricProcessorFactory(
  'reviewReason',
  (acc: USER_SESSION_METRICS[]): USER_SESSION_METRICS[] => acc.flat(),
  async (reasons: USER_SESSION_METRICS[], session: Session): Promise<void> => {
    try {
      await updateReviewReasons(session._id as Types.ObjectId, reasons)
      emitter.emit(SESSION_EVENTS.REVIEW_REASONS_SET, session._id.toString())
    } catch (err) {
      throw new Error(
        `Failed to set review reason for session ${session._id} - ${err}`
      )
    }
  }
)

// registered as listener on processors-ready
export const processStudentMetricUpdate = metricProcessorFactory(
  'buildStudentUpdateQuery',
  (acc: UserSessionMetricsUpdateQuery[]): UserSessionMetricsUpdateQuery[] =>
    acc,
  async (
    updates: UserSessionMetricsUpdateQuery[],
    session: Session
  ): Promise<void> => userUpdates(session.student as Types.ObjectId, updates)
)

// registered as listener on processors-ready
export const processVolunteerMetricUpdate = metricProcessorFactory(
  'buildVolunteerUpdateQuery',
  (acc: UserSessionMetricsUpdateQuery[]): UserSessionMetricsUpdateQuery[] =>
    acc,
  async (
    updates: UserSessionMetricsUpdateQuery[],
    session: Session
  ): Promise<void> => {
    if (session.volunteer)
      await userUpdates(session.volunteer as Types.ObjectId, updates)
  }
)

// helper to execute updates for a single user
async function userUpdates(
  user: Types.ObjectId,
  updates: UserSessionMetricsUpdateQuery[]
): Promise<void> {
  try {
    await executeUpdatesByUserId(user, updates)
  } catch (err) {
    throw new Error(`Failed to update USM for user ${user} - ${err}`)
  }
}
