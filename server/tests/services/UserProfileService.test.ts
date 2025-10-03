import { mocked } from 'jest-mock'
import * as UserRepo from '../../models/User/queries'
import { buildStudent, buildVolunteer } from '../mocks/generate'
import { updateUserProfile } from '../../services/UserProfileService'
import * as StudentService from '../../services/UserCreationService'
import { createAccountAction } from '../../models/UserAction'
import { ACCOUNT_USER_ACTIONS } from '../../constants'
import { createContact, deleteContactByEmail } from '../../services/MailService'

jest.mock('../../models/User/queries')
jest.mock('../../models/UserAction')
jest.mock('../../services/MailService')
jest.mock('../../services/UserCreationService')

const mockUserRepo = mocked(UserRepo)
const mockedStudentService = mocked(StudentService)
const mockGetStudentUser = () => buildStudent()
const mockedStudent = mockGetStudentUser()
const mockedVolunteer = buildVolunteer()

const DEFAULT_VOLUNTEER_REQUEST = {
  deactivated: false,
  smsConsent: true,
  mutedSubjectAlerts: ['subject1', 'subject2'],
  schoolId: 'asdfkajsdfk',
  phone: '23234234',
}

const DEFAULT_REQUEST = {
  deactivated: false,
  smsConsent: true,
}

describe('User Profile', () => {
  describe('updateUserProfile', () => {
    beforeEach(async () => {
      jest.resetAllMocks()
    })

    it.each([
      DEFAULT_VOLUNTEER_REQUEST,
      {
        deactivated: false,
        smsConsent: true,
      },
    ])('Should call the user repo with the correct data', async (req) => {
      await updateUserProfile(mockedStudent, '123', req)

      expect(mockUserRepo.updateUserProfileById).toHaveBeenCalledWith(
        mockedStudent.id,
        req,
        expect.anything()
      )
    })

    it('Volunteer should call update subject alerts', async () => {
      await updateUserProfile(mockedVolunteer, '123', DEFAULT_VOLUNTEER_REQUEST)

      expect(mockUserRepo.updateSubjectAlerts).toHaveBeenCalledWith(
        mockedVolunteer.id,
        DEFAULT_VOLUNTEER_REQUEST.mutedSubjectAlerts,
        expect.anything()
      )
    })

    it("Student shouldn't call update subject alerts", async () => {
      await updateUserProfile(mockedStudent, '123', DEFAULT_REQUEST)

      expect(mockUserRepo.updateSubjectAlerts).toHaveBeenCalledTimes(0)
    })

    it('Student should update school', async () => {
      const schoolId = '1235'
      await updateUserProfile(mockedStudent, '123', {
        ...DEFAULT_REQUEST,
        schoolId,
      })
      expect(mockedStudentService.upsertStudent).toHaveBeenCalledWith(
        { userId: mockedStudent.id, schoolId },
        expect.anything()
      )
    })

    it("Volunteer shouldn't update school", async () => {
      await updateUserProfile(mockedVolunteer, '123', DEFAULT_REQUEST)
      expect(mockedStudentService.upsertStudent).toHaveBeenCalledTimes(0)
    })

    it('deletes SendGrid contact when user is deactivated', async () => {
      await updateUserProfile(mockedVolunteer, '123', {
        ...DEFAULT_REQUEST,
        deactivated: true,
      })

      expect(deleteContactByEmail).toHaveBeenCalledWith(mockedVolunteer.email)
      expect(createAccountAction).toHaveBeenCalledWith({
        action: ACCOUNT_USER_ACTIONS.DEACTIVATED,
        userId: mockedVolunteer.id,
        ipAddress: '123',
      })
    })
  })
})
