test.todo('postgres migration')
/*import mongoose from 'mongoose'
import {
  resetDb,
  insertSessionWithVolunteer,
  insertSession,
  getSession,
} from '../db-utils'
import endUnmatchedSession from '../../worker/jobs/endUnmatchedSession'
import { log } from '../../worker/logger'
import * as SessionService from '../../services/SessionService'
import { Jobs } from '../../worker/jobs'
jest.mock('../../worker/logger')
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

describe('End unmatched session', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  test('Should not end session when session is fulfilled', async () => {
    const { session } = await insertSessionWithVolunteer()
    // @todo: figure out how to properly type

    const job: any = {
      data: {
        sessionId: session._id,
      },
    }

    await endUnmatchedSession(job)
    expect(log).toHaveBeenCalledWith(
      `Cancel ${Jobs.EndUnmatchedSession}: session ${session._id} fulfilled`
    )
  })

  test('Should throw error when ending a session fails', async () => {
    const { session } = await insertSession()
    // @todo: figure out how to properly type

    const job: any = {
      data: {
        sessionId: session._id,
      },
    }
    const errorMessage = 'unable to end session'
    const mockEndSession = jest
      .spyOn(SessionService, 'endSession')
      .mockRejectedValueOnce(errorMessage)

    await expect(endUnmatchedSession(job)).rejects.toEqual(
      Error(
        `Failed to ${Jobs.EndUnmatchedSession}: session ${session._id}: ${errorMessage}`
      )
    )
    mockEndSession.mockRestore()
  })

  test('Should end session unmatched session', async () => {
    const { session } = await insertSession()
    // @todo: figure out how to properly type

    const job: any = {
      data: {
        sessionId: session._id,
      },
    }

    await endUnmatchedSession(job)

    const query = { _id: session._id }
    const projection = { endedAt: 1 }
    const updatedSession = await getSession(query, projection)

    expect(updatedSession.endedAt).toBeTruthy()
    expect(log).toHaveBeenCalledWith(
      `Successfuly ${Jobs.EndUnmatchedSession}: session ${session._id}`
    )
  })
})
*/
