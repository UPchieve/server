jest.mock('ioredis', () => require('ioredis-mock/jest'))

jest.mock('posthog-node')
jest.mock('../services/AnalyticsService')

jest.mock('merkury')

const customVolunteerPartnerOrgList =
  process.env.SUBWAY_CUSTOM_VOLUNTEER_PARTNER_ORGS || 'example'
const customVolunteerPartnerOrgs = customVolunteerPartnerOrgList.split(',')

jest.mock('../config', () => {
  return {
    NODE_ENV: 'dev',
    sessionSecret: 'secret',
    awsS3: {
      accessKeyId: 'ACCESSKEY123',
      secretAccessKey: 'SECRETACCESSKEY789',
      region: 'us-east-2',
      photoIdBucket: 'photo-id-bucket',
      sessionPhotoBucket: 'session-photo-bucket'
    },
    volunteerPartnerManifestPath: 'localManifests/volunteer.yaml',
    studentPartnerManifestPath: 'localManifests/student.yaml',
    smtp: {
      host: 'smtp.mailtrap.io',
      port: 2525,
      secure: false,
      user: process.env.SUBWAY_SMTP_USER,
      password: process.env.SUBWAY_SMTP_PASSWORD
    },
    mail: {
      senders: {
        noreply:
          process.env.SUBWAY_NOREPLY_EMAIL_SENDER || 'example@example.org',
        support:
          process.env.SUBWAY_SUPPORT_EMAIL_SENDER || 'example@example.org'
      },
      receivers: {
        contact:
          process.env.SUBWAY_CONTACT_EMAIL_RECEIVER || 'example@example.org'
      }
    },
    sendgrid: {
      apiKey: process.env.SUBWAY_SENDGRID_API_KEY,
      failedFirstAttemptedQuizTemplate: 'd-447e43ee9746482ca308e05069ba2e00'
    },
    // global.__MONGO_URI__ is set by '@shelf/jest-mongodb' when a test runs
    database: global.__MONGO_URI__,
    volunteerPartnerManifests: {
      example: {
        name: 'Example - Regular'
      },
      example2: {
        name: 'Example - Email Requirement',
        requiredEmailDomains: ['example.com']
      }
    },

    customVolunteerPartnerOrgs: customVolunteerPartnerOrgs,

    assistmentsBaseURL: 'https://example.com',

    assistmentsToken: 'bogus',

    assistmentsAuthSchema: 'token={TOKEN}',

    cacheKeys: {
      updateTotalVolunteerHoursLastRun: 'UPDATE_TOTAL_VOLUNTEER_HOURS_LAST_RUN'
    },

    logLevel: 'info',

    studentPartnerManifests: {
      example: {
        name: 'Example - No School',
        signupCode: 'EX1',
        highSchoolSignup: false,
        schoolSignupRequired: false
      },
      example2: {
        name: 'Example - High School Optional',
        signupCode: 'EX2',
        highSchoolSignup: true,
        schoolSignupRequired: false
      }
    },
    bannedServiceProviders: ['Example'],
    notificationSchedule: [
      1 * 60 * 1000,
      12 * 1000,
      12 * 1000,
      12 * 1000,
      12 * 1000,
      1 * 60 * 1000,
      12 * 1000,
      12 * 1000,
      12 * 1000,
      12 * 1000,
      1 * 60 * 1000,
      12 * 1000,
      12 * 1000,
      12 * 1000,
      12 * 1000,
      3 * 60 * 1000,
      5 * 1000,
      5 * 1000,
      5 * 1000,
      5 * 1000,
      1 * 60 * 1000,
      5 * 1000,
      5 * 1000,
      5 * 1000,
      5 * 1000,
      1 * 60 * 1000,
      5 * 1000,
      5 * 1000,
      5 * 1000,
      5 * 1000
    ],
    client: { host: 'localhost' },
    accountSid: 'AC12345',
    authToken: '1234567890'
  }
})

jest.mock('unleash-client', () => {
  return {
    isEnabled: (): boolean => true
  }
})

export {} // get typescript to think this is a module

// extend NodeJS global for mongoURI for use with @shelf/jest-mongodb
declare global {
  namespace NodeJS {
    interface Global {
      __MONGO_URI__: string
    }
  }
}
