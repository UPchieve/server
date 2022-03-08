import { StartedTestContainer } from 'testcontainers/dist/test-container'
import { GenericContainer, Wait } from 'testcontainers'
import fs from 'fs'

const isCI = Boolean(process.env.CI_CONTAINER)
const root = isCI ? '' : `../../${__dirname}`

const PORT = 5432
let __PG_CONTAINER__: StartedTestContainer | undefined = undefined
const healthCheck = {
  test: `pg_isready -U subway -d upchieve`,
  interval: 1000, // ping every second
  timeout: 1000, // timeout per ping
  retries: 10, // try 10 times (10 seconds)
  startPeriod: 5000, // wait 5 seconds before counting against retries
}

export async function setup() {
  const container = new GenericContainer('postgres:14-alpine')
    .withHealthCheck(healthCheck)
    .withExposedPorts(PORT)
    .withStartupTimeout(10 * 60 * 1000)
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
    
    //.withBindMount(`${root}/database/db_init`, '/docker-entrypoint-initdb.d')

  __PG_CONTAINER__ = await container.start()
  fs.readdirSync('/').forEach(file => {
    console.log(file);
  });
  console.log('Postgres init folder:', (await __PG_CONTAINER__.exec(['ls', '-al', '/docker-entrypoint-initdb.d'])).output)
  console.log('Postgres root folder:', (await __PG_CONTAINER__.exec(['ls', '-al', '/'])).output)

  // In CI the container running docker will live at host docker via docker links
  const host = isCI ? 'docker' : __PG_CONTAINER__.getHost()

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
