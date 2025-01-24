import { execSync } from 'child_process'
import * as path from 'path'

const isCI = process.env.CI

const sql_files = [
  './database/db_init/schema.sql',
  './database/db_init/auth.sql',
  './database/db_init/test_seeds.sql',
  './database/db_init/seed_migrations.sql',
]

export default async function globalSetup(): Promise<void> {
  if (!isCI) {
    try {
      execSync('docker-compose --profile db-test down')
      execSync('docker-compose --profile db-test up -d')

      await new Promise(resolve => setTimeout(resolve, 3000))

      execSync('docker exec database-ci dropdb -U admin --if-exists upchieve')
      execSync('docker exec database-ci createdb -U admin upchieve')

      sql_files.forEach(file => {
        const sourcePath = path.resolve(process.cwd(), file)
        execSync(
          `cat ${sourcePath} | docker exec -i database-ci psql -U admin -d upchieve`
        )
      })
    } catch (error) {
      console.error('Error in global setup:', (error as Error).message)
      process.exit(1)
    }
  }
}
