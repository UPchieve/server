import config from '../../config'
import { provider } from '../../services/AnthropicFoundryService'
import { AnthropicMessagePayload } from '../../types/claude'

const create = jest.fn()

jest.mock('../../config')
jest.mock('@azure/identity')
jest.mock('@anthropic-ai/foundry-sdk', () => ({
  // The SDK is a default export, which esModuleInterop only unwraps with this.
  __esModule: true,
  default: jest.fn(() => ({
    messages: { create: (...a: unknown[]) => create(...a) },
  })),
}))

const payload: AnthropicMessagePayload = {
  max_tokens: 2000,
  system: 'a system prompt',
  messages: [{ role: 'user', content: [{ type: 'text', text: 'hi' }] }],
}

beforeEach(() => {
  jest.clearAllMocks()
  create.mockResolvedValue({
    stop_reason: 'end_turn',
    content: [{ type: 'text', text: 'an answer' }],
    usage: { input_tokens: 11, output_tokens: 4 },
  })
})

describe('modelFor', () => {
  it('uses its one deployment whatever model the caller asked for', () => {
    expect(provider.modelFor('a-bedrock-model')).toBe(
      config.anthropicFoundryModelId
    )
  })
})

describe('send', () => {
  it('reads back the fields ClaudeService depends on', async () => {
    const response = await provider.send(
      payload,
      'a-deployment',
      AbortSignal.timeout(1000)
    )

    expect(response).toEqual({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'an answer' }],
      usage: { input_tokens: 11, output_tokens: 4 },
    })
  })

  it('turns a null stop reason into undefined', async () => {
    create.mockResolvedValueOnce({ stop_reason: null, content: [], usage: {} })

    const response = await provider.send(
      payload,
      'a-deployment',
      AbortSignal.timeout(1000)
    )

    expect(response.stop_reason).toBeUndefined()
  })

  it('sends the deployment as the model, which Bedrock carries in the body instead', async () => {
    await provider.send(payload, 'a-deployment', AbortSignal.timeout(1000))

    const [body] = create.mock.lastCall!
    expect(body.model).toBe('a-deployment')
    expect(body.system).toBe('a system prompt')
  })

  it('passes the caller deadline to the SDK', async () => {
    const deadline = AbortSignal.timeout(1000)

    await provider.send(payload, 'a-deployment', deadline)

    const [, options] = create.mock.lastCall!
    expect(options).toEqual({ signal: deadline })
  })
})
