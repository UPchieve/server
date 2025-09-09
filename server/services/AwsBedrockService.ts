import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime'
import config from '../config'
import { getImageFileType } from '../utils/image-utils'

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

type BedrockInvokeInput = {
  modelId: string
  text?: string
  prompt: string
  tools_option?: BedrockToolsAttribute
  image?: Buffer
}

type BedrockInvokeResponse = {
  content: Array<{ input?: Object; text?: string }>
}

function imageContentPayload(image: Buffer) {
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

function textContextPayload(text: string) {
  return { type: 'text', text: `<text>${text}</text>` }
}

export async function invokeModel({
  modelId,
  image,
  text,
  prompt,
  tools_option,
}: BedrockInvokeInput) {
  const client = getClient()

  const payLoadContent = []

  if (text != null && text != undefined) {
    payLoadContent.push(textContextPayload(text))
  }
  if (image) {
    payLoadContent.push(imageContentPayload(image))
  }

  const payload = {
    anthropic_version: ANTHROPIC_VERSION,
    max_tokens: 2000,
    system: prompt,
    ...(tools_option ? tools_option : {}),
    messages: [
      {
        role: 'user',
        content: payLoadContent,
      },
    ],
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
    throw new Error('No excpected Bedrock response')
  }

  return response
}

const getResponseWithToolsOption = (modelRes: BedrockInvokeResponse) => {
  return modelRes?.content[0]?.input ?? null
}
const getResponse = (modelRes: BedrockInvokeResponse) => {
  return modelRes?.content[0]?.text
    ? JSON.parse(modelRes.content[0].text)
    : null
}
