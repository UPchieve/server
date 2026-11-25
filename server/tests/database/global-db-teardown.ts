import { execSync } from 'child_process'

const isCI = process.env.CI

export default async function globalTeardown(): Promise<void> {
  if (!isCI) {
    try {
      execSync('docker compose --profile db-test rm -fsv database-ci')
    } catch (error) {
      console.error('Error stopping Docker Compose:', (error as Error).message)
    }
  }
}
