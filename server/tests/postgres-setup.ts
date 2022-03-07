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
  const base = new GenericContainer('subway-postgres')
    .withHealthCheck(healthCheck)
    .withExposedPorts(PORT)
    .withWaitStrategy(Wait.forHealthCheck())
  const container = isCI
    ? base.withNetworkMode('host')
    : base

  __PG_CONTAINER__ = await container.start()
  console.log('Launched container')

  const host = isCI ? 'docker' : __PG_CONTAINER__.getHost()
  const port = isCI ? 5432 : __PG_CONTAINER__.getMappedPort(PORT)

  console.log(`host:port at ${host}:${port}`)
  const globalEnv = {
    __PG_HOST__: host,
    __PG_PORT__: port,
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
