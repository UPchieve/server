import * as VolunteersRepo from '../../models/Volunteer'
import { VolunteerOccupations } from '../../models/Volunteer'
import * as NTHSRepo from '../../models/NTHSGroups'
import * as NTHSService from '../../services/NTHSGroupsService'
import { beforeEach } from '@jest/globals'
import { getDbUlid } from '../../models/pgUtils'
import { NotAHighSchoolerNTHSJoinError } from '../../models/Errors'

jest.mock('../../models/Volunteer')
jest.mock('../../models/NTHSGroups')

const mockedVolunteersRepo = jest.mocked(VolunteersRepo)
const mockedNTHSRepo = jest.mocked(NTHSRepo)

beforeEach(() => {
  jest.resetAllMocks()
})
describe('joinGroupAsMemberByGroupId', () => {
  const USER_ID = getDbUlid()
  const GROUP_ID = getDbUlid()

  describe('Prevents non-high schoolers from joining', () => {
    it('Does not prevent joining if the user has not set occupations yet', async () => {
      mockedVolunteersRepo.getVolunteerOccupations.mockResolvedValue([])
      await NTHSService.joinGroupAsMemberByGroupId(USER_ID, GROUP_ID)
      expect(mockedNTHSRepo.joinGroupById).toHaveBeenCalled()
      expect(mockedNTHSRepo.upsertNthsGroupMemberRole).toHaveBeenCalled()
      expect(mockedNTHSRepo.getGroupsByUser).toHaveBeenCalled()
    })

    it('Prevents joining if the user has occupations and they do not include HS student', async () => {
      mockedVolunteersRepo.getVolunteerOccupations.mockResolvedValue([
        VolunteerOccupations.CAREGIVER,
      ])
      await expect(() =>
        NTHSService.joinGroupAsMemberByGroupId(USER_ID, GROUP_ID)
      ).rejects.toThrow(NotAHighSchoolerNTHSJoinError)
      expect(mockedNTHSRepo.joinGroupById).not.toHaveBeenCalled()
      expect(mockedNTHSRepo.upsertNthsGroupMemberRole).not.toHaveBeenCalled()
      expect(mockedNTHSRepo.getGroupsByUser).not.toHaveBeenCalled()
    })
  })
})
