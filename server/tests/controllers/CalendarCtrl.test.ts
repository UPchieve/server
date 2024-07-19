import { mocked } from 'jest-mock'
import { ACCOUNT_USER_ACTIONS } from '../../constants'
import faker from 'faker'

import * as CalendarCtrl from '../../controllers/CalendarCtrl'
import * as VolunteerRepo from '../../models/Volunteer'
import * as AvailabilityRepo from '../../models/Availability'
import { getDbUlid } from '../../models/pgUtils'
import { Ulid } from '../../models/pgUtils'
import {
  buildUserContactInfo,
  buildAvailability,
  getIpAddress,
} from '../mocks/generate'
import * as UserActionRepo from '../../models/UserAction'
jest.mock('../../services/VolunteerService')
jest.mock('../../services/AnalyticsService')

jest.mock('../../models/Volunteer')
jest.mock('../../models/UserAction')
jest.mock('../../models/Availability')
jest.mock('../../models/User')

const mockedVolunteerRepo = mocked(VolunteerRepo)

const mockSaturdayAvailability = {
  '10a': false,
  '11a': false,
  '12a': false,
  '1a': false,
  '2a': false,
  '3a': false,
  '4a': false,
  '5a': false,
  '6a': false,
  '7a': false,
  '8a': false,
  '9a': false,
  '3p': false,
  '4p': false,
  '5p': false,
  '6p': false,
  '7p': false,
  '8p': false,
  '9p': false,
  '10p': false,
  '11p': false,
  '12p': false,
  '1p': true,
  '2p': true,
}

export type VolunteerForScheduleUpdate = {
  id: Ulid
  volunteerPartnerOrg?: string
  onboarded: boolean
  availability: AvailabilityRepo.Availability
  subjects?: string[]
}

function buildVolunteerForScheduleUpdate(
  userId?: Ulid,
  subjects?: string[],
  onboarded = true,
  passedUpchieve101 = false
): VolunteerRepo.VolunteerForScheduleUpdate {
  return {
    id: userId || getDbUlid(),
    volunteerPartnerOrg: faker.company.companyName(),
    onboarded: onboarded,
    availability: buildAvailability(),
    subjects: subjects || ['algebraOne'],
    passedRequiredTraining: passedUpchieve101,
  }
}

const user = buildUserContactInfo()
const tz = 'American/New York'
const ip = getIpAddress()

describe('Save availability and time zone', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should throw error when not provided an availability', async () => {
    mockedVolunteerRepo.getVolunteerForScheduleUpdate.mockResolvedValue(
      buildVolunteerForScheduleUpdate(user.id)
    )

    const input = { user, tz, ip }

    await expect(CalendarCtrl.updateSchedule(input)).rejects.toThrow(
      'No availability object specified'
    )
  })

  test('Should throw error when provided availability with missing keys', async () => {
    mockedVolunteerRepo.getVolunteerForScheduleUpdate.mockResolvedValue(
      buildVolunteerForScheduleUpdate(user.id)
    )

    const availability: any = buildAvailability()
    const input = {
      user,
      tz,
      availability: {
        ...availability,
        Saturday: undefined,
      },
      ip,
    }

    await expect(CalendarCtrl.updateSchedule(input)).rejects.toThrow(
      'Availability object missing required keys'
    )
  })

  test('Should update availability (and user action fires) not onboarded', async () => {
    const volunteer = buildVolunteerForScheduleUpdate(user.id)
    mockedVolunteerRepo.getVolunteerForScheduleUpdate.mockResolvedValue(
      volunteer
    )

    const availability = buildAvailability({
      Saturday: mockSaturdayAvailability,
    })
    const input = {
      user,
      tz,
      availability,
      ip,
    }
    await CalendarCtrl.updateSchedule(input)

    /**
     * expect
     * 1. save old availability as history
     * 2. update availability
     * 3. update onboarded status - FALSE
     */
    expect(UserActionRepo.createAccountAction).toHaveBeenCalledTimes(0)
    expect(
      AvailabilityRepo.saveCurrentAvailabilityAsHistory
    ).toHaveBeenLastCalledWith(user.id)
    expect(
      AvailabilityRepo.updateAvailabilityByVolunteerId
    ).toHaveBeenLastCalledWith(user.id, availability, tz)
    expect(
      VolunteerRepo.updateVolunteerThroughAvailability
    ).toHaveBeenLastCalledWith(user.id, tz, volunteer.onboarded)
  })

  test('Should update availability (and user action) and becomes onboarded - with user action', async () => {
    const volunteer = buildVolunteerForScheduleUpdate(
      user.id,
      ['algebraOne'],
      false,
      true
    )
    mockedVolunteerRepo.getVolunteerForScheduleUpdate.mockResolvedValue(
      volunteer
    )

    const availability = buildAvailability({
      Saturday: mockSaturdayAvailability,
    })
    const input = {
      user,
      tz,
      availability,
      ip,
    }
    await CalendarCtrl.updateSchedule(input)

    /**
     * expect
     * 1. user action for becoming onboarded
     * 2. save old availability as history
     * 3. update availability
     * 4. update onboarded status - TRUE
     */
    expect(UserActionRepo.createAccountAction).toHaveBeenCalledWith({
      userId: user.id,
      action: ACCOUNT_USER_ACTIONS.ONBOARDED,
      ipAddress: ip,
    })
    expect(
      AvailabilityRepo.saveCurrentAvailabilityAsHistory
    ).toHaveBeenLastCalledWith(user.id)
    expect(
      AvailabilityRepo.updateAvailabilityByVolunteerId
    ).toHaveBeenLastCalledWith(user.id, availability, tz)
    expect(
      VolunteerRepo.updateVolunteerThroughAvailability
    ).toHaveBeenLastCalledWith(user.id, tz, true)
  })
})

describe('Clear schedule', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('Should clear schedule and save history', async () => {
    await CalendarCtrl.clearSchedule(user, tz)

    expect(
      AvailabilityRepo.saveCurrentAvailabilityAsHistory
    ).toHaveBeenLastCalledWith(user.id)
    expect(
      AvailabilityRepo.clearAvailabilityForVolunteer
    ).toHaveBeenLastCalledWith(user.id)
    expect(
      VolunteerRepo.updateVolunteerThroughAvailability
    ).toHaveBeenLastCalledWith(user.id, tz)
  })
})
