jest.unmock('../config')

describe('config.ipWhoIsUrl', () => {
  const OLD_ENV = process.env

  // Before each test, we reset the environment variables and clear the module cache.
  // This ensures that each test runs in a clean, isolated environment,
  // preventing side effects from other tests in this file.
  beforeEach(() => {
    process.env = { ...OLD_ENV }
    jest.resetModules()
  })

  // After all tests in this file have completed, we restore the original environment variables.
  // This is to prevent this test file from affecting other test files.
  afterAll(() => {
    process.env = OLD_ENV
  })

  it('should use the environment variable for ipWhoIsUrl when it is set', () => {
    const testUrl = 'http://test-url.com'
    process.env.SUBWAY_IP_WHO_IS_URL = testUrl
    const config = require('../config')
    expect(config.ipWhoIsUrl).toBe(testUrl)
  })

  it('should use the fallback ipWhoIsUrl when the environment variable is not set', () => {
    delete process.env.SUBWAY_IP_WHO_IS_URL
    const config = require('../config')
    expect(config.ipWhoIsUrl).toBe('http://free.ipwhois.io/json')
  })
})
