import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime'
import config from '../config'

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

export type BedrockToolsAttribute = {
  tools: Array<{
    name: string
    description: string
    input_schema: { required: Array<string> }
  }>
  tool_choice: { type: BedrockToolChoice; name?: string }
}
type BedrockInvokeInput = {
  modelId: string
  text: string
  prompt: string
  tools_option?: BedrockToolsAttribute
}

type BedrockInvokeResponse = {
  content: Array<{ input?: Object; text?: string }>
}

export async function invokeModel({
  modelId,
  text,
  prompt,
  tools_option,
}: BedrockInvokeInput) {
  const client = getClient()

  const payload = {
    anthropic_version: ANTHROPIC_VERSION,
    max_tokens: 2000,
    system: prompt,
    ...(tools_option ? tools_option : {}),
    messages: [
      {
        role: 'user',
        content: [{ type: 'text', text: `<text>${text}</text>` }],
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
