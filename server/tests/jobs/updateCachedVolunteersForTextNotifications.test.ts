import * as CacheService from '../../cache'
import * as VolunteerService from '../../services/VolunteerService'
import * as logger from '../../logger'
import updateCachedVolunteersForTextNotifications, {
  TEXTABLE_VOLUNTEERS_CACHE_KEY,
} from '../../worker/jobs/updateCachedVolunteersForTextNotifications'
import { TextableVolunteer } from '../../models/Volunteer'
import { buildTextableVolunteer } from '../mocks/generate'

jest.mock('../../cache')
jest.mock('../../services/VolunteerService')
jest.mock('../../logger')

const mockCacheService = jest.mocked(CacheService)
const mockVolunteerService = jest.mocked(VolunteerService)
const mockLogger = jest.mocked(logger)
it('Caches the volunteers', async () => {
  const eligibleVolunteers: TextableVolunteer[] = [
    buildTextableVolunteer(),
    buildTextableVolunteer(),
  ]
  mockVolunteerService.getVolunteersForTextNotifications.mockResolvedValue(
    eligibleVolunteers
  )

  await updateCachedVolunteersForTextNotifications()

  expect(
    mockVolunteerService.getVolunteersForTextNotifications
  ).toHaveBeenCalledTimes(1)
  expect(mockCacheService.save).toHaveBeenCalledTimes(1)
  expect(mockCacheService.save).toHaveBeenCalledWith(
    TEXTABLE_VOLUNTEERS_CACHE_KEY,
    JSON.stringify(eligibleVolunteers)
  )
  expect(mockLogger.default.info).toHaveBeenCalledTimes(2)
  expect(mockLogger.default.info).toHaveBeenNthCalledWith(
    1,
    expect.stringContaining('Found 2 candidate volunteers.')
  )
  expect(mockLogger.default.info).toHaveBeenNthCalledWith(
    2,
    expect.stringContaining('Saved 2 volunteers to cache.')
  )
})
