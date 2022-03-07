import { StartedTestContainer } from 'testcontainers/dist/test-container'
import { GenericContainer, Wait } from 'testcontainers'

import config from '../config'

const PORT = 5432
const healthCheck = {
  test: `pg_isready -h localhost -p ${PORT} -U ${config.postgresUser} -d ${config.postgresDatabase}`,
  interval: 1000,
  timeout: 3000,
  retries: 5,
  startPeriod: 1000,
}
let __PG_CONTAINER__: StartedTestContainer | undefined = undefined

export async function setup() {
  const isCI = Boolean(process.env.CI_CONTAINER)
  console.log('Starting setup')
  const container = new GenericContainer('subway-postgres')
    .withHealthCheck(healthCheck)
    .withExposedPorts(PORT)
    .withWaitStrategy(Wait.forHealthCheck())

  __PG_CONTAINER__ = await container.start()
  console.log('Launched container')

  const host = isCI ? 'docker' : __PG_CONTAINER__.getHost()

  console.log(`host:port at ${host}:${__PG_CONTAINER__.getMappedPort(PORT)}`)
  const globalEnv = {
    __PG_HOST__: host,
    __PG_PORT__: __PG_CONTAINER__.getMappedPort(PORT),
  }

  setGlobalsFromEnv(global, globalEnv)
}

export async function teardown() {
  await __PG_CONTAINER__?.stop({
    timeout: 5 * 1000,
  })
}

export function setGlobalsFromEnv(globals: any, env: any) {
  const envKeys = Object.keys(env)

  envKeys.forEach(key => {
    // @ts-ignore
    globals[key] = env[key]
  })
}
