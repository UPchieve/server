import { Job } from 'bull'
import { redisClient } from '../../services/RedisService'
import * as PresenceService from '../../services/PresenceService'
import * as UserActionService from '../../services/UserActionService'
import { getDbUlid, getUuid } from '../../models/pgUtils'
import { ACCOUNT_USER_ACTIONS } from '../../constants'
import markPassiveCoachesInactive, {
  MarkPassiveCoachesInactiveJobData,
} from '../../worker/jobs/markPassiveCoachesInactive'

jest.mock('../../services/UserActionService')
jest.mock('../../services/QueueService')
jest.mock('../../logger')

const mockedUserActionService = jest.mocked(UserActionService)

beforeEach(async () => {
  jest.clearAllMocks()
  await redisClient.flushall()
})

async function makePassive(userId: string) {
  const clientUUID = getUuid()
  await PresenceService.trackActivity({ userId, clientUUID, role: 'volunteer' })
  await PresenceService.trackPassivity({ userId, clientUUID })
}

async function onlineCoachIds() {
  return (await PresenceService.getOnlineUserIds()).volunteers
}

function jobFor(coachIds: string[]) {
  return {
    data: { sessionId: getDbUlid(), coachIds, listedAtEpochMs: Date.now() },
  } as Job<MarkPassiveCoachesInactiveJobData>
}

describe('markPassiveCoachesInactive', () => {
  test('takes every coach who stayed passive offline', async () => {
    const coachIds = [getDbUlid(), getDbUlid()]
    for (const coachId of coachIds) await makePassive(coachId)

    await markPassiveCoachesInactive(jobFor(coachIds))

    expect(await onlineCoachIds()).toEqual([])
  })

  test('still marks the other coaches when marking one of them fails', async () => {
    const failingCoachId = getDbUlid()
    const coachId = getDbUlid()
    await makePassive(failingCoachId)
    await makePassive(coachId)
    mockedUserActionService.createAccountAction.mockImplementation(
      async ({ action, userId }) => {
        if (
          action === ACCOUNT_USER_ACTIONS.INACTIVE_ON_SITE &&
          userId === failingCoachId
        )
          throw new Error('db down')
      }
    )

    await expect(
      markPassiveCoachesInactive(jobFor([failingCoachId, coachId]))
    ).rejects.toThrow('db down')

    expect(await onlineCoachIds()).toEqual([failingCoachId])
  })
})
