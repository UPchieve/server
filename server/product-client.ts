import config from './config'
import { PostHog } from 'posthog-node'

// TODO: Handle local dev instance better.
export const client =
  config.posthogToken !== 'bogus'
    ? new PostHog(config.posthogToken, {
        host: 'https://app.posthog.com',
      })
    : {
        isFeatureEnabled: () => false,
        getFeatureFlagPayload: () => '',
        getAllFlagsAndPayloads: () => {
          return { featureFlags: {}, featureFlagPayloads: {} }
        },
        captureEvent: () => {
          /* no-op */
        },
        shutdownAsync: () => {
          /* no-op */
        },
      }
