import { StartedTestContainer } from 'testcontainers/dist/test-container'
import { GenericContainer, Wait } from 'testcontainers'

const isCI = Boolean(process.env.CI_CONTAINER)
const root = isCI ? '/builds/upchieve/subway' : '.'
const host = isCI ? 'docker' : 'localhost'
const PORT = 5432
let __PG_CONTAINER__: StartedTestContainer | undefined = undefined
const healthCheck = {
  test: `pg_isready -h ${host} -U subway -d upchieve`,
  interval: 1000, // ping every second
  retries: 20, // try 10 times (10 seconds)
  startPeriod: 5000, // wait 5 seconds before counting against retries
}

export async function setup() {
  const container = new GenericContainer('postgres:14-alpine')
    .withHealthCheck(healthCheck)
    .withExposedPorts(PORT)
    .withWaitStrategy(Wait.forHealthCheck())
    .withEnv('POSTGRES_PASSWORD', 'Password123')
    .withEnv('POSTGRES_DB', 'upchieve')
    .withEnv('POSTGRES_USER', 'admin')
    .withCopyFileToContainer(
      `${root}/database/db_init/schema.sql`,
      '/docker-entrypoint-initdb.d/init_db.sql'
    )
    .withCopyFileToContainer(
      `${root}/database/db_init/auth.sql`,
      '/docker-entrypoint-initdb.d/init_roles.sql'
    )
    .withCopyFileToContainer(
      `${root}/database/db_init/test_seeds.sql`,
      '/docker-entrypoint-initdb.d/seeds.sql'
    )

  __PG_CONTAINER__ = await container.start()

  const globalEnv = {
    __PG_HOST__: host,
    __PG_PORT__: __PG_CONTAINER__.getMappedPort(PORT),
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
