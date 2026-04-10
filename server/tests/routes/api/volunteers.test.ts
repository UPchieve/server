import request, { Response } from 'supertest'
import { mocked } from 'jest-mock'
import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import { mockApp, mockRouter } from '../../mock-app'
import { routeVolunteers } from '../../../router/api/volunteers'
import * as VolunteersCtrl from '../../../controllers/VolunteersCtrl'
import * as VolunteerService from '../../../services/VolunteerService'
import * as cache from '../../../cache'
import config from '../../../config'
import {
  buildLegacyVolunteer,
  buildHeatMap,
  serializeRoleContext,
} from '../../mocks/generate'
import { getUuid } from '../../../models/pgUtils'
import { DAYS, HOURS } from '../../../constants'
import moment from 'moment'

function isAdmin(
  _req: ExpressRequest<string, unknown>,
  _res: ExpressResponse,
  next: () => void
): void {
  next()
}

jest.mock('../../../controllers/VolunteersCtrl')
jest.mock('../../../services/VolunteerService')
jest.mock('../../../cache')
jest.mock('../../../logger')
jest.mock('../../../utils/auth-utils', () => ({
  authPassport: {
    isAdmin,
  },
}))

const mockedVolunteersCtrl = mocked(VolunteersCtrl)
const mockedVolunteerService = mocked(VolunteerService)
const mockedCache = mocked(cache)

const router = mockRouter()
routeVolunteers(router)

const app = mockApp()
app.use('/api', router)

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

describe('routeVolunteers', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /api/volunteers/availability/:certifiedSubject', () => {
    test('returns aggregated volunteer availabilities', async () => {
      const subject = 'algebraOne'
      const aggAvailabilities = {
        ...buildHeatMap(),
        daysOfWeek: ['Sunday', 'Monday'] as DAYS[],
        timesOfDay: ['12a', '1a'] as HOURS[],
        table: Array(7)
          .fill(0)
          .map(() => Array(24).fill(0)),
        min: 0,
        max: 4,
      }
      mockedVolunteersCtrl.getVolunteersAvailability.mockResolvedValueOnce(
        aggAvailabilities
      )

      const response = await sendGet(`/api/volunteers/availability/${subject}`)
      expect(response.status).toBe(200)
      expect(
        mockedVolunteersCtrl.getVolunteersAvailability
      ).toHaveBeenCalledWith(subject)
      expect(response.body).toEqual({
        msg: 'Users retreived from database',
        aggAvailabilities,
      })
    })
  })

  describe('GET /api/volunteers/review', () => {
    test('returns volunteers to review', async () => {
      const volunteers = [buildLegacyVolunteer()]
      const page = 1
      mockedVolunteerService.getVolunteersToReview.mockResolvedValueOnce({
        volunteers,
        isLastPage: false,
      })

      const response = await sendGet(`/api/volunteers/review?page=${page}`)
      expect(response.status).toBe(200)
      expect(mockedVolunteerService.getVolunteersToReview).toHaveBeenCalledWith(
        page
      )
      expect(response.body).toEqual({
        volunteers: volunteers.map((volunteer) => {
          return {
            ...volunteer,
            _id: volunteer.id,
            firstname: volunteer.firstName,
            lastname: volunteer.lastName,
            roleContext: serializeRoleContext(volunteer.roleContext),
            createdAt: volunteer.createdAt.toISOString(),
          }
        }),
        isLastPage: false,
      })
    })

    test('defaults page to 1 when page query is missing', async () => {
      mockedVolunteerService.getVolunteersToReview.mockResolvedValueOnce({
        volunteers: [],
        isLastPage: true,
      })

      const response = await sendGet('/api/volunteers/review')
      expect(response.status).toBe(200)
      expect(mockedVolunteerService.getVolunteersToReview).toHaveBeenCalledWith(
        1
      )
    })

    test('returns fixed error message on failure', async () => {
      mockedVolunteerService.getVolunteersToReview.mockRejectedValueOnce(
        new Error('Error')
      )

      const response = await sendGet('/api/volunteers/review')
      expect(response.status).toBe(500)
      expect(response.body).toEqual({
        err: 'There was an error retrieving the pending volunteers.',
      })
    })
  })

  describe('POST /api/volunteers/review/:id', () => {
    test('updates pending volunteer status to approved', async () => {
      const volunteerId = getUuid()
      mockedVolunteerService.updatePendingVolunteerStatus.mockResolvedValueOnce()

      const response = await sendPost(`/api/volunteers/review/${volunteerId}`, {
        photoIdStatus: 'APPROVED',
      })
      expect(response.status).toBe(200)
      expect(
        mockedVolunteerService.updatePendingVolunteerStatus
      ).toHaveBeenCalledWith(volunteerId, 'approved')
    })

    test('returns error message on failure', async () => {
      const volunteerId = getUuid()
      const errorMessage = 'Failed to update'
      mockedVolunteerService.updatePendingVolunteerStatus.mockRejectedValueOnce(
        new Error(errorMessage)
      )

      const response = await sendPost(`/api/volunteers/review/${volunteerId}`, {
        photoIdStatus: 'REJECTED',
      })
      expect(response.status).toBe(500)
      expect(response.body).toEqual({ err: errorMessage })
    })
  })

  describe('GET /api/volunteers/hours-last-updated', () => {
    test('returns formatted last updated date', async () => {
      const updatedAt = new Date()
      mockedCache.get.mockResolvedValueOnce(updatedAt.toISOString())

      const response = await sendGet('/api/volunteers/hours-last-updated')
      expect(response.status).toBe(200)
      expect(mockedCache.get).toHaveBeenCalledWith(
        config.cacheKeys.updateTotalVolunteerHoursLastRun
      )
      expect(response.body).toEqual({
        lastUpdated: moment(updatedAt).format('M/DD/YYYY'),
      })
    })

    test('returns 409 when cache key is not found', async () => {
      mockedCache.get.mockRejectedValueOnce(
        new cache.KeyNotFoundError('Missing key')
      )

      const response = await sendGet('/api/volunteers/hours-last-updated')
      expect(response.status).toBe(409)
    })

    test('returns 500 for other non cache related errors', async () => {
      const errorMessage = 'Error'
      mockedCache.get.mockRejectedValueOnce(new Error(errorMessage))

      const response = await sendGet('/api/volunteers/hours-last-updated')
      expect(response.status).toBe(500)
      expect(response.body).toEqual({
        err: errorMessage,
      })
    })
  })

  describe('GET /api/volunteers/presence', () => {
    test('returns volunteer presence by subject', async () => {
      const presenceBySubject = {
        algebraOne: 3,
        biology: 2,
      }
      mockedVolunteerService.getSubjectPresence.mockResolvedValueOnce(
        presenceBySubject
      )

      const response = await sendGet('/api/volunteers/presence')
      expect(response.status).toBe(200)
      expect(mockedVolunteerService.getSubjectPresence).toHaveBeenCalled()
      expect(response.body).toEqual({ presenceBySubject })
    })
  })
})
