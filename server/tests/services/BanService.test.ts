import { mocked } from 'jest-mock'
import * as BanService from '../../services/BanService'
import * as SessionRepo from '../../models/Session'
import * as UsersRepo from '../../models/User'
import * as ModerationInfractionsRepo from '../../models/ModerationInfractions'
import * as UserActionRepo from '../../models/UserAction'
import { ACCOUNT_USER_ACTIONS } from '../../constants'
import { CurrentSession } from '../../types/session'
import logger from '../../logger'

jest.mock('../../models/Session')
jest.mock('../../models/User')
jest.mock('../../models/ModerationInfractions')
jest.mock('../../models/UserAction')
jest.mock('../../logger')

const mockSessionRepo = mocked(SessionRepo)
const mockUsersRepo = mocked(UsersRepo)
const mockModerationInfractionsRepo = mocked(ModerationInfractionsRepo)
const mockUserActionRepo = mocked(UserActionRepo)

const STUDENT_ID = 'student-id'
const VOLUNTEER_ID = 'volunteer-id'
const SESSION_ID = 'session-id'

function buildCurrentSession(
  overrides: Partial<CurrentSession> = {}
): CurrentSession {
  return {
    id: SESSION_ID,
    studentId: STUDENT_ID,
    volunteerId: VOLUNTEER_ID,
    ...overrides,
  } as CurrentSession
}

describe('removePartnerLiveMediaBan', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockSessionRepo.getCurrentSessionByUserId.mockResolvedValue(
      buildCurrentSession()
    )
    mockUsersRepo.removeLiveMediaBanById.mockResolvedValue(true)
    mockUserActionRepo.createAccountAction.mockResolvedValue()
  })

  test.each([
    ['volunteer', VOLUNTEER_ID, STUDENT_ID],
    ['student', STUDENT_ID, VOLUNTEER_ID],
  ])(
    'a %s removes their partner’s live media ban in their current session',
    async (_role, userId, partnerId) => {
      const result = await BanService.removePartnerLiveMediaBan(userId)

      expect(result).toEqual(SESSION_ID)
      expect(mockSessionRepo.getCurrentSessionByUserId).toHaveBeenCalledWith(
        userId
      )
      expect(mockUsersRepo.removeLiveMediaBanById).toHaveBeenCalledWith(
        partnerId
      )
      expect(mockUserActionRepo.createAccountAction).toHaveBeenCalledWith({
        userId: partnerId,
        sessionId: SESSION_ID,
        action: ACCOUNT_USER_ACTIONS.LIVE_MEDIA_BAN_REMOVED,
      })
    }
  )

  test('does nothing when the user has no current session', async () => {
    mockSessionRepo.getCurrentSessionByUserId.mockResolvedValue(undefined)

    const result = await BanService.removePartnerLiveMediaBan(VOLUNTEER_ID)

    expect(result).toBeUndefined()
    expect(mockUsersRepo.removeLiveMediaBanById).not.toHaveBeenCalled()
    expect(mockUserActionRepo.createAccountAction).not.toHaveBeenCalled()
  })

  test('does nothing when no volunteer has joined the session yet', async () => {
    mockSessionRepo.getCurrentSessionByUserId.mockResolvedValue(
      buildCurrentSession({ volunteerId: undefined })
    )

    const result = await BanService.removePartnerLiveMediaBan(STUDENT_ID)

    expect(result).toBeUndefined()
    expect(mockUsersRepo.removeLiveMediaBanById).not.toHaveBeenCalled()
  })
})
