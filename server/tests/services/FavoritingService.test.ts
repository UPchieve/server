import { mocked } from 'jest-mock'
import * as FavoritingService from '../../services/FavoritingService'
import * as MailService from '../../services/MailService'
import * as UserService from '../../services/UserService'
import { UserContactInfo } from '../../models/User'
import { RoleContext } from '../../services/UserRolesService'

jest.mock('../../services/MailService')
jest.mock('../../services/UserService')
const mockedMailService = mocked(MailService)
const mockedUserService = mocked(UserService)

beforeEach(async () => {
  jest.resetAllMocks()
})

describe('emailFavoritedVolunteer', () => {
  test('sends email to the volunteer', async () => {
    const volunteerFirstName = 'volunteerFirstName'
    const volunteerEmail = 'volunteer@email.com'
    const studentFirstName = 'studentFirstName'
    mockedUserService.getUserContactInfo
      .mockResolvedValueOnce({
        firstName: volunteerFirstName,
        email: volunteerEmail,
        roleContext: new RoleContext(['volunteer'], 'volunteer', 'volunteer'),
      } as UserContactInfo & { roleContext: RoleContext })
      .mockResolvedValueOnce({
        firstName: studentFirstName,
        roleContext: new RoleContext(['student'], 'student', 'student'),
      } as UserContactInfo & { roleContext: RoleContext })

    await FavoritingService.emailFavoritedVolunteer('volunteerId', 'studentId')

    expect(mockedUserService.getUserContactInfo).toHaveBeenCalledTimes(2)
    expect(
      mockedMailService.sendStudentFavoritedVolunteerEmail
    ).toHaveBeenCalledWith(volunteerEmail, volunteerFirstName, studentFirstName)
  })

  test('does nothing if no volunteer for id', async () => {
    mockedUserService.getUserContactInfo
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({
        firstName: 'Veronica',
        roleContext: new RoleContext(['volunteer'], 'volunteer', 'volunteer'),
      } as UserContactInfo & { roleContext: RoleContext })

    await FavoritingService.emailFavoritedVolunteer('volunteerId', 'studentId')

    expect(mockedUserService.getUserContactInfo).toHaveBeenCalledTimes(2)
    expect(
      mockedMailService.sendStudentFavoritedVolunteerEmail
    ).not.toHaveBeenCalled()
  })

  test('does nothing if no student for id', async () => {
    mockedUserService.getUserContactInfo
      .mockResolvedValueOnce({
        firstName: 'Harold',
        roleContext: new RoleContext(['student'], 'student', 'student'),
      } as UserContactInfo & { roleContext: RoleContext })
      .mockResolvedValueOnce(undefined)

    await FavoritingService.emailFavoritedVolunteer('volunteerId', 'studentId')

    expect(mockedUserService.getUserContactInfo).toHaveBeenCalledTimes(2)
    expect(
      mockedMailService.sendStudentFavoritedVolunteerEmail
    ).not.toHaveBeenCalled()
  })
})
