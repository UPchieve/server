import config from './config'

// really great csp docs: https://content-security-policy.com/
// helmet docs: https://helmetjs.github.io/

// script sources
const googleUrls = [
  'https://www.googletagmanager.com/gtm',
  'https://www.googletagmanager.com/gtag',
  'https://www.google-analytics.com/analytics.js'
]
const cdnUrl = 'https://cdn.upchieve.org'
const mathJaxScriptUrl = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax'
const newrelicUrls = [
  'https://js-agent.newrelic.com',
  'https://bam.nr-data.net'
]

// connect sources
const posthogUrl = 'https://app.posthog.com'
const unleashUrl = config.vueAppUnleashUrl
const sentryUrl = 'https://*.ingest.sentry.io'
const mathJaxFetchUrl = 'https://api.cdnjs.com/libraries/mathjax'

// the alternative to disabling eslint here
// is to do '\'self\'' which looks...terrible
// 'self' must come through in single-quotes
// to the front end
export const scriptSrc = [
  "'self'", // eslint-disable-line quotes
  ...googleUrls,
  cdnUrl,
  mathJaxScriptUrl,
  ...newrelicUrls,
  "'unsafe-eval'", // eslint-disable-line quotes
  "'unsafe-inline'" // eslint-disable-line quotes
]

export const connectSrc = [
  "'self'", // eslint-disable-line quotes
  posthogUrl,
  unleashUrl,
  sentryUrl,
  mathJaxFetchUrl,
  config.vueAppUnleashUrl
]
