jest.mock('ioredis', () => require('ioredis-mock/jest'))

jest.mock('posthog-node')
jest.mock('@unleash/proxy')
jest.mock('openai')
jest.mock('../services/AnalyticsService')
jest.mock('../services/FeatureFlagService')

jest.mock('../services/EventsService')

jest.mock('../worker/logger')
// Custom mock to avoid "TypeError: (0 , socket_io_client_1.io) is not a function" errors
jest.mock('socket.io-client', () => ({
  io: () => ({
    on: () => undefined,
  }),
}))

jest.mock('../worker/sockets', () => {
  const originalModule = jest.requireActual('../worker/sockets')
  const mockEmit = jest.fn()

  // Create a partial mock with only the methods you need
  const partialMockSocket = {
    emit: mockEmit,
  }

  return {
    ...originalModule,
    getSocket: () => partialMockSocket as any,
  }
})

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

    assistmentsBaseURL: 'https://example.com',

    assistmentsToken: 'bogus',

    assistmentsAuthSchema: 'token={TOKEN}',

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
  }
})

jest.mock('unleash-client', () => {
  return {
    isEnabled: (): boolean => true,
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
