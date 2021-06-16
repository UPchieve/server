import { mocked } from 'ts-jest/utils'
import generateAndStoreWaitTimeHeatMap from '../../worker/jobs/generateAndStoreWaitTimeHeatMap'
import * as SessionService from '../../services/SessionService'
import logger from '../../logger'
import { Jobs } from '../../worker/jobs'
jest.mock('../../logger')
jest.mock('../../services/SessionService')

const mockedSessionService = mocked(SessionService, true)

describe(Jobs.GenerateAndStoreWaitTimeHeatMap, () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  test('Should log successful execution of job if the heat map was generated and stored successfully', async () => {
    mockedSessionService.generateAndStoreWaitTimeHeatMap.mockImplementationOnce(
      async () => {
        return undefined
      }
    )
    await generateAndStoreWaitTimeHeatMap()
    expect(logger.info).toHaveBeenCalledWith(
      // @todo: mock out moment dates so we can do an absolute assertion check
      //        on the log message
      expect.stringMatching(
        `Successfuly executed ${Jobs.GenerateAndStoreWaitTimeHeatMap}`
      )
    )
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
