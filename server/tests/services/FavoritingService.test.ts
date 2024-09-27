import { mocked } from 'jest-mock'
import * as FavoritingService from '../../services/FavoritingService'
import * as MailService from '../../services/MailService'
import * as UserRepo from '../../models/User'
import { UserContactInfo } from '../../models/User'

jest.mock('../../services/MailService')
jest.mock('../../models/User')
const mockedMailService = mocked(MailService)
const mockedUserRepo = mocked(UserRepo)

beforeEach(async () => {
  jest.resetAllMocks()
})

describe('emailFavoritedVolunteer', () => {
  test('sends email to the volunteer', async () => {
    const volunteerFirstName = 'volunteerFirstName'
    const volunteerEmail = 'volunteer@email.com'
    const studentFirstName = 'studentFirstName'
    mockedUserRepo.getUserContactInfoById
      .mockResolvedValueOnce({
        firstName: volunteerFirstName,
        email: volunteerEmail,
      } as UserContactInfo)
      .mockResolvedValueOnce({
        firstName: studentFirstName,
      } as UserContactInfo)

    await FavoritingService.emailFavoritedVolunteer('volunteerId', 'studentId')

    expect(mockedUserRepo.getUserContactInfoById).toHaveBeenCalledTimes(2)
    expect(
      mockedMailService.sendStudentFavoritedVolunteerEmail
    ).toHaveBeenCalledWith(volunteerEmail, volunteerFirstName, studentFirstName)
  })

  test('does nothing if no volunteer for id', async () => {
    mockedUserRepo.getUserContactInfoById
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({
        firstName: 'Veronica',
      } as UserContactInfo)

    await FavoritingService.emailFavoritedVolunteer('volunteerId', 'studentId')

    expect(mockedUserRepo.getUserContactInfoById).toHaveBeenCalledTimes(2)
    expect(
      mockedMailService.sendStudentFavoritedVolunteerEmail
    ).not.toHaveBeenCalled()
  })

  test('does nothing if no student for id', async () => {
    mockedUserRepo.getUserContactInfoById
      .mockResolvedValueOnce({
        firstName: 'Harold',
      } as UserContactInfo)
      .mockResolvedValueOnce(undefined)

    await FavoritingService.emailFavoritedVolunteer('volunteerId', 'studentId')

    expect(mockedUserRepo.getUserContactInfoById).toHaveBeenCalledTimes(2)
    expect(
      mockedMailService.sendStudentFavoritedVolunteerEmail
    ).not.toHaveBeenCalled()
  })
})
