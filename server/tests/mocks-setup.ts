const redisMockImpl = require('ioredis-mock/jest')
redisMockImpl.prototype.config = jest.fn()
jest.mock('ioredis', () => redisMockImpl)
jest.mock('yjs')
jest.mock('posthog-node')
jest.mock('openai')
jest.mock('yjs')
jest.mock('@azure-rest/ai-vision-image-analysis')
jest.mock('@azure/core-auth')
jest.mock('../services/AnalyticsService')
jest.mock('../services/FeatureFlagService')

jest.mock('../services/EventsService')

jest.mock('../worker/logger')

const customVolunteerPartnerOrgList =
  process.env.SUBWAY_CUSTOM_VOLUNTEER_PARTNER_ORGS || 'example'
const customVolunteerPartnerOrgs = customVolunteerPartnerOrgList.split(',')

const priorityMatchingPartnerOrgList =
  process.env.SUBWAY_PRIORITY_MATCHING_PARTNER_ORGS || 'example'
const priorityMatchingPartnerOrgs = priorityMatchingPartnerOrgList.split(',')

const priorityMatchingSponsorOrgList =
  process.env.SUBWAY_PRIORITY_MATCHING_SPONSOR_ORGS || 'sponsor,sponsor2'
const priorityMatchingSponsorOrgs = priorityMatchingSponsorOrgList.split(',')

jest.mock('../config', () => {
  return {
    NODE_ENV: 'dev',
    postgresHost: 'localhost', // will not be used in testing
    postgresPort: 5432, // will not be used in testing
    postgresUser: 'subway',
    postgresPassword: 'Password123',
    postgresDatabase: 'upchieve',
    sessionSecret: 'secret',
    awsS3: {
      accessKeyId: 'ACCESSKEY123',
      secretAccessKey: 'SECRETACCESSKEY789',
      region: 'us-east-2',
      photoIdBucket: 'photo-id-bucket',
      sessionPhotoBucket: 'session-photo-bucket',
    },
    volunteerPartnerManifestPath: 'localManifests/volunteer.yaml',
    studentPartnerManifestPath: 'localManifests/student.yaml',
    sponsorOrgManifestPath: 'localManifests/sponsor-orgs.yaml',
    associatedPartnerManifestPath: 'localManifests/associated-partners.yaml',
    smtp: {
      host: 'smtp.mailtrap.io',
      port: 2525,
      secure: false,
      user: process.env.SUBWAY_SMTP_USER,
      password: process.env.SUBWAY_SMTP_PASSWORD,
    },
    mail: {
      senders: {
        noreply:
          process.env.SUBWAY_NOREPLY_EMAIL_SENDER || 'example@example.org',
        support:
          process.env.SUBWAY_SUPPORT_EMAIL_SENDER || 'example@example.org',
      },
      receivers: {
        contact:
          process.env.SUBWAY_CONTACT_EMAIL_RECEIVER || 'example@example.org',
      },
    },
    sendgrid: {
      apiKey: process.env.SUBWAY_SENDGRID_API_KEY,
      failedFirstAttemptedQuizTemplate: 'd-447e43ee9746482ca308e05069ba2e00',
      studentAbsentWarningTemplate: 'd-f27a47f3875a4dfd9f07446219ecacfc',
      studentAbsentVolunteerApologyTemplate:
        'd-2e648990eaca4b5e986a5486d8fea338',
      studentUnmatchedApologyTemplate: 'd-73756dd129344032bc4ca5d1055e1b7b',
      studentOnlyLookingForAnswersTemplate:
        'd-d78c20e2cfbe41968e458a93a6d5c7ac',
      volunteerAbsentWarningTemplate: 'd-7458c9322ae747c78b90bd93e27b9269',
      volunteerAbsentStudentApologyTemplate:
        'd-e45797aba9d04bb29a9745988a52fc1f',
      volunteerTenSessionMilestoneTemplate:
        'd-0447cf80536a430881262f8f92044b73',
    },
    volunteerPartnerManifests: {
      example: {
        name: 'Example - Regular',
      },
      example2: {
        name: 'Example - Email Requirement',
        requiredEmailDomains: ['example.com'],
      },
    },

    customVolunteerPartnerOrgs: customVolunteerPartnerOrgs,
    priorityMatchingPartnerOrgs,
    priorityMatchingSponsorOrgs,

    cacheKeys: {
      updateTotalVolunteerHoursLastRun: 'UPDATE_TOTAL_VOLUNTEER_HOURS_LAST_RUN',
    },

    logLevel: 'info',

    studentPartnerManifests: {
      example: {
        name: 'Example - No School',
        signupCode: 'EX1',
        highSchoolSignup: false,
        schoolSignupRequired: false,
      },
      example2: {
        name: 'Example - High School Optional',
        signupCode: 'EX2',
        highSchoolSignup: true,
        schoolSignupRequired: false,
      },
    },
    sponsorOrgManifests: {
      sponsor: {
        name: 'Sponsor',
        schools: [
          '618abe7ba0e5212595a7bf98',
          '618abe7ba0e5212595a7bf99',
          '618abe7ba0e5212595a7bf9a',
        ],
        partnerOrgs: null,
      },
      sponsor2: {
        name: 'Sponsor 2',
        schools: ['618abe7ba0e5212595a7bf9b', '618abe7ba0e5212595a7bf9c'],
        partnerOrgs: ['example', 'example2'],
      },
    },
    bannedServiceProviders: ['Example'],
    notificationSchedule: [
      1 * 60 * 1000,
      12 * 1000,
      12 * 1000,
      12 * 1000,
      12 * 1000,
      12 * 1000,
      12 * 1000,
      12 * 1000,
      12 * 1000,
      12 * 1000,
      12 * 1000,
      12 * 1000,
      12 * 1000,
      12 * 1000,
      12 * 1000,
    ],
    client: { host: 'localhost' },
    accountSid: 'AC12345',
    authToken: '1234567890',
    favoriteVolunteerLimit: 20,

    // recaptcha
    googleRecaptchaThreshold: 0.5,

    minSessionLength: 60000,

    corporatePartnerReports: {
      customAnalyticsReportPartnerOrgs: ['big-telecom'],
      batchSize: 2,
    },

    subwayApiCredentials: 'bogus',
    apiPort: 3000,
    clusterServerAddress: 'localhost',

    // Langfuse
    langfuseSecretKey: 'test-bogus', // pragma: allowlist secret
    langfusePublicKey: 'test-bogus', // pragma: allowlist secret
    langfuseBaseUrl: 'test-bogus', // pragma: allowlist secret
  }
})

// TODO: have Jest automock.
//       Jest default mock results in error like "newrelic_1.default.noticeError is not a function" for example
jest.mock('newrelic', () => {
  return {
    noticeError: jest.fn().mockImplementation(() => {
      return
    }),
    startSegment: jest.fn().mockImplementation(() => {
      return
    }),
    addCustomAttribute: jest.fn().mockImplementation(() => {
      return
    }),
  }
})

// initialize global postgres connection vars
var __PG_HOST__: string
var __PG_PORT__: number
