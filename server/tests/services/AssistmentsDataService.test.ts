import { mocked } from 'ts-jest/utils'
import { getUUID, getObjectId } from '../generate'
import * as AssistmentsDataService from '../../services/AssistmentsDataService'
import * as AssistmentsDataRepo from '../../models/AssistmentsData'
jest.mock('../../models/AssistmentsData')

const mockedSessionRepo = mocked(AssistmentsDataRepo, true)

beforeEach(async () => {
  jest.clearAllMocks()
  jest.restoreAllMocks()
})

describe('create()', () => {
  test('Should create a call the repo layer to create a new document', async () => {
    const problemId = 123456789
    const assignmentId = getUUID()
    const studentId = getUUID()
    const sessionId = getObjectId()
    await AssistmentsDataService.create(
      problemId,
      assignmentId,
      studentId,
      sessionId
    )
    expect(mockedSessionRepo.createBySession).toHaveBeenCalledTimes(1)
  })
})
