import { check } from 'tcp-port-used'
import { PostgreSqlContainer, Wait } from 'testcontainers'

export default async function setup() {
  const { path, host, port } = await ContainerConfigFactory.getContainerConfig()
  const container = await createTestDbContainer(path, host, port).start()

  process.env.__TEST_DB_CONNECTION_STRING__ = container.getConnectionUri()
  // @ts-ignore
  global.__TEST_DB_CONTAINER__ = container
}

function createTestDbContainer(path: string, host: string, port: number) {
  return new PostgreSqlContainer('postgres:14')
    .withHealthCheck({
      test: [
        'CMD',
        'pg_isready',
        '-h',
        host,
        '-U',
        'admin',
        '-d',
        'upchieve',
        '-p',
        String(port),
      ],
      interval: 1, // ping every second
      retries: 60,
      startPeriod: 5, // wait 5 seconds before counting against retries
    })
    .withWaitStrategy(Wait.forHealthCheck())
    .withExposedPorts(port)
    .withUsername('admin')
    .withPassword('Password123')
    .withDatabase('upchieve')
    .withEnvironment({
      POSTGRES_PASSWORD: 'Password123',
      POSTGRES_DB: 'upchieve',
      POSTGRES_USER: 'admin',
      PGPORT: String(port),
    })
    .withCopyFilesToContainer([
      {
        source: `${path}/database/db_init/schema.sql`,
        target: '/docker-entrypoint-initdb.d/a.sql',
      },
      {
        source: `${path}/database/db_init/auth.sql`,
        target: '/docker-entrypoint-initdb.d/b.sql',
      },
      {
        source: `${path}/database/db_init/test_seeds.sql`,
        target: '/docker-entrypoint-initdb.d/c.sql',
      },
      {
        source: `${path}/database/db_init/seed_migrations.sql`,
        target: '/docker-entrypoint-initdb.d/d.sql',
      },
    ])
}

class ContainerConfigFactory {
  private constructor() {}

  static async getContainerConfig() {
    const isCI = Boolean(process.env.CI)
    const path = isCI ? '/builds/upchieve.subway' : '.'
    const host = isCI ? 'docker' : 'localhost'
    const port = isCI ? await this.genPort(host) : 5432

    return { path, host, port }
  }

  private static async genPort(host: string): Promise<number> {
    let iter = 0
    while (iter < 100) {
      const port = Math.floor(Math.random() * (65535 - 1024 + 1) + 1024) // tcp ports range 1024-65535
      if (!(await check(port, host))) return port
      iter += 1
    }
    throw new Error('Could not generate valid port')
  }
}
