import request, { Response } from 'supertest'
import { mocked } from 'jest-mock'
import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import { mockApp } from '../../mock-app'
import * as EligiblityRouter from '../../../router/eligibility'
import * as SchoolService from '../../../services/SchoolService'
import * as EligibilityService from '../../../services/EligibilityService'
import * as IpAddressService from '../../../services/IpAddressService'
import * as StudentService from '../../../services/StudentService'
import * as ZipCodeRepo from '../../../models/ZipCode/queries'
import * as IneligibleStudentRepo from '../../../models/IneligibleStudent/queries'
import {
  buildIneligibleStudent,
  buildSchool,
  buildZipCode,
  getEmail,
} from '../../mocks/generate'
import { getUuid } from '../../../models/pgUtils'
import * as cache from '../../../cache'

function isAdmin(
  _req: ExpressRequest,
  _res: ExpressResponse,
  next: () => void
): void {
  next()
}

jest.mock('../../../services/SchoolService')
jest.mock('../../../services/EligibilityService')
jest.mock('../../../services/IpAddressService')
jest.mock('../../../services/StudentService')
jest.mock('../../../models/ZipCode/queries')
jest.mock('../../../models/IneligibleStudent/queries')
jest.mock('../../../cache', () => ({
  rpush: jest.fn(),
}))
jest.mock('@sentry/node', () => ({
  captureException: jest.fn(),
}))
jest.mock('../../../utils/auth-utils', () => {
  const actual = jest.requireActual('../../../utils/auth-utils')
  return {
    ...actual,
    authPassport: {
      ...actual.authPassport,
      isAdmin,
    },
  }
})
jest.mock('../../../logger')

const mockedSchoolService = mocked(SchoolService)
const mockedEligibilityService = mocked(EligibilityService)
const mockedIpAddressService = mocked(IpAddressService)
const mockedStudentService = mocked(StudentService)
const mockedZipCodeRepo = mocked(ZipCodeRepo)
const mockedIneligibleStudentRepo = mocked(IneligibleStudentRepo)
const mockedCache = mocked(cache)

const app = mockApp()
EligiblityRouter.routes(app)

const agent = request.agent(app)

function sendGet(path: string): Promise<Response> {
  return agent.get(path).set('Accept', 'application/json')
}

function sendGetQuery(
  path: string,
  payload?: Record<string, unknown>
): Promise<Response> {
  return agent
    .get(path)
    .set('Accept', 'application/json')
    .query(payload ?? {})
}

function sendPost(
  path: string,
  payload?: Record<string, unknown>
): Promise<Response> {
  return agent.post(path).set('Accept', 'application/json').send(payload)
}

function sendPut(
  path: string,
  payload?: Record<string, unknown>
): Promise<Response> {
  return agent.put(path).set('Accept', 'application/json').send(payload)
}

function buildPartnerSchool(overrides = {}) {
  return {
    schoolName: 'Partner High School',
    partnerKey: 'partner-key',
    partnerSites: ['Site A'],
    schoolId: '01H123456789ABCDEFGHJKMNPQ',
    ...overrides,
  }
}

describe('routeSchool', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /check', () => {
    test('returns eligibility result', async () => {
      const zipCode = '12345'
      const eligiblityResponse = {
        isEligible: true,
        isCollegeStudent: false,
      }
      const payload = {
        email: getEmail(),
        zipCode,
      }
      mockedEligibilityService.checkEligibility.mockResolvedValueOnce(
        eligiblityResponse
      )

      const response = await sendPost('/api-public/eligibility/check', payload)
      expect(response.status).toBe(200)
      expect(mockedEligibilityService.checkEligibility).toHaveBeenCalledWith(
        expect.any(String),
        payload
      )
      expect(response.body).toEqual({
        isEligible: true,
        isCollegeStudent: false,
      })
    })
  })

  describe('GET /check/teacher', () => {
    test('returns teacher school eligibility', async () => {
      const schoolId = getUuid()
      const isEligible = true
      mockedEligibilityService.verifyEligibility.mockResolvedValueOnce(
        isEligible
      )

      const response = await sendGetQuery(
        '/api-public/eligibility/check/teacher',
        {
          schoolId,
        }
      )
      expect(response.status).toBe(200)
      expect(mockedEligibilityService.verifyEligibility).toHaveBeenCalledWith(
        undefined,
        schoolId
      )
      expect(response.body).toEqual({ isEligible })
    })

    test('returns 422 when schoolId is missing', async () => {
      const response = await sendGet('/api-public/eligibility/check/teacher')
      expect(response.status).toBe(422)
      expect(response.body.err).toBe('School ID must be provided.')
      expect(mockedEligibilityService.verifyEligibility).not.toHaveBeenCalled()
    })
  })

  describe('GET /school/search', () => {
    test('returns school search results', async () => {
      const school = buildSchool()
      const results = [
        {
          id: school.id,
          upchieveId: school.id,
          name: school.name,
          districtName: 'District 1',
          city: 'Brooklyn',
          state: 'NY',
        },
      ]
      mockedSchoolService.search.mockResolvedValueOnce(results)

      const response = await sendGetQuery(
        '/api-public/eligibility/school/search',
        { q: 'brooklyn' }
      )
      expect(response.status).toBe(200)
      expect(mockedSchoolService.search).toHaveBeenCalledWith('brooklyn')
      expect(response.body).toEqual({
        results,
      })
    })
  })

  describe('PUT /school/:schoolId', () => {
    test('updates school as admin', async () => {
      const school = buildSchool()
      const update = {
        name: 'Updated School',
        city: 'Brooklyn',
        state: 'NY',
        zip: '11201',
        isApproved: true,
      }
      mockedSchoolService.adminUpdateSchool.mockResolvedValueOnce(undefined)

      const response = await sendPut(
        `/api-public/eligibility/school/${school.id}`,
        update
      )
      expect(response.status).toBe(200)
      expect(mockedSchoolService.adminUpdateSchool).toHaveBeenCalledWith({
        schoolId: school.id,
        ...update,
      })
    })
  })

  describe('POST /school/approval', () => {
    test('updates school approval', async () => {
      const school = buildSchool()
      const isApproved = true
      mockedSchoolService.updateApproval.mockResolvedValueOnce(undefined)

      const response = await sendPost(
        '/api-public/eligibility/school/approval',
        {
          schoolId: school.id,
          isApproved,
        }
      )
      expect(response.status).toBe(200)
      expect(mockedSchoolService.updateApproval).toHaveBeenCalledWith(
        school.id,
        isApproved
      )
    })
  })

  describe('POST /school/partner', () => {
    test('updates school partner status', async () => {
      const school = buildSchool()
      const isPartner = true
      mockedSchoolService.updateIsPartner.mockResolvedValueOnce(undefined)

      const response = await sendPost(
        '/api-public/eligibility/school/partner',
        {
          schoolId: school.id,
          isPartner,
        }
      )
      expect(response.status).toBe(200)
      expect(mockedSchoolService.updateIsPartner).toHaveBeenCalledWith(
        school.id,
        isPartner
      )
    })
  })

  describe('GET /ineligible-students', () => {
    test('returns paginated ineligible students', async () => {
      const ineligibleStudents = [
        buildIneligibleStudent(),
        buildIneligibleStudent(),
      ]
      const perPage = 15
      const isLastPage = ineligibleStudents.length < perPage
      mockedIneligibleStudentRepo.getIneligibleStudentsPaginated.mockResolvedValueOnce(
        ineligibleStudents
      )

      const response = await sendGet(
        '/api-public/eligibility/ineligible-students'
      )
      expect(response.status).toBe(200)
      expect(
        mockedIneligibleStudentRepo.getIneligibleStudentsPaginated
      ).toHaveBeenCalledWith(perPage, 0)
      expect(response.body).toEqual({
        ineligibleStudents: ineligibleStudents.map((student) => {
          return {
            ...student,
            createdAt: student.createdAt.toISOString(),
            updatedAt: student.updatedAt.toISOString(),
          }
        }),
        isLastPage,
      })
    })

    test('returns paginated ineligible students for requested page', async () => {
      mockedIneligibleStudentRepo.getIneligibleStudentsPaginated.mockResolvedValueOnce(
        []
      )

      const response = await sendGetQuery(
        '/api-public/eligibility/ineligible-students',
        {
          page: '3',
        }
      )
      expect(response.status).toBe(200)
      expect(
        mockedIneligibleStudentRepo.getIneligibleStudentsPaginated
      ).toHaveBeenCalledWith(15, 30)
      expect(response.body).toEqual({
        ineligibleStudents: [],
        isLastPage: true,
      })
    })
  })

  describe('GET /zip-codes/:zipCode', () => {
    test('returns zip code data when zip code exists', async () => {
      const zipCode = buildZipCode()
      mockedZipCodeRepo.getZipCodeByZipCode.mockResolvedValueOnce(zipCode)

      const response = await sendGet(
        `/api-public/eligibility/zip-codes/${zipCode.zipCode}`
      )
      expect(response.status).toBe(200)
      expect(mockedZipCodeRepo.getZipCodeByZipCode).toHaveBeenCalledWith(
        zipCode.zipCode
      )
      expect(response.body).toEqual({
        zipCode,
      })
    })

    test('returns 404 when zip code does not exist', async () => {
      const zipCode = '12345'
      mockedZipCodeRepo.getZipCodeByZipCode.mockResolvedValueOnce(undefined)

      const response = await sendGet(
        `/api-public/eligibility/zip-codes/${zipCode}`
      )
      expect(response.status).toBe(404)
      expect(mockedZipCodeRepo.getZipCodeByZipCode).toHaveBeenCalledWith(
        zipCode
      )
    })
  })

  describe('GET /ip-check', () => {
    test('returns 200 when ip address is allowed', async () => {
      mockedIpAddressService.checkIpAddress.mockResolvedValueOnce(undefined)

      const response = await sendGetQuery('/api-public/eligibility/ip-check', {
        ip: '161.185.160.93',
      })
      expect(response.status).toBe(200)
      expect(mockedIpAddressService.checkIpAddress).toHaveBeenCalledWith(
        expect.any(String)
      )
    })
  })

  describe('GET /check-zip-code/:zipCode', () => {
    const zipCode = '12345'
    test('returns true when zip code exists', async () => {
      mockedEligibilityService.checkZipCode.mockResolvedValueOnce(true)

      const response = await sendGet(
        `/api-public/eligibility/check-zip-code/${zipCode}`
      )
      expect(response.status).toBe(200)
      expect(mockedEligibilityService.checkZipCode).toHaveBeenCalledWith(
        zipCode
      )
      expect(response.body).toEqual({
        isValidZipCode: true,
      })
    })

    test('returns false when zip code does not exist', async () => {
      mockedEligibilityService.checkZipCode.mockResolvedValueOnce(false)

      const response = await sendGet(
        `/api-public/eligibility/check-zip-code/${zipCode}`
      )
      expect(response.status).toBe(200)
      expect(mockedEligibilityService.checkZipCode).toHaveBeenCalledWith(
        zipCode
      )
      expect(response.body).toEqual({
        isValidZipCode: false,
      })
    })
  })

  describe('GET /signup-sources/students', () => {
    test('returns signup sources', async () => {
      const signupSources = [
        { id: 1, name: 'Google' },
        { id: 2, name: 'Friend' },
      ]
      mockedStudentService.getStudentSignupSources.mockResolvedValueOnce(
        signupSources
      )

      const response = await sendGet(
        '/api-public/eligibility/signup-sources/students'
      )
      expect(response.status).toBe(200)
      expect(
        mockedStudentService.getStudentSignupSources
      ).toHaveBeenCalledTimes(1)
      expect(response.body).toEqual({
        signupSources,
      })
    })
  })

  describe('POST /big-future/email', () => {
    test('pushes email to redis list and returns 200', async () => {
      const email = getEmail()
      mockedCache.rpush.mockResolvedValueOnce(1)

      const response = await sendPost(
        '/api-public/eligibility/big-future/email',
        { email }
      )
      expect(response.status).toBe(200)
      expect(mockedCache.rpush).toHaveBeenCalledWith('big-future-emails', email)
    })

    test('returns 422 when email is missing', async () => {
      const response = await sendPost(
        '/api-public/eligibility/big-future/email',
        {}
      )
      expect(response.status).toBe(422)
      expect(mockedCache.rpush).not.toHaveBeenCalled()
    })

    test('returns 500 when rpush throws', async () => {
      const email = getEmail()
      mockedCache.rpush.mockRejectedValueOnce(new Error('Error'))

      const response = await sendPost(
        '/api-public/eligibility/big-future/email',
        { email }
      )
      expect(response.status).toBe(500)
      expect(mockedCache.rpush).toHaveBeenCalledWith('big-future-emails', email)
    })
  })
})
