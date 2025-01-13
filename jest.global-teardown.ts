const { dropTestDatabase, closeConnections } = require('./jest.setup')

module.exports = async () => {
  await dropTestDatabase()
  await closeConnections()
}
