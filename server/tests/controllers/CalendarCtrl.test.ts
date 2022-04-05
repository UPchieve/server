import { mocked } from 'ts-jest/utils'
import { ACCOUNT_USER_ACTIONS } from '../../constants'

import * as CalendarCtrl from '../../controllers/CalendarCtrl'
import * as VolunteerRepo from '../../models/Volunteer'
import * as AvailabilityRepo from '../../models/Availability'
import { getDbUlid } from '../../models/pgUtils'
import { Ulid } from '../../models/pgUtils'
import { buildUserContactInfo, buildAvailability, getIpAddress } from '../pg-generate'
import * as UserActionRepo from '../../models/UserAction'
jest.mock('../../services/VolunteerService')
jest.mock('../../services/AnalyticsService')

jest.mock('../../models/Volunteer')
jest.mock('../../models/UserAction')
jest.mock('../../models/Availability')
jest.mock('../../models/User')

const mockedVolunteerRepo = mocked(VolunteerRepo, true)

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
  availability: AvailabilityRepo.Availability,
  subjects?: string[]
}

function buildVolunteerForScheduleUpdate(userId?: Ulid, subjects?: string[]): VolunteerRepo.VolunteerForScheduleUpdate {
  return {
    id: userId || getDbUlid(),
    volunteerPartnerOrg: fakerStatic.company.companyName(),
    onboarded: true,
    availability: buildAvailability(),
    subjects: subjects || []
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
    const input = { user, tz, ip }

    await expect(CalendarCtrl.updateSchedule(input)).rejects.toThrow(
      'No availability object specified'
    )
  })

  test('Should throw error when provided availability with missing keys', async () => {
    const availability: any = buildAvailability()
    availability.Saturday = undefined
    const input = {
      user,
      tz,
      availability,
      ip,
    }

    await expect(CalendarCtrl.updateSchedule(input)).rejects.toThrow(
      'Availability object missing required keys'
    )
  })

  test('Should update availability (and user action fires) not onboarded', async () => {
    mockedVolunteerRepo.getVolunteerForScheduleUpdate.mockResolvedValue(buildVolunteerForScheduleUpdate(user.id))

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
     * 1. user action for updating availability
     * 2. save old availability as history
     * 3. update availability
     * 4/ update onboarded status - FALSE
     */
    expect(UserActionRepo.createAccountAction).toHaveBeenLastCalledWith({
      userId: user.id,
      action: ACCOUNT_USER_ACTIONS.UPDATED_AVAILABILITY,
      ipAddress: ''
    })
    expect(AvailabilityRepo.saveCurrentAvailabilityAsHistory).toHaveBeenLastCalledWith(user.id)
    expect(AvailabilityRepo.updateAvailabilityByVolunteerId).toHaveBeenLastCalledWith(user.id, availability, ip)
    expect(VolunteerRepo.updateVolunteerThroughAvailability).toHaveBeenLastCalledWith(user.id, tz, false)
  })

  test('Should update availability (and user action) and becomes onboarded - with user action', async () => {
    mockedVolunteerRepo.getVolunteerForScheduleUpdate.mockResolvedValue(buildVolunteerForScheduleUpdate(user.id, ['algebraOne']))

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
     * 1. user action for updating availability
     * 2. user action for becoming onboarded
     * 3. save old availability as history
     * 4. update availability
     * 5/ update onboarded status - TRUE
     */
    expect(UserActionRepo.createAccountAction).toHaveBeenCalledWith({
      userId: user.id,
      action: ACCOUNT_USER_ACTIONS.UPDATED_AVAILABILITY,
      ipAddress: ''
    })
    expect(UserActionRepo.createAccountAction).toHaveBeenCalledWith({
      userId: user.id,
      action: ACCOUNT_USER_ACTIONS.ONBOARDED,
      ipAddress: ''
    })
    expect(AvailabilityRepo.saveCurrentAvailabilityAsHistory).toHaveBeenLastCalledWith(user.id)
    expect(AvailabilityRepo.updateAvailabilityByVolunteerId).toHaveBeenLastCalledWith(user.id, availability, ip)
    expect(VolunteerRepo.updateVolunteerThroughAvailability).toHaveBeenLastCalledWith(user.id, tz, true)
  })
})

describe('Clear schedule', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('Should clear schedule and save history', async () => {
    await CalendarCtrl.clearSchedule(user, tz)

    expect(AvailabilityRepo.saveCurrentAvailabilityAsHistory).toHaveBeenLastCalledWith(user.id)
    expect(AvailabilityRepo.clearAvailabilityForVolunteer).toHaveBeenLastCalledWith(user.id)
    expect(VolunteerRepo.updateVolunteerThroughAvailability).toHaveBeenLastCalledWith(user.id, tz)
  })
})
