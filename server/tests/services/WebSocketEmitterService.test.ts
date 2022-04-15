import { getUuid } from '../../models/pgUtils'
import { WebSocketEmitter } from '../../services/WebSocketEmitterService'
import { UpgradedWebSocket } from '../../services/WebSocketEmitterService/types'

function getMockedWebSocket() {
  const mockedWs = {
    CONNECTING: 0,
    OPEN: 0,
    CLOSING: 0,
    CLOSED: 0,

    onopen: jest.fn(),
    onerror: jest.fn(),
    onclose: jest.fn(),
    onmessage: jest.fn(),

    close: jest.fn(),
    send: jest.fn(),
  }
  // @note: partial mock of WebSocket
  return (mockedWs as unknown) as UpgradedWebSocket
}

describe('WebSocketEmitterService public methods', () => {
  const channel = 'test-channel'
  let roomId: string
  beforeEach(() => {
    roomId = getUuid()
  })

  test('Adds a websocket client to a given room', () => {
    const wsEmitter = new WebSocketEmitter(channel)
    const ws = getMockedWebSocket()
    wsEmitter.addClientToRoom(ws, roomId)
    const clients = wsEmitter.getRoomClients(roomId)
    expect(clients).toHaveLength(1)
  })

  test('Should remove websocket client from rooms', () => {
    const wsEmitter = new WebSocketEmitter(channel)
    const wsOne = getMockedWebSocket()
    const wsTwo = getMockedWebSocket()
    wsEmitter.addClientToRoom(wsOne, roomId)
    wsEmitter.addClientToRoom(wsTwo, roomId)
    expect(wsEmitter.getRoomClients(roomId)).toHaveLength(2)
    wsEmitter.removeClientFromRoom(wsOne, roomId)
    const updatedClients = wsEmitter.getRoomClients(roomId)
    expect(updatedClients).toHaveLength(1)
    expect(updatedClients[0].id).toBe(wsTwo.id)
  })

  test('Room should be undefined once all clients are removed', () => {
    const wsEmitter = new WebSocketEmitter(channel)
    const wsOne = getMockedWebSocket()
    const wsTwo = getMockedWebSocket()
    wsEmitter.addClientToRoom(wsOne, roomId)
    wsEmitter.addClientToRoom(wsTwo, roomId)
    expect(wsEmitter.getRoomClients(roomId)).toHaveLength(2)
    wsEmitter.removeClientFromRoom(wsOne, roomId)
    wsEmitter.removeClientFromRoom(wsTwo, roomId)
    const updatedClients = wsEmitter.getRoomClients(roomId)
    expect(updatedClients).toBeUndefined()
  })
})
