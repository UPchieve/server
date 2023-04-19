import config from './config'
import { PostHog } from 'posthog-node'

export const client = new PostHog(config.posthogToken, {
  host: 'https://app.posthog.com',
})
