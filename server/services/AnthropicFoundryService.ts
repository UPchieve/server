import AnthropicFoundry from '@anthropic-ai/foundry-sdk'
import { ClientSecretCredential, getBearerTokenProvider } from '@azure/identity'
import config from '../config'
import { secondsInMs } from '../utils/time-utils'
import {
  AnthropicMessagePayload,
  ClaudeResponse,
  ClaudeProvider,
} from '../types/claude'

const FOUNDRY_SCOPE = 'https://ai.azure.com/.default'

let client: AnthropicFoundry | undefined

/** The Azure resource this posts to. */
function requireResource(): string {
  const resource = config.anthropicFoundryResource
  // Azure subdomains are first-come and the resource becomes the request
  // hostname, so an unset one would post student content to whoever holds it.
  if (!resource || resource === 'bogus') {
    throw new Error(
      'Foundry fallback is not configured: SUBWAY_ANTHROPIC_FOUNDRY_RESOURCE is unset'
    )
  }
  return resource
}

function getClient(): AnthropicFoundry {
  if (!client) {
    const credential = new ClientSecretCredential(
      config.azureTenantId,
      config.azureClientId,
      config.azureStorageSecret
    )
    client = new AnthropicFoundry({
      resource: requireResource(),
      azureADTokenProvider: getBearerTokenProvider(credential, FOUNDRY_SCOPE),
      // Default is 2 retries with a ~10 minute timeout. Per attempt, like
      // Bedrock's, so the caller's deadline is what actually bounds this.
      maxRetries: 1,
      timeout: secondsInMs(30),
    })
  }
  return client
}

export const provider: ClaudeProvider = {
  name: 'foundry',

  modelFor(): string {
    return config.anthropicFoundryModelId
  },

  async send(
    payload: AnthropicMessagePayload,
    model: string,
    deadline: AbortSignal
  ): Promise<ClaudeResponse> {
    const message = await getClient().messages.create(
      { ...payload, model },
      { signal: deadline }
    )
    return {
      stop_reason: message.stop_reason ?? undefined,
      content: message.content,
      usage: message.usage,
    }
  },
}
