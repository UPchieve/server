import config from '../config'
import {
  StartedTestContainer,
} from 'testcontainers/dist/test-container'
import {
  GenericContainer,
  Wait,
} from 'testcontainers'

// TODO: safer connection string, exponential backoff, reconnect strategy
jest.setTimeout(10 * 1000)

let startedContainer: StartedTestContainer

const PORT = 6543
export const container = new GenericContainer('subway-postgres')
  .withExposedPorts(PORT)
  .withWaitStrategy(Wait.forLogMessage('init process complete'))

beforeAll(async () => {
  startedContainer = await container.start()
  config.postgresHost = startedContainer.getHost()
})

afterAll(async () => {
  await startedContainer.stop()
})
