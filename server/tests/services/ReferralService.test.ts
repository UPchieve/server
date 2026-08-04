import * as ReferralsRepo from '../../models/Referrals'
import * as ReferralService from '../../services/ReferralService'
import * as QueueService from '../../services/QueueService'
import * as NotificationsService from '../../services/NotificationService'
import { mocked } from 'jest-mock'
import { Jobs } from '../../worker/jobs'
import { jest, describe, beforeEach, expect, it } from '@jest/globals'

jest.mock('../../models/Referrals')
jest.mock('../../services/QueueService')
jest.mock('../../services/NotificationService')

const mockedReferralsRepo = mocked(ReferralsRepo)
const mockedNotificationService = mocked(NotificationsService)

beforeEach(() => {
  jest.resetAllMocks()
})

describe('queueReferredByEmailsForVolunteer', () => {
  function buildReferredUser(overrides = {}) {
    return {
      userId: 'some-user-id',
      roles: ['student', 'volunteer'],
      ...overrides,
    }
  }
  describe('Ambassador email', () => {
    const REFERRED_BY_USER_ID = '123'
    const FIRST_NAME = 'Malzie'
    async function test() {
      return ReferralService.queueReferredByEmailsForVolunteer({
        referredBy: REFERRED_BY_USER_ID,
        firstName: FIRST_NAME,
        sendAmbassadorEmail: true,
        referredByCode: 'ABC',
      })
    }

    it('Sends ambassador email if at least 5 volunteers have been recruited', async () => {
      mockedReferralsRepo.getReferredUsersWithFilter.mockResolvedValue([
        buildReferredUser({ roles: ['volunteer'] }),
        buildReferredUser({ roles: ['volunteer'] }),
        buildReferredUser({ roles: ['volunteer'] }),
        buildReferredUser({ roles: ['volunteer'] }),
        buildReferredUser({ roles: ['volunteer', 'student'] }),
      ])
      mockedNotificationService.hasUserBeenSentEmail.mockResolvedValue(false)
      await test()
      expect(QueueService.add).toHaveBeenCalledTimes(2)
      expect(QueueService.add).toHaveBeenNthCalledWith(
        2,
        Jobs.SendAmbassadorCongratsEmail,
        expect.anything(),
        expect.anything()
      )
    })

    it('Does NOT send ambassador email if less than 5 volunteers have been recruited', async () => {
      mockedReferralsRepo.getReferredUsersWithFilter.mockResolvedValue([
        buildReferredUser({ roles: ['volunteer'] }),
        buildReferredUser({ roles: ['volunteer', 'student'] }),
      ])
      mockedNotificationService.hasUserBeenSentEmail.mockResolvedValue(false)
      await test()
      expect(QueueService.add).toHaveBeenCalledTimes(1)
      expect(QueueService.add).toHaveBeenNthCalledWith(
        1,
        Jobs.SendReferralSignUpCelebrationEmail,
        expect.anything(),
        expect.anything()
      )
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.SendAmbassadorCongratsEmail
      )
    })

    it('Does NOT send ambassador email if it was already sent', async () => {
      mockedReferralsRepo.getReferredUsersWithFilter.mockResolvedValue([
        buildReferredUser({ roles: ['volunteer'] }),
        buildReferredUser({ roles: ['volunteer'] }),
        buildReferredUser({ roles: ['volunteer'] }),
        buildReferredUser({ roles: ['volunteer'] }),
        buildReferredUser({ roles: ['volunteer', 'student'] }),
      ])
      mockedNotificationService.hasUserBeenSentEmail.mockResolvedValue(true)
      await test()
      expect(QueueService.add).toHaveBeenCalledTimes(1)
      expect(QueueService.add).toHaveBeenNthCalledWith(
        1,
        Jobs.SendReferralSignUpCelebrationEmail,
        expect.anything(),
        expect.anything()
      )
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.SendAmbassadorCongratsEmail
      )
    })
  })
})
