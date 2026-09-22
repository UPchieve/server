import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime'
import config from '../config'
import { secondsInMs } from '../utils/time-utils'
import {
  AnthropicMessagePayload,
  ClaudeResponse,
  ClaudeProvider,
} from '../types/claude'

const ANTHROPIC_VERSION = 'bedrock-2023-05-31'

let client: BedrockRuntimeClient | undefined

function getClient(): BedrockRuntimeClient {
  if (!client) {
    client = new BedrockRuntimeClient({
      region: config.awsBedrockRegion,
      credentials: {
        accessKeyId: config.awsBedrockAccessKey,
        secretAccessKey: config.awsBedrockSecretAccessKey,
      },
      requestHandler: {
        requestTimeout: secondsInMs(30),
      },
      // Default is 3, but we retry 2 more in Foundry.
      maxAttempts: 2,
    })
  }
  return client
}

export const provider: ClaudeProvider = {
  name: 'bedrock',

  modelFor(modelId: string): string {
    return modelId
  },

  async send(
    payload: AnthropicMessagePayload,
    model: string,
    deadline: AbortSignal
  ): Promise<ClaudeResponse> {
    const command = new InvokeModelCommand({
      modelId: model,
      body: JSON.stringify({
        ...payload,
        anthropic_version: ANTHROPIC_VERSION,
      }),
      contentType: 'application/json',
    })
    const response = await getClient().send(command, { abortSignal: deadline })
    return JSON.parse(new TextDecoder().decode(response.body))
  },
}
