import { StartedTestContainer } from 'testcontainers/dist/test-container'
import { GenericContainer, Wait } from 'testcontainers'
import { v4 } from 'uuid'

const isCI = Boolean(process.env.CI_CONTAINER)
// path to subway repo
const root = isCI ? '/builds/upchieve/subway' : '.'
const host = isCI ? 'docker' : 'localhost'
const PORT = 5555
const name = v4()

let __PG_CONTAINER__: StartedTestContainer | undefined = undefined
const healthCheck = {
  test: `pg_isready -h localhost -p ${PORT}`, // `PGPASSWORD=Password123 psql -w -h ${host} -U subway -c "select 1" -d upchieve -p 5432`,
  interval: 1, // ping every second
  retries: 1000,
  startPeriod: 5, // wait 5 seconds before counting against retries
}

import { Pool } from 'pg'

export const ONE_MINUTE = 60 * 1000

export async function setup() {
  const container = new GenericContainer('postgres:14-alpine')
    .withName(name)
    .withNetworkMode('host')
    .withHealthCheck(healthCheck)
    .withExposedPorts(PORT)
    .withWaitStrategy(Wait.forHealthCheck())
    .withStartupTimeout(20 * 1000)
    .withEnv('POSTGRES_PASSWORD', 'Password123')
    .withEnv('POSTGRES_DB', 'upchieve')
    .withEnv('POSTGRES_USER', 'admin')
    .withEnv('PGPORT', String(PORT))
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
  console.log('Container started at', Date.now())

  const globalEnv = {
    __PG_HOST__: host,
    __PG_PORT__: PORT,
  }

  console.log('Live PG Host', __PG_CONTAINER__.getHost())

  console.log('Client start attempt at', Date.now())
  const client = new Pool({
    host: host,
    port: PORT,
    user: 'subway',
    password: 'Password123',
    database: 'upchieve',
    allowExitOnIdle: true,
    connectionTimeoutMillis: 0,
    idleTimeoutMillis: 0,
    ssl: false,
  })
  console.log('Client started at', Date.now())
  client.on('error', () => console.log('Shutting down'))

  const result = await client.query('select * from report_reasons')
  console.log('Query results: ', result.rows)

  // setGlobalsFromEnv(global, globalEnv)
  console.log('Teardown started at', Date.now())
  await teardown()
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

setup()
