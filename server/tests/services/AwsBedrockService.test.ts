import { provider } from '../../services/AwsBedrockService'
import { AnthropicMessagePayload } from '../../types/claude'

// Jest hoists the factory above this, so it forwards instead of capturing.
const send = jest.fn()

jest.mock('../../config')
jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: jest.fn(() => ({
    send: (...args: unknown[]) => send(...args),
  })),
  InvokeModelCommand: jest.fn((input) => input),
}))

const payload: AnthropicMessagePayload = {
  max_tokens: 2000,
  system: 'a system prompt',
  messages: [{ role: 'user', content: [{ type: 'text', text: 'hi' }] }],
}

beforeEach(() => {
  jest.clearAllMocks()
  send.mockResolvedValue({
    body: new TextEncoder().encode(
      JSON.stringify({ content: [{ text: 'ok' }] })
    ),
  })
})

describe('modelFor', () => {
  it('uses the model the caller asked for', () => {
    expect(provider.modelFor('a-bedrock-model')).toBe('a-bedrock-model')
  })
})

describe('send', () => {
  it('adds the anthropic_version Bedrock requires', async () => {
    await provider.send(payload, 'a-model', AbortSignal.timeout(1000))

    const [command] = send.mock.lastCall!
    expect(JSON.parse(command.body)).toMatchObject({
      anthropic_version: 'bedrock-2023-05-31',
      system: 'a system prompt',
    })
  })

  it('passes the caller deadline to the SDK', async () => {
    const deadline = AbortSignal.timeout(1000)

    await provider.send(payload, 'a-model', deadline)

    const [, options] = send.mock.lastCall!
    expect(options).toEqual({ abortSignal: deadline })
  })
})
