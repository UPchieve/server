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

export async function invokeModel({
  modelId,
  text,
  prompt,
}: {
  modelId: string
  text: string
  prompt: string
}) {
  const client = getClient()

  const payload = {
    anthropic_version: ANTHROPIC_VERSION,
    max_tokens: 2000,
    system: prompt,
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
  const response = await client.send(command)
  const jsonString = new TextDecoder().decode(response.body)
  const modelRes = JSON.parse(jsonString)
  return JSON.parse(modelRes.content[0].text)
}
