import mongoose from 'mongoose'
import { UserNotFoundError } from '../../models/Errors'
import { getMostRecentSessionInfo } from '../../services/StudentService'
import { insertSession, insertStudent, resetDb } from '../db-utils'
import { buildStudent } from '../generate'

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

describe('getMostRecentSessionTypes', () => {
  test('should get the last 3 of 6 unique session subTopics when sessions are stored as IDs', async () => {
    const sessions = []
    for (let i = 0; i < 6; i++) {
      const { session } = await insertSession({
        subTopic: `${Math.floor(i / 2)}`
      })
      sessions.push(session._id)
    }
    const student = await insertStudent({ pastSessions: sessions })

    const list = await getMostRecentSessionInfo(student._id.toString(), 3)

    expect(list).toEqual([{type: 'math', subTopic: '2'}, {type: 'math', subTopic: '1'}, {type: 'math', subTopic: '0'}])
  })

  test('should return a UserNotFoundError error if the id is nonsense', async () => {
    try {
      await getMostRecentSessionInfo('blah', 3)
      expect(true).toBe(false)
    } catch (err) {
      expect(err instanceof UserNotFoundError).toBe(true)
    }
  })

  test('should return a UserNotFoundError error if the id does not exist', async () => {
    const dummyStudent = buildStudent()
    try {
      await getMostRecentSessionInfo(dummyStudent._id.toString(), 3)
      expect(true).toBe(false) // Line should not be encountered because function should throw an error
    } catch (err) {
      expect(err instanceof UserNotFoundError).toBe(true)
    }
  })

  test('should return a list of 2 sessions if there are only 2 sessions ever taken', async () => {
    const sessions = []
    for (let i = 0; i < 2; i++) {
      const { session } = await insertSession({ subTopic: `${i}` })
      sessions.push(session._id)
    }
    const student = await insertStudent({ pastSessions: sessions })

    const list = await getMostRecentSessionInfo(student._id.toString(), 3)

    expect(list).toEqual([{type: 'math', subTopic: '1'}, {type: 'math', subTopic: '0'}])
  })

  test('should return an empty list if no session was ever taken', async () => {
    const student = await insertStudent()

    const list = await getMostRecentSessionInfo(student._id.toString(), 3)

    expect(list).toEqual([])
  })
})
