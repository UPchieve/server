import { Types } from 'mongoose'
import { mocked } from 'ts-jest/utils'

import { Volunteer } from '../../../models/Volunteer'
import { buildVolunteer } from '../../generate'
import EmailVolunteerInactiveBlackoutOver, {
  processVolunteer,
  ContactInfo
} from '../../../worker/jobs/volunteer-emails/emailVolunteerInactiveBlackoutOver'
import MailService from '../../../services/MailService'
import * as AvailabilityService from '../../../services/AvailabilityService'
import * as VolunteerService from '../../../services/VolunteerService'

jest.mock('../../../services/MailService')
const mockedMailService = mocked(MailService, true)
jest.mock('../../../services/VolunteerService')
const mockedVolunteerService = mocked(VolunteerService, true)
jest.mock('../../../services/AvailabilityService')
const mockedAvailabilityService = mocked(AvailabilityService, true)

describe('Test process volunteer subroutine', async () => {
  const volunteer: ContactInfo = {
    _id: Types.ObjectId().toString(),
    firstname: 'Test',
    email: 'test@example.com'
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
    mockedVolunteerService.updateVolunteer.mockRejectedValueOnce(
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
    mockedAvailabilityService.updateAvailabilitySnapshot.mockRejectedValueOnce(
      new Error(availabilityError)
    )

    const errors = await processVolunteer(volunteer)

    expect(errors.length).toEqual(1)
    expect(errors[0]).toEqual(
      `Failed to update snapshot for volunteer ${volunteer._id}: ${availabilityError}`
    )
  })
})

describe('Test email blackout over job', async () => {
  const volunteers = []

  beforeEach(() => {
    jest.resetAllMocks()
  })

  beforeAll(() => {
    for (let i = 0; i < 3; i++) {
      const temp = buildVolunteer()
      volunteers.push({
        _id: temp._id,
        firstname: temp.firstname,
        email: temp.email
      } as Partial<Volunteer>)
    }
  })

  test('Successfully runs', async () => {
    mockedVolunteerService.getVolunteers.mockResolvedValueOnce(volunteers)

    await expect(EmailVolunteerInactiveBlackoutOver()).resolves.not.toThrow()
  })

  test('Handles procesVolunteer errors', async () => {
    mockedVolunteerService.getVolunteers.mockResolvedValueOnce(volunteers)

    const mailError = 'foo'
    mockedMailService.sendVolunteerInactiveBlackoutOver.mockRejectedValueOnce(
      new Error(mailError)
    )

    await expect(EmailVolunteerInactiveBlackoutOver()).rejects.toThrow(
      /Failed to fully process/
    )
  })
})
