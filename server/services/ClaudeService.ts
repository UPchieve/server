import logger from '../logger'
import {
  AnthropicMessagePayload,
  ClaudeProvider,
  ImageContent,
  TextContent,
  ToolInput,
  ClaudeResponse,
  ClaudeToolsAttribute,
} from '../types/claude'
import { TypedImage } from '../utils/image-utils'
import { secondsInMs } from '../utils/time-utils'
import { provider as bedrock } from './AwsBedrockService'
import { provider as foundry } from './AnthropicFoundryService'

export * from '../types/claude'

const MAX_TOKENS = 2000

// Each SDK's own timeout is per attempt, so retries stack past it. This keeps
// the total wait reasonable.
const PROVIDER_DEADLINE = secondsInMs(30)

const PROVIDERS: ClaudeProvider[] = [bedrock, foundry]

type ClaudeInvokeInput = {
  modelId: string
  prompt: string
  text?: string
  tools_option?: ClaudeToolsAttribute
  images?: Array<TypedImage>
}

/** A well-formed HTTP 200 that did not contain the content we asked for. */
export class NoClaudeResponseError extends Error {
  constructor(contentField: string) {
    super(`No Claude response block with a ${contentField}`)
    this.name = 'NoClaudeResponseError'
  }
}

type ClaudeFailure = {
  provider: string
  model: string
  error: unknown
}

export class AllClaudeProvidersFailedError extends Error {
  constructor(readonly failures: ClaudeFailure[]) {
    // Keep the provider errors out of the message: resError returns it as the
    // 500 body, and they carry IAM ARNs, account ids and tenant ids.
    super(
      `Claude request failed on ${failures.map((f) => f.provider).join(' and ')}`
    )
    this.name = 'AllClaudeProvidersFailedError'
  }
}

// We say what to short circuit on because the usual classification is wrong
// here: ValidationException normally means a malformed client request, which is
// not worth sending anywhere, but AWS also returns it simply to block a request,
// and that is precisely when the other provider should get a turn.
function shouldTryNextProvider(err: unknown): boolean {
  return !(err instanceof NoClaudeResponseError)
}

function toImageContent(image: TypedImage): ImageContent {
  return {
    type: 'image',
    source: {
      type: 'base64',
      media_type: image.mediaType,
      data: image.data.toString('base64'),
    },
  }
}

function toTextContent(text: string): TextContent {
  return { type: 'text', text: `<text>${text}</text>` }
}

/**
 * A response's shape with its body left out.
 * The body is text read off a student's message or image, and logger.error
 * reaches Sentry and New Relic unredacted.
 */
function toContentShape(response: ClaudeResponse) {
  return {
    stopReason: response?.stop_reason,
    contentBlockTypes: (response?.content ?? []).map((block) => block?.type),
  }
}

export function buildPayload({
  prompt,
  text,
  images = [],
  tools_option,
}: ClaudeInvokeInput): AnthropicMessagePayload {
  const content: Array<TextContent | ImageContent> = []
  if (text != null) content.push(toTextContent(text))
  for (const image of images) content.push(toImageContent(image))

  const payload: AnthropicMessagePayload = {
    max_tokens: MAX_TOKENS,
    system: prompt,
    messages: [{ role: 'user', content }],
  }

  if (tools_option) {
    payload.tools = tools_option.tools
    payload.tool_choice = tools_option.tool_choice
  }

  return payload
}

function extractResponse(
  response: ClaudeResponse,
  usingTools: boolean
): ToolInput | string | null {
  const blocks = response?.content ?? []
  const block = usingTools
    ? blocks.find((b) => b?.input !== undefined)
    : blocks.find((b) => typeof b?.text === 'string')
  return (usingTools ? block?.input : block?.text) ?? null
}

async function askProvider<T>(
  provider: ClaudeProvider,
  payload: AnthropicMessagePayload,
  model: string,
  usingTools: boolean
): Promise<T> {
  const response = await provider.send(
    payload,
    model,
    AbortSignal.timeout(PROVIDER_DEADLINE)
  )
  const result = extractResponse(response, usingTools)

  if (result === null) {
    logger.error(
      { provider: provider.name, model, ...toContentShape(response) },
      'Did not receive expected Claude response'
    )
    throw new NoClaudeResponseError(usingTools ? 'input' : 'text')
  }

  // The response is untyped JSON and T is the caller's, so this cannot be proven.
  return result as T
}

/** Try each Claude provider in order on the input. */
export async function invokeModel<T = string | ToolInput>(
  input: ClaudeInvokeInput
): Promise<T> {
  const payload = buildPayload(input)
  const usingTools = !!input.tools_option
  const failures: ClaudeFailure[] = []

  const [primary] = PROVIDERS
  for (const provider of PROVIDERS) {
    const isFallback = provider !== primary
    const model = provider.modelFor(input.modelId)

    try {
      const result = await askProvider<T>(provider, payload, model, usingTools)

      if (isFallback) {
        logger.warn(
          { provider: provider.name, model },
          'Claude request served by fallback provider'
        )
      }

      return result
    } catch (error) {
      failures.push({ provider: provider.name, model, error })

      // Logged on its own, not just in aggregate: a fallback that has quietly
      // stopped working is the worst thing to discover during an outage.
      if (isFallback) {
        logger.error(
          { provider: provider.name, model, err: error },
          'Claude fallback provider failed'
        )
      }

      if (!shouldTryNextProvider(error)) break

      logger.warn(
        { provider: provider.name, model, err: error },
        'Claude provider failed, trying the fallback'
      )
    }
  }

  throw new AllClaudeProvidersFailedError(failures)
}
