import { mocked } from 'jest-mock'
import request, { Response } from 'supertest'
import { mockApp, mockPassportMiddleware, mockRouter } from '../../mock-app'
import {
  buildNTHSChapterImpact,
  buildNTHSChapterRoster,
  buildNTHSGroup,
  buildNTHSGroupMemberWithRole,
  buildNTHSGroupMemberWithRolePublic,
  buildNTHSGroupWithMemberInfo,
  buildNTHSChapterRosterMember,
  buildNTHSChapterTopTutor,
  buildUser,
  buildVolunteer,
} from '../../mocks/generate'
import {
  GROUP_ADMIN_ACTIONS,
  GROUP_ADMIN_REMOVABLE_ACTIONS,
  routeNTHSGroups,
} from '../../../router/api/nths-groups'
import * as NTHSGroupsService from '../../../services/NTHSGroupsService'
import { RepoUpdateError } from '../../../models/Errors'
import {
  NTHSCandidateApplicationStatus,
  NTHSChapterImpact,
  NTHSChapterRoster,
  NTHSGroupRoleName,
  NTHSSchoolAffiliationStatusName,
} from '../../../models/NTHSGroups/types'
import { getUuid } from '../../../models/pgUtils'

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
const actionName = 'NAMED YOUR TEAM'
const DAY_MS = 24 * 60 * 60 * 1000
const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS)
const schoolYear = {
  label: '2026–27',
  startsAt: new Date('2026-07-01T00:00:00.000Z'),
  endsAt: new Date('2027-07-01T00:00:00.000Z'),
}
const schoolYearPublic = {
  label: '2026–27',
  startsAt: '2026-07-01T00:00:00.000Z',
  endsAt: '2027-07-01T00:00:00.000Z',
}

describe('routeNTHSGroups', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockUser = buildVolunteer()
    // Cleared by default; the gate's own tests override it.
    mockedNTHSGroupsService.isClearedToViewChapterMemberInfo.mockResolvedValue(
      true
    )
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
    test.each([
      ['member', true],
      ['admin', false],
    ] as const)(
      'returns group members to a current %s, with excludeClosedAccounts %s',
      async (roleName, excludeClosedAccounts) => {
        mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(
          buildNTHSGroupMemberWithRole({ roleName })
        )
        const members = [
          buildNTHSGroupMemberWithRole(),
          buildNTHSGroupMemberWithRole({ deleted: true }),
        ]
        mockedNTHSGroupsService.getGroupMembers.mockResolvedValueOnce(members)

        const response = await sendGet(`/api/nths-groups/${groupId}/members`)
        expect(response.status).toBe(200)
        expect(mockedNTHSGroupsService.getGroupMembers).toHaveBeenCalledWith(
          groupId,
          undefined,
          { excludeClosedAccounts }
        )
        expect(response.body).toEqual({
          members: members.map(buildNTHSGroupMemberWithRolePublic),
        })
      }
    )
  })

  describe('PUT /api/nths-groups/:groupId/members/:memberId', () => {
    test('updates a member when requester is group admin', async () => {
      const member = buildNTHSGroupMemberWithRole({
        roleName: 'admin',
      })
      mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(member)
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

    test('gives HTTP 422 for a malformed memberId instead of a driver error', async () => {
      const member = buildNTHSGroupMemberWithRole({ roleName: 'admin' })
      mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(member)

      const response = await sendPut(
        `/api/nths-groups/${groupId}/members/not-a-uuid`,
        { role: 'admin' }
      )
      expect(response.status).toBe(422)
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

    test('gives HTTP 422 for a malformed groupId instead of a driver error', async () => {
      const response = await sendDelete('/api/nths-groups/not-a-uuid/leave')
      expect(response.status).toBe(422)
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
      mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(member)
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
      mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(member)
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
      mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(member)
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

    // A typo in GROUP_ADMIN_ACTIONS would silently lock presidents out of their
    // own checklist and affiliation choice.
    test.each([...GROUP_ADMIN_ACTIONS])(
      'allows %s from a chapter admin',
      async (allowed) => {
        const member = buildNTHSGroupMemberWithRole({ roleName: 'admin' })
        mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(
          member
        )
        mockedNTHSGroupsService.createAction.mockResolvedValueOnce({
          action: {
            id: 1,
            groupId: member.nthsGroupId,
            actionId: 2,
            actionName: allowed,
            createdAt: new Date(),
          },
        })

        const response = await sendPost(
          `/api/nths-groups/${member.nthsGroupId}/actions`,
          { action: allowed }
        )

        expect(response.status).toBe(200)
        expect(mockedNTHSGroupsService.createAction).toHaveBeenCalledWith(
          member.nthsGroupId,
          allowed
        )
      }
    )

    test.each([
      'ADVISOR VERIFIED',
      'SCHOOL AFFILIATION DENIED',
      'SUBMITTED ADVISOR CONTACT INFO',
      'NOT AN ACTION',
    ])('refuses %s from a chapter admin', async (action) => {
      const member = buildNTHSGroupMemberWithRole({ roleName: 'admin' })
      mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(member)
      // Stubbed so that removing the guard shows up as a 200 rather than a
      // crash on the auto-mock's undefined return.
      mockedNTHSGroupsService.createAction.mockResolvedValueOnce({
        action: {
          id: 1,
          groupId: member.nthsGroupId,
          actionId: 2,
          actionName,
          createdAt: new Date(),
        },
      })

      const response = await sendPost(
        `/api/nths-groups/${member.nthsGroupId}/actions`,
        { action }
      )

      expect(response.status).toBe(422)
      expect(mockedNTHSGroupsService.createAction).not.toHaveBeenCalled()
    })
  })

  describe('DELETE /api/nths-groups/:groupId/actions/:actionName', () => {
    test.each([...GROUP_ADMIN_REMOVABLE_ACTIONS])(
      'allows unchecking %s from a chapter admin',
      async (allowed) => {
        const member = buildNTHSGroupMemberWithRole({ roleName: 'admin' })
        mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(
          member
        )
        mockedNTHSGroupsService.deleteAction.mockResolvedValueOnce()

        const response = await sendDelete(
          `/api/nths-groups/${member.nthsGroupId}/actions/${encodeURIComponent(allowed)}`
        )

        expect(response.status).toBe(204)
        expect(mockedNTHSGroupsService.deleteAction).toHaveBeenCalledWith(
          member.nthsGroupId,
          allowed
        )
      }
    )

    test.each([
      'MARKED SCHOOL AFFILIATION IN PROGRESS',
      'OPTED OUT',
      'ADVISOR VERIFIED',
      'SCHOOL AFFILIATION DENIED',
      'SUBMITTED ADVISOR CONTACT INFO',
      'NOT AN ACTION',
    ])('refuses to uncheck %s from a chapter admin', async (action) => {
      const member = buildNTHSGroupMemberWithRole({ roleName: 'admin' })
      mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(member)

      const response = await sendDelete(
        `/api/nths-groups/${member.nthsGroupId}/actions/${encodeURIComponent(action)}`
      )

      expect(response.status).toBe(422)
      expect(mockedNTHSGroupsService.deleteAction).not.toHaveBeenCalled()
    })
  })

  describe('GET /api/nths-groups/:groupId/actions', () => {
    test('returns actions and groupActions to a current member who is not an admin', async () => {
      mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(
        buildNTHSGroupMemberWithRole({ roleName: 'member' })
      )
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

  // getActiveGroupMember finds nobody for someone outside the chapter or for a
  // member who left it.
  test.each([
    ['/api/nths-groups/:groupId/members', 'getGroupMembers'],
    ['/api/nths-groups/:groupId/actions', 'getActionsForGroup'],
    ['/api/nths-groups/:groupId/impact', 'getChapterImpact'],
    ['/api/nths-groups/:groupId/roster', 'getChapterRoster'],
  ] as const)(
    'GET %s gives HTTP 403 to a non-member or departed member',
    async (route, read) => {
      mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(
        undefined
      )

      const response = await sendGet(route.replace(':groupId', groupId))

      expect(response.status).toBe(403)
      expect(mockedNTHSGroupsService.getActiveGroupMember).toHaveBeenCalledWith(
        mockUser.id,
        groupId
      )
      expect(mockedNTHSGroupsService[read]).not.toHaveBeenCalled()
    }
  )

  // A plain member passes the membership check, so this exercises the admin
  // role check.
  test.each([
    ['PUT', '/api/nths-groups/:groupId', 'updateGroupName'],
    ['PUT', '/api/nths-groups/:groupId/members/:memberId', 'updateGroupMember'],
    ['POST', '/api/nths-groups/:groupId/actions', 'createAction'],
    ['DELETE', '/api/nths-groups/:groupId/actions/:actionName', 'deleteAction'],
    [
      'POST',
      '/api/nths-groups/:groupId/submit-school-affiliation',
      'submitSchoolAffiliation',
    ],
  ] as const)(
    '%s %s gives HTTP 403 to a plain member',
    async (method, route, write) => {
      mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(
        buildNTHSGroupMemberWithRole({ roleName: 'member' })
      )
      const path = route
        .replace(':groupId', groupId)
        .replace(':memberId', memberId)
        .replace(':actionName', encodeURIComponent(actionName))

      const response =
        method === 'PUT'
          ? await sendPut(path, { name: 'Renamed', role: 'admin' })
          : method === 'DELETE'
            ? await sendDelete(path)
            : await sendPost(path, { action: 'OPTED OUT' })

      expect(response.status).toBe(403)
      expect(mockedNTHSGroupsService[write]).not.toHaveBeenCalled()
    }
  )

  describe('POST /api/nths-groups/:groupId/submit-school-affiliation', () => {
    test('submits school affiliation when requester is admin', async () => {
      const member = buildNTHSGroupMemberWithRole({ roleName: 'admin' })
      mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(member)
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

  describe('GET /api/nths-groups/:groupId/impact', () => {
    function sendImpactGet(
      query: Record<string, string> = {},
      overrides: {
        roleName?: NTHSGroupRoleName
        impact?: Partial<NTHSChapterImpact>
      } = {}
    ) {
      mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(
        buildNTHSGroupMemberWithRole({
          roleName: overrides.roleName ?? 'member',
        })
      )
      mockedNTHSGroupsService.getChapterImpact.mockResolvedValueOnce(
        buildNTHSChapterImpact({ groupId, schoolYear, ...overrides.impact })
      )
      return sendGet(
        `/api/nths-groups/${groupId}/impact?${new URLSearchParams(query)}`
      )
    }

    test('serializes the impact for the response body', async () => {
      const topTutorThisMonth = buildNTHSChapterTopTutor({ userId: memberId })
      const schoolYearToDate = {
        studentsHelped: 4,
        sessionsCompleted: 6,
        hoursTutored: 8,
        membersTutoring: 2,
      }
      const allTime = {
        studentsHelped: 40,
        sessionsCompleted: 60,
        hoursTutored: 80,
      }
      const goals = { hoursTutored: 40, membersTutoring: 3 }

      const response = await sendImpactGet(
        {},
        {
          impact: {
            topTutorThisMonth,
            viewerHoursThisMonth: 1.5,
            schoolYearToDate,
            allTime,
            goals,
          },
        }
      )
      expect(response.status).toBe(200)
      expect(response.body.impact).toEqual({
        groupId,
        schoolYear: schoolYearPublic,
        schoolYearToDate,
        allTime,
        goals,
        topTutorThisMonth,
        viewerHoursThisMonth: 1.5,
      })
    })

    describe('monthStartsAt', () => {
      test('counts the signed-in member from the month start the browser sent', async () => {
        const monthStartsAt = new Date(Date.now() - 14 * DAY_MS)

        const response = await sendImpactGet({
          monthStartsAt: monthStartsAt.toISOString(),
        })

        expect(response.status).toBe(200)
        expect(mockedNTHSGroupsService.getChapterImpact).toHaveBeenCalledWith(
          groupId,
          mockUser.id,
          expect.any(Date),
          monthStartsAt
        )
      })
    })

    test('gives HTTP 403 for a malformed group id without querying membership', async () => {
      const response = await sendGet('/api/nths-groups/not-a-uuid/impact')
      expect(response.status).toBe(403)
      expect(
        mockedNTHSGroupsService.getActiveGroupMember
      ).not.toHaveBeenCalled()
      expect(mockedNTHSGroupsService.getChapterImpact).not.toHaveBeenCalled()
    })
  })

  describe('GET /api/nths-groups/:groupId/roster', () => {
    function sendRosterGet(
      query: Record<string, string> = {},
      overrides: {
        roleName?: NTHSGroupRoleName
        roster?: Partial<NTHSChapterRoster>
      } = {}
    ) {
      mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(
        buildNTHSGroupMemberWithRole({
          roleName: overrides.roleName ?? 'admin',
        })
      )
      mockedNTHSGroupsService.getChapterRoster.mockResolvedValueOnce(
        buildNTHSChapterRoster({ groupId, schoolYear, ...overrides.roster })
      )
      return sendGet(
        `/api/nths-groups/${groupId}/roster?${new URLSearchParams(query)}`
      )
    }

    test('returns training, safety, account and activity fields per member, and the top tutor', async () => {
      const joinedAt = new Date('2026-08-01T00:00:00.000Z')
      const lastActiveAt = new Date('2026-09-11T00:00:00.000Z')
      const member = buildNTHSChapterRosterMember({
        userId: memberId,
        firstName: 'Jordan',
        lastInitial: 'N',
        joinedAt,
        accountClosed: true,
        sessionsThisYear: 2,
        hoursThisYear: 1.5,
        periodHours: {
          thisWeek: 0.75,
          lastTwoWeeks: 1.5,
          thisMonth: 1.5,
          thisSchoolYear: 1.5,
          allTime: 2.25,
        },
        lastActiveAt,
      })
      const topTutorThisMonth = buildNTHSChapterTopTutor({ userId: memberId })

      const response = await sendRosterGet(
        {},
        { roster: { members: [member], topTutorThisMonth } }
      )
      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        roster: {
          groupId,
          schoolYear: schoolYearPublic,
          topTutorThisMonth,
          members: [
            {
              ...member,
              joinedAt: joinedAt.toISOString(),
              lastActiveAt: lastActiveAt.toISOString(),
            },
          ],
        },
      })
    })

    describe('period start params', () => {
      test('passes the period starts the browser sent to the service', async () => {
        const weekStartsAt = daysAgo(3)
        const lastTwoWeeksStartsAt = daysAgo(10)
        const monthStartsAt = daysAgo(61)

        const response = await sendRosterGet({
          weekStartsAt: weekStartsAt.toISOString(),
          lastTwoWeeksStartsAt: lastTwoWeeksStartsAt.toISOString(),
          monthStartsAt: monthStartsAt.toISOString(),
        })

        expect(response.status).toBe(200)
        expect(mockedNTHSGroupsService.getChapterRoster).toHaveBeenCalledWith(
          groupId,
          expect.any(Date),
          { weekStartsAt, lastTwoWeeksStartsAt, monthStartsAt },
          { includeClosedAccounts: true }
        )
      })

      test.each([
        ['malformed', { weekStartsAt: 'last monday' }],
        ['empty', { lastTwoWeeksStartsAt: '' }],
        [
          'well beyond a clock-skew tolerance in the future',
          { monthStartsAt: new Date(Date.now() + 10 * 60_000).toISOString() },
        ],
        ['older than 62 days', { monthStartsAt: daysAgo(63).toISOString() }],
      ])('gives HTTP 422 for a period start that is %s', async (_, query) => {
        const response = await sendRosterGet(query)

        expect(response.status).toBe(422)
        expect(mockedNTHSGroupsService.getChapterRoster).not.toHaveBeenCalled()
      })

      test('clamps a start that is only slightly ahead of server time instead of rejecting it', async () => {
        const monthStartsAt = new Date(Date.now() + 60_000)

        const response = await sendRosterGet({
          monthStartsAt: monthStartsAt.toISOString(),
        })

        expect(response.status).toBe(200)
        const [, now, periodStarts] =
          mockedNTHSGroupsService.getChapterRoster.mock.calls[0]
        expect(periodStarts.monthStartsAt.getTime()).toBeLessThanOrEqual(
          now.getTime()
        )
      })
    })

    test.each([
      ['member', false],
      ['admin', true],
    ] as const)(
      'asks the service for closed accounts only for an admin (%s -> %s)',
      async (roleName, includeClosedAccounts) => {
        const response = await sendRosterGet({}, { roleName })
        expect(response.status).toBe(200)
        expect(mockedNTHSGroupsService.getChapterRoster).toHaveBeenCalledWith(
          groupId,
          expect.any(Date),
          {},
          { includeClosedAccounts }
        )
      }
    )
  })

  describe('the member-info gate', () => {
    test.each([
      [
        '/api/nths-groups/:groupId/members',
        'getGroupMembers',
        () => {
          mockedNTHSGroupsService.getGroupMembers.mockResolvedValueOnce([])
        },
      ],
      [
        '/api/nths-groups/:groupId/impact',
        'getChapterImpact',
        () => {
          mockedNTHSGroupsService.getChapterImpact.mockResolvedValueOnce(
            buildNTHSChapterImpact({ groupId, schoolYear })
          )
        },
      ],
      [
        '/api/nths-groups/:groupId/roster',
        'getChapterRoster',
        () => {
          mockedNTHSGroupsService.getChapterRoster.mockResolvedValueOnce(
            buildNTHSChapterRoster({ groupId, schoolYear })
          )
        },
      ],
    ] as const)(
      '%s gates a member on isClearedToViewChapterMemberInfo, exempts an admin',
      async (route, read, mockRead) => {
        mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(
          buildNTHSGroupMemberWithRole({ roleName: 'member' })
        )
        mockedNTHSGroupsService.isClearedToViewChapterMemberInfo.mockResolvedValueOnce(
          false
        )

        const memberResponse = await sendGet(route.replace(':groupId', groupId))
        expect(memberResponse.status).toBe(403)
        expect(memberResponse.body).toEqual({ err: 'Unauthorized' })
        expect(
          mockedNTHSGroupsService.isClearedToViewChapterMemberInfo
        ).toHaveBeenCalledWith(mockUser.id)
        expect(mockedNTHSGroupsService[read]).not.toHaveBeenCalled()

        mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(
          buildNTHSGroupMemberWithRole({ roleName: 'admin' })
        )
        mockedNTHSGroupsService.isClearedToViewChapterMemberInfo.mockResolvedValueOnce(
          false
        )
        mockRead()

        const adminResponse = await sendGet(route.replace(':groupId', groupId))
        expect(adminResponse.status).toBe(200)
        expect(mockedNTHSGroupsService[read]).toHaveBeenCalled()
      }
    )
  })
})
