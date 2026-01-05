import {
  ChatPromptClient,
  LangfuseTraceClient,
  TextPromptClient,
} from 'langfuse-core'
import { Langfuse } from 'langfuse-node'
import config from '../config'
import logger from '../logger'

export const client = new Langfuse({
  secretKey: config.langfuseSecretKey,
  publicKey: config.langfusePublicKey,
  baseUrl: config.langfuseBaseUrl,
})

export type Trace = LangfuseTraceClient
export type TraceName = 'progressReport' | 'whiteboardVision' | 'sessionSummary'
export type ModelObservationName =
  | 'getProgressReportResult'
  | 'describeWhiteboardSnapshot'
  | 'generateSessionSummary'

export type TraceOptions = {
  trace?: Trace
  name: TraceName
  userId?: string
  sessionId?: string
  input?: unknown
  metadata?: Record<string, unknown>
}
export type ModelObservationOptions = {
  trace?: Trace
  name: ModelObservationName
  model: string // TODO: Make type.
  input?: unknown
  prompt?: TextPromptClient | ChatPromptClient // TODO: Translate into our own type.
  metadata?: Record<string, unknown>
}

export async function runWithTrace<T>(
  cb: (trace: Trace) => Promise<T>,
  options: TraceOptions
): Promise<{ result: T; traceId: string }> {
  const trace = options.trace ?? client.trace(options)

  try {
    const result = await cb(trace)
    trace.update({ output: result })
    return { result, traceId: trace.id }
  } catch (e) {
    trace.update({
      output: {
        error: stringifyError(e),
      },
    })
    throw e
  }
}

export async function runWithModelObservation<T>(
  cb: () => Promise<T>,
  options: ModelObservationOptions
): Promise<T> {
  const { trace, ...generationOptions } = options
  if (!trace) {
    logger.info(
      generationOptions,
      'No trace found, continue callback execution'
    )
    return await cb()
  }

  const gen = trace.generation(generationOptions)

  try {
    const result = await cb()
    gen.end({ output: result })
    return result
  } catch (e) {
    gen.end({
      output: {
        error: stringifyError(e),
      },
    })
    throw e
  }
}

function stringifyError(e: unknown) {
  return e instanceof Error ? e.message : String(e)
}
