import { Langfuse } from 'langfuse-node'
import config from '../config'

export const client = new Langfuse({
  secretKey: config.langfuseSecretKey,
  publicKey: config.langfusePublicKey,
  baseUrl: config.langfuseBaseUrl,
})

export type TraceName = 'progressReport' | 'whiteboardVision' | 'sessionSummary'
export type GenerationName =
  | 'getProgressReportResult'
  | 'describeWhiteboardSnapshot'
  | 'generateSessionSummary'

export type LangfuseGenerationOptions = {
  traceName: TraceName
  generationName: GenerationName
  model: string
  input?: any
  metadata?: Record<string, any>
}

export async function runWithGeneration<T>(
  cb: () => Promise<T>,
  options: LangfuseGenerationOptions
): Promise<{ result: T; traceId: string }> {
  const { traceName, generationName, model, input, metadata } = options
  const trace = client.trace({
    name: traceName,
    metadata,
  })
  const gen = trace.generation({
    name: generationName,
    model,
    input,
    metadata,
  })

  try {
    const result = await cb()
    gen.end({ output: result })
    return { result, traceId: trace.traceId }
  } catch (error) {
    gen.end({
      output: {
        error: error instanceof Error ? error.message : String(error),
      },
    })
    throw error
  }
}
