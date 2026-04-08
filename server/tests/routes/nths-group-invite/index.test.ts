import request, { Response } from 'supertest'
import { mocked } from 'jest-mock'
import { mockApp } from '../../mock-app'
import * as NTHSGroupInviteRouter from '../../../router/nths-group-invite'
import * as NTHSGroupsService from '../../../services/NTHSGroupsService'
import { buildNTHSGroup } from '../../mocks/generate'
import { getUuid } from '../../../models/pgUtils'

jest.mock('../../../services/NTHSGroupsService')
jest.mock('../../../logger')

const mockedNTHSGroupsService = mocked(NTHSGroupsService)

const app = mockApp()
NTHSGroupInviteRouter.routes(app)

const agent = request.agent(app)

function sendGet(path: string): Promise<Response> {
  return agent.get(path).set('Accept', 'application/json')
}

describe('routeNTHSGroupInvite', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api-public/nths-group-invite/:inviteCode/invitation', () => {
    const inviteCode = getUuid()
    test('returns nths group for invite code', async () => {
      const group = buildNTHSGroup()
      mockedNTHSGroupsService.getNTHSGroupByInviteCode.mockResolvedValueOnce(
        group
      )

      const response = await sendGet(
        `/api-public/nths-group-invite/${group.inviteCode}/invitation`
      )
      expect(response.status).toBe(200)
      expect(
        mockedNTHSGroupsService.getNTHSGroupByInviteCode
      ).toHaveBeenCalledWith(group.inviteCode)
      expect(response.body).toEqual({
        NTHSgroup: { ...group, createdAt: group.createdAt?.toISOString() },
      })
    })

    test('returns null nths group when invite code is not found', async () => {
      // TODO: update return type from underlying function
      mockedNTHSGroupsService.getNTHSGroupByInviteCode.mockResolvedValueOnce(
        undefined
      )

      const response = await sendGet(
        `/api-public/nths-group-invite/${inviteCode}/invitation`
      )
      expect(response.status).toBe(200)
      expect(
        mockedNTHSGroupsService.getNTHSGroupByInviteCode
      ).toHaveBeenCalledWith(inviteCode)
      expect(response.body).toEqual({
        NTHSgroup: undefined,
      })
    })

    test('returns 422 when invite code param is invalid', async () => {
      const response = await sendGet(
        '/api-public/nths-group-invite//invitation'
      )

      expect(response.status).toBe(404)
      expect(
        mockedNTHSGroupsService.getNTHSGroupByInviteCode
      ).not.toHaveBeenCalled()
    })

    test('returns 500 when service throws', async () => {
      const errorMessage = 'Error'
      mockedNTHSGroupsService.getNTHSGroupByInviteCode.mockRejectedValueOnce(
        new Error(errorMessage)
      )

      const response = await sendGet(
        `/api-public/nths-group-invite/${inviteCode}/invitation`
      )
      expect(response.status).toBe(500)
      expect(
        mockedNTHSGroupsService.getNTHSGroupByInviteCode
      ).toHaveBeenCalledWith(inviteCode)
      expect(response.body).toEqual({
        err: errorMessage,
      })
    })
  })
})
