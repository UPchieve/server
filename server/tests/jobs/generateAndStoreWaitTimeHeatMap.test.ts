import { mocked } from 'jest-mock'
import generateAndStoreWaitTimeHeatMap from '../../worker/jobs/generateAndStoreWaitTimeHeatMap'
import * as SessionService from '../../services/SessionService'
import { Jobs } from '../../worker/jobs'
import * as SessionUtils from '../../utils/session-utils'
jest.mock('../../services/SessionService')

const mockedSessionService = mocked(SessionService)

describe(Jobs.GenerateAndStoreWaitTimeHeatMap, () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  test('Should not throw an error if successfully generated and stored the heat map', () => {
    mockedSessionService.generateAndStoreWaitTimeHeatMap.mockResolvedValueOnce(
      SessionUtils.createEmptyHeatMap()
    )
    expect(() => generateAndStoreWaitTimeHeatMap()).not.toThrow()
  })

  test('Should let error bubble up if failed to generate or store the heat map', async () => {
    mockedSessionService.generateAndStoreWaitTimeHeatMap.mockImplementationOnce(
      async () => {
        throw new Error('Unable to store heat map')
      }
    )
    await expect(generateAndStoreWaitTimeHeatMap()).rejects.toThrow()
  })
})
