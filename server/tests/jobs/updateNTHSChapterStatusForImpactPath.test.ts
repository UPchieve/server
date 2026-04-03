import * as NTHSService from '../../services/NTHSGroupsService'
import * as VolunteersService from '../../services/VolunteerService'
import * as SessionRepo from '../../models/Session'
import * as MailService from '../../services/MailService'
import logger from '../../logger'
import { beforeEach } from '@jest/globals'
import updateNTHSChapterStatusForImpactPath, {
  UpdateNTHSChapterStatusJobData,
} from '../../worker/jobs/updateNTHSChapterStatusForImpactPath'
import moment from 'moment'
import 'moment-timezone'
import { Job } from 'bull'
import { Jobs } from '../../worker/jobs'
import { NTHSGroupMemberWithRole } from '../../models/NTHSGroups'
import {
  buildNTHSGroup,
  buildNTHSGroupMemberWithRole,
  buildUserSession,
  buildVolunteerWithReadyToCoachInfo,
} from '../mocks/generate'

jest.mock('../../services/NTHSGroupsService')
jest.mock('../../services/VolunteerService')
jest.mock('../../services/MailService')
jest.mock('../../models/Session')
jest.mock('../../logger')

const mockedNTHSService = jest.mocked(NTHSService)
const mockedVolunteersService = jest.mocked(VolunteersService)
const mockedMailService = jest.mocked(MailService)
const mockedSessionRepo = jest.mocked(SessionRepo)
const mockedLogger = jest.mocked(logger)

const DEFAULT_JOB = {
  name: Jobs.UpdateNTHSChapterStatusForImpactPath,
  data: {
    nthsGroupId: '123',
    periodStart: moment().subtract(1, 'years').toDate(),
    periodEnd: moment().add(1, 'years').toDate(),
  },
} as Job<UpdateNTHSChapterStatusJobData>

beforeEach(() => {
  jest.resetAllMocks()
  mockedNTHSService.getNTHSGroupByID.mockResolvedValue(buildNTHSGroup())
  mockedNTHSService.getNTHSGroupAdminsContactInfo.mockResolvedValue([
    {
      nthsGroupId: '123',
      firstName: 'Test',
      email: 'test@testing.com',
    },
  ])
  mockedNTHSService.getLatestNthsChapterStatus.mockResolvedValue(undefined)
})

function buildGroupMembers(
  opts: {
    active?: number
    deactivated?: number
  } = {}
): NTHSGroupMemberWithRole[] {
  const options = {
    active: 6,
    deactivated: 0,
    ...opts,
  }
  const arr = []
  for (let i = 0; i < options.active; i++) {
    arr.push(buildNTHSGroupMemberWithRole())
  }
  for (let i = 0; i < options.deactivated; i++) {
    arr.push(
      buildNTHSGroupMemberWithRole({
        deactivatedAt: new Date(),
      })
    )
  }
  return arr
}
describe('updateNTHSChapterStatusForImpactPath', () => {
  it('Happy path: eligible chapter', async () => {
    const groupMembers = buildGroupMembers({ active: 6 })
    mockedNTHSService.getGroupMembers.mockResolvedValue(groupMembers)
    mockedVolunteersService.getVolunteersReadyToCoachStatus.mockResolvedValue(
      groupMembers.map((member) =>
        buildVolunteerWithReadyToCoachInfo({
          id: member.userId,
        })
      )
    )
    for (const member of groupMembers) {
      const session = buildUserSession({
        volunteerId: member.userId,
      })
      mockedSessionRepo.getUserSessionsByUserId.mockResolvedValueOnce([session])
    }

    await updateNTHSChapterStatusForImpactPath(DEFAULT_JOB)

    expect(mockedLogger.info).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('Chapter status has been updated to OFFICIAL')
    )
    expect(NTHSService.insertNthsChapterStatus).toHaveBeenCalledWith(
      DEFAULT_JOB.data.nthsGroupId,
      'OFFICIAL'
    )
    expect(
      mockedMailService.sendNTHSChapterImpactPathOfficialStatusNotification
    ).toHaveBeenCalled()
  })

  it('Does not count banned coaches', async () => {
    const groupMembers = buildGroupMembers({ active: 6 })
    mockedNTHSService.getGroupMembers.mockResolvedValue(groupMembers)
    const readyToCoachInfo = groupMembers.map((member) =>
      buildVolunteerWithReadyToCoachInfo({
        id: member.userId,
      })
    )
    // One coach is banned
    const bannedCoachId = readyToCoachInfo[0].id
    readyToCoachInfo[0] = {
      ...readyToCoachInfo[0],
      banType: 'complete',
    }
    mockedVolunteersService.getVolunteersReadyToCoachStatus.mockResolvedValue(
      readyToCoachInfo
    )
    for (const member of groupMembers) {
      const session = buildUserSession({
        volunteerId: member.userId,
      })
      mockedSessionRepo.getUserSessionsByUserId.mockResolvedValueOnce([session])
    }

    await updateNTHSChapterStatusForImpactPath(DEFAULT_JOB)

    const readyToCoachIds = groupMembers
      .map((member) => member.userId)
      .filter((id) => id !== bannedCoachId)
    expect(mockedLogger.info).toHaveBeenCalledWith(
      {
        groupId: DEFAULT_JOB.data.nthsGroupId,
        userIds: readyToCoachIds,
      },
      expect.stringContaining('Found 5 ready-to-coach members of NTHS chapter')
    )
    expect(NTHSService.insertNthsChapterStatus).toHaveBeenCalledWith(
      DEFAULT_JOB.data.nthsGroupId,
      'PENDING'
    )
    expect(
      mockedMailService.sendNTHSChapterImpactPathOfficialStatusNotification
    ).not.toHaveBeenCalled()
  })

  it('Does not count ready to coach but not activated coaches', async () => {
    const groupMembers = buildGroupMembers({ active: 6 })
    mockedNTHSService.getGroupMembers.mockResolvedValue(groupMembers)
    mockedVolunteersService.getVolunteersReadyToCoachStatus.mockResolvedValue(
      groupMembers.map((member) =>
        buildVolunteerWithReadyToCoachInfo({
          id: member.userId,
        })
      )
    )
    // All but 1 coach has a session
    const notActivatedCoachId = groupMembers[0].userId
    mockedSessionRepo.getUserSessionsByUserId.mockResolvedValueOnce([])
    for (const member of groupMembers.slice(1)) {
      const session = buildUserSession({
        volunteerId: member.userId,
      })
      mockedSessionRepo.getUserSessionsByUserId.mockResolvedValueOnce([session])
    }

    await updateNTHSChapterStatusForImpactPath(DEFAULT_JOB)

    const expectedEligibleMemberIds = groupMembers
      .map((member) => member.userId)
      .filter((id) => id !== notActivatedCoachId)
    expect(mockedLogger.info).toHaveBeenCalledWith(
      {
        groupId: DEFAULT_JOB.data.nthsGroupId,
        newChapterStatus: 'PENDING',
        userIds: expectedEligibleMemberIds,
      },
      expect.stringContaining('Counted 5 eligible members for impact path')
    )
    expect(mockedLogger.info).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('Chapter status has been updated to PENDING')
    )
    expect(NTHSService.insertNthsChapterStatus).toHaveBeenCalledWith(
      DEFAULT_JOB.data.nthsGroupId,
      'PENDING'
    )
    expect(
      mockedMailService.sendNTHSChapterImpactPathOfficialStatusNotification
    ).not.toHaveBeenCalled()
  })

  it("Queries for sessions no older than the user's deactivatedAt", async () => {
    const groupMembers = buildGroupMembers({ active: 5, deactivated: 1 })
    mockedNTHSService.getGroupMembers.mockResolvedValue(groupMembers)
    mockedVolunteersService.getVolunteersReadyToCoachStatus.mockResolvedValue(
      groupMembers.map((member) =>
        buildVolunteerWithReadyToCoachInfo({
          id: member.userId,
        })
      )
    )
    const deactivatedMemberId = groupMembers[5].userId
    for (const member of groupMembers.slice(0, 5)) {
      const session = buildUserSession({
        volunteerId: member.userId,
      })
      mockedSessionRepo.getUserSessionsByUserId.mockResolvedValueOnce([session])
    }
    mockedSessionRepo.getUserSessionsByUserId.mockResolvedValueOnce([])

    await updateNTHSChapterStatusForImpactPath(DEFAULT_JOB)

    expect(mockedSessionRepo.getUserSessionsByUserId).toHaveBeenNthCalledWith(
      6,
      deactivatedMemberId,
      {
        start: DEFAULT_JOB.data.periodStart,
        end: groupMembers[5].deactivatedAt,
      }
    )
    const expectedEligibleMemberIds = groupMembers
      .map((member) => member.userId)
      .filter((id) => id !== deactivatedMemberId)
    expect(mockedLogger.info).toHaveBeenCalledWith(
      {
        groupId: DEFAULT_JOB.data.nthsGroupId,
        newChapterStatus: 'PENDING',
        userIds: expectedEligibleMemberIds,
      },
      expect.stringContaining('Counted 5 eligible members for impact path')
    )
    expect(mockedLogger.info).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('Chapter status has been updated to PENDING')
    )
    expect(NTHSService.insertNthsChapterStatus).toHaveBeenCalledWith(
      DEFAULT_JOB.data.nthsGroupId,
      'PENDING'
    )
    expect(
      mockedMailService.sendNTHSChapterImpactPathOfficialStatusNotification
    ).not.toHaveBeenCalled()
  })
  it('Does not count sessions happening before the start date of the job or after the end date of the job', async () => {
    const groupMembers = buildGroupMembers({ active: 6 })
    mockedNTHSService.getGroupMembers.mockResolvedValue(groupMembers)
    mockedVolunteersService.getVolunteersReadyToCoachStatus.mockResolvedValue(
      groupMembers.map((member) =>
        buildVolunteerWithReadyToCoachInfo({
          id: member.userId,
        })
      )
    )
    // Mock that the first two members don't have sessions in the requested date range.
    mockedSessionRepo.getUserSessionsByUserId.mockResolvedValueOnce([])
    mockedSessionRepo.getUserSessionsByUserId.mockResolvedValueOnce([])
    // The rest of the members have sessions occurring in the job's date range.
    groupMembers.slice(2).forEach((member) => {
      mockedSessionRepo.getUserSessionsByUserId.mockResolvedValueOnce([
        buildUserSession({
          volunteerId: member.userId,
        }),
      ])
    })

    await updateNTHSChapterStatusForImpactPath(DEFAULT_JOB)

    expect(mockedLogger.info).toHaveBeenCalledWith(
      {
        groupId: DEFAULT_JOB.data.nthsGroupId,
        newChapterStatus: 'PENDING',
        userIds: groupMembers.slice(2).map((member) => member.userId),
      },
      expect.stringContaining('Counted 4 eligible members for impact path')
    )
    expect(mockedLogger.info).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('Chapter status has been updated to PENDING')
    )
    expect(NTHSService.insertNthsChapterStatus).toHaveBeenCalledWith(
      DEFAULT_JOB.data.nthsGroupId,
      'PENDING'
    )
    expect(
      mockedMailService.sendNTHSChapterImpactPathOfficialStatusNotification
    ).not.toHaveBeenCalled()
  })
})
