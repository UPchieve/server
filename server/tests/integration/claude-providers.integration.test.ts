import { readFileSync } from 'fs'
import { join } from 'path'
import config from '../../config'
import { provider as bedrock } from '../../services/AwsBedrockService'
import { provider as foundry } from '../../services/AnthropicFoundryService'
import {
  buildPayload,
  ClaudeToolChoice,
  ClaudeToolsAttribute,
  ClaudeProvider,
  invokeModel,
} from '../../services/ClaudeService'
import { TypedImage } from '../../utils/image-utils'

// Only via `pnpm test:integration`: costs money and needs live credentials.
// The unit tests pin the payload we build. These prove a provider accepts it
// and that the caller gets usable data back.

const TOOL_NAME = 'json_response'
const FORCED_TOOL: ClaudeToolsAttribute = {
  tools: [
    {
      name: TOOL_NAME,
      description: 'Structured response',
      strict: true,
      input_schema: {
        type: 'object',
        properties: { answer: { type: 'string', description: 'The answer' } },
        required: ['answer'],
        additionalProperties: false,
      },
    },
  ],
  tool_choice: { type: ClaudeToolChoice.TOOL, name: TOOL_NAME },
}

const fixture = (
  name: string,
  mediaType: TypedImage['mediaType']
): TypedImage => ({
  data: readFileSync(join(__dirname, 'fixtures', name)),
  mediaType,
})

const PNG = fixture('whiteboard.png', 'image/png')
const JPEG = fixture('screenshare.jpg', 'image/jpeg')

const PROMPT = 'You are a test fixture. Answer briefly.'
const MODEL = config.awsBedrockSonnet4Id

const SHAPES = {
  text: { modelId: MODEL, prompt: PROMPT, text: 'Say the word ready.' },
  forcedTool: {
    modelId: MODEL,
    prompt: PROMPT,
    text: 'What is 2 + 2?',
    tools_option: FORCED_TOOL,
  },
  emptyText: {
    modelId: MODEL,
    prompt: PROMPT,
    text: '',
    tools_option: FORCED_TOOL,
  },
  pngWithTool: {
    modelId: MODEL,
    prompt: PROMPT,
    text: 'Describe this image.',
    images: [PNG],
    tools_option: FORCED_TOOL,
  },
  jpegWithTool: {
    modelId: MODEL,
    prompt: PROMPT,
    text: 'Describe this image.',
    images: [JPEG],
    tools_option: FORCED_TOOL,
  },
  imageNoTool: {
    modelId: MODEL,
    prompt: PROMPT,
    text: 'Describe this image.',
    images: [PNG],
  },
}

const configured = (value?: string) => !!value && value !== 'bogus'
const PROVIDERS: ClaudeProvider[] = [bedrock, foundry]
const isConfigured: Record<string, boolean> = {
  bedrock: configured(config.awsBedrockSonnet4Id),
  foundry:
    configured(config.anthropicFoundryResource) &&
    configured(config.anthropicFoundryModelId),
}

describe.each(PROVIDERS)('$name', (provider) => {
  const maybe = isConfigured[provider.name] ? describe : describe.skip

  maybe('returns data the caller can use for every shape', () => {
    it.each(Object.entries(SHAPES))('the %s shape', async (_n, shape) => {
      const payload = buildPayload(shape)

      const response = await provider.send(
        payload,
        provider.modelFor(MODEL),
        AbortSignal.timeout(30_000)
      )

      const block = response.content.find((b) =>
        payload.tools ? b?.input !== undefined : typeof b?.text === 'string'
      )
      expect(block).toBeDefined()
    })
  })
})

// The loop above says which providers work. This says a caller gets an answer
// as long as one of them does.
it('serves the caller whichever provider answers', async () => {
  const result = await invokeModel<{ answer: string }>(SHAPES.forcedTool)

  expect(result).toMatchObject({ answer: expect.any(String) })
})
