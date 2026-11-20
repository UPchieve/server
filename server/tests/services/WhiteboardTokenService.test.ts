import { createVerifier } from 'fast-jwt'
import { generateKeyPairSync } from 'node:crypto'
import config from '../../config'
import { NotAllowedError } from '../../models/Errors'
import logger from '../../logger'
import * as SessionService from '../../services/SessionService'
import * as WhiteboardTokenService from '../../services/WhiteboardTokenService'
import { buildCurrentSession } from '../mocks/generate'
import { getDbUlid } from '../../models/pgUtils'
import { mocked } from 'jest-mock'

jest.mock('../../services/SessionService')
jest.mock('../../logger')

describe('WhiteboardTokenService', () => {
  const mockedSessionService = mocked(SessionService)
  const mockedLogger = jest.mocked(logger)

  beforeEach(() => {
    jest.resetAllMocks()
  })

  function setWhiteboardTokenPrivateKey(): string {
    const { privateKey, publicKey } = generateKeyPairSync('ed25519')
    const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' })
    ;(
      config as unknown as { whiteboardTokenPrivateKey: string }
    ).whiteboardTokenPrivateKey = privateKeyPem.toString()
    return publicKey.export({ type: 'spki', format: 'pem' }).toString()
  }

  test('allows the session student', async () => {
    const userId = getDbUlid()
    const session = buildCurrentSession({ studentId: userId })
    mockedSessionService.getCurrentSessionById.mockResolvedValue(session)

    await expect(
      WhiteboardTokenService.ensureUserCanJoinWhiteboard(userId, session.id)
    ).resolves.toBeUndefined()
  })

  test('rejects a user who is not a session participant', async () => {
    const userId = getDbUlid()
    const session = buildCurrentSession({
      studentId: getDbUlid(),
      volunteerId: getDbUlid(),
    })
    mockedSessionService.getCurrentSessionById.mockResolvedValue(session)

    await expect(
      WhiteboardTokenService.ensureUserCanJoinWhiteboard(userId, session.id)
    ).rejects.toBeInstanceOf(NotAllowedError)
    expect(mockedLogger.warn).toHaveBeenCalledWith(
      'Unauthorized whiteboard join attempt',
      {
        userId,
        sessionId: session.id,
        reason: 'not_session_participant',
      }
    )
  })

  test('rejects an ended session', async () => {
    const userId = getDbUlid()
    const session = buildCurrentSession({
      studentId: userId,
      endedAt: new Date(),
    })
    mockedSessionService.getCurrentSessionById.mockResolvedValue(session)

    await expect(
      WhiteboardTokenService.ensureUserCanJoinWhiteboard(userId, session.id)
    ).rejects.toBeInstanceOf(NotAllowedError)
    expect(mockedLogger.warn).toHaveBeenCalledWith(
      'Unauthorized whiteboard join attempt',
      {
        userId,
        sessionId: session.id,
        reason: 'ended_session',
      }
    )
  })

  test('returns a signed, one-hour token for an authorized user', async () => {
    const userId = getDbUlid()
    const session = buildCurrentSession({ studentId: userId })
    mockedSessionService.getCurrentSessionById.mockResolvedValue(session)
    const publicKey = setWhiteboardTokenPrivateKey()

    const token = await WhiteboardTokenService.getWhiteboardJWT(
      userId,
      session.id
    )
    const verify = createVerifier({
      key: publicKey,
      algorithms: ['EdDSA'],
      complete: true,
      allowedIss: 'subway',
      allowedAud: 'graffiti',
    })
    const { payload, header } = verify(token)

    expect(header).toEqual({
      alg: 'EdDSA',
      typ: 'JWT',
    })
    expect(payload.sessionId).toBe(session.id)
    expect(payload.sub).toBe(userId)
    expect(payload.exp).toBe(payload.iat! + 3600)
  })
})
