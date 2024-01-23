import config from './config'
import { PostHog } from 'posthog-node'

const ONE_MINUTE_IN_MS = 1000 * 60

// TODO: Handle local dev instance better.
export const client = isValidConfigToken(config.posthogToken)
  ? new PostHog(config.posthogToken, {
      host: 'https://app.posthog.com',
      personalApiKey: isValidConfigToken(config.posthogPersonalApiToken)
        ? config.posthogPersonalApiToken
        : undefined,
      featureFlagsPollingInterval: ONE_MINUTE_IN_MS,
    })
  : {
      isFeatureEnabled: () => false,
      getFeatureFlagPayload: () => '',
      getAllFlagsAndPayloads: () => {
        return { featureFlags: {}, featureFlagPayloads: {} }
      },
      identify: () => {
        /* no-op */
      },
      capture: () => {
        /* no-op */
      },
      shutdownAsync: () => {
        /* no-op */
      },
    }

function isValidConfigToken(token: string) {
  return token !== 'bogus'
}
