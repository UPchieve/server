import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import config from './config'

Sentry.init({
  dsn: config.sentryDsn,
  environment: config.NODE_ENV,
  release: `uc-server@${config.version}`,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
})
