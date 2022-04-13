import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'
import { addLastActivity } from '../../middleware/add-last-activity'
import { ONE_DAY_ELAPSED_MILLISECONDS } from '../../constants'
import * as UserRepo from '../../models/User/queries'
import { getDbUlid } from '../../models/pgUtils'

jest.mock('../../models/User/queries')

const USER_ID = getDbUlid()

const mockNextCallback = jest.fn()

beforeEach(() => {
  jest.resetAllMocks()
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

test.todo('TODO: Implement an integration test')
