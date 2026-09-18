import { mocked } from 'jest-mock'
import * as AwsBedrockService from '../../services/AwsBedrockService'
import * as AnthropicFoundryService from '../../services/AnthropicFoundryService'
import logger from '../../logger'

// Jest hoists the factory above this, so it forwards instead of capturing.
const send = jest.fn()

jest.mock('../../logger')
jest.mock('../../config')
jest.mock('../../services/AnthropicFoundryService')
jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: jest.fn(() => ({
    send: (...args: unknown[]) => send(...args),
  })),
  InvokeModelCommand: jest.fn((input) => input),
}))

const mockedFoundry = mocked(AnthropicFoundryService)

const STUDENT_QUESTION = 'what is 2 + 2?'

const bedrockReplies = (text: string) =>
  send.mockResolvedValueOnce({
    body: new TextEncoder().encode(JSON.stringify({ content: [{ text }] })),
  })

const bedrockFails = () =>
  send.mockRejectedValueOnce(new Error('Operation not allowed'))

const invoke = () =>
  AwsBedrockService.invokeModel<string>({
    modelId: 'test-bedrock-sonnet',
    prompt: 'a system prompt',
    text: STUDENT_QUESTION,
  })

const bedrockRepliesWithTool = (input: object) =>
  send.mockResolvedValueOnce({
    body: new TextEncoder().encode(JSON.stringify({ content: [{ input }] })),
  })

/** The body this service actually put on the wire. */
const sentBody = () => JSON.parse((send.mock.lastCall as any[])[0].body)

const FORCED_TOOL = {
  tool_choice: {
    type: AwsBedrockService.BedrockToolChoice.TOOL,
    name: 'json_response',
  },
  tools: [
    {
      name: 'json_response',
      description: 'json',
      input_schema: { type: 'object', properties: {} },
    },
  ],
} as any

const AN_IMAGE = Buffer.from('an-image')

beforeEach(() => {
  jest.clearAllMocks()
  send.mockReset()
})

describe('invokeModel', () => {
  it('leaves Foundry alone while Bedrock is answering', async () => {
    bedrockReplies('a bedrock answer')

    expect(await invoke()).toBe('a bedrock answer')
    expect(mockedFoundry.invokeModel).not.toHaveBeenCalled()
  })

  it('serves the request from Foundry when Bedrock fails, sending it the same payload', async () => {
    bedrockFails()
    mockedFoundry.invokeModel.mockResolvedValueOnce({
      content: [{ text: 'a foundry answer' }],
    })

    expect(await invoke()).toBe('a foundry answer')

    const [payload] = mockedFoundry.invokeModel.mock.lastCall as any[]
    expect(payload.system).toBe('a system prompt')
    expect(payload.messages[0].content).toEqual([
      { type: 'text', text: `<text>${STUDENT_QUESTION}</text>` },
    ])
  })

  it('throws when Foundry fails too, so callers keep their existing behaviour', async () => {
    bedrockFails()
    mockedFoundry.invokeModel.mockRejectedValueOnce(new Error('foundry 503'))

    await expect(invoke()).rejects.toThrow('foundry 503')
  })

  it('keeps the response body out of the log when the content is unusable', async () => {
    const readOffAStudentsImage = 'my tiktok is @tiktokofficial'
    send.mockResolvedValueOnce({
      body: new TextEncoder().encode(
        JSON.stringify({
          stop_reason: 'end_turn',
          content: [{ type: 'text', other: readOffAStudentsImage }],
        })
      ),
    })

    await expect(invoke()).rejects.toThrow('No expected Bedrock response')

    const [logged] = mocked(logger).error.mock.lastCall as any[]
    expect(JSON.stringify(logged)).not.toContain(readOffAStudentsImage)
    expect(logged).toMatchObject({ contentBlockTypes: ['text'] })
  })
})

describe('the payload it builds', () => {
  it('wraps the caller text in <text> tags', async () => {
    bedrockReplies('a summary')

    await AwsBedrockService.invokeModel<string>({
      modelId: 'test-bedrock-sonnet',
      prompt: 'a system prompt',
      text: STUDENT_QUESTION,
    })

    expect(sentBody().messages[0].content).toEqual([
      { type: 'text', text: `<text>${STUDENT_QUESTION}</text>` },
    ])
  })

  it('still sends a text block when the text is empty, as the tutor bot does', async () => {
    bedrockRepliesWithTool({ response: 'an answer' })

    await AwsBedrockService.invokeModel({
      modelId: 'test-bedrock-sonnet',
      prompt: 'a system prompt',
      text: '',
      tools_option: FORCED_TOOL,
    })

    expect(sentBody().messages[0].content).toEqual([
      { type: 'text', text: '<text></text>' },
    ])
  })

  it('encodes an image as a base64 block', async () => {
    bedrockRepliesWithTool({ infractions: [] })

    await AwsBedrockService.invokeModel({
      modelId: 'test-bedrock-sonnet',
      prompt: 'a system prompt',
      images: [AN_IMAGE],
      tools_option: FORCED_TOOL,
    })

    expect(sentBody().messages[0].content).toEqual([
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: undefined,
          data: AN_IMAGE.toString('base64'),
        },
      },
    ])
  })
})

describe('what it reads back', () => {
  it('returns the tool input when a tool was forced', async () => {
    bedrockRepliesWithTool({ confidence: 0.9 })

    const result = await AwsBedrockService.invokeModel<{ confidence: number }>({
      modelId: 'test-bedrock-sonnet',
      prompt: 'a system prompt',
      text: STUDENT_QUESTION,
      tools_option: FORCED_TOOL,
    })

    expect(result).toEqual({ confidence: 0.9 })
  })

  it('returns the text when no tool was forced', async () => {
    bedrockReplies('a description')

    const result = await AwsBedrockService.invokeModel<string>({
      modelId: 'test-bedrock-sonnet',
      prompt: 'a system prompt',
      images: [AN_IMAGE],
    })

    expect(result).toBe('a description')
  })
})
