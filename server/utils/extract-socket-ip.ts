import { Socket } from 'socket.io'

/**
 * Extracts the real client IP address from a Socket.io socket connection
 * by using the CF-Connecting-IP header set by Cloudflare, which contains
 * the actual client IP address.
 *
 * The `socket handshake address` property cannot be used to get the client
 * IP address because does not reliably return that IP, and instead
 * sometimes returns the IP of the last proxy (potentially depending on
 * which transport, websockets or polling, is used - more investigation
 * needed).
 */
export function extractSocketIp(socket: Socket): string | undefined {
  const cfConnectingIp = socket.handshake.headers['cf-connecting-ip']

  if (cfConnectingIp && typeof cfConnectingIp === 'string') {
    return cfConnectingIp
  }
}
