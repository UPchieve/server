import { ObjectId } from 'mongodb'
import mongoose from 'mongoose'
import { UserNotFoundError } from '../../models/Errors'
import { Session, validTypes } from '../../models/Session'
import { sessionsToReview } from '../../services/SessionService'
import { getMostRecentSessionTypes } from '../../services/StudentService'
import { insertSession, insertStudent, resetDb } from '../db-utils'
import { buildSession, buildStudent } from '../generate'

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
})

beforeEach(async () => {
  await resetDb()
  jest.clearAllMocks()
})

const delay = ms => new Promise(res => setTimeout(res, ms));

describe('getMostRecentSessionTypes', () => {
  test('should get the last 3 of 6 session topics when sessions are stored as IDs', async () => {
    const sessions = []
    for (let i = 0; i<6;i++) {
      let type = validTypes[0]
      if (i >= 3) {
        type = validTypes[i-1]
      }
      const { session } = await insertSession({ type })
      sessions.push(session._id)
    }
    const student = await insertStudent({ pastSessions: sessions })

    const list = await getMostRecentSessionTypes(student._id.toString(), 3)

    expect(list).toEqual([validTypes[4], validTypes[3], validTypes[2]])
  })
  
  test('should return a UserNotFoundError error if the id is nonsense', async () => {
    try {
      const list = await getMostRecentSessionTypes('blah', 3)
      expect(true).toBe(false)
    } catch (err) {
      expect(err instanceof UserNotFoundError).toBe(true)
    }
  })

  test('should return a UserNotFoundError error if the id does not exist', async () => {
    const dummyStudent = buildStudent()
    try {
      const list = await getMostRecentSessionTypes(dummyStudent._id.toString(), 3)
      expect(true).toBe(false)
    } catch (err) {
      expect(err instanceof UserNotFoundError).toBe(true)
    }
  })

  test('should return a list of 2 sessions if there are only 2 sessions ever taken', async () => {
    const sessions = []
    for (let i = 0; i<2;i++) {
      let type = validTypes[i+1]
      const { session } = await insertSession({ type })
      sessions.push(session._id)
    }
    const student = await insertStudent({ pastSessions: sessions })

    const list = await getMostRecentSessionTypes(student._id.toString(), 3)

    expect(list).toEqual([validTypes[2], validTypes[1]])
  })

  test('should return an empty list if no session was ever taken', async () => {
    const student = await insertStudent()

    const list = await getMostRecentSessionTypes(student._id.toString(), 3)

    expect(list).toEqual([])
  })
})