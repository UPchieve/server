import WebSocket from 'ws'

export interface UpgradedWebSocket extends WebSocket {
  id?: string
}

export interface Packet {
  socketId: string
  message: any
}

export interface WebSocketEmitterOptions {
  encoder?: Function
}
