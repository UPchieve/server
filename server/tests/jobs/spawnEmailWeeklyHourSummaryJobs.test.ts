import { mocked } from 'jest-mock'
import moment from 'moment'
import spawnEmailWeeklyHourSummaryJobs from '../../worker/jobs/spawnEmailWeeklyHourSummaryJobs'
import * as VolunteerQueries from '../../models/Volunteer/queries'
import QueueService from '../../services/QueueService'
import { Jobs } from '../../worker/jobs'
import { getDbUlid } from '../../models/pgUtils'

jest.mock('../../models/Volunteer/queries')
jest.mock('../../services/QueueService')

const mockedVolunteerQueries = mocked(VolunteerQueries)
const mockedQueueService = mocked(QueueService)

describe('spawnEmailWeeklyHourSummaryJobs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should spawn jobs for all volunteers when no parameters provided (happy path)', async () => {
    const volunteer1 = {
      id: getDbUlid(),
      email: 'vol1@test.com',
      firstName: 'Vol',
      lastName: 'One',
      sentHourSummaryIntroEmail: false,
    }
    const volunteer2 = {
      id: getDbUlid(),
      email: 'vol2@test.com',
      firstName: 'Vol',
      lastName: 'Two',
      sentHourSummaryIntroEmail: true,
    }

    mockedVolunteerQueries.getVolunteersForWeeklyHourSummary.mockResolvedValue([
      volunteer1,
      volunteer2,
    ])

    await spawnEmailWeeklyHourSummaryJobs()

    expect(mockedQueueService.add).toHaveBeenCalledTimes(2)
    expect(mockedQueueService.add).toHaveBeenCalledWith(
      Jobs.EmailWeeklyHourSummary,
      expect.objectContaining({
        volunteer: volunteer1,
      }),
      expect.objectContaining({ priority: 3 })
    )
  })

  test('Should spawn jobs only for specific volunteers when volunteerIds provided', async () => {
    const volunteer1 = {
      id: getDbUlid(),
      email: 'vol1@test.com',
      firstName: 'Vol',
      lastName: 'One',
      sentHourSummaryIntroEmail: false,
    }
    const volunteer2 = {
      id: getDbUlid(),
      email: 'vol2@test.com',
      firstName: 'Vol',
      lastName: 'Two',
      sentHourSummaryIntroEmail: true,
    }
    const volunteer3 = {
      id: getDbUlid(),
      email: 'vol3@test.com',
      firstName: 'Vol',
      lastName: 'Three',
      sentHourSummaryIntroEmail: false,
    }

    mockedVolunteerQueries.getVolunteersForWeeklyHourSummary.mockResolvedValue([
      volunteer1,
      volunteer2,
      volunteer3,
    ])

    const customStartDate = moment()
      .utc()
      .subtract(2, 'weeks')
      .startOf('isoWeek')
      .toISOString()
    const customEndDate = moment()
      .utc()
      .subtract(2, 'weeks')
      .endOf('isoWeek')
      .toISOString()

    await spawnEmailWeeklyHourSummaryJobs({
      data: {
        startDate: customStartDate,
        endDate: customEndDate,
        volunteerIds: [volunteer1.id, volunteer3.id],
      },
    } as any)

    expect(mockedQueueService.add).toHaveBeenCalledTimes(2)
    expect(mockedQueueService.add).toHaveBeenCalledWith(
      Jobs.EmailWeeklyHourSummary,
      expect.objectContaining({
        startDate: customStartDate,
        endDate: customEndDate,
        volunteer: volunteer1,
      }),
      expect.objectContaining({ priority: 3 })
    )
    expect(mockedQueueService.add).toHaveBeenCalledWith(
      Jobs.EmailWeeklyHourSummary,
      expect.objectContaining({
        startDate: customStartDate,
        endDate: customEndDate,
        volunteer: volunteer3,
      }),
      expect.objectContaining({ priority: 3 })
    )
  })
})
