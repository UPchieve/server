import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime'
import config from '../config'
import { getImageFileType } from '../utils/image-utils'
import { secondsInMs } from '../utils/time-utils'
import logger from '../logger'

const ANTHROPIC_VERSION = 'bedrock-2023-05-31'

export function getClient() {
  if (!client) client = createClient()
  return client
}

const createClient = (): BedrockRuntimeClient => {
  return new BedrockRuntimeClient({
    region: config.awsBedrockRegion,
    credentials: {
      accessKeyId: config.awsBedrockAccessKey,
      secretAccessKey: config.awsBedrockSecretAccessKey,
    },
    requestHandler: {
      requestTimeout: secondsInMs(30),
    },
  })
}

let client: BedrockRuntimeClient = createClient()

export enum BedrockToolChoice {
  AUTO = 'auto',
  ANY = 'any',
  NONE = 'none',
  TOOL = 'tool',
}

export type BedrockTools = Array<{
  name: string
  description: string
  input_schema: { type: string; properties: object; required: Array<string> }
}>

export type BedrockToolsAttribute = {
  tools: BedrockTools
  tool_choice: { type: BedrockToolChoice; name?: string }
}

type TextContent = {
  type: 'text'
  text: string
}

type ImageContent = {
  type: 'image'
  source: {
    type: 'base64'
    media_type?: string
    data: string
  }
}

type AnthropicMessagePayload = {
  anthropic_version: string
  max_tokens: number
  system: string
  messages: Array<{
    role: 'user'
    content: Array<TextContent | ImageContent>
  }>
  tools?: BedrockTools
  tool_choice?: { type: BedrockToolChoice; name?: string }
}

type BedrockInvokeInput = {
  modelId: string
  text?: string
  prompt: string
  tools_option?: BedrockToolsAttribute
  images?: Array<Buffer>
}

type ToolInput = Record<string, any>

type BedrockInvokeResponse = {
  content: Array<{ input?: ToolInput; text?: string }>
}

function imageContentPayload(image: Buffer): ImageContent {
  const imageFileType = getImageFileType(image)

  return {
    type: 'image',
    source: {
      type: 'base64',
      media_type: imageFileType?.mime,
      data: image.toString('base64'),
    },
  }
}

function textContextPayload(text: string): TextContent {
  return { type: 'text', text: `<text>${text}</text>` }
}

export async function invokeModel<T = string | ToolInput>({
  modelId,
  images = [],
  text,
  prompt,
  tools_option,
}: BedrockInvokeInput): Promise<T> {
  const client = getClient()
  const payLoadContent = []

  if (text != null && text != undefined) {
    payLoadContent.push(textContextPayload(text))
  }
  for (const image of images) {
    payLoadContent.push(imageContentPayload(image))
  }

  const payload: AnthropicMessagePayload = {
    anthropic_version: ANTHROPIC_VERSION,
    max_tokens: 2000,
    system: prompt,
    messages: [
      {
        role: 'user',
        content: payLoadContent,
      },
    ],
  }

  if (tools_option) {
    payload.tools = tools_option.tools
    payload.tool_choice = tools_option.tool_choice
  }

  const command = new InvokeModelCommand({
    modelId,
    body: JSON.stringify(payload),
    contentType: 'application/json',
  })
  const initResponse = await client.send(command)
  const jsonString = new TextDecoder().decode(initResponse.body)
  const modelRes = JSON.parse(jsonString)

  const getModelResponse = tools_option
    ? getResponseWithToolsOption
    : getResponse

  const response = getModelResponse(modelRes)

  if (!response) {
    logger.error(
      { response: jsonString, contentField: tools_option ? 'input' : 'text' },
      'Did not receive expected Bedrock response'
    )
    throw new Error('No expected Bedrock response')
  }

  return response as T
}

const getResponseWithToolsOption = (modelRes: BedrockInvokeResponse) => {
  return modelRes?.content[0]?.input ?? null
}
const getResponse = (modelRes: BedrockInvokeResponse) => {
  return modelRes?.content[0]?.text ?? null
}
