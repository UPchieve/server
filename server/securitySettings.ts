import config from './config'

// really great csp docs: https://content-security-policy.com/
// helmet docs: https://helmetjs.github.io/

// script sources
const googleUrls = [
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com'
]
const cdnUrl = 'https://cdn.upchieve.org'
const mathJaxScriptUrl = 'https://cdnjs.cloudflare.com'
const newrelicUrls = [
  'https://js-agent.newrelic.com',
  'https://bam.nr-data.net'
]

// connect sources
const posthogUrl = 'https://app.posthog.com'
const unleashUrl = 'https://gitlab.com'
const sentryUrl = 'https://*.ingest.sentry.io'
const mathJaxFetchUrl = 'https://api.cdnjs.com'

// img srcs
const s3PhotoConnectUrls = [
  `${config.awsS3.photoIdBucket}.s3.us-east-2.amazonaws.com`,
  `${config.awsS3.sessionPhotoBucket}.s3.us-east-2.amazonaws.com`
]

const s3PhotoImageUrls = [
  `${config.awsS3.photoIdBucket}.s3.amazonaws.com`,
  `${config.awsS3.sessionPhotoBucket}.s3.amazonaws.com`,
  `${config.awsS3.sessionPhotoBucket}.s3.us-east-2.amazonaws.com`
]

// default srcs
const vimeoUrl = 'https://player.vimeo.com'
const googleDocsUrl = 'https://docs.google.com'
const trainingMaterialsS3 =
  'https://upc-training-materials.s3.us-east-2.amazonaws.com'

// the alternative to disabling eslint here
// is to do '\'self\'' which looks...terrible
// 'self' must come through in single-quotes
// to the front end
export const scriptSrc = [
  "'self'", // eslint-disable-line quotes
  ...googleUrls,
  cdnUrl,
  mathJaxScriptUrl,
  posthogUrl,
  ...newrelicUrls,
  "'unsafe-eval'", // eslint-disable-line quotes
  "'unsafe-inline'" // eslint-disable-line quotes
]

export const imgSrc = [
  "'self'", // eslint-disable-line quotes
  ...googleUrls,
  ...s3PhotoImageUrls,
  cdnUrl,
  'data:',
  'blob:'
]

export const connectSrc = [
  "'self'", // eslint-disable-line quotes
  posthogUrl,
  unleashUrl,
  sentryUrl,
  mathJaxFetchUrl,
  ...s3PhotoConnectUrls,
  ...newrelicUrls,
  ...googleUrls,
  config.vueAppUnleashUrl,
  `wss://${config.host}`
]

if (config.NODE_ENV !== 'production') {
  connectSrc.push('http://localhost:3000')
  connectSrc.push('http://localhost:3001')
}

export const defaultSrc = [
  "'self'", // eslint-disable-line quotes
  "'unsafe-inline'", // eslint-disable-line quotes
  vimeoUrl,
  googleDocsUrl,
  trainingMaterialsS3
]

// the rest are defaults
export const baseUri = ["'self'"] // eslint-disable-line quotes
export const blockAllMixedContent = []
export const fontSrc = ["'self'", 'https:', 'data:'] // eslint-disable-line quotes
export const frameAncestors = ["'self'", 'http://localhost'] // eslint-disable-line quotes
export const objectSrc = ["'none'"] // eslint-disable-line quotes
export const scriptSrcAttr = ["'none'"] // eslint-disable-line quotes
export const styleSrc = ["'self'", 'https:', "'unsafe-inline'"] // eslint-disable-line quotes
export const upgradeInsecureRequests = []
