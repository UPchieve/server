import { Ulid } from '../../models/pgUtils'
import {
  Session,
  getMessagesForFrontend,
  getSessionById,
  updateSessionFlagsById,
  updateSessionReviewReasonsById,
} from '../../models/Session'
import {
  UserSessionMetrics,
  UserSessionMetricsUpdateQuery,
  getUSMByUserId,
  executeUSMUpdatesByUserId,
} from '../../models/UserSessionMetrics'
import {
  USER_SESSION_METRICS,
  SESSION_EVENTS,
  USM_EVENTS,
} from '../../constants'
import { emitter } from '../EventsService'
import logger from '../../logger'
import { safeAsync } from '../../utils/safe-async'
import { METRIC_PROCESSORS, MetricProcessorOutputs } from './metrics'
import {
  UpdateValueData,
  ProcessorData,
  MetricProcessor,
  CounterMetricProcessor,
} from './types'
import { asString } from '../../utils/type-utils'
import {
  getPostsessionSurveyResponsesForSessionMetrics,
  PostsessionSurveyResponse,
} from '../../models/Survey'

export interface MetricProcessorPayload {
  session: Session
  studentUSM: UserSessionMetrics
  volunteerUSM?: UserSessionMetrics
  outputs: MetricProcessorOutputs
}

const SESSION_METRICS_PROCESSORS: CounterMetricProcessor[] = []
const FEEDBACK_METRICS_PROCESSORS: CounterMetricProcessor[] = []
const REPORT_METRICS_PROCESSORS: CounterMetricProcessor[] = []
for (const metric of Object.values(METRIC_PROCESSORS)) {
  if (metric.requiresFeedback) FEEDBACK_METRICS_PROCESSORS.push(metric)
  // Reported metric is run separately from others since isReported is not guaranteed to be accurate at session end
  else if (metric.key === 'Reported') REPORT_METRICS_PROCESSORS.push(metric)
  else SESSION_METRICS_PROCESSORS.push(metric)
}

// registered as listener on session-ended
export async function prepareSessionProcessors(sessionId: Ulid): Promise<void> {
  const {
    session,
    studentUSM,
    volunteerUSM,
    surveyResponses,
  } = await getValuesToPrepareMetrics(sessionId)
  const payload = await prepareMetrics(
    SESSION_METRICS_PROCESSORS,
    session,
    studentUSM,
    volunteerUSM,
    surveyResponses
  )
  emitter.emit(USM_EVENTS.SESSION_PROCESSORS_READY, payload)
}

// registered as listener on feedback-saved
export async function prepareFeedbackProcessors(
  sessionId: Ulid
): Promise<void> {
  const {
    session,
    studentUSM,
    volunteerUSM,
    surveyResponses,
  } = await getValuesToPrepareMetrics(sessionId)
  const payload = await prepareMetrics(
    FEEDBACK_METRICS_PROCESSORS,
    session,
    studentUSM,
    volunteerUSM,
    surveyResponses
  )
  emitter.emit(USM_EVENTS.FEEDBACK_PROCESSORS_READY, payload)
}

// registered as listener on session-reported
export async function prepareReportProcessors(sessionId: Ulid): Promise<void> {
  const {
    session,
    studentUSM,
    volunteerUSM,
    surveyResponses,
  } = await getValuesToPrepareMetrics(asString(sessionId))

  const payload = await prepareMetrics(
    REPORT_METRICS_PROCESSORS,
    session,
    studentUSM,
    volunteerUSM,
    surveyResponses
  )
  emitter.emit(USM_EVENTS.REPORT_PROCESSORS_READY, payload)
}

export async function getValuesToPrepareMetrics(
  sessionId: Ulid
): Promise<{
  session: Session
  studentUSM: UserSessionMetrics
  volunteerUSM?: UserSessionMetrics
  surveyResponses?: PostsessionSurveyResponse[]
}> {
  const session = await getSessionById(sessionId)
  const surveyResponses = await getPostsessionSurveyResponsesForSessionMetrics(
    sessionId
  )
  const uvd = { session } as UpdateValueData

  const studentUSM = await getUSMByUserId(uvd.session.studentId)
  if (!studentUSM)
    throw new Error(`Could not find USM for student ${uvd.session.studentId}`)
  let volunteerUSM: UserSessionMetrics | undefined
  if (uvd.session.volunteerId) {
    volunteerUSM = await getUSMByUserId(uvd.session.volunteerId)
    if (!volunteerUSM)
      throw new Error(
        `Could not find USM for volunteer ${uvd.session.volunteerId}`
      )
  }
  return {
    session,
    studentUSM,
    volunteerUSM,
    surveyResponses,
  }
}

export async function prepareMetrics(
  metrics: MetricProcessor[],
  session: Session,
  studentUSM: UserSessionMetrics,
  volunteerUSM?: UserSessionMetrics,
  surveyResponses?: PostsessionSurveyResponse[]
): Promise<MetricProcessorPayload> {
  const messages = await getMessagesForFrontend(session.id)
  const uvd = { session, messages, surveyResponses }
  const outputs: MetricProcessorOutputs = {}
  for (const metric of metrics) {
    try {
      outputs[
        metric.constructor.name as keyof MetricProcessorOutputs
      ] = metric.computeUpdateValue(uvd)
    } catch (err) {
      logger.error(
        `Metrics processor ${metric.constructor.name} failed to compute update value`
      )
    }
  }
  return {
    session: uvd.session,
    studentUSM,
    volunteerUSM,
    outputs,
  } as MetricProcessorPayload
}

/**
 * Provides a standard interface for iterating over a set of MetricProcessor
 * Executes a given MetricProcessor method for all metrics and accumulates results
 * Flatten results by providing a reducer and execute any side-effects asynchronously
 *
 * Register functions created by factory on a '{foo}-processors-ready' event
 *
 * @param {string} opName name of method on MetricProcessor subtype
 * @param {function} reduce transform opName output into desired shape for side-effect processing
 * @param {function} fn execute side effects based on output of reduce and the current session/usm
 * @returns {function} metric processor event handler function
 */
export function metricProcessorFactory<T>(
  processors: { [key: string]: MetricProcessor },
  opName: keyof MetricProcessor,
  reduce: (acc: any[]) => T,
  fn: (val: T, session: Session) => Promise<void>
): (payload: MetricProcessorPayload) => Promise<void> {
  return async (payload: MetricProcessorPayload): Promise<void> => {
    const { session, studentUSM, volunteerUSM, outputs } = payload

    const acc: any[] = []
    const errors: string[] = []
    for (const key in outputs) {
      const processor = processors[key]
      if (
        processor &&
        processor.hasOwnProperty(opName) &&
        typeof processor[opName] === 'function'
      ) {
        const processorData = {
          session,
          studentUSM,
          volunteerUSM,
          value: outputs[key as keyof MetricProcessorOutputs],
        } as ProcessorData
        try {
          acc.push(await (processor[opName] as Function)(processorData))
        } catch (err) {
          if (err instanceof Error)
            errors.push(`${key}.${opName}(): ${err.message}`)
        }
      } else errors.push(`${key}.${opName} method does not exist`)
    }

    const result = reduce(acc)
    const { error } = await safeAsync(fn(result, session))
    if (error) errors.push(error.message)
    if (errors.length)
      throw new Error(`errors processing ${opName}:\n${errors.join('\n')}`)
  }
}

// registered as listener on session-processors-ready
export const processSessionFlags = metricProcessorFactory(
  METRIC_PROCESSORS,
  'computeFlag',
  (acc: USER_SESSION_METRICS[]): USER_SESSION_METRICS[] => acc.flat(),
  async (flags: USER_SESSION_METRICS[], session: Session): Promise<void> => {
    try {
      await updateSessionFlagsById(session.id, flags)
      emitter.emit(SESSION_EVENTS.SESSION_FLAGS_SET, session.id)
    } catch (err) {
      throw new Error(`failed to set flags for session ${session.id} - ${err}`)
    }
  }
)

// registered as listener on feedback-processors-ready
export const processFeedbackFlags = metricProcessorFactory(
  METRIC_PROCESSORS,
  'computeFlag',
  (acc: USER_SESSION_METRICS[]): USER_SESSION_METRICS[] => acc.flat(),
  async (flags: USER_SESSION_METRICS[], session: Session): Promise<void> => {
    try {
      await updateSessionFlagsById(session.id, flags)
      emitter.emit(SESSION_EVENTS.FEEDBACK_FLAGS_SET, session.id)
    } catch (err) {
      throw new Error(`failed to set flags for session ${session.id} - ${err}`)
    }
  }
)

// registered as listener on report-processors-ready
export const processReportFlags = metricProcessorFactory(
  METRIC_PROCESSORS,
  'computeFlag',
  (acc: USER_SESSION_METRICS[]): USER_SESSION_METRICS[] => acc.flat(),
  async (flags: USER_SESSION_METRICS[], session: Session): Promise<void> => {
    try {
      await updateSessionFlagsById(session.id, flags)
      emitter.emit(SESSION_EVENTS.REPORT_FLAGS_SET, session.id)
    } catch (err) {
      throw new Error(`failed to set flags for session ${session.id} - ${err}`)
    }
  }
)

// registered as listener on session-processors-ready
export const processSessionReviewReasons = metricProcessorFactory(
  METRIC_PROCESSORS,
  'computeReviewReason',
  (acc: USER_SESSION_METRICS[]): USER_SESSION_METRICS[] => acc.flat(),
  async (reasons: USER_SESSION_METRICS[], session: Session): Promise<void> => {
    try {
      if (reasons.length) {
        await updateSessionReviewReasonsById(session.id, reasons)
        emitter.emit(
          SESSION_EVENTS.SESSION_REVIEW_REASONS_SET,
          session.id.toString()
        )
      }
    } catch (err) {
      throw new Error(
        `failed to set review reason for session ${session.id} - ${err}`
      )
    }
  }
)

// registered as listener on feedback-processors-ready
export const processFeedbackReviewReasons = metricProcessorFactory(
  METRIC_PROCESSORS,
  'computeReviewReason',
  (acc: USER_SESSION_METRICS[]): USER_SESSION_METRICS[] => acc.flat(),
  async (reasons: USER_SESSION_METRICS[], session: Session): Promise<void> => {
    try {
      if (reasons.length) {
        await updateSessionReviewReasonsById(session.id, reasons)
        emitter.emit(
          SESSION_EVENTS.FEEDBACK_REVIEW_REASONS_SET,
          session.id.toString()
        )
      }
    } catch (err) {
      throw new Error(
        `failed to set review reason for session ${session.id} - ${err}`
      )
    }
  }
)

// registered as listener on report-processors-ready
export const processReportReviewReasons = metricProcessorFactory(
  METRIC_PROCESSORS,
  'computeReviewReason',
  (acc: USER_SESSION_METRICS[]): USER_SESSION_METRICS[] => acc.flat(),
  async (reasons: USER_SESSION_METRICS[], session: Session): Promise<void> => {
    try {
      if (reasons.length) {
        await updateSessionReviewReasonsById(session.id, reasons)
        emitter.emit(
          SESSION_EVENTS.REPORT_REVIEW_REASONS_SET,
          session.id.toString()
        )
      }
    } catch (err) {
      throw new Error(
        `failed to set review reason for session ${session.id} - ${err}`
      )
    }
  }
)

// registered as listener on {ANY}-processors-ready
export const processStudentUpdateQuery = metricProcessorFactory(
  METRIC_PROCESSORS,
  'computeStudentUpdateQuery',
  (acc: UserSessionMetricsUpdateQuery[]): UserSessionMetricsUpdateQuery[] =>
    acc,
  async (
    updates: UserSessionMetricsUpdateQuery[],
    session: Session
  ): Promise<void> => {
    try {
      await executeUSMUpdatesByUserId(session.studentId, updates)
    } catch (err) {
      throw new Error(
        `failed to update USM for user ${session.studentId} - ${err}`
      )
    }
  }
)

// registered as listener on {ANY}-processors-ready
export const processVolunteerUpdateQuery = metricProcessorFactory(
  METRIC_PROCESSORS,
  'computeVolunteerUpdateQuery',
  (acc: UserSessionMetricsUpdateQuery[]): UserSessionMetricsUpdateQuery[] =>
    acc,
  async (
    updates: UserSessionMetricsUpdateQuery[],
    session: Session
  ): Promise<void> => {
    try {
      if (session.volunteerId)
        await executeUSMUpdatesByUserId(session.volunteerId, updates)
    } catch (err) {
      throw new Error(
        `failed to update USM for user ${session.volunteerId} - ${err}`
      )
    }
  }
)

// registered as listener on {ANY}-processors-ready
export const processTriggerMetricActions = metricProcessorFactory(
  METRIC_PROCESSORS,
  'triggerActions',
  (acc: Promise<void>[][]): Promise<void>[] => acc.flat(),
  async (actions: Promise<void>[], session: Session): Promise<void> => {
    const results = await Promise.allSettled(actions)
    results.forEach(result => {
      if (result.status === 'rejected')
        logger.error(
          `failed to trigger side effect action for session: ${session.id} - error: ${result.reason}`
        )
    })
  }
)
