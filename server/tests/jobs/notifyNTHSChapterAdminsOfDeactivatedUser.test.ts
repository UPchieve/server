import { Job } from 'bull'
import * as NTHSGroupsRepo from '../../models/NTHSGroups'
import * as MailService from '../../services/MailService'
import logger from '../../logger'
import { getDbUlid } from '../../models/pgUtils'
import notifyNTHSChapterAdminsOfDeactivatedUser, {
  NotifyNTHSChapterAdminsOfDeactivatedUserJobData,
} from '../../worker/jobs/notifyNTHSChapterAdminsOfDeactivatedUser'
import { Jobs } from '../../worker/jobs'

jest.mock('../../models/NTHSGroups')
jest.mock('../../services/MailService')
jest.mock('../../services/UserService')
jest.mock('../../logger')

const mockedNTHSGroupsRepo = jest.mocked(NTHSGroupsRepo)
const mockedMailService = jest.mocked(MailService)
const mockedLogger = jest.mocked(logger)

beforeEach(() => {
  jest.resetAllMocks()
})

test('completes without an email when the chapter has no current admin', async () => {
  const job = {
    name: Jobs.NotifyNTHSChapterAdminsOfDeactivatedUser,
    data: { nthsGroupId: getDbUlid(), deactivatedUserId: getDbUlid() },
  } as Job<NotifyNTHSChapterAdminsOfDeactivatedUserJobData>
  mockedNTHSGroupsRepo.getGroupAdminsContactInfo.mockResolvedValueOnce([])

  await notifyNTHSChapterAdminsOfDeactivatedUser(job)

  expect(mockedLogger.warn).toHaveBeenCalledWith(
    {
      groupId: job.data.nthsGroupId,
      deactivatedUserId: job.data.deactivatedUserId,
    },
    expect.any(String)
  )
  expect(
    mockedMailService.sendNTHSChapterAdminsMemberDeactivationNotice
  ).not.toHaveBeenCalled()
})
