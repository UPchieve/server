/**
 * Manual mock for socketio client
 *
 * Code using the client (worker sockets) only invoke the `on` and `emit` function
 * If more functions are used we need to add them to this mock
 */

module.exports = function io(address: string, options: unknown) {
  return {
    on: jest.fn(),
    emit: jest.fn(),
  }
}
