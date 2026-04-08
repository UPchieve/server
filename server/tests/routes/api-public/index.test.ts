import request, { Response } from 'supertest'
import { mocked } from 'jest-mock'
import { mockApp, mockPassportMiddleware } from '../../mock-app'
import { routes as routeApiPublic } from '../../../router/api-public'
import * as StudentService from '../../../services/StudentService'
import * as VolunteerService from '../../../services/VolunteerService'
import * as TeacherService from '../../../services/TeacherService'
import * as NTHSGroupsService from '../../../services/NTHSGroupsService'
import {
  buildNTHSGroup,
  buildNTHSGroupWithMemberInfo,
  buildTeacherClass,
  buildUser,
  getEmail,
} from '../../mocks/generate'
import { getUuid } from '../../../models/pgUtils'
import { LegacyUserModel } from '../../../models/User/legacy-user'
import { AppUser } from '../../types'

jest.mock('../../../services/StudentService')
jest.mock('../../../services/VolunteerService')
jest.mock('../../../services/TeacherService')
jest.mock('../../../services/NTHSGroupsService')
jest.mock('../../../logger')

const mockedStudentService = mocked(StudentService)
const mockedVolunteerService = mocked(VolunteerService)
const mockedTeacherService = mocked(TeacherService)
const mockedNTHSGroupsService = mocked(NTHSGroupsService)

let mockUser = buildUser()

function mockGetUser() {
  return mockUser
}

const app = mockApp()
app.use(mockPassportMiddleware(mockGetUser))
routeApiPublic(app)

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

function serializeNTHSGroupWithMemberInfo(
  group: ReturnType<typeof buildNTHSGroupWithMemberInfo>
) {
  return {
    ...group,
    joinedAt: group.joinedAt.toISOString(),
    groupInfo: {
      ...group.groupInfo,
      createdAt: group.groupInfo.createdAt?.toISOString(),
    },
    memberInfo: {
      ...group.memberInfo,
      joinedAt: group.memberInfo.joinedAt.toISOString(),
    },
  }
}

describe('routeApiPublic', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockUser = buildUser()
  })

  describe('POST /api-public/students/class', () => {
    const classCode = getUuid()
    test('adds authenticated user to class when authenticated email matches request email', async () => {
      const email = mockUser.email
      const teacherClass = buildTeacherClass({ code: classCode })

      // TODO: Update underlying type
      mockedTeacherService.addStudentToTeacherClassByClassCode.mockResolvedValueOnce(
        teacherClass
      )

      const response = await sendPost('/api-public/students/class', {
        classCode,
        email,
      })
      expect(response.status).toBe(200)
      expect(
        mockedTeacherService.addStudentToTeacherClassByClassCode
      ).toHaveBeenCalledWith(mockUser.id, classCode)
      expect(response.body).toEqual({
        teacherClass: {
          ...teacherClass,
          createdAt: teacherClass.createdAt.toISOString(),
          updatedAt: teacherClass.updatedAt.toISOString(),
        },
      })
      expect(
        mockedTeacherService.getTeacherClassByClassCode
      ).not.toHaveBeenCalled()
      expect(
        mockedStudentService.doesStudentWithEmailExist
      ).not.toHaveBeenCalled()
    })

    test('returns whether student exists when authenticated email does not match request email', async () => {
      const email = mockUser.email
      const teacherClass = buildTeacherClass({ code: classCode })

      mockUser = buildUser({
        email: getEmail(),
      })
      // TODO: Update underlying type
      mockedTeacherService.getTeacherClassByClassCode.mockResolvedValueOnce(
        teacherClass
      )
      mockedStudentService.doesStudentWithEmailExist.mockResolvedValueOnce(true)

      const response = await sendPost('/api-public/students/class', {
        classCode,
        email,
      })
      expect(response.status).toBe(200)
      expect(
        mockedTeacherService.getTeacherClassByClassCode
      ).toHaveBeenCalledWith(classCode)
      expect(
        mockedStudentService.doesStudentWithEmailExist
      ).toHaveBeenCalledWith(email)
      expect(response.body).toEqual({
        isExistingStudent: true,
      })
      expect(
        mockedTeacherService.addStudentToTeacherClassByClassCode
      ).not.toHaveBeenCalled()
    })

    test('returns whether student exists when request is unauthenticated', async () => {
      const email = getEmail()
      const teacherClass = buildTeacherClass({ code: classCode })
      mockUser = undefined as unknown as AppUser
      // TODO: Update underlying type
      mockedTeacherService.getTeacherClassByClassCode.mockResolvedValueOnce(
        teacherClass
      )
      mockedStudentService.doesStudentWithEmailExist.mockResolvedValueOnce(
        false
      )

      const response = await sendPost('/api-public/students/class', {
        classCode,
        email,
      })
      expect(response.status).toBe(200)
      expect(
        mockedTeacherService.getTeacherClassByClassCode
      ).toHaveBeenCalledWith(classCode)
      expect(
        mockedStudentService.doesStudentWithEmailExist
      ).toHaveBeenCalledWith(email)
      expect(response.body).toEqual({
        isExistingStudent: false,
      })
    })

    test('returns 422 when class code is invalid', async () => {
      mockedTeacherService.getTeacherClassByClassCode.mockResolvedValueOnce(
        undefined
      )

      const response = await sendPost('/api-public/students/class', {
        classCode: 'BADCODE',
        email: getEmail(),
      })
      expect(response.status).toBe(422)
      expect(
        mockedTeacherService.getTeacherClassByClassCode
      ).toHaveBeenCalledWith('BADCODE')
      expect(
        mockedStudentService.doesStudentWithEmailExist
      ).not.toHaveBeenCalled()
    })
  })

  describe('POST /api-public/nths-groups/join', () => {
    const inviteCode = 'ABC123'

    test('returns groups when authenticated email matches and user joins group', async () => {
      const email = mockUser.email
      const group = buildNTHSGroup({ inviteCode })
      const joinedGroup = buildNTHSGroupWithMemberInfo({
        inviteCode,
        groupId: group.id,
        groupName: group.name,
        groupKey: group.key,
        groupInfo: {
          id: group.id,
          name: group.name,
          key: group.key,
          createdAt: group.createdAt,
          inviteCode,
        },
      })
      const groups = [joinedGroup]

      mockedNTHSGroupsService.getNTHSGroupByInviteCode.mockResolvedValueOnce(
        group
      )
      mockedNTHSGroupsService.getGroups.mockResolvedValueOnce([])
      mockedNTHSGroupsService.joinGroupAsMemberByGroupId.mockResolvedValueOnce([
        joinedGroup,
      ])

      const response = await sendPost('/api-public/nths-groups/join', {
        inviteCode,
        email,
      })
      expect(response.status).toBe(200)
      expect(
        mockedNTHSGroupsService.getNTHSGroupByInviteCode
      ).toHaveBeenCalledWith(inviteCode)
      expect(mockedNTHSGroupsService.getGroups).toHaveBeenCalledWith(
        mockUser.id
      )
      expect(
        mockedNTHSGroupsService.joinGroupAsMemberByGroupId
      ).toHaveBeenCalledWith(mockUser.id, group.id)
      expect(response.body).toEqual({
        groups: groups.map(serializeNTHSGroupWithMemberInfo),
      })
      expect(
        mockedVolunteerService.doesVolunteerWithEmailExist
      ).not.toHaveBeenCalled()
    })

    test('returns first existing group when authenticated email matches and user is already in a group', async () => {
      const email = mockUser.email
      const group = buildNTHSGroup({ inviteCode })
      const existingGroup = buildNTHSGroupWithMemberInfo({
        inviteCode,
        groupId: group.id,
        groupName: group.name,
        groupKey: group.key,
        groupInfo: {
          id: group.id,
          name: group.name,
          key: group.key,
          createdAt: group.createdAt,
          inviteCode,
        },
      })
      const groups = [existingGroup]

      mockedNTHSGroupsService.getNTHSGroupByInviteCode.mockResolvedValueOnce(
        group
      )
      mockedNTHSGroupsService.getGroups.mockResolvedValueOnce(groups)

      const response = await sendPost('/api-public/nths-groups/join', {
        inviteCode,
        email: email.toUpperCase(),
      })
      expect(response.status).toBe(200)
      expect(mockedNTHSGroupsService.getGroups).toHaveBeenCalledWith(
        mockUser.id
      )
      expect(
        mockedNTHSGroupsService.joinGroupAsMemberByGroupId
      ).not.toHaveBeenCalled()
      expect(response.body).toEqual({
        NTHSGroup: serializeNTHSGroupWithMemberInfo(existingGroup),
      })
    })

    test('returns whether volunteer exists when authenticated email does not match request email', async () => {
      const email = getEmail()
      const group = buildNTHSGroup({ inviteCode })

      mockUser = buildUser({
        email: getEmail(),
      })
      mockedNTHSGroupsService.getNTHSGroupByInviteCode.mockResolvedValueOnce(
        group
      )
      mockedVolunteerService.doesVolunteerWithEmailExist.mockResolvedValueOnce(
        true
      )

      const response = await sendPost('/api-public/nths-groups/join', {
        inviteCode,
        email: email,
      })
      expect(response.status).toBe(200)
      expect(
        mockedVolunteerService.doesVolunteerWithEmailExist
      ).toHaveBeenCalledWith(email.toLowerCase())
      expect(response.body).toEqual({
        isExistingVolunteer: true,
      })
      expect(mockedNTHSGroupsService.getGroups).not.toHaveBeenCalled()
      expect(
        mockedNTHSGroupsService.joinGroupAsMemberByGroupId
      ).not.toHaveBeenCalled()
    })

    test('returns whether volunteer exists when request is unauthenticated', async () => {
      const email = getEmail()
      const group = buildNTHSGroup({ inviteCode })

      mockUser = undefined as unknown as AppUser
      mockedNTHSGroupsService.getNTHSGroupByInviteCode.mockResolvedValueOnce(
        group
      )
      mockedVolunteerService.doesVolunteerWithEmailExist.mockResolvedValueOnce(
        false
      )

      const response = await sendPost('/api-public/nths-groups/join', {
        inviteCode,
        email,
      })
      expect(response.status).toBe(200)
      expect(
        mockedVolunteerService.doesVolunteerWithEmailExist
      ).toHaveBeenCalledWith(email.toLowerCase())
      expect(response.body).toEqual({
        isExistingVolunteer: false,
      })
    })

    test('returns 422 when invite code is invalid', async () => {
      const inviteCode = getUuid()
      //   TODO: Fix return type of getNTHSGroupByInviteCode
      mockedNTHSGroupsService.getNTHSGroupByInviteCode.mockResolvedValueOnce(
        undefined
      )

      const response = await sendPost('/api-public/nths-groups/join', {
        inviteCode,
        email: getEmail(),
      })

      expect(response.status).toBe(422)
      expect(response.body).toEqual({
        err: 'Invalid team invite code',
      })
      expect(
        mockedNTHSGroupsService.getNTHSGroupByInviteCode
      ).toHaveBeenCalledWith(inviteCode)
      expect(mockedNTHSGroupsService.getGroups).not.toHaveBeenCalled()
      expect(
        mockedVolunteerService.doesVolunteerWithEmailExist
      ).not.toHaveBeenCalled()
    })
  })

  describe('GET /api-public/nths-groups/:inviteCode', () => {
    test('returns nths group by invite code', async () => {
      const group = buildNTHSGroup()
      mockedNTHSGroupsService.getNTHSGroupByInviteCode.mockResolvedValueOnce(
        group
      )

      const response = await sendGet(
        `/api-public/nths-groups/${group.inviteCode}`
      )
      expect(response.status).toBe(200)
      expect(
        mockedNTHSGroupsService.getNTHSGroupByInviteCode
      ).toHaveBeenCalledWith(group.inviteCode)
      expect(response.body).toEqual({
        NTHSGroup: { ...group, createdAt: group.createdAt?.toISOString() },
      })
    })

    test('returns 422 when invite code is invalid', async () => {
      //   TODO: Fix return type of getNTHSGroupByInviteCode
      mockedNTHSGroupsService.getNTHSGroupByInviteCode.mockResolvedValueOnce(
        undefined
      )

      const response = await sendGet('/api-public/nths-groups/BAD123')
      expect(response.status).toBe(422)
      expect(
        mockedNTHSGroupsService.getNTHSGroupByInviteCode
      ).toHaveBeenCalledWith('BAD123')
    })
  })
})
