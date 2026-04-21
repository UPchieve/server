import { mocked } from 'jest-mock'
import request, { Response } from 'supertest'
import { mockApp, mockPassportMiddleware, mockRouter } from '../../mock-app'
import {
  buildNTHSGroup,
  buildNTHSGroupMemberWithRole,
  buildNTHSGroupWithMemberInfo,
  buildUser,
  buildVolunteer,
} from '../../mocks/generate'
import { isGroupAdmin, routeNTHSGroups } from '../../../router/api/nths-groups'
import * as NTHSGroupsService from '../../../services/NTHSGroupsService'
import { RepoUpdateError } from '../../../models/Errors'
import {
  NTHSCandidateApplicationStatus,
  NTHSSchoolAffiliationStatusName,
} from '../../../models/NTHSGroups/types'
import { getUuid } from '../../../models/pgUtils'
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from 'express'

jest.mock('../../../services/NTHSGroupsService')

const mockedNTHSGroupsService = mocked(NTHSGroupsService)

let mockUser = buildVolunteer()

function mockGetUser() {
  return mockUser
}

const router = mockRouter()
routeNTHSGroups(router)

const app = mockApp()
app.use(mockPassportMiddleware(mockGetUser))
app.use('/api', router)

const agent = request.agent(app)

function sendGet(path: string): Promise<Response> {
  return agent.get(path).set('Accept', 'application/json')
}

function sendPost(path: string, payload?: object): Promise<Response> {
  return agent.post(path).set('Accept', 'application/json').send(payload)
}

function sendPut(path: string, payload?: object): Promise<Response> {
  return agent.put(path).set('Accept', 'application/json').send(payload)
}

function sendDelete(path: string): Promise<Response> {
  return agent.delete(path).set('Accept', 'application/json')
}

const groupId = getUuid()
const memberId = getUuid()
const actionName = 'Action'

describe('isGroupAdmin', () => {
  const userId = getUuid()

  beforeEach(() => {
    jest.resetAllMocks()
    mockUser = buildVolunteer()
  })

  test('Gives HTTP 403 if the requesting user is not an admin', async () => {
    const member = buildNTHSGroupMemberWithRole()
    mockedNTHSGroupsService.getGroupMember.mockResolvedValueOnce(member)

    const mockNextFunction = jest.fn()
    const mockStatus = jest.fn().mockReturnThis()
    const mockJson = jest.fn()
    const request = {
      user: { id: mockUser.id },
      params: { groupId: groupId },
    } as unknown as ExpressRequest
    const mockResponse = {
      status: mockStatus,
      json: mockJson,
    } as unknown as ExpressResponse

    await isGroupAdmin(request, mockResponse, mockNextFunction)
    expect(mockNextFunction).not.toHaveBeenCalled()
    expect(mockStatus).toHaveBeenCalledWith(403)
    expect(mockJson).toHaveBeenCalledWith({ err: 'Unauthorized' })
  })

  test('Passes the middleware if the user is an admin of this group', async () => {
    const member = buildNTHSGroupMemberWithRole({ roleName: 'admin' })
    mockedNTHSGroupsService.getGroupMember.mockResolvedValueOnce(member)

    const request = {
      user: { id: userId },
      params: { groupId },
    } as unknown as ExpressRequest
    const mockResponse = {} as unknown as ExpressResponse
    const nextFunctionMock: NextFunction = jest.fn()

    await isGroupAdmin(request, mockResponse, nextFunctionMock)
    expect(nextFunctionMock).toHaveBeenCalledTimes(1)
  })
})

describe('routeNTHSGroups', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockUser = buildVolunteer()
  })

  describe('GET /api/nths-groups', () => {
    test('returns groups and candidateApplicationStatus when user has no groups', async () => {
      mockedNTHSGroupsService.getGroups.mockResolvedValueOnce([])
      mockedNTHSGroupsService.getLatestCandidateApplicationStatus.mockResolvedValueOnce(
        NTHSCandidateApplicationStatus.applied
      )

      const response = await sendGet('/api/nths-groups')
      expect(response.status).toBe(200)
      expect(mockedNTHSGroupsService.getGroups).toHaveBeenCalledWith(
        mockUser.id
      )
      expect(
        mockedNTHSGroupsService.getLatestCandidateApplicationStatus
      ).toHaveBeenCalledWith(mockUser.id)
      expect(response.body).toEqual({
        groups: [],
        candidateApplicationStatus: 'applied',
      })
    })

    test('returns groups and does not get candidateApplicationStatus when user has groups', async () => {
      const group = buildNTHSGroupWithMemberInfo()
      const groups = [group]
      mockedNTHSGroupsService.getGroups.mockResolvedValueOnce(groups)

      const response = await sendGet('/api/nths-groups')
      expect(response.status).toBe(200)
      expect(mockedNTHSGroupsService.getGroups).toHaveBeenCalledWith(
        mockUser.id
      )
      expect(
        mockedNTHSGroupsService.getLatestCandidateApplicationStatus
      ).not.toHaveBeenCalled()
      expect(response.body).toEqual({
        groups: [
          {
            ...group,
            groupInfo: {
              ...group.groupInfo,
              createdAt: group.groupInfo.createdAt?.toISOString(),
            },
            memberInfo: {
              ...group.memberInfo,
              joinedAt: group.joinedAt.toISOString(),
            },
            joinedAt: group.joinedAt.toISOString(),
          },
        ],
      })
    })
  })

  describe('GET /api/nths-groups/:groupId/members', () => {
    test('returns group members', async () => {
      const member = buildNTHSGroupMemberWithRole()
      const members = [member]
      mockedNTHSGroupsService.getGroupMembers.mockResolvedValueOnce(members)

      const response = await sendGet(`/api/nths-groups/${groupId}/members`)
      expect(response.status).toBe(200)
      expect(mockedNTHSGroupsService.getGroupMembers).toHaveBeenCalledWith(
        groupId
      )
      expect(response.body).toEqual({
        members: [
          {
            ...member,
            joinedAt: member.joinedAt.toISOString(),
            updatedAt: member.joinedAt.toISOString(),
          },
        ],
      })
    })
  })

  describe('PUT /api/nths-groups/:groupId/members/:memberId', () => {
    test('updates a member when requester is group admin', async () => {
      const member = buildNTHSGroupMemberWithRole({
        roleName: 'admin',
      })
      mockedNTHSGroupsService.getGroupMember.mockResolvedValueOnce(member)
      mockedNTHSGroupsService.updateGroupMember.mockResolvedValueOnce()
      const payload = {
        role: 'admin',
        isActive: true,
      }

      const response = await sendPut(
        `/api/nths-groups/${groupId}/members/${memberId}`,
        payload
      )
      expect(response.status).toBe(204)
      expect(mockedNTHSGroupsService.updateGroupMember).toHaveBeenCalledWith(
        memberId,
        groupId,
        payload
      )
    })

    test('returns 403 when requester is not group admin', async () => {
      const member = buildNTHSGroupMemberWithRole()
      mockedNTHSGroupsService.getGroupMember.mockResolvedValueOnce(member)

      const response = await sendPut(
        `/api/nths-groups/${groupId}/members/${memberId}`,
        { title: 'Treasurer' }
      )
      expect(response.status).toBe(403)
      expect(response.body).toEqual({ err: 'Unauthorized' })
      expect(mockedNTHSGroupsService.updateGroupMember).not.toHaveBeenCalled()
    })
  })

  describe('DELETE /api/nths-groups/:groupId/leave', () => {
    test('deactivates the current user membership', async () => {
      mockedNTHSGroupsService.updateGroupMember.mockResolvedValueOnce()

      const response = await sendDelete(`/api/nths-groups/${groupId}/leave`)
      expect(response.status).toBe(204)
      expect(mockedNTHSGroupsService.updateGroupMember).toHaveBeenCalledWith(
        mockUser.id,
        groupId,
        { isActive: false }
      )
    })

    test('returns an error when user is not authenticated', async () => {
      const originalUser = mockUser
      mockUser = {
        ...originalUser,
        id: undefined as unknown as string,
      }

      const response = await sendDelete(`/api/nths-groups/${groupId}/leave`)
      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(mockedNTHSGroupsService.updateGroupMember).not.toHaveBeenCalled()
    })
  })

  describe('POST /api/nths-groups/new', () => {
    test('creates a new group', async () => {
      const group = buildNTHSGroupWithMemberInfo()
      mockedNTHSGroupsService.foundGroup.mockResolvedValueOnce(group)

      const response = await sendPost('/api/nths-groups/new')
      expect(response.status).toBe(200)
      expect(mockedNTHSGroupsService.foundGroup).toHaveBeenCalledWith(
        mockUser.id
      )
      expect(response.body).toEqual({
        group: {
          ...group,
          groupInfo: {
            ...group.groupInfo,
            createdAt: group.groupInfo.createdAt?.toISOString(),
          },
          memberInfo: {
            ...group.memberInfo,
            joinedAt: group.memberInfo.joinedAt.toISOString(),
          },
          joinedAt: group.joinedAt.toISOString(),
        },
      })
    })
  })

  describe('PUT /api/nths-groups/:groupId', () => {
    test('updates the group name when requester is admin', async () => {
      const group = buildNTHSGroup()
      const member = buildNTHSGroupMemberWithRole({ roleName: 'admin' })
      const teamName = 'UPchieve'
      mockedNTHSGroupsService.getGroupMember.mockResolvedValueOnce(member)
      mockedNTHSGroupsService.updateGroupName.mockResolvedValueOnce(group)

      const response = await sendPut(`/api/nths-groups/${group.id}`, {
        name: teamName,
      })
      expect(response.status).toBe(200)
      expect(mockedNTHSGroupsService.updateGroupName).toHaveBeenCalledWith(
        group.id,
        teamName
      )
      expect(response.body).toEqual({
        group: {
          ...group,
          createdAt: group.createdAt?.toISOString(),
        },
      })
    })

    test('sends group name taken error response', async () => {
      const member = buildNTHSGroupMemberWithRole({ roleName: 'admin' })
      mockedNTHSGroupsService.getGroupMember.mockResolvedValueOnce(member)
      mockedNTHSGroupsService.updateGroupName.mockRejectedValueOnce(
        new RepoUpdateError('unique_name')
      )

      const response = await sendPut(`/api/nths-groups/${groupId}`, {
        name: 'Taken Name',
      })
      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('POST /api/nths-groups/:groupId/actions', () => {
    test('creates a group action when requester is admin', async () => {
      const member = buildNTHSGroupMemberWithRole({ roleName: 'admin' })
      const createdAt = new Date()
      const action = {
        id: 1,
        groupId: member.nthsGroupId,
        actionId: 2,
        actionName,
        createdAt,
      }
      mockedNTHSGroupsService.getGroupMember.mockResolvedValueOnce(member)
      mockedNTHSGroupsService.createAction.mockResolvedValueOnce({
        action,
      })

      const response = await sendPost(
        `/api/nths-groups/${member.nthsGroupId}/actions`,
        {
          action: actionName,
        }
      )
      expect(response.status).toBe(200)
      expect(mockedNTHSGroupsService.createAction).toHaveBeenCalledWith(
        member.nthsGroupId,
        actionName
      )
      expect(response.body).toEqual({
        groupId: member.nthsGroupId,
        action: { ...action, createdAt: action.createdAt.toISOString() },
      })
    })
  })

  describe('GET /api/nths-groups/:groupId/actions', () => {
    test('returns actions and groupActions', async () => {
      const createdAt = new Date()
      const groupActions = [
        {
          id: 1,
          groupId,
          actionId: 2,
          actionName,
          createdAt,
        },
      ]
      const actions = [
        {
          id: 2,
          name: actionName,
        },
      ]

      mockedNTHSGroupsService.getActionsForGroup.mockResolvedValueOnce(
        groupActions
      )
      mockedNTHSGroupsService.getActions.mockResolvedValueOnce(actions)

      const response = await sendGet(`/api/nths-groups/${groupId}/actions`)
      expect(response.status).toBe(200)
      expect(mockedNTHSGroupsService.getActionsForGroup).toHaveBeenCalledWith(
        groupId
      )
      expect(mockedNTHSGroupsService.getActions).toHaveBeenCalledTimes(1)
      expect(response.body).toEqual({
        groupId,
        actions,
        groupActions: [
          {
            ...groupActions[0],
            createdAt: createdAt.toISOString(),
          },
        ],
      })
    })
  })

  describe('POST /api/nths-groups/:groupId/submit-school-affiliation', () => {
    test('submits school affiliation when requester is admin', async () => {
      const member = buildNTHSGroupMemberWithRole({ roleName: 'admin' })
      mockedNTHSGroupsService.getGroupMember.mockResolvedValueOnce(member)
      const user = buildUser()
      const schoolId = getUuid()
      const payload = {
        schoolId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        phoneExtension: undefined,
        title: 'Teacher',
      }
      const result = {
        groupId: member.nthsGroupId,
        NTHSAdvisor: {
          id: getUuid(),
          nthsGroupId: member.nthsGroupId,
          schoolId,
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          phone: payload.phone,
          title: payload.title,
        },
        action: {
          action: {
            id: 1,
            groupId: member.nthsGroupId,
            actionId: 2,
            actionName,
            createdAt: new Date(),
          },
          schoolAffiliationStatus:
            'AFFILIATED' as NTHSSchoolAffiliationStatusName,
        },
      }
      mockedNTHSGroupsService.submitSchoolAffiliation.mockResolvedValueOnce(
        result
      )

      const response = await sendPost(
        `/api/nths-groups/${member.nthsGroupId}/submit-school-affiliation`,
        payload
      )
      expect(response.status).toBe(200)
      expect(
        mockedNTHSGroupsService.submitSchoolAffiliation
      ).toHaveBeenCalledWith({
        nthsGroupId: member.nthsGroupId,
        schoolId,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phone: payload.phone,
        phoneExtension: payload.phoneExtension,
        title: payload.title,
      })
      expect(response.body).toEqual({
        ...result,
        action: {
          ...result.action,
          action: {
            ...result.action.action,
            createdAt: result.action.action.createdAt.toISOString(),
          },
        },
      })
    })
  })
})
