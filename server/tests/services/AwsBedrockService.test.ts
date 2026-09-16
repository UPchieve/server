import { mocked } from 'jest-mock'
import * as AwsBedrockService from '../../services/AwsBedrockService'
import * as AnthropicFoundryService from '../../services/AnthropicFoundryService'

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
})
