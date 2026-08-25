import { mocked } from 'jest-mock'
import request, { Response } from 'supertest'
import { mockApp, mockPassportMiddleware, mockRouter } from '../../mock-app'
import { buildVolunteer } from '../../mocks/generate'
import { routeNTHSApplication } from '../../../router/api/nths-application'
import * as NTHSApplicationService from '../../../services/NTHSApplicationService'
import { NTHSApplicationNotEligibleError } from '../../../services/NTHSApplicationService'
import { NTHSCandidateApplication } from '../../../models/NTHSApplication'
import { NTHSCandidateApplicationStatus } from '../../../models/NTHSGroups'
import { getUuid } from '../../../models/pgUtils'
import { InputError, NTHSApplicationExistsError } from '../../../models/Errors'
import { GRADES } from '../../../constants/user'

jest.mock('../../../services/NTHSApplicationService', () => {
  const actual = jest.requireActual('../../../services/NTHSApplicationService')
  return {
    ...actual,
    submitCandidateApplication: jest.fn(),
    getApplicationEligibility: jest.fn(),
    getLatestCandidateApplication: jest.fn(),
  }
})

const mockedService = mocked(NTHSApplicationService)

let mockUser = buildVolunteer()

const authedRouter = mockRouter()
routeNTHSApplication(authedRouter)
const authedApp = mockApp()
authedApp.use(mockPassportMiddleware(() => mockUser))
authedApp.use('/api', authedRouter)
const authedAgent = request.agent(authedApp)

// No passport middleware, so req.user is undefined the way it is for a
// logged-out request.
const anonRouter = mockRouter()
routeNTHSApplication(anonRouter)
const anonApp = mockApp()
anonApp.use('/api', anonRouter)
const anonAgent = request.agent(anonApp)

const RESPONSES = { whyStartChapter: 'To help my peers' }

const UNLISTED_SCHOOL = {
  name: 'Riverside International Academy',
  city: 'Boulder',
  state: 'CO',
}

function sendPost(
  agent: request.SuperAgentTest,
  payload?: object
): Promise<Response> {
  return agent
    .post('/api/nths-application')
    .set('Accept', 'application/json')
    .send(payload)
}

function buildApplication(
  overrides: Partial<NTHSCandidateApplication> = {}
): NTHSCandidateApplication {
  return {
    id: 1,
    userId: mockUser.id,
    status: NTHSCandidateApplicationStatus.applied,
    schoolId: getUuid(),
    formVersion: 1,
    responses: RESPONSES,
    createdAt: new Date('2026-08-06T00:00:00.000Z'),
    ...overrides,
  }
}

describe('POST /api/nths-application', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUser = buildVolunteer()
  })

  test('creates an application for the session user', async () => {
    const application = buildApplication({ userId: mockUser.id })
    mockedService.submitCandidateApplication.mockResolvedValueOnce(application)

    const response = await sendPost(authedAgent, {
      schoolId: application.schoolId,
      gradeLevel: GRADES.ELEVENTH,
      responses: RESPONSES,
    })

    expect(response.status).toBe(200)
    expect(mockedService.submitCandidateApplication).toHaveBeenCalledWith({
      userId: mockUser.id,
      schoolId: application.schoolId,
      unlistedSchool: undefined,
      gradeLevel: GRADES.ELEVENTH,
      responses: RESPONSES,
    })
    expect(response.body).toEqual({
      application: {
        id: application.id,
        status: 'applied',
        schoolId: application.schoolId,
        formVersion: 1,
        responses: RESPONSES,
        createdAt: application.createdAt.toISOString(),
      },
    })
  })

  test('passes an unlisted school through to the service', async () => {
    const application = buildApplication({
      schoolId: undefined,
      unlistedSchool: UNLISTED_SCHOOL,
    })
    mockedService.submitCandidateApplication.mockResolvedValueOnce(application)

    const response = await sendPost(authedAgent, {
      unlistedSchool: UNLISTED_SCHOOL,
      gradeLevel: GRADES.TWELVETH,
      responses: RESPONSES,
    })

    expect(response.status).toBe(200)
    expect(mockedService.submitCandidateApplication).toHaveBeenCalledWith(
      expect.objectContaining({ unlistedSchool: UNLISTED_SCHOOL })
    )
    expect(response.body.application.unlistedSchool).toEqual(UNLISTED_SCHOOL)
  })

  test('takes the user from the session and ignores a userId in the body', async () => {
    mockedService.submitCandidateApplication.mockResolvedValueOnce(
      buildApplication()
    )

    const spoofedUserId = getUuid()
    await sendPost(authedAgent, {
      userId: spoofedUserId,
      gradeLevel: GRADES.ELEVENTH,
      responses: RESPONSES,
    })

    expect(mockedService.submitCandidateApplication).toHaveBeenCalledWith(
      expect.objectContaining({ userId: mockUser.id })
    )
    expect(mockedService.submitCandidateApplication).not.toHaveBeenCalledWith(
      expect.objectContaining({ userId: spoofedUserId })
    )
  })

  test('gives HTTP 401 when the request is not authenticated', async () => {
    const response = await sendPost(anonAgent, {
      gradeLevel: GRADES.ELEVENTH,
      responses: RESPONSES,
    })

    expect(response.status).toBe(401)
    expect(mockedService.submitCandidateApplication).not.toHaveBeenCalled()
  })

  test.each([
    ['responses is missing', { gradeLevel: GRADES.ELEVENTH }],
    [
      'responses is not an object',
      { gradeLevel: GRADES.ELEVENTH, responses: 'nope' },
    ],
    ['gradeLevel is missing', { responses: RESPONSES }],
    [
      'gradeLevel is not a known grade',
      { gradeLevel: 'tenth', responses: RESPONSES },
    ],
    [
      'schoolId is not a uuid',
      {
        gradeLevel: GRADES.ELEVENTH,
        responses: RESPONSES,
        schoolId: 'not-a-uuid',
      },
    ],
    [
      'unlistedSchool is not an object',
      {
        gradeLevel: GRADES.ELEVENTH,
        responses: RESPONSES,
        unlistedSchool: 'Riverside',
      },
    ],
  ])('gives HTTP 422 when %s', async (_label, payload) => {
    const response = await sendPost(authedAgent, payload)

    expect(response.status).toBe(422)
    // A validation message must not echo table or column names back to a client.
    expect(response.body.err).not.toMatch(/nths_candidate_applications/)
    expect(mockedService.submitCandidateApplication).not.toHaveBeenCalled()
  })

  test('gives HTTP 422 when the service rejects the submission', async () => {
    mockedService.submitCandidateApplication.mockRejectedValueOnce(
      new InputError('An application needs a school')
    )

    const response = await sendPost(authedAgent, {
      gradeLevel: GRADES.ELEVENTH,
      responses: RESPONSES,
    })

    expect(response.status).toBe(422)
    expect(response.body.err).toBe('An application needs a school')
  })

  test('gives HTTP 409 when the applicant already has one pending', async () => {
    mockedService.submitCandidateApplication.mockRejectedValueOnce(
      new NTHSApplicationExistsError(
        'You already have an application being reviewed'
      )
    )

    const response = await sendPost(authedAgent, {
      gradeLevel: GRADES.ELEVENTH,
      responses: RESPONSES,
      schoolId: getUuid(),
    })

    expect(response.status).toBe(409)
    expect(response.body.err).toBe(
      'You already have an application being reviewed'
    )
  })

  test('gives HTTP 403 without disclosing why an applicant is ineligible', async () => {
    mockedService.submitCandidateApplication.mockRejectedValueOnce(
      new NTHSApplicationNotEligibleError(
        'Ineligible NTHS chapter application',
        {
          userId: mockUser.id,
          reasons: ['banned'],
        }
      )
    )

    const response = await sendPost(authedAgent, {
      gradeLevel: GRADES.ELEVENTH,
      responses: RESPONSES,
      schoolId: getUuid(),
    })

    expect(response.status).toBe(403)
    expect(response.body.err).toBe(
      'You are not currently eligible to apply to start an NTHS chapter'
    )
    expect(response.body.err).not.toMatch(/banned/)
  })
})

describe('GET /api/nths-application/eligibility', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUser = buildVolunteer()
  })

  test('returns eligibility, the reasons, and the current grade', async () => {
    mockedService.getApplicationEligibility.mockResolvedValueOnce({
      eligible: false,
      reasons: [
        NTHSApplicationService.NTHSApplicationIneligibilityReason.notApproved,
        NTHSApplicationService.NTHSApplicationIneligibilityReason
          .noCompletedSessions,
      ],
      currentGradeName: '11th',
    })

    const response = await authedAgent.get('/api/nths-application/eligibility')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      eligible: false,
      reasons: ['notApproved', 'noCompletedSessions'],
      currentGradeName: '11th',
    })
  })

  test('never tells the applicant they are banned', async () => {
    mockedService.getApplicationEligibility.mockResolvedValueOnce({
      eligible: false,
      reasons: [
        NTHSApplicationService.NTHSApplicationIneligibilityReason.banned,
        NTHSApplicationService.NTHSApplicationIneligibilityReason
          .noCompletedSessions,
      ],
      currentGradeName: '11th',
    })

    const response = await authedAgent.get('/api/nths-application/eligibility')

    expect(response.status).toBe(200)
    expect(response.body.reasons).toEqual(['noCompletedSessions'])
    expect(JSON.stringify(response.body)).not.toMatch(/banned/)
  })

  test('gives HTTP 401 when the request is not authenticated', async () => {
    const response = await anonAgent.get('/api/nths-application/eligibility')

    expect(response.status).toBe(401)
    expect(mockedService.getApplicationEligibility).not.toHaveBeenCalled()
  })
})
