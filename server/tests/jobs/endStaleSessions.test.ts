test.todo('postgres migration')
/*import mongoose from 'mongoose'
import { resetDb, insertSession } from '../db-utils'
import SessionModel from '../../models/Session'
import endStaleSessions from '../../worker/jobs/endStaleSessions'
jest.setTimeout(15000)

// TODO: refactor test to mock out DB calls

// db connection
beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__)
})

afterAll(async () => {
  await mongoose.connection.close()
})

beforeEach(async () => {
  await resetDb()
})

describe('End stale sessions', () => {
  test('Should end sessions that were created more than 12 hours ago', async () => {
    const thirteenHours = 1000 * 60 * 60 * 13
    const twelveHours = 1000 * 60 * 60 * 12

    await Promise.all([
      insertSession({
        createdAt: new Date(new Date().getTime() - thirteenHours),
      }),
      insertSession({
        createdAt: new Date(new Date().getTime() - twelveHours),
      }),
      insertSession(),
    ])
    await endStaleSessions()

    const sessions = await SessionModel.find()
      .lean()
      .exec()

    for (const session of sessions) {
      if (new Date(session.createdAt).getTime() <= twelveHours)
        expect(session.endedBy).toBeNull()
    }
  })
})
*/
