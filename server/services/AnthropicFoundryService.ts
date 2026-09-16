import AnthropicFoundry from '@anthropic-ai/foundry-sdk'
import { ClientSecretCredential, getBearerTokenProvider } from '@azure/identity'
import config from '../config'
import { secondsInMs } from '../utils/time-utils'

const FOUNDRY_SCOPE = 'https://ai.azure.com/.default'

let client: AnthropicFoundry | undefined

function getClient(): AnthropicFoundry {
  if (!client) {
    client = new AnthropicFoundry({
      resource: config.anthropicFoundryResource,
      azureADTokenProvider: getBearerTokenProvider(
        new ClientSecretCredential(
          config.azureTenantId,
          config.azureClientId,
          config.azureStorageSecret
        ),
        FOUNDRY_SCOPE
      ),
      maxRetries: 1,
      timeout: secondsInMs(30),
    })
  }
  return client
}

/** Foundry takes the same Anthropic body, with the version swapped for a model. */
export async function invokeModel(
  payload: Record<string, unknown>
): Promise<any> {
  const { anthropic_version: _version, ...body } = payload
  // Bedrock's payload types are looser than the SDK's; tightened in the follow-up.
  return getClient().messages.create({
    ...body,
    model: config.anthropicFoundryModelId,
  } as any)
}
