import { mocked } from 'jest-mock'
import logger from '../../logger'
import * as Bedrock from '../../services/AwsBedrockService'
import * as Foundry from '../../services/AnthropicFoundryService'
import {
  AllClaudeProvidersFailedError,
  buildPayload,
  ClaudeToolChoice,
  ClaudeToolsAttribute,
  invokeModel,
} from '../../services/ClaudeService'

jest.mock('../../logger')
jest.mock('../../config')
jest.mock('../../services/AwsBedrockService', () => ({
  provider: {
    name: 'bedrock',
    modelFor: jest.fn(() => 'bedrock-model'),
    send: jest.fn(),
  },
}))
jest.mock('../../services/AnthropicFoundryService', () => ({
  provider: {
    name: 'foundry',
    modelFor: jest.fn(() => 'foundry-model'),
    send: jest.fn(),
  },
}))

const bedrock = mocked(Bedrock.provider)
const foundry = mocked(Foundry.provider)

const PRIMARY_ANSWER = 'from primary'
const FALLBACK_ANSWER = 'from fallback'

const textResponse = (text: string) => ({
  content: [{ text }],
  usage: { input_tokens: 10, output_tokens: 3 },
})

const named = (name: string) => Object.assign(new Error('boom'), { name })

const FORCED_TOOL: ClaudeToolsAttribute = {
  tool_choice: { type: ClaudeToolChoice.TOOL, name: 'json_response' },
  tools: [
    {
      name: 'json_response',
      description: 'json',
      strict: true,
      input_schema: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false,
      },
    },
  ],
}

beforeEach(() => {
  jest.clearAllMocks()
  bedrock.send.mockResolvedValue(textResponse(PRIMARY_ANSWER))
  foundry.send.mockResolvedValue(textResponse(FALLBACK_ANSWER))
})

const invokeText = () =>
  invokeModel<string>({ modelId: 'a-model', prompt: 'system' })

describe('invokeModel', () => {
  describe('when the primary succeeds', () => {
    it('returns its result without calling the fallback', async () => {
      const result = await invokeText()

      expect(result).toBe(PRIMARY_ANSWER)
      expect(foundry.send).not.toHaveBeenCalled()
    })
  })

  describe('when it does not', () => {
    it.each([
      ['ThrottlingException'],
      ['ServiceUnavailableException'],
      ['TimeoutError'],
      // 4xx, but revoked credentials or a bad model id in one region is
      // exactly what the other provider is for.
      ['AccessDeniedException'],
      // Bedrock reports a model that is not serving as a validation error,
      // so excluding those would disable the fallback during an outage.
      ['ValidationException'],
    ])('falls back on %s', async (errorName) => {
      bedrock.send.mockRejectedValueOnce(named(errorName))

      const result = await invokeText()

      expect(result).toBe(FALLBACK_ANSWER)
    })

    it('sends the fallback the same payload the primary got', async () => {
      bedrock.send.mockRejectedValueOnce(named('ThrottlingException'))

      await invokeModel({ modelId: 'a-model', prompt: 'system', text: 'hello' })

      const [sentToPrimary] = bedrock.send.mock.lastCall!
      const [sentToFallback] = foundry.send.mock.lastCall!
      expect(sentToFallback).toBe(sentToPrimary)
    })

    it('reads past a thinking block, which Sonnet emits before its answer', async () => {
      bedrock.send.mockResolvedValueOnce({
        content: [
          { type: 'thinking', thinking: 'hmm' },
          { type: 'text', text: 'the answer' },
        ],
      } as any)

      const result = await invokeText()

      expect(result).toBe('the answer')
    })

    it('finds the tool input even when a thinking block comes first', async () => {
      bedrock.send.mockResolvedValueOnce({
        content: [
          { type: 'thinking', thinking: 'hmm' },
          { type: 'tool_use', input: { confidence: 'high' } },
        ],
      } as any)

      const result = await invokeModel<{ confidence: string }>({
        modelId: 'a-model',
        prompt: 'system',
        tools_option: FORCED_TOOL,
      })

      expect(result).toEqual({ confidence: 'high' })
    })

    it('does not try the fallback when the primary answers without the content we asked for', async () => {
      bedrock.send.mockResolvedValueOnce({ content: [] })

      await invokeText().catch(() => {})

      expect(foundry.send).not.toHaveBeenCalled()
    })

    it('leaves the body out of the log, which is text read off a student', async () => {
      const readOffAStudentsImage = 'my tiktok is @tiktokofficial'
      bedrock.send.mockResolvedValueOnce({
        content: [{ type: 'thinking', thinking: readOffAStudentsImage }],
      } as any)

      await invokeText().catch(() => {})

      const logged = mocked(logger.error).mock.lastCall
      expect(JSON.stringify(logged)).not.toContain(readOffAStudentsImage)
    })

    it('reports the block types it got instead', async () => {
      bedrock.send.mockResolvedValueOnce({
        content: [{ type: 'thinking' }, { type: 'text' }],
      } as any)

      await invokeText().catch(() => {})

      expect(mocked(logger.error).mock.lastCall?.[0]).toMatchObject({
        contentBlockTypes: ['thinking', 'text'],
      })
    })

    it('names both providers when neither can serve', async () => {
      bedrock.send.mockRejectedValueOnce(named('ThrottlingException'))
      foundry.send.mockRejectedValueOnce(named('InternalServerError'))

      const error = await invokeText().catch((e) => e)

      expect(error).toBeInstanceOf(AllClaudeProvidersFailedError)
      expect(error.message).toBe('Claude request failed on bedrock and foundry')
    })

    it('keeps the provider errors out of the message', async () => {
      bedrock.send.mockRejectedValueOnce(named('ThrottlingException'))
      foundry.send.mockRejectedValueOnce(named('InternalServerError'))

      const error = await invokeText().catch((e) => e)

      expect(error.message).not.toContain('boom')
    })

    it('records the model each provider used, not the one asked for', async () => {
      bedrock.send.mockRejectedValueOnce(named('ThrottlingException'))
      foundry.send.mockRejectedValueOnce(named('InternalServerError'))

      const error = await invokeText().catch((e) => e)

      expect(error.failures.map((f: any) => f.model)).toEqual([
        'bedrock-model',
        'foundry-model',
      ])
    })

    it('bounds each provider with a deadline so a hang does not delay the fallback', async () => {
      await invokeText()

      const [, , deadline] = bedrock.send.mock.lastCall!
      expect(deadline).toBeInstanceOf(AbortSignal)
    })
  })
})

// The shapes its callers rely on.
describe('buildPayload', () => {
  const base = { modelId: 'a-model', prompt: 'system' }

  it('wraps plain text in a text block and attaches no tools', () => {
    const payload = buildPayload({ ...base, text: 'hello' })

    expect(payload.messages[0].content).toEqual([
      { type: 'text', text: '<text>hello</text>' },
    ])
    expect(payload.tools).toBeUndefined()
  })

  it('carries a forced tool choice through', () => {
    const payload = buildPayload({ ...base, tools_option: FORCED_TOOL })

    expect(payload.tools).toEqual(FORCED_TOOL.tools)
    expect(payload.tool_choice).toEqual(FORCED_TOOL.tool_choice)
  })

  it('keeps a text block when the text is empty, as the tutor bot needs', () => {
    const payload = buildPayload({ ...base, text: '' })

    expect(payload.messages[0].content).toEqual([
      { type: 'text', text: '<text></text>' },
    ])
  })

  it.each([['image/png'], ['image/jpeg']] as const)(
    'encodes a %s image as a base64 block',
    (mediaType) => {
      const payload = buildPayload({
        ...base,
        images: [{ data: Buffer.from('bytes'), mediaType }],
      })

      expect(payload.messages[0].content).toEqual([
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: Buffer.from('bytes').toString('base64'),
          },
        },
      ])
    }
  )
})
