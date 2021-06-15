import generateAndStoreWaitTimeHeatMap from '../../worker/jobs/generateAndStoreWaitTimeHeatMap'
import { mocked } from 'ts-jest/utils'
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
      async () => {}
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

  test('Should log error if failed to generate or store the heat map', async () => {
    mockedSessionService.generateAndStoreWaitTimeHeatMap.mockImplementationOnce(
      async () => {
        throw new Error('Unable to store heat map')
      }
    )
    await generateAndStoreWaitTimeHeatMap()
    expect(logger.error).toHaveBeenCalledWith(
      // @todo: mock out moment dates so we can do an absolute assertion check
      //        on the log message
      expect.stringMatching(`Failed to ${Jobs.GenerateAndStoreWaitTimeHeatMap}`)
    )
  })
})
