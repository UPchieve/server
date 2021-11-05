import Redis from 'ioredis'
import { v4 as uuidv4 } from 'uuid'
import config from '../../config'
import { JSONString } from '../../constants'
import logger from '../../logger'
import {
  UpgradedWebSocket,
  Packet,
  WebSocketEmitterOptions,
  asWebSocketPacket,
} from './types'

export class WebSocketEmitter {
  private rooms: { [roomId: string]: UpgradedWebSocket[] } = {}
  private PubClient = new Redis(config.redisConnectionString)
  private SubClient = new Redis(config.redisConnectionString)
  private channel = ''

  // @note: An encoder may take a data format and produce a representation that is suitable
  //        for transmitting over a WebSocket, e.g JSON into binary representations
  private encoder: Function | null = null

  constructor(channel: string, options: WebSocketEmitterOptions = {}) {
    this.channel = channel
    if (options.encoder && typeof options.encoder === 'function')
      this.encoder = options.encoder
    this.SubClient.psubscribe(this.channel + '*')
    this.SubClient.on('pmessage', this.onMessage)
  }

  // @note: Use of arrow function to bind `this` to the class instead of Redis
  private onMessage = (
    pattern: string,
    channel: string,
    message: JSONString
  ) => {
    const roomId = channel.slice(this.channel.length)
    let packet: Packet
    try {
      packet = asWebSocketPacket(
        JSON.parse(message),
        `Unsuitable WebSocket packet shape for room ${roomId}`
      )
    } catch (error) {
      if (error instanceof Error) logger.error(error.message)
      return
    }

    // No WebSocket clients were initialized for the room
    if (!Array.isArray(this.rooms[roomId])) return

    const websocketId = packet.socketId
    for (const client of this.rooms[roomId]) {
      // Send to all clients except for the client who initiated the message
      if (websocketId === client.id) continue
      if (this.encoder) client.send(this.encoder(packet.message))
      else client.send(packet.message)
    }
  }

  private addIdToWebSocket(ws: UpgradedWebSocket) {
    const wsId = uuidv4()
    ws.id = wsId
    return ws
  }

  public addClientToRoom(ws: UpgradedWebSocket, roomId: string) {
    const updatedWs = this.addIdToWebSocket(ws)

    if (!this.rooms[roomId]) this.rooms[roomId] = []
    this.rooms[roomId].push(updatedWs)
  }

  public removeClientFromRoom(ws: UpgradedWebSocket, roomId: string) {
    this.rooms[roomId] = this.rooms[roomId].filter(
      roomClients => roomClients.id !== ws.id
    )
    if (this.rooms[roomId].length === 0) delete this.rooms[roomId]
  }

  public getRoomClients(roomId: string): UpgradedWebSocket[] {
    return this.rooms[roomId]
  }

  public broadcast(path: string, packet: Packet) {
    this.PubClient.publish(this.channel + path, JSON.stringify(packet))
  }
}
