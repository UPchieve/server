import * as GatesStudyService from '../../services/GatesStudyService'
import * as gatesStudyUtils from '../../utils/gates-study-utils'
import unleashClient from 'unleash-client'

import * as UserProductFlagsRepo from '../../models/UserProductFlags'
import { mocked } from 'ts-jest/utils'

import { getStringObjectId, buildGatesQualifiedData } from '../generate'

jest.mock('../../models/UserProductFlags')
jest.mock('../../utils/gates-study-utils')

const mockUserProductFlagsRepo = mocked(UserProductFlagsRepo, true)
const mockedUnleashClient = mocked(unleashClient, true)
const mockedGatesStudyUtils = mocked(gatesStudyUtils, true)

describe('processGatesQualifiedSession', () => {
  test('Feature flag is on', async () => {
    mockedGatesStudyUtils.isDateWithinGatesStudyPeriod.mockReturnValue(false)
    await GatesStudyService.processGatesQualifiedSession(getStringObjectId())
    expect(mockUserProductFlagsRepo).toBeCalledTimes(1)
  })

  test('Feature flag is off', async () => {
    mockedGatesStudyUtils.isDateWithinGatesStudyPeriod.mockReturnValue(false)
    await GatesStudyService.processGatesQualifiedSession(getStringObjectId())
    expect(mockUserProductFlagsRepo).toBeCalledTimes(0)
  })

  test('Date is not within the Gates study date range', async () => {
    mockedGatesStudyUtils.isDateWithinGatesStudyPeriod.mockReturnValue(false)
    await GatesStudyService.processGatesQualifiedSession(getStringObjectId())
    expect(mockUserProductFlagsRepo).toBeCalledTimes(0)
  })

  test('Date is not within the Gates study date range', async () => {
    const mockGatesQualifiedData = buildGatesQualifiedData()
    mockedGatesStudyUtils.isDateWithinGatesStudyPeriod.mockReturnValue(true)
    mockedGatesStudyUtils.prepareForGatesQualificationCheck.mockResolvedValueOnce(
      mockGatesQualifiedData
    )
    await GatesStudyService.processGatesQualifiedSession(getStringObjectId())
    expect(mockUserProductFlagsRepo).toBeCalledTimes(1)
  })
})
