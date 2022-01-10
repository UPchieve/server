import unleashClient from 'unleash-client'
import { mocked } from 'ts-jest/utils'
import * as GatesStudyService from '../../services/GatesStudyService'
import * as gatesStudyUtils from '../../utils/gates-study-utils'
import { isDateWithinRange } from '../../utils/is-date-within-range'

import * as UserProductFlagsRepo from '../../models/UserProductFlags/queries'

import { getObjectId, buildGatesQualifiedData } from '../generate'

jest.mock('../../models/UserProductFlags/queries')
jest.mock('../../utils/gates-study-utils')
jest.mock('../../utils/is-date-within-range')
jest.mock('unleash-client', () => {
  return {
    isEnabled: jest.fn(),
  }
})

const mockUserProductFlagsRepo = mocked(UserProductFlagsRepo, true)
const mockedUnleashClient = mocked(unleashClient, true)
const mockedGatesStudyUtils = mocked(gatesStudyUtils, true)
const mockIsDateWithinRange = mocked(isDateWithinRange, true)

beforeEach(() => {
  jest.resetAllMocks()
})

describe('processGatesQualifiedCheck', () => {
  test('Student completes a Gates-qualified session when the Gates feature flag is on', async () => {
    const isFeatureFlagOn = true
    const isWithinStudyPeriod = false
    const isGatesQualified = true
    const mockQualificationData = buildGatesQualifiedData()

    mockedUnleashClient.isEnabled.mockReturnValue(isFeatureFlagOn)
    mockIsDateWithinRange.mockReturnValue(isWithinStudyPeriod)
    mockedGatesStudyUtils.isGatesQualifiedStudent.mockReturnValue(
      isGatesQualified
    )
    mockedGatesStudyUtils.prepareForGatesQualificationCheck.mockResolvedValueOnce(
      mockQualificationData
    )

    await GatesStudyService.processGatesQualifiedCheck(getObjectId())

    expect(
      mockUserProductFlagsRepo.updateUPFGatesQualifiedFlagById
    ).toBeCalledTimes(1)
  })

  test('Student completes a non-Gates-qualified session within the Gates study period', async () => {
    const isFeatureFlagOn = false
    const isWithinStudyPeriod = true
    const isGatesQualified = false

    mockedUnleashClient.isEnabled.mockReturnValue(isFeatureFlagOn)
    mockIsDateWithinRange.mockReturnValue(isWithinStudyPeriod)
    mockedGatesStudyUtils.isGatesQualifiedStudent.mockReturnValue(
      isGatesQualified
    )

    await GatesStudyService.processGatesQualifiedCheck(getObjectId())

    expect(
      mockUserProductFlagsRepo.updateUPFGatesQualifiedFlagById
    ).toBeCalledTimes(0)
  })

  test('Student completes a Gates-qualified session within the study period and the Gates feature flag is off', async () => {
    const isFeatureFlagOn = false
    const isWithinStudyPeriod = true
    const isGatesQualified = true
    const mockQualificationData = buildGatesQualifiedData()

    mockedUnleashClient.isEnabled.mockReturnValue(isFeatureFlagOn)
    mockIsDateWithinRange.mockReturnValue(isWithinStudyPeriod)
    mockedGatesStudyUtils.isGatesQualifiedStudent.mockReturnValue(
      isGatesQualified
    )
    mockedGatesStudyUtils.prepareForGatesQualificationCheck.mockResolvedValueOnce(
      mockQualificationData
    )

    await GatesStudyService.processGatesQualifiedCheck(getObjectId())

    expect(
      mockUserProductFlagsRepo.updateUPFGatesQualifiedFlagById
    ).toBeCalledTimes(1)
  })

  test('Student completes a Gates-qualified session outside of the study period and the Gates feature flag is off', async () => {
    const isFeatureFlagOn = false
    const isWithinStudyPeriod = false
    const isGatesQualified = true
    const mockQualificationData = buildGatesQualifiedData()

    mockedUnleashClient.isEnabled.mockReturnValue(isFeatureFlagOn)
    mockIsDateWithinRange.mockReturnValue(isWithinStudyPeriod)
    mockedGatesStudyUtils.isGatesQualifiedStudent.mockReturnValue(
      isGatesQualified
    )
    mockedGatesStudyUtils.prepareForGatesQualificationCheck.mockResolvedValueOnce(
      mockQualificationData
    )

    await GatesStudyService.processGatesQualifiedCheck(getObjectId())

    expect(
      mockUserProductFlagsRepo.updateUPFGatesQualifiedFlagById
    ).toBeCalledTimes(0)
  })
})
