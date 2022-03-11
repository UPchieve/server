import { StartedTestContainer } from 'testcontainers/dist/test-container'
import { GenericContainer, Wait } from 'testcontainers'
import { check } from 'tcp-port-used'

async function genPort(): Promise<number> {
  let iter = 0
  while (iter < 100) {
    const port = Math.floor(Math.random() * (65535 - 1024 + 1) + 1024) // tcp ports range 1024-65535
    if (await check(port, 'localhost')) return port
  }
  throw new Error('Could not generate valid port')
}

let __PG_CONTAINER__: StartedTestContainer | undefined = undefined

export async function setup() {
  const isCI = Boolean(process.env.CI_CONTAINER)
  const pathToSubway = isCI ? '/builds/upchieve/subway' : '.'
  const HOST = isCI ? 'docker' : 'localhost'
  const PORT = isCI ? await genPort() : 5432

  const healthCheck = {
    test: `pg_isready -h localhost -U subway -d upchieve -p ${PORT}`,
    interval: 1, // ping every second
    retries: 60,
    startPeriod: 5, // wait 5 seconds before counting against retries
  }

  let container = new GenericContainer('postgres:14-alpine')
    .withHealthCheck(healthCheck)
    .withExposedPorts(PORT)
    .withWaitStrategy(Wait.forHealthCheck())
    .withEnv('POSTGRES_PASSWORD', 'Password123')
    .withEnv('POSTGRES_DB', 'upchieve')
    .withEnv('POSTGRES_USER', 'admin')
    .withEnv('PGPORT', String(PORT))
    .withCopyFileToContainer(
      `${pathToSubway}/database/db_init/schema.sql`,
      '/docker-entrypoint-initdb.d/init_db.sql'
    )
    .withCopyFileToContainer(
      `${pathToSubway}/database/db_init/auth.sql`,
      '/docker-entrypoint-initdb.d/init_roles.sql'
    )
    .withCopyFileToContainer(
      `${pathToSubway}/database/db_init/test_seeds.sql`,
      '/docker-entrypoint-initdb.d/seeds.sql'
    )
  container = isCI ? container.withNetworkMode('host') : container

  __PG_CONTAINER__ = await container.start()

  const globalEnv = {
    __PG_HOST__: HOST,
    __PG_PORT__: isCI ? PORT : __PG_CONTAINER__.getMappedPort(PORT),
  }

  setGlobalsFromEnv(global, globalEnv)
}

export async function teardown() {
  await __PG_CONTAINER__?.stop({
    timeout: 30 * 1000,
  })
}

export function setGlobalsFromEnv(globals: any, env: any) {
  const envKeys = Object.keys(env)

  envKeys.forEach(key => {
    // @ts-ignore
    globals[key] = env[key]
  })
}
