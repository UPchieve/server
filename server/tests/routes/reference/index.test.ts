import request, { Response } from 'supertest'
import { mocked } from 'jest-mock'
import { mockApp } from '../../mock-app'
import * as ReferenceRouter from '../../../router/reference'
import * as UserService from '../../../services/UserService'
import * as VolunteerRepo from '../../../models/Volunteer/queries'
import { getUuid } from '../../../models/pgUtils'

jest.mock('../../../services/UserService')
jest.mock('../../../models/Volunteer/queries')
jest.mock('../../../logger')

const mockedUserService = mocked(UserService)
const mockedVolunteerRepo = mocked(VolunteerRepo)

const app = mockApp()
ReferenceRouter.routes(app)

const agent = request.agent(app)

function sendGet(path: string): Promise<Response> {
  return agent.get(path).set('Accept', 'application/json')
}

function sendPost(
  path: string,
  payload?: Record<string, unknown>
): Promise<Response> {
  return agent.post(path).set('Accept', 'application/json').send(payload)
}

describe('routeReference', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api-public/reference/:referenceId/submit', () => {
    test('saves reference form and returns 200 when reference exists', async () => {
      const referenceId = getUuid()
      const referenceFormData = {
        affiliation: 'Teacher',
        relationshipLength: '2 years',
        additionalInfo: 'Great with students',
        patient: 5,
        positiveRoleModel: 5,
        agreeableAndApproachable: 5,
        communicatesEffectively: 5,
        trustworthyWithChildren: 5,
      }
      const volunteerReference = {
        volunteerId: getUuid(),
        referenceEmail: 'reference@example.com',
      }

      mockedVolunteerRepo.getVolunteerByReference.mockResolvedValueOnce(
        volunteerReference
      )
      mockedUserService.saveReferenceForm.mockResolvedValueOnce()

      const response = await sendPost(
        `/api-public/reference/${referenceId}/submit`,
        referenceFormData
      )
      expect(response.status).toBe(200)
      expect(mockedVolunteerRepo.getVolunteerByReference).toHaveBeenCalledWith(
        referenceId
      )
      expect(mockedUserService.saveReferenceForm).toHaveBeenCalledWith(
        volunteerReference.volunteerId,
        referenceId,
        volunteerReference.referenceEmail,
        referenceFormData,
        expect.any(String)
      )
    })

    test('returns 404 when reference does not exist', async () => {
      const referenceId = getUuid()
      mockedVolunteerRepo.getVolunteerByReference.mockResolvedValueOnce(
        undefined
      )

      const response = await sendPost(
        `/api-public/reference/${referenceId}/submit`,
        {
          affiliation: 'Teacher',
        }
      )
      expect(response.status).toBe(404)
      expect(mockedVolunteerRepo.getVolunteerByReference).toHaveBeenCalledWith(
        referenceId
      )
      expect(mockedUserService.saveReferenceForm).not.toHaveBeenCalled()
    })

    test('returns 500 when saveReferenceForm throws', async () => {
      const referenceId = getUuid()
      const volunteerReference = {
        volunteerId: getUuid(),
        referenceEmail: 'reference@example.com',
      }
      const errorMessage = 'Error'

      mockedVolunteerRepo.getVolunteerByReference.mockResolvedValueOnce(
        volunteerReference
      )
      mockedUserService.saveReferenceForm.mockRejectedValueOnce(
        new Error(errorMessage)
      )

      const response = await sendPost(
        `/api-public/reference/${referenceId}/submit`,
        {
          affiliation: 'Teacher',
        }
      )

      expect(response.status).toBe(500)
      expect(response.body.err).toBe(errorMessage)
      expect(mockedVolunteerRepo.getVolunteerByReference).toHaveBeenCalledWith(
        referenceId
      )
      expect(mockedUserService.saveReferenceForm).toHaveBeenCalledWith(
        volunteerReference.volunteerId,
        referenceId,
        volunteerReference.referenceEmail,
        { affiliation: 'Teacher' },
        expect.any(String)
      )
    })
  })

  describe('GET /api-public/reference/:referenceId', () => {
    test('returns 200 when reference exists', async () => {
      const referenceId = getUuid()
      const volunteerReference = {
        volunteerId: getUuid(),
        referenceEmail: 'reference@example.com',
      }
      mockedVolunteerRepo.getVolunteerByReference.mockResolvedValueOnce(
        volunteerReference
      )

      const response = await sendGet(`/api-public/reference/${referenceId}`)
      expect(response.status).toBe(200)
      expect(mockedVolunteerRepo.getVolunteerByReference).toHaveBeenCalledWith(
        referenceId
      )
    })

    test('returns 404 when reference does not exist', async () => {
      const referenceId = getUuid()
      mockedVolunteerRepo.getVolunteerByReference.mockResolvedValueOnce(
        undefined
      )

      const response = await sendGet(`/api-public/reference/${referenceId}`)
      expect(response.status).toBe(404)
      expect(mockedVolunteerRepo.getVolunteerByReference).toHaveBeenCalledWith(
        referenceId
      )
    })

    test('returns 500 when getVolunteerByReference throws', async () => {
      const referenceId = getUuid()
      const errorMessage = 'Error'
      mockedVolunteerRepo.getVolunteerByReference.mockRejectedValueOnce(
        new Error(errorMessage)
      )

      const response = await sendGet(`/api-public/reference/${referenceId}`)
      expect(response.status).toBe(500)
      expect(response.body.err).toBe(errorMessage)
      expect(mockedVolunteerRepo.getVolunteerByReference).toHaveBeenCalledWith(
        referenceId
      )
    })
  })
})
