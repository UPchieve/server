import { createSigner } from 'fast-jwt'
import WebSocket from 'ws'

const GRAFFITI_URL = 'ws://localhost:5503/graffiti/whiteboard/room/'
const SESSION_ID = '01J9R1Q2Y3X4Z5A6B7C8D9E0F1'
const OTHER_SESSION_ID = '01J9R1Q2Y3X4Z5A6B7C8D9E0F2'
const USER_ID = '01J9R1Q2Y3X4Z5A6B7C8D9E0F3'

function signWhiteboardToken(sessionId: string): string {
  const privateKey = process.env.WHITEBOARD_AUTH_TOKEN_PRIVATE
  if (!privateKey) {
    throw new Error('WHITEBOARD_AUTH_TOKEN_PRIVATE must be set for E2E tests')
  }

  return createSigner({
    key: privateKey,
    algorithm: 'EdDSA',
    expiresIn: 60 * 60 * 1000,
    iss: 'subway',
    aud: 'graffiti',
  })({ sessionId, sub: USER_ID })
}

function upgradeStatus(cookie?: string): Promise<number> {
  return new Promise((resolve, reject) => {
    let statusCode: number | undefined
    const socket = new WebSocket(GRAFFITI_URL + SESSION_ID, {
      headers: cookie ? { Cookie: cookie } : undefined,
    })
    socket.once('upgrade', (response) => {
      statusCode = response.statusCode
    })
    socket.once('open', () => {
      socket.once('close', () => resolve(statusCode ?? 0))
      socket.close()
    })
    socket.once('unexpected-response', (_, response) => {
      response.resume()
      socket.terminate()
      resolve(response.statusCode ?? 0)
    })
    socket.once('error', reject)
  })
}

describe('whiteboard authorization', () => {
  test('allows a matching token cookie to connect to its room', async () => {
    await expect(
      upgradeStatus(`whiteboard_token=${signWhiteboardToken(SESSION_ID)}`)
    ).resolves.toBe(101)
  })

  test('rejects a missing token cookie', async () => {
    await expect(upgradeStatus()).resolves.toBe(403)
  })

  test('rejects a token cookie for another room', async () => {
    await expect(
      upgradeStatus(`whiteboard_token=${signWhiteboardToken(OTHER_SESSION_ID)}`)
    ).resolves.toBe(403)
  })
})
