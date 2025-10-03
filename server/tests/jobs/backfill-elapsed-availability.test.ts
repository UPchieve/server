import { mocked } from 'jest-mock'
import { getUuid } from '../../models/pgUtils'
import * as VolunteerRepo from '../../models/Volunteer/queries'
import backfillElapsedAvailability from '../../scripts/backfill-elapsed-availability'
import * as AvailabilityService from '../../services/AvailabilityService'
import * as Logger from '../../worker/logger'
import { Jobs } from '../../worker/jobs'

jest.mock('../../models/Volunteer/queries')
jest.mock('../../services/AvailabilityService')
jest.mock('../../worker/logger', () => ({
  log: jest.fn(),
}))

const mockedAvailabilityService = mocked(AvailabilityService)
const mockedVolunteerRepo = mocked(VolunteerRepo)
const mockedLogger = mocked(Logger)

function setSystemTimeTo(dateIso: string) {
  jest.useFakeTimers()
  jest.setSystemTime(new Date(dateIso))
}

describe('backfillElapsedAvailability', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.useRealTimers()
  })

  test('should early exit if ran before 5:00 AM ET', async () => {
    setSystemTimeTo('2025-01-01T06:00:00Z')
    await backfillElapsedAvailability()

    expect(mockedLogger.log).toHaveBeenCalledWith(
      `${Jobs.BackfillElapsedAvailability}: exiting — must run after 8:00 AM ET`
    )
    expect(
      mockedVolunteerRepo.getVolunteerIdsForElapsedAvailability
    ).not.toHaveBeenCalled()
    expect(
      mockedAvailabilityService.getTotalElapsedAvailabilityForDateRange
    ).not.toHaveBeenCalled()
    expect(
      mockedVolunteerRepo.setVolunteerElapsedAvailabilityById
    ).not.toHaveBeenCalled()
  })

  test('should log success with 0 updated when no volunteers to update', async () => {
    setSystemTimeTo('2025-01-01T15:00:00Z')
    mockedVolunteerRepo.getVolunteerIdsForElapsedAvailability.mockResolvedValueOnce(
      []
    )

    await backfillElapsedAvailability()

    expect(
      mockedVolunteerRepo.getVolunteerIdsForElapsedAvailability
    ).toHaveBeenCalled()
    expect(mockedLogger.log).toHaveBeenCalledWith(
      expect.stringContaining(
        `Successfully ${Jobs.BackfillElapsedAvailability}: 0 volunteers`
      )
    )
    expect(
      mockedAvailabilityService.getTotalElapsedAvailabilityForDateRange
    ).not.toHaveBeenCalled()
    expect(
      mockedVolunteerRepo.setVolunteerElapsedAvailabilityById
    ).not.toHaveBeenCalled()
  })

  test('should update volunteers who have elapsed availability for the date range', async () => {
    setSystemTimeTo('2025-01-01T15:00:00Z')
    const volOneId = getUuid()
    const volThreeId = getUuid()
    const volunteers = [volOneId, getUuid(), volThreeId]
    mockedVolunteerRepo.getVolunteerIdsForElapsedAvailability.mockResolvedValueOnce(
      volunteers
    )
    mockedAvailabilityService.getTotalElapsedAvailabilityForDateRange
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(3)
    mockedVolunteerRepo.setVolunteerElapsedAvailabilityById.mockResolvedValue()

    await backfillElapsedAvailability()

    expect(
      mockedAvailabilityService.getTotalElapsedAvailabilityForDateRange
    ).toHaveBeenCalledTimes(3)
    expect(
      mockedVolunteerRepo.setVolunteerElapsedAvailabilityById
    ).toHaveBeenCalledTimes(2)
    expect(
      mockedVolunteerRepo.setVolunteerElapsedAvailabilityById
    ).toHaveBeenNthCalledWith(1, volOneId, 5)
    expect(
      mockedVolunteerRepo.setVolunteerElapsedAvailabilityById
    ).toHaveBeenNthCalledWith(2, volThreeId, 3)
    expect(mockedLogger.log).toHaveBeenCalledWith(
      `Successfully ${Jobs.BackfillElapsedAvailability}: 2 volunteers`
    )
  })

  test('should throw if any volunteer update fails', async () => {
    setSystemTimeTo('2025-01-01T15:00:00Z')
    mockedVolunteerRepo.getVolunteerIdsForElapsedAvailability.mockResolvedValueOnce(
      [getUuid(), getUuid(), getUuid(), getUuid()]
    )

    mockedAvailabilityService.getTotalElapsedAvailabilityForDateRange
      .mockResolvedValueOnce(2)
      .mockRejectedValueOnce(new Error('Calculation error'))
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(3)
    mockedVolunteerRepo.setVolunteerElapsedAvailabilityById
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(new Error('Failed to set elapsed availability'))

    await expect(backfillElapsedAvailability()).rejects.toMatchObject({
      message: expect.stringContaining(
        `${Jobs.BackfillElapsedAvailability}: has errors`
      ),
    })
  })
})
