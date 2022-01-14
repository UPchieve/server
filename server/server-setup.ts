import { Server, Socket } from 'net'

let connections: Socket[] = []

export function serverSetup(server: Server) {
  server.on('connection', connection => {
    connections.push(connection)
    connection.on(
      'close',
      () => (connections = connections.filter(curr => curr !== connection))
    )
  })
}

export function getConnections(): Socket[] {
  return connections
}
