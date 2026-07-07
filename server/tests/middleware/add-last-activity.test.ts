import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'
import { addLastActivity } from '../../middleware/add-last-activity'
import { ONE_DAY_ELAPSED_MILLISECONDS } from '../../constants'
import * as UserRepo from '../../models/User/queries'
import { getDbUlid } from '../../models/pgUtils'
import { afterEach } from 'node:test'

jest.mock('../../models/User/queries')

const USER_ID = getDbUlid()
const mockNextCallback = jest.fn()
const TEST_TIME = new Date()

beforeEach(() => {
  jest.resetAllMocks()
  jest.useFakeTimers().setSystemTime(TEST_TIME)
})

afterEach(() => {
  jest.useRealTimers()
  jest.setSystemTime(jest.getRealSystemTime())
})

const res: any = new Response()

test('Should execute next() when given no req.user', () => {
  // TODO: Proper type on this const
  const req: any = new Request()

  addLastActivity(req, res, mockNextCallback)

  expect(mockNextCallback.mock.calls.length).toBe(1)
})

test('Should execute next() when user has lastActivityAt value within one day range', () => {
  const mockDecoration = { user: { id: USER_ID, lastActivityAt: new Date() } }
  const req: any = Object.assign({}, new Request(), mockDecoration)

  addLastActivity(req, res, mockNextCallback)

  expect(mockNextCallback.mock.calls.length).toBe(1)
})

test('Should execute next() and update when user has lastActivityAt value has exceeded one day range', async () => {
  const mockDecoration = {
    user: {
      id: USER_ID,
      lastActivityAt: new Date(Date.now() - ONE_DAY_ELAPSED_MILLISECONDS * 2),
    },
  }
  const req: any = Object.assign({}, new Request(), mockDecoration)

  await addLastActivity(req, res, mockNextCallback)

  expect(UserRepo.updateUserLastActivityById).toBeCalledTimes(1)
  expect(mockNextCallback.mock.calls.length).toBe(1)
})

test('If lastActivityAt is undefined, it will update the DB', async () => {
  const mockUser = {
    user: {
      id: USER_ID,
      lastActivityAt: undefined,
    },
  }
  const req = Object.assign({}, new Request(), mockUser)

  await addLastActivity(req, res, mockNextCallback)
  expect(UserRepo.updateUserLastActivityById).toHaveBeenCalledTimes(1)
  expect(UserRepo.updateUserLastActivityById).toHaveBeenCalledWith(
    USER_ID,
    TEST_TIME
  )
  expect(mockNextCallback.mock.calls.length).toBe(1)
})

test.todo('TODO: Implement an integration test')
