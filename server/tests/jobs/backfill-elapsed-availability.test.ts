import { Job } from 'bull'
import { mocked } from 'jest-mock'
import { getUuid } from '../../models/pgUtils'
import * as VolunteerRepo from '../../models/Volunteer/queries'
import backfillElapsedAvailability from '../../scripts/backfill-elapsed-availability'
import * as AvailabilityService from '../../services/AvailabilityService'
import logger from '../../logger'

jest.mock('../../models/Volunteer/queries')
jest.mock('../../services/AvailabilityService')
jest.mock('../../logger')

const mockedAvailabilityService = mocked(AvailabilityService)
const mockedVolunteerRepo = mocked(VolunteerRepo)
const job = { name: 'BackfillElapsedAvailability' } as Job<undefined>

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
    await backfillElapsedAvailability(job)

    expect(logger.warn).toHaveBeenCalledWith(
      `BackfillElapsedAvailability: exiting — must run after 8:00 AM ET`
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

    await backfillElapsedAvailability(job)

    expect(
      mockedVolunteerRepo.getVolunteerIdsForElapsedAvailability
    ).toHaveBeenCalled()
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining(
        `Successfully BackfillElapsedAvailability: 0 volunteers`
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

    await backfillElapsedAvailability(job)

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
    expect(logger.info).toHaveBeenCalledWith(
      `Successfully BackfillElapsedAvailability: 2 volunteers`
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

    await expect(backfillElapsedAvailability(job)).rejects.toMatchObject({
      message: expect.stringContaining(
        `BackfillElapsedAvailability: has errors`
      ),
    })
  })
})
