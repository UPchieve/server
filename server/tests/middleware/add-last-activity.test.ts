import { Request } from 'jest-express/lib/request'
import { mocked } from 'ts-jest/utils'
import { addLastActivity } from '../../middleware/add-last-activity'
import { ONE_DAY_ELAPSED_MILLISECONDS } from '../../constants'
import { updateLastActivityUser } from '../../services/UserService'
jest.mock('../../services/UserService', () => ({
  updateLastActivityUser: jest.fn()
}))

const USER_ID = '5a39d174a6f3b3973d5633z7'

const mockNextCallback = jest.fn()

beforeEach(() => {
  jest.resetAllMocks()
})

test('Should execute next() when given no req.user', () => {
  // TODO: Proper type on this const
  const req: any = new Request()

  addLastActivity(req, null, mockNextCallback)

  expect(mockNextCallback.mock.calls.length).toBe(1)
})

test('Should execute next() when user has lastActivityAt value within one day range', () => {
  const mockDecoration = { user: { _id: USER_ID, lastActivityAt: new Date() } }
  const req: any = Object.assign({}, new Request(), mockDecoration)

  addLastActivity(req, null, mockNextCallback)

  expect(mockNextCallback.mock.calls.length).toBe(1)
})

test('Should execute next() and update when user has lastActivityAt value has exceeded one day range', async () => {
  const mockDecoration = {
    user: {
      _id: USER_ID,
      lastActivityAt: new Date(Date.now() - ONE_DAY_ELAPSED_MILLISECONDS * 2)
    }
  }
  const req: any = Object.assign({}, new Request(), mockDecoration)
  const mockUpdateLastActivityUser = mocked(updateLastActivityUser)
  mockUpdateLastActivityUser.mockImplementation(() => Promise.resolve())

  await addLastActivity(req, null, mockNextCallback)

  expect(updateLastActivityUser).toBeCalledTimes(1)
  expect(mockNextCallback.mock.calls.length).toBe(1)
})

test.todo('TODO: Implement an integration test')
