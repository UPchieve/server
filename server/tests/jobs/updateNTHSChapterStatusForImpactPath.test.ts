import * as NTHSService from '../../services/NTHSGroupsService'
import * as NTHSGroupsRepo from '../../models/NTHSGroups'
import * as MailService from '../../services/MailService'
import logger from '../../logger'
import { beforeEach } from '@jest/globals'
import updateNTHSChapterStatusForImpactPath, {
  UpdateNTHSChapterStatusJobData,
} from '../../worker/jobs/updateNTHSChapterStatusForImpactPath'
import { Job } from 'bull'
import { buildNTHSGroup } from '../mocks/generate'

jest.mock('../../services/NTHSGroupsService')
jest.mock('../../models/NTHSGroups')
jest.mock('../../services/MailService')
jest.mock('../../logger')

const mockedNTHSService = jest.mocked(NTHSService)
const mockedNTHSGroupsRepo = jest.mocked(NTHSGroupsRepo)
const mockedMailService = jest.mocked(MailService)
const mockedLogger = jest.mocked(logger)

const DEFAULT_JOB = {
  name: 'UpdateNTHSChapterStatusForImpactPath',
  data: { nthsGroupId: '123' },
} as Job<UpdateNTHSChapterStatusJobData>

function mockMembersTutoring(
  membersTutoring: number,
  hasOfficialStatus = false
) {
  mockedNTHSGroupsRepo.getNthsChapterImpact.mockResolvedValue({
    hasOfficialStatus,
    schoolYearToDate: {
      membersTutoring,
      studentsHelped: 0,
      sessionsCompleted: 0,
      hoursTutored: 0,
    },
    allTime: { studentsHelped: 0, sessionsCompleted: 0, hoursTutored: 0 },
  })
}

beforeEach(() => {
  jest.resetAllMocks()
  jest.useFakeTimers().setSystemTime(new Date('2026-11-15T12:00:00Z'))
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

afterEach(() => {
  jest.useRealTimers()
})

const PENDING_ROW = {
  groupId: 1,
  statusName: 'PENDING',
  createdAt: null,
  statusId: 1,
} as const

describe('updateNTHSChapterStatusForImpactPath', () => {
  it.each([
    ['no previous row, below the goal', undefined, 2, [['123', 'PENDING']], 0],
    ['no previous row, at the goal', undefined, 3, [['123', 'OFFICIAL']], 1],
    ['pending, below the goal', PENDING_ROW, 2, [], 0],
    ['pending, at the goal', PENDING_ROW, 3, [['123', 'OFFICIAL']], 1],
  ])(
    'Stores the status for a chapter with %s',
    async (
      _label,
      previous,
      membersTutoring,
      expectedInserts,
      expectedEmails
    ) => {
      mockedNTHSService.getLatestNthsChapterStatus.mockResolvedValue(previous)
      mockMembersTutoring(membersTutoring)

      await updateNTHSChapterStatusForImpactPath(DEFAULT_JOB)

      expect(mockedNTHSService.insertNthsChapterStatus.mock.calls).toEqual(
        expectedInserts
      )
      expect(
        mockedMailService.sendNTHSChapterImpactPathOfficialStatusNotification
      ).toHaveBeenCalledTimes(expectedEmails)
    }
  )

  it('Counts members for the current school year', async () => {
    mockMembersTutoring(0)

    await updateNTHSChapterStatusForImpactPath(DEFAULT_JOB)

    expect(mockedNTHSGroupsRepo.getNthsChapterImpact).toHaveBeenCalledWith(
      '123',
      new Date('2026-07-01T00:00:00Z'),
      new Date('2027-07-01T00:00:00Z')
    )
  })

  it('Sets OFFICIAL and skips the email when the chapter has no current admin', async () => {
    mockMembersTutoring(3)
    mockedNTHSService.getNTHSGroupAdminsContactInfo.mockResolvedValue([])

    await updateNTHSChapterStatusForImpactPath(DEFAULT_JOB)

    expect(NTHSService.insertNthsChapterStatus).toHaveBeenCalledWith(
      DEFAULT_JOB.data.nthsGroupId,
      'OFFICIAL'
    )
    expect(mockedLogger.warn).toHaveBeenCalledWith(expect.any(String), {
      groupId: DEFAULT_JOB.data.nthsGroupId,
    })
    expect(
      mockedMailService.sendNTHSChapterImpactPathOfficialStatusNotification
    ).not.toHaveBeenCalled()
  })

  it("Chapter doesn't lose their OFFICIAL status", async () => {
    mockedNTHSService.getLatestNthsChapterStatus.mockResolvedValue(PENDING_ROW)
    mockMembersTutoring(3, true)

    await updateNTHSChapterStatusForImpactPath(DEFAULT_JOB)

    expect(NTHSService.insertNthsChapterStatus).not.toHaveBeenCalled()
    expect(
      mockedMailService.sendNTHSChapterImpactPathOfficialStatusNotification
    ).not.toHaveBeenCalled()
  })
})
