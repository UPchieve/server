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
import * as NTHSChecklistProgressService from '../../../services/NTHSChecklistProgressService'
import * as NTHSRenewalService from '../../../services/NTHSRenewalService'
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
jest.mock('../../../services/NTHSChecklistProgressService')
jest.mock('../../../services/NTHSRenewalService')

const mockedNTHSGroupsService = mocked(NTHSGroupsService)
const actualNTHSGroupsService = jest.requireActual<typeof NTHSGroupsService>(
  '../../../services/NTHSGroupsService'
)
const mockedNTHSChecklistProgressService = mocked(NTHSChecklistProgressService)
const mockedNTHSRenewalService = mocked(NTHSRenewalService)

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
    mockedNTHSGroupsService.asGroupMemberUpdate.mockImplementation(
      actualNTHSGroupsService.asGroupMemberUpdate
    )
  })

  describe('GET /api/nths-groups', () => {
    test('returns groups and candidateApplicationStatus when user has no groups', async () => {
      mockedNTHSGroupsService.getGroups.mockResolvedValueOnce([])
      mockedNTHSGroupsService.getLatestCandidateApplicationStatus.mockResolvedValueOnce(
        NTHSCandidateApplicationStatus.approved
      )
      const approvalExpiresAt = new Date('2026-11-20T15:00:00.000Z')
      mockedNTHSGroupsService.getApprovalExpiresAt.mockResolvedValueOnce(
        approvalExpiresAt
      )

      const response = await sendGet('/api/nths-groups')
      expect(response.status).toBe(200)
      expect(mockedNTHSGroupsService.getGroups).toHaveBeenCalledWith(
        mockUser.id
      )
      expect(
        mockedNTHSGroupsService.getLatestCandidateApplicationStatus
      ).toHaveBeenCalledWith(mockUser.id)
      expect(
        mockedNTHSRenewalService.getRenewalsForViewer
      ).not.toHaveBeenCalled()
      expect(response.body).toEqual({
        groups: [],
        candidateApplicationStatus: 'approved',
        approvalExpiresAt: approvalExpiresAt.toISOString(),
      })
    })

    test('returns a null approvalExpiresAt while the application is pending', async () => {
      mockedNTHSGroupsService.getGroups.mockResolvedValueOnce([])
      mockedNTHSGroupsService.getLatestCandidateApplicationStatus.mockResolvedValueOnce(
        NTHSCandidateApplicationStatus.applied
      )
      mockedNTHSGroupsService.getApprovalExpiresAt.mockResolvedValueOnce(
        undefined
      )

      const response = await sendGet('/api/nths-groups')
      expect(response.body).toEqual({
        groups: [],
        candidateApplicationStatus: 'applied',
        approvalExpiresAt: null,
      })
    })

    test('returns groups with their renewal and does not get candidateApplicationStatus when user has groups', async () => {
      const group = buildNTHSGroupWithMemberInfo()
      const groups = [group]
      const renewal = {
        prompt: 'member-must-answer' as const,
        closesOn: '2027-09-30',
        commitmentsRequired: true,
        canNameSelf: false,
        namingSelfAccepts: true,
      }
      mockedNTHSGroupsService.getGroups.mockResolvedValueOnce(groups)
      mockedNTHSRenewalService.getRenewalsForViewer.mockResolvedValueOnce([
        renewal,
      ])

      const response = await sendGet('/api/nths-groups')
      expect(response.status).toBe(200)
      expect(mockedNTHSGroupsService.getGroups).toHaveBeenCalledWith(
        mockUser.id
      )
      expect(
        mockedNTHSGroupsService.getLatestCandidateApplicationStatus
      ).not.toHaveBeenCalled()
      expect(
        mockedNTHSGroupsService.getApprovalExpiresAt
      ).not.toHaveBeenCalled()
      expect(response.body).toEqual({
        approvalExpiresAt: null,
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
            renewal,
          },
        ],
      })
      expect(
        mockedNTHSRenewalService.getRenewalsForViewer
      ).toHaveBeenCalledWith(mockUser.id, groups, expect.any(Date))
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

  describe('GET /api/nths-groups/:groupId/checklist', () => {
    test('returns the checklist with chapter progress to an active admin', async () => {
      mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(
        buildNTHSGroupMemberWithRole({ roleName: 'admin' })
      )
      mockedNTHSChecklistProgressService.getChecklistWithProgress.mockResolvedValueOnce(
        {
          checklist: {
            spreadsheetId: 'spreadsheet-id',
            sections: [
              {
                id: 1,
                title: 'Get started',
                order: 0,
                items: [
                  {
                    key: 'recruit-members',
                    order: 1,
                    title: 'Recruit members',
                    resources: [],
                    checkable: true,
                    skippable: false,
                  },
                ],
              },
            ],
          },
          progress: [
            {
              id: '1',
              nthsGroupId: groupId,
              itemKey: 'recruit-members',
              status: 'complete',
              updatedByUserId: mockUser.id,
              createdAt: new Date('2026-10-14T12:00:00.000Z'),
              updatedAt: new Date('2026-10-14T12:00:00.000Z'),
            },
          ],
          groupCreatedAt: new Date('2026-10-01T12:00:00.000Z'),
        }
      )

      const response = await sendGet(`/api/nths-groups/${groupId}/checklist`)

      expect(response.status).toBe(200)
      expect(
        mockedNTHSChecklistProgressService.getChecklistWithProgress
      ).toHaveBeenCalledWith(groupId, mockUser.id)
      expect(response.body).toEqual({
        checklist: {
          sections: [
            {
              id: 1,
              title: 'Get started',
              order: 0,
              items: [
                {
                  key: 'recruit-members',
                  order: 1,
                  title: 'Recruit members',
                  resources: [],
                  checkable: true,
                  skippable: false,
                  status: 'complete',
                },
              ],
            },
          ],
        },
      })
    })

    test.each([
      ['active member', buildNTHSGroupMemberWithRole({ roleName: 'member' })],
      ['inactive/non-member', undefined],
    ])('gives HTTP 403 to an %s', async (_requester, groupMember) => {
      mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(
        groupMember
      )

      const response = await sendGet(`/api/nths-groups/${groupId}/checklist`)

      expect(response.status).toBe(403)
      expect(
        mockedNTHSChecklistProgressService.getChecklistWithProgress
      ).not.toHaveBeenCalled()
    })
  })

  describe('PUT /api/nths-groups/:groupId/checklist/:itemKey', () => {
    test('updates shared progress as an active admin', async () => {
      mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(
        buildNTHSGroupMemberWithRole({ roleName: 'admin' })
      )
      mockedNTHSChecklistProgressService.updateChecklistItemProgress.mockResolvedValueOnce(
        {
          id: '1',
          nthsGroupId: groupId,
          itemKey: 'recruit-members',
          status: 'incomplete',
          updatedByUserId: mockUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      )

      const response = await sendPut(
        `/api/nths-groups/${groupId}/checklist/recruit-members`,
        { status: 'incomplete' }
      )

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        itemKey: 'recruit-members',
        status: 'incomplete',
      })
      expect(
        mockedNTHSChecklistProgressService.updateChecklistItemProgress
      ).toHaveBeenCalledWith({
        nthsGroupId: groupId,
        itemKey: 'recruit-members',
        status: 'incomplete',
        updatedByUserId: mockUser.id,
      })
    })

    test.each([undefined, '', 'checked', 'complete-ish'])(
      'gives HTTP 422 for status %j',
      async (status) => {
        mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(
          buildNTHSGroupMemberWithRole({ roleName: 'admin' })
        )

        const response = await sendPut(
          `/api/nths-groups/${groupId}/checklist/recruit-members`,
          { status }
        )

        expect(response.status).toBe(422)
        expect(
          mockedNTHSChecklistProgressService.updateChecklistItemProgress
        ).not.toHaveBeenCalled()
      }
    )

    test.each([
      ['active member', buildNTHSGroupMemberWithRole({ roleName: 'member' })],
      ['inactive/non-member', undefined],
    ])('gives HTTP 403 to an %s', async (_requester, groupMember) => {
      mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(
        groupMember
      )

      const response = await sendPut(
        `/api/nths-groups/${groupId}/checklist/recruit-members`,
        { status: 'complete' }
      )

      expect(response.status).toBe(403)
      expect(
        mockedNTHSChecklistProgressService.updateChecklistItemProgress
      ).not.toHaveBeenCalled()
    })
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
        title: 'Vice President',
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

    test.each([
      [{ title: 'president' }],
      [{ title: 3 }],
      [{ role: 'owner' }],
      [{ isActive: true }],
    ])('gives HTTP 422 for the body %j', async (body) => {
      mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(
        buildNTHSGroupMemberWithRole({ roleName: 'admin' })
      )

      const response = await sendPut(
        `/api/nths-groups/${groupId}/members/${memberId}`,
        body
      )
      expect(response.status).toBe(422)
      expect(mockedNTHSGroupsService.updateGroupMember).not.toHaveBeenCalled()
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
      mockedNTHSGroupsService.leaveGroup.mockResolvedValueOnce()

      const response = await sendDelete(`/api/nths-groups/${groupId}/leave`)
      expect(response.status).toBe(204)
      expect(mockedNTHSGroupsService.leaveGroup).toHaveBeenCalledWith(
        mockUser.id,
        groupId
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
      expect(mockedNTHSGroupsService.leaveGroup).not.toHaveBeenCalled()
    })

    test('gives HTTP 422 for a malformed groupId instead of a driver error', async () => {
      const response = await sendDelete('/api/nths-groups/not-a-uuid/leave')
      expect(response.status).toBe(422)
      expect(mockedNTHSGroupsService.leaveGroup).not.toHaveBeenCalled()
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

  describe('renewal routes', () => {
    const renewal = {
      prompt: 'none',
      closesOn: null,
      commitmentsRequired: false,
      canNameSelf: false,
      namingSelfAccepts: false,
    } as const
    const successorsBody = { userIds: [memberId], expectedUserIds: [] }

    test.each([
      [
        'GET /renewal',
        'admin',
        () => sendGet(`/api/nths-groups/${groupId}/renewal`),
        () =>
          mockedNTHSRenewalService.getRenewalSuccessors.mockResolvedValueOnce({
            successors: [],
            canEditSuccessors: true,
          }),
        { successors: [], canEditSuccessors: true },
      ],
      [
        'PUT /renewal/successors',
        'admin',
        () =>
          sendPut(
            `/api/nths-groups/${groupId}/renewal/successors`,
            successorsBody
          ),
        () =>
          mockedNTHSRenewalService.setRenewalSuccessors.mockResolvedValueOnce(
            renewal
          ),
        { renewal },
      ],
      [
        'POST /renewal/successors/self',
        'admin',
        () => sendPost(`/api/nths-groups/${groupId}/renewal/successors/self`),
        () =>
          mockedNTHSRenewalService.nameSelfAsSuccessor.mockResolvedValueOnce(
            renewal
          ),
        { renewal },
      ],
      [
        'POST /renewal/accept',
        'member',
        () => sendPost(`/api/nths-groups/${groupId}/renewal/accept`),
        () =>
          mockedNTHSRenewalService.acceptPresidency.mockResolvedValueOnce({
            renewal,
            outcome: 'accepted',
          }),
        { renewal, outcome: 'accepted' },
      ],
      [
        'POST /renewal/decline',
        'member',
        () => sendPost(`/api/nths-groups/${groupId}/renewal/decline`),
        () =>
          mockedNTHSRenewalService.declinePresidency.mockResolvedValueOnce(
            renewal
          ),
        { renewal },
      ],
    ] as const)(
      '%s needs an active %s and responds under named keys',
      async (_label, role, send, mockService, body) => {
        mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(
          role === 'admin'
            ? buildNTHSGroupMemberWithRole({ roleName: 'member' })
            : undefined
        )
        expect((await send()).status).toBe(403)

        mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(
          buildNTHSGroupMemberWithRole({ roleName: role })
        )
        mockService()
        const response = await send()
        expect(response.status).toBe(200)
        expect(response.body).toEqual(body)
      }
    )

    test('POST /renewal/accept treats null commitments as none', async () => {
      mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(
        buildNTHSGroupMemberWithRole({ roleName: 'member' })
      )
      mockedNTHSRenewalService.acceptPresidency.mockResolvedValueOnce({
        renewal,
        outcome: 'accepted',
      })

      const response = await sendPost(
        `/api/nths-groups/${groupId}/renewal/accept`,
        { commitments: null }
      )
      expect(response.status).toBe(200)
      expect(mockedNTHSRenewalService.acceptPresidency).toHaveBeenCalledWith(
        mockUser.id,
        groupId,
        { reason: 'renewal', commitments: undefined },
        expect.any(Date)
      )
    })

    test.each([
      [
        'GET /renewal',
        () => sendGet(`/api/nths-groups/${groupId}/renewal`),
        'getRenewalSuccessors',
      ],
      [
        'PUT /renewal/successors',
        () =>
          sendPut(
            `/api/nths-groups/${groupId}/renewal/successors`,
            successorsBody
          ),
        'setRenewalSuccessors',
      ],
      [
        'POST /renewal/successors/self',
        () => sendPost(`/api/nths-groups/${groupId}/renewal/successors/self`),
        'nameSelfAsSuccessor',
      ],
    ] as const)(
      '%s refuses an admin the member-info gate does not clear',
      async (_label, send, service) => {
        mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(
          buildNTHSGroupMemberWithRole({ roleName: 'admin' })
        )
        mockedNTHSGroupsService.isClearedToViewChapterMemberInfo.mockResolvedValueOnce(
          false
        )

        expect((await send()).status).toBe(403)
        expect(mockedNTHSRenewalService[service]).not.toHaveBeenCalled()
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
      '%s refuses a requester the member-info gate does not clear, admin or not',
      async (route, read, mockRead) => {
        mockRead()
        const cases = [
          ['member', false],
          ['admin', true],
        ] as const
        for (const [roleName, isAdmin] of cases) {
          mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(
            buildNTHSGroupMemberWithRole({ roleName })
          )
          mockedNTHSGroupsService.isClearedToViewChapterMemberInfo.mockResolvedValueOnce(
            false
          )

          const response = await sendGet(route.replace(':groupId', groupId))
          expect(response.status).toBe(403)
          expect(response.body).toEqual({ err: 'Unauthorized' })
          expect(
            mockedNTHSGroupsService.isClearedToViewChapterMemberInfo
          ).toHaveBeenLastCalledWith(mockUser.id, isAdmin)
          expect(mockedNTHSGroupsService[read]).not.toHaveBeenCalled()
        }

        mockedNTHSGroupsService.getActiveGroupMember.mockResolvedValueOnce(
          buildNTHSGroupMemberWithRole({ roleName: 'admin' })
        )
        const response = await sendGet(route.replace(':groupId', groupId))
        expect(response.status).toBe(200)
        expect(mockedNTHSGroupsService[read]).toHaveBeenCalled()
      }
    )
  })
})
