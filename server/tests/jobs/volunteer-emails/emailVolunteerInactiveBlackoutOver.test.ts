test.todo('postgres migration')
/*import { Types } from 'mongoose'
import { mocked } from 'jest-mock';

import { buildVolunteer } from '../../generate'
import EmailVolunteerInactiveBlackoutOver, {
  processVolunteer,
} from '../../../worker/jobs/volunteer-emails/emailVolunteerInactiveBlackoutOver'
import * as MailService from '../../../services/MailService'
import * as AvailabilityRepo from '../../../models/Availability/queries'
import * as VolunteerRepo from '../../../models/Volunteer/queries'

jest.mock('../../../services/MailService')
const mockedMailService = mocked(MailService, true)
jest.mock('../../../models/Volunteer/queries')
const mockedVolunteerRepo = mocked(VolunteerRepo, true)
jest.mock('../../../models/Availability/queries')
const mockedAvailabilityRepo = mocked(AvailabilityRepo, true)

describe('Test process volunteer subroutine', () => {
  const volunteer: VolunteerRepo.VolunteerContactInfo = {
    _id: new Types.ObjectId(),
    firstname: 'Test',
    email: 'test@example.com',
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Successfully runs', async () => {
    const errors = await processVolunteer(volunteer)

    expect(errors.length).toEqual(0)
  })
  test('Handles mail service error', async () => {
    const mailError = 'foo'
    mockedMailService.sendVolunteerInactiveBlackoutOver.mockRejectedValueOnce(
      new Error(mailError)
    )

    const errors = await processVolunteer(volunteer)

    expect(errors.length).toEqual(1)
    expect(errors[0]).toEqual(
      `Failed to send blackout over email to volunteer ${volunteer._id}: ${mailError}`
    )
  })
  test('Handles volunteer service error', async () => {
    const volunteerError = 'foo'
    mockedVolunteerRepo.updateVolunteerInactiveAvailability.mockRejectedValueOnce(
      new Error(volunteerError)
    )

    const errors = await processVolunteer(volunteer)

    expect(errors.length).toEqual(1)
    expect(errors[0]).toEqual(
      `Failed to update availability for volunteer ${volunteer._id}: ${volunteerError}`
    )
  })
  test('Handles availability service error', async () => {
    const availabilityError = 'foo'
    mockedAvailabilityRepo.updateSnapshotOnCallByVolunteerId.mockRejectedValueOnce(
      new Error(availabilityError)
    )

    const errors = await processVolunteer(volunteer)

    expect(errors.length).toEqual(1)
    expect(errors[0]).toEqual(
      `Failed to update snapshot for volunteer ${volunteer._id}: ${availabilityError}`
    )
  })
})

describe('Test email blackout over job', () => {
  const volunteers: VolunteerRepo.VolunteerContactInfo[] = []

  beforeEach(() => {
    jest.resetAllMocks()
  })

  beforeAll(() => {
    for (let i = 0; i < 3; i++) {
      const temp = buildVolunteer()
      volunteers.push({
        _id: temp._id,
        firstname: temp.firstname,
        email: temp.email,
      } as VolunteerRepo.VolunteerContactInfo)
    }
  })

  test('Successfully runs', async () => {
    mockedVolunteerRepo.getVolunteersForBlackoutOver.mockResolvedValueOnce(
      volunteers
    )

    await expect(EmailVolunteerInactiveBlackoutOver()).resolves.not.toThrow()
  })

  test('Handles procesVolunteer errors', async () => {
    mockedVolunteerRepo.getVolunteersForBlackoutOver.mockResolvedValueOnce(
      volunteers
    )

    const mailError = 'foo'
    mockedMailService.sendVolunteerInactiveBlackoutOver.mockRejectedValueOnce(
      new Error(mailError)
    )

    await expect(EmailVolunteerInactiveBlackoutOver()).rejects.toThrow(
      /Failed to fully process/
    )
  })
})
*/
