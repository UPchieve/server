import { Job } from 'bull'
import config from '../../../config'
import * as NthsApplicationRepo from '../../../models/NTHSApplication'
import * as MailService from '../../../services/MailService'
import * as NotificationService from '../../../services/NotificationService'
import notifyApplicants, {
  JobData,
} from '../../../worker/jobs/nths/applicationStatusNotification'

jest.mock('../../../models/NTHSApplication')
jest.mock('../../../services/MailService')
jest.mock('../../../services/NotificationService')

const mockedApplications = jest.mocked(NthsApplicationRepo)
const mockedMail = jest.mocked(MailService)
const mockedNotifications = jest.mocked(NotificationService)

const JOB = {
  data: {
    periodStart: new Date('2026-09-01T04:00:00.000Z'),
    periodEnd: new Date('2027-01-01T05:00:00.000Z'),
  },
} as Job<JobData>

beforeEach(() => {
  jest.clearAllMocks()
  mockedApplications.needsDenialEmail.mockResolvedValue([])
  mockedApplications.needsApprovalEmail.mockResolvedValue([])
  mockedMail.sendNTHSCandidateApplicationApproved.mockResolvedValue()
  mockedMail.sendNTHSCandidateApplicationDenied.mockResolvedValue()
  mockedNotifications.createEmailNotification.mockResolvedValue()
})

describe('NTHSApplicationStatus approval email', () => {
  test('uses approval day plus 21 ET calendar days as the launch date', async () => {
    const applicant = {
      userId: '00000000-0000-0000-0000-000000000001',
      firstName: 'Taylor',
      email: 'taylor@example.com',
      activatedAt: new Date('2026-10-01T23:30:00.000Z'),
    }
    mockedApplications.needsApprovalEmail.mockResolvedValue([applicant])

    await notifyApplicants(JOB)

    expect(
      mockedMail.sendNTHSCandidateApplicationApproved
    ).toHaveBeenCalledWith([
      {
        ...applicant,
        launchDate: 'October 22, 2026',
      },
    ])
    expect(mockedNotifications.createEmailNotification).toHaveBeenCalledWith({
      userId: applicant.userId,
      emailTemplateId: config.sendgrid.nthsCandidateApplicationApproved,
    })
  })
})
