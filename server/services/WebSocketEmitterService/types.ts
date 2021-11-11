import WebSocket from 'ws'
import { asFactory, asString, asAny } from '../../utils/type-utils'

export interface UpgradedWebSocket extends WebSocket {
  id?: string
}

export interface Packet {
  socketId: string
  // the data sent over the WebSocket can be shaped in any format
  message: any
}

export interface WebSocketEmitterOptions {
  encoder?: Function
}

export const asWebSocketPacket = asFactory<Packet>({
  socketId: asString,
  message: asAny,
})
