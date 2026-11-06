jest.unmock('../../services/FeatureFlagService')
jest.mock('../../clients/product-client', () => ({
  client: {
    isFeatureEnabled: jest.fn(),
    getFeatureFlag: jest.fn(),
    getFeatureFlagPayload: jest.fn(),
  },
}))

import { client as productClient } from '../../clients/product-client'
import {
  isInSessionOffersTestGroup,
  isSessionOffersEnabled,
} from '../../services/FeatureFlagService'
import { FEATURE_FLAGS, SUBJECTS } from '../../constants'

const mockedProductClient = jest.mocked(productClient)
const STUDENT_ID = 'student-1'

describe('isSessionOffersEnabled', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('is enabled for a subject listed in the flag payload', async () => {
    mockedProductClient.isFeatureEnabled.mockResolvedValue(true)
    mockedProductClient.getFeatureFlagPayload.mockResolvedValue({
      subjects: [SUBJECTS.ALGEBRA_ONE],
    })

    expect(await isSessionOffersEnabled(STUDENT_ID, SUBJECTS.ALGEBRA_ONE)).toBe(
      true
    )
    expect(mockedProductClient.getFeatureFlagPayload).toHaveBeenCalledWith(
      FEATURE_FLAGS.SESSION_OFFERS,
      STUDENT_ID
    )
  })

  it('is disabled for a subject not listed in the flag payload', async () => {
    mockedProductClient.isFeatureEnabled.mockResolvedValue(true)
    mockedProductClient.getFeatureFlagPayload.mockResolvedValue({
      subjects: [SUBJECTS.GEOMETRY],
    })

    expect(await isSessionOffersEnabled(STUDENT_ID, SUBJECTS.ALGEBRA_ONE)).toBe(
      false
    )
  })

  it('is disabled when the flag has no payload', async () => {
    mockedProductClient.isFeatureEnabled.mockResolvedValue(true)
    mockedProductClient.getFeatureFlagPayload.mockResolvedValue(undefined)

    expect(await isSessionOffersEnabled(STUDENT_ID, SUBJECTS.ALGEBRA_ONE)).toBe(
      false
    )
  })

  it('is disabled when the flag is off, even if the subject is in the payload', async () => {
    mockedProductClient.isFeatureEnabled.mockResolvedValue(false)
    mockedProductClient.getFeatureFlagPayload.mockResolvedValue({
      subjects: [SUBJECTS.ALGEBRA_ONE],
    })

    expect(await isSessionOffersEnabled(STUDENT_ID, SUBJECTS.ALGEBRA_ONE)).toBe(
      false
    )
  })
})

describe('isInSessionOffersTestGroup', () => {
  const COACH_ID = 'coach-1'

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('is true for the test variant', async () => {
    mockedProductClient.getFeatureFlag.mockResolvedValue('test')

    expect(await isInSessionOffersTestGroup(COACH_ID)).toBe(true)
    expect(mockedProductClient.getFeatureFlag).toHaveBeenCalledWith(
      FEATURE_FLAGS.SESSION_OFFERS_COACH,
      COACH_ID
    )
  })

  it.each<[string, string | boolean | undefined]>([
    ['the control variant', 'control'],
    ['a coach outside the experiment', false],
    ['an unknown flag', undefined],
  ])('is false for %s', async (_, variant) => {
    mockedProductClient.getFeatureFlag.mockResolvedValue(variant)

    expect(await isInSessionOffersTestGroup(COACH_ID)).toBe(false)
  })
})
