import {
  ChatPromptClient,
  LangfuseTraceClient,
  TextPromptClient,
} from 'langfuse-core'
import { client } from '../clients/langfuse'
import logger from '../logger'

export type Trace = LangfuseTraceClient
export type TraceName = 'progressReport' | 'whiteboardVision' | 'sessionSummary'
export type ModelObservationName =
  | 'getProgressReportResult'
  | 'describeWhiteboardSnapshot'
  | 'generateSessionSummary'
export type TraceTag = 'flagged-by-moderation'

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
  // TODO: I don't love that calling code needs to know what model to use.
  // Option: Wrap `runWithGeneration` within the actual e.g. `invokeModel` code.
  // This will require a much larger refactor to use a generic `AiService`.
  model: string
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

export function addTraceTags(trace: Trace, tags: TraceTag[]): void {
  trace.update({ tags })
}

function stringifyError(e: unknown) {
  return e instanceof Error ? e.message : String(e)
}
