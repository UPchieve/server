import { Job } from 'bull'
import config from '../../../config'
import * as NthsApplicationRepo from '../../../models/NTHSApplication'
import type { NTHSActiveCampaignPresident } from '../../../models/NTHSApplication'
import * as MailService from '../../../services/MailService'
import * as NotificationService from '../../../services/NotificationService'
import * as NTHSGroupsService from '../../../services/NTHSGroupsService'
import candidateEngagementCampaign from '../../../worker/jobs/nths/candidateEngagementCampaign'

jest.mock('../../../models/NTHSApplication')
jest.mock('../../../services/MailService')
jest.mock('../../../services/NotificationService')
jest.mock('../../../services/NTHSGroupsService')

const mockedApplications = jest.mocked(NthsApplicationRepo)
const mockedMail = jest.mocked(MailService)
const mockedNotifications = jest.mocked(NotificationService)
const mockedGroups = jest.mocked(NTHSGroupsService)

const NOW = new Date('2026-10-15T14:00:00.000Z')
const JOB = {
  data: {
    cohortStartDate: new Date('2026-09-01T04:00:00.000Z'),
    cohortEndDate: new Date('2027-01-01T05:00:00.000Z'),
  },
} as Job<{ cohortStartDate: Date; cohortEndDate: Date }>

function president(
  overrides: Partial<NTHSActiveCampaignPresident> = {}
): NTHSActiveCampaignPresident {
  return {
    applicationId: 1,
    userId: '00000000-0000-0000-0000-000000000001',
    approvedAt: new Date('2026-10-12T14:00:00.000Z'),
    firstName: 'Taylor',
    email: 'taylor@example.com',
    ...overrides,
  }
}

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(NOW)
  jest.clearAllMocks()
  mockedNotifications.getLatestEmailNotifications.mockResolvedValue([])
  mockedGroups.getActiveMemberCounts.mockResolvedValue([])
  mockedGroups.getTutoringMemberCounts.mockResolvedValue([])
  mockedMail.sendNTHSCampaignEmail.mockResolvedValue()
  mockedNotifications.createEmailNotification.mockResolvedValue()
})

afterEach(() => {
  jest.useRealTimers()
})

describe('NTHSCandidateEngagement v3', () => {
  test('loads shared state and sends one typed email for each eligible path', async () => {
    const setupPresident = president()
    const recruitingPresident = president({
      applicationId: 2,
      userId: '00000000-0000-0000-0000-000000000002',
      approvedAt: new Date('2026-10-01T14:00:00.000Z'),
      firstName: 'Reese',
      email: 'reese@example.com',
      chapterId: '10000000-0000-0000-0000-000000000002',
      chapterName: 'Recruiting Chapter',
      chapterKey: 'recruiting-chapter',
      inviteCode: 'ABC123',
      chapterStatus: 'PENDING',
    })
    const activationPresident = president({
      applicationId: 3,
      userId: '00000000-0000-0000-0000-000000000003',
      approvedAt: new Date('2026-10-05T14:00:00.000Z'),
      firstName: 'Alex',
      email: 'alex@example.com',
      chapterId: '10000000-0000-0000-0000-000000000003',
      chapterName: 'Activation Chapter',
      chapterKey: 'activation-chapter',
      inviteCode: 'XYZ789',
      chapterStatus: 'PENDING',
    })
    const presidents = [
      setupPresident,
      recruitingPresident,
      activationPresident,
    ]
    mockedApplications.getActiveCampaignPresidents.mockResolvedValue(presidents)
    mockedGroups.getActiveMemberCounts.mockResolvedValue([
      { groupId: recruitingPresident.chapterId!, membersCount: 1 },
      { groupId: activationPresident.chapterId!, membersCount: 3 },
    ])
    mockedGroups.getTutoringMemberCounts.mockResolvedValue([
      {
        groupId: activationPresident.chapterId!,
        tutoringMembersCount: 1,
      },
    ])

    await candidateEngagementCampaign(JOB)

    expect(mockedGroups.getTutoringMemberCounts).toHaveBeenCalledWith([
      activationPresident.chapterId,
    ])
    expect(mockedMail.sendNTHSCampaignEmail).toHaveBeenNthCalledWith(
      1,
      'setupDay3',
      [
        {
          to: setupPresident.email,
          dynamicData: { firstName: setupPresident.firstName },
        },
      ]
    )
    expect(mockedMail.sendNTHSCampaignEmail).toHaveBeenNthCalledWith(
      2,
      'recruitingDay14',
      [
        {
          to: recruitingPresident.email,
          dynamicData: { firstName: 'Reese', days_left: 7 },
        },
      ]
    )
    expect(mockedMail.sendNTHSCampaignEmail).toHaveBeenNthCalledWith(
      3,
      'activationA1',
      [
        {
          to: activationPresident.email,
          dynamicData: {
            firstName: 'Alex',
            members_count: 3,
            tutoring_count: 1,
            launch_date: 'October 26, 2026',
          },
        },
      ]
    )
    expect(mockedNotifications.createEmailNotification).toHaveBeenCalledTimes(3)
  })

  test('maps template notification history back to campaign state', async () => {
    const candidate = president({
      approvedAt: new Date('2026-10-01T14:00:00.000Z'),
      chapterId: '10000000-0000-0000-0000-000000000001',
      inviteCode: 'ABC123',
      chapterStatus: 'PENDING',
    })
    mockedApplications.getActiveCampaignPresidents.mockResolvedValue([
      candidate,
    ])
    mockedGroups.getActiveMemberCounts.mockResolvedValue([
      { groupId: candidate.chapterId!, membersCount: 1 },
    ])
    mockedNotifications.getLatestEmailNotifications.mockResolvedValue([
      {
        userId: candidate.userId,
        emailTemplateId: config.sendgrid.nthsCandidateEngagment.recruitingDay14,
        sentAt: new Date('2026-10-14T14:00:00.000Z'),
      },
    ])

    await candidateEngagementCampaign(JOB)

    expect(mockedMail.sendNTHSCampaignEmail).not.toHaveBeenCalled()
    expect(mockedNotifications.createEmailNotification).not.toHaveBeenCalled()
  })

  test('builds the R4 member invitation link from the chapter invite code', async () => {
    const candidate = president({
      approvedAt: new Date('2026-09-27T14:00:00.000Z'),
      chapterId: '10000000-0000-0000-0000-000000000001',
      inviteCode: 'ABC123',
      chapterStatus: 'PENDING',
    })
    mockedApplications.getActiveCampaignPresidents.mockResolvedValue([
      candidate,
    ])
    mockedGroups.getActiveMemberCounts.mockResolvedValue([
      { groupId: candidate.chapterId!, membersCount: 1 },
    ])

    await candidateEngagementCampaign(JOB)

    expect(mockedMail.sendNTHSCampaignEmail).toHaveBeenCalledWith(
      'recruitingDay18',
      [
        {
          to: candidate.email,
          dynamicData: {
            firstName: candidate.firstName,
            days_left: 3,
            invite_link: 'http://localhost/join-team/ABC123',
          },
        },
      ]
    )
  })

  test('sends a template group in batches of 100', async () => {
    const presidents = Array.from({ length: 101 }, (_, index) =>
      president({
        applicationId: index + 1,
        userId: `00000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`,
        email: `president-${index + 1}@example.com`,
      })
    )
    mockedApplications.getActiveCampaignPresidents.mockResolvedValue(presidents)

    await candidateEngagementCampaign(JOB)

    expect(mockedMail.sendNTHSCampaignEmail).toHaveBeenCalledTimes(2)
    expect(mockedMail.sendNTHSCampaignEmail.mock.calls[0][1]).toHaveLength(100)
    expect(mockedMail.sendNTHSCampaignEmail.mock.calls[1][1]).toHaveLength(1)
    expect(mockedNotifications.createEmailNotification).toHaveBeenCalledTimes(
      101
    )
  })

  test('records no notification when the batch send fails', async () => {
    const candidate = president()
    mockedApplications.getActiveCampaignPresidents.mockResolvedValue([
      candidate,
    ])
    mockedMail.sendNTHSCampaignEmail.mockRejectedValueOnce(
      new Error('SendGrid failed')
    )

    await expect(candidateEngagementCampaign(JOB)).rejects.toThrow(
      'SendGrid failed'
    )
    expect(mockedNotifications.createEmailNotification).not.toHaveBeenCalled()
  })
})
