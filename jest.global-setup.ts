const { connectToDefault, createTestDatabase } = require('./jest.setup')

module.exports = async () => {
  await connectToDefault()
  await createTestDatabase()
}
