import * as cache from '../../cache'
import * as db from '../../db'
import logger from '../../logger'
import * as pgQueries from '../../models/SessionEditorActivity/pg.queries'
import { insertSessionEditorActivity } from '../../models/SessionEditorActivity/queries'
import { getUuid } from '../../models/pgUtils'
import { RepoCreateError } from '../../models/Errors'
import { logThrottledEditorActivity } from '../../services/SessionEditorActivityService'

jest.mock('../../cache')
jest.mock('../../db')
jest.mock('../../models/SessionEditorActivity/pg.queries')

const mockedCache = jest.mocked(cache)
const mockedDb = jest.mocked(db)
const mockedInsertQuery = jest.mocked(pgQueries.insertSessionEditorActivity)

const THROTTLE_SECONDS = 60 * 5
const dbClient = {} as ReturnType<typeof db.getClient>

describe('SessionEditorActivity repo', () => {
  const sessionId = getUuid()
  const userId = getUuid()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedDb.getClient.mockReturnValue(dbClient)
    mockedInsertQuery.run.mockResolvedValue([{ id: getUuid() }])
  })

  describe('insertSessionEditorActivity', () => {
    test('Inserts a row and returns the new id', async () => {
      const insertedId = getUuid()
      mockedInsertQuery.run.mockResolvedValue([{ id: insertedId }])

      const result = await insertSessionEditorActivity({
        sessionId,
        userId,
        source: 'quill',
      })

      expect(result).toEqual(insertedId)
      expect(mockedInsertQuery.run).toHaveBeenCalledWith(
        {
          id: expect.any(String),
          sessionId,
          userId,
          source: 'quill',
        },
        dbClient
      )
    })

    test(`Throws ${RepoCreateError.name} if the insert returns no rows`, async () => {
      mockedInsertQuery.run.mockResolvedValue([])

      await expect(
        insertSessionEditorActivity({ sessionId, userId, source: 'quill' })
      ).rejects.toThrow(RepoCreateError)
    })
  })

  describe('logThrottledEditorActivity', () => {
    test('Inserts activity and sets the throttle key when the key is not cached', async () => {
      mockedCache.exists.mockResolvedValue(false)

      await logThrottledEditorActivity(sessionId, userId, 'whiteboard')

      expect(mockedCache.saveWithExpiration).toHaveBeenCalledWith(
        `session-editor-activity-throttle-whiteboard-${sessionId}-${userId}`,
        '1',
        THROTTLE_SECONDS
      )
      expect(mockedInsertQuery.run).toHaveBeenCalledWith(
        expect.objectContaining({ sessionId, userId, source: 'whiteboard' }),
        dbClient
      )
    })

    test('Does not insert activity when the throttle key is already cached', async () => {
      mockedCache.exists.mockResolvedValue(true)

      await logThrottledEditorActivity(sessionId, userId, 'whiteboard')

      expect(mockedCache.saveWithExpiration).not.toHaveBeenCalled()
      expect(mockedInsertQuery.run).not.toHaveBeenCalled()
    })

    test('Throttles each source independently for the same session and user', async () => {
      mockedCache.exists.mockResolvedValue(false)

      await logThrottledEditorActivity(sessionId, userId, 'whiteboard')
      await logThrottledEditorActivity(sessionId, userId, 'quill')

      expect(mockedCache.exists).toHaveBeenNthCalledWith(
        1,
        `session-editor-activity-throttle-whiteboard-${sessionId}-${userId}`
      )
      expect(mockedCache.exists).toHaveBeenNthCalledWith(
        2,
        `session-editor-activity-throttle-quill-${sessionId}-${userId}`
      )
      expect(mockedInsertQuery.run).toHaveBeenCalledTimes(2)
    })

    test('Swallows and logs errors so that editor traffic is never interrupted', async () => {
      const loggerWarnSpy = jest.spyOn(logger, 'warn').mockImplementation()
      mockedCache.exists.mockResolvedValue(false)
      mockedInsertQuery.run.mockRejectedValue(new Error('db is down'))

      await expect(
        logThrottledEditorActivity(sessionId, userId, 'quill')
      ).resolves.toBeUndefined()
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.objectContaining({ sessionId, userId, source: 'quill' }),
        'Failed to log throttled session editor activity'
      )

      loggerWarnSpy.mockRestore()
    })

    test('Swallows and logs errors thrown by the cache', async () => {
      const loggerWarnSpy = jest.spyOn(logger, 'warn').mockImplementation()
      mockedCache.exists.mockRejectedValue(new Error('redis is down'))

      await expect(
        logThrottledEditorActivity(sessionId, userId, 'whiteboard')
      ).resolves.toBeUndefined()
      expect(mockedInsertQuery.run).not.toHaveBeenCalled()
      expect(loggerWarnSpy).toHaveBeenCalled()

      loggerWarnSpy.mockRestore()
    })
  })
})
