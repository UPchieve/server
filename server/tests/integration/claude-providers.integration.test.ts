import { readFileSync } from 'fs'
import { join } from 'path'
import config from '../../config'
import * as AwsBedrockService from '../../services/AwsBedrockService'
import {
  BedrockToolChoice,
  BedrockToolsAttribute,
} from '../../services/AwsBedrockService'

// Only via `pnpm test:integration`: costs money and needs live credentials.
// The unit tests pin the payload we build. These prove a provider accepts it
// and that the caller gets usable data back.

const TOOL_NAME = 'json_response'
const FORCED_TOOL: BedrockToolsAttribute = {
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
  tool_choice: { type: BedrockToolChoice.TOOL, name: TOOL_NAME },
}

const fixture = (name: string) =>
  readFileSync(join(__dirname, 'fixtures', name))

const PNG = fixture('whiteboard.png')
const JPEG = fixture('screenshare.jpg')

const PROMPT = 'You are a test fixture. Answer briefly.'
const MODEL = config.awsBedrockSonnet4Id

describe('the shapes the call sites send', () => {
  it('answers a plain request with text, as session summaries need', async () => {
    const result = await AwsBedrockService.invokeModel<string>({
      modelId: MODEL,
      prompt: PROMPT,
      text: 'Say the word ready.',
    })

    expect(typeof result).toBe('string')
    expect((result as string).length).toBeGreaterThan(0)
  })

  it('answers a forced tool with parsed input, as moderation needs', async () => {
    const result = await AwsBedrockService.invokeModel<{ answer: string }>({
      modelId: MODEL,
      prompt: PROMPT,
      text: 'What is 2 + 2?',
      tools_option: FORCED_TOOL,
    })

    expect(result).toMatchObject({ answer: expect.any(String) })
  })

  it('accepts the empty text block the tutor bot sends', async () => {
    const result = await AwsBedrockService.invokeModel<{ answer: string }>({
      modelId: MODEL,
      prompt: PROMPT,
      text: '',
      tools_option: FORCED_TOOL,
    })

    expect(result).toMatchObject({ answer: expect.any(String) })
  })

  it.each([
    ['png', PNG],
    ['jpeg', JPEG],
  ])(
    'accepts a %s image with a forced tool, as image moderation sends',
    async (_name, image) => {
      const result = await AwsBedrockService.invokeModel<{ answer: string }>({
        modelId: MODEL,
        prompt: PROMPT,
        text: 'Describe this image.',
        images: [image],
        tools_option: FORCED_TOOL,
      })

      expect(result).toMatchObject({ answer: expect.any(String) })
    }
  )

  it('answers an image with no tool in text, as whiteboard vision needs', async () => {
    const result = await AwsBedrockService.invokeModel<string>({
      modelId: MODEL,
      prompt: PROMPT,
      text: 'Describe this image.',
      images: [PNG],
    })

    expect(typeof result).toBe('string')
  })
})
