import * as CacheService from '../../cache'
import * as VolunteerService from '../../services/VolunteerService'
import updateCachedVolunteersForTextNotifications from '../../worker/jobs/updateCachedVolunteersForTextNotifications'
import { TextableVolunteer } from '../../models/Volunteer'
import { getDbUlid } from '../../../database/seeds/utils'
import { faker } from '@faker-js/faker'
import { omit } from 'lodash'

jest.mock('../../cache')
jest.mock('../../services/VolunteerService')
jest.mock('../../logger')

const mockCacheService = jest.mocked(CacheService)
const mockVolunteerService = jest.mocked(VolunteerService)
describe('Filtering out muted subjects', () => {
  it('Saves to cache the candidate volunteers with muted subjects filtered out', async () => {
    const mutedPrealgebra = buildTextableVolunteer({
      id: '1',
      mutedSubjects: ['prealgebra'],
      unlockedSubjects: ['prealgebra', 'algebraOne'],
    })
    const noneMuted = buildTextableVolunteer({
      id: '3',
      unlockedSubjects: ['prealgebra', 'algebraOne'],
    })
    const volunteers: TextableVolunteer[] = [mutedPrealgebra, noneMuted]
    const expectedVolunteers = [
      {
        ...omit(mutedPrealgebra, 'mutedSubjects'),
        unlockedSubjects: ['algebraOne'],
      },
      {
        ...omit(noneMuted, 'mutedSubjects'),
        unlockedSubjects: ['prealgebra', 'algebraOne'],
      },
    ]
    mockVolunteerService.getVolunteersForTextNotifications.mockResolvedValue(
      volunteers
    )

    await updateCachedVolunteersForTextNotifications()

    expect(mockCacheService.save).toHaveBeenCalledTimes(1)
    expect(mockCacheService.save).toHaveBeenCalledWith(
      'VOLUNTEERS-FOR-TEXT-NOTIFICATIONS',
      JSON.stringify(expectedVolunteers)
    )
  })
})

function buildTextableVolunteer(
  overrides: Partial<TextableVolunteer> = {}
): TextableVolunteer {
  return {
    id: getDbUlid(),
    firstName: faker.string.alpha(),
    mutedSubjects: [],
    unlockedSubjects: ['prealgebra', 'algebraOne'],
    ...overrides,
  }
}
