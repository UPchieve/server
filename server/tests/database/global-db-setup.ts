import { execSync } from 'child_process'

const isCI = process.env.CI

export default async function globalSetup(): Promise<void> {
  if (!isCI) {
    try {
      execSync('docker compose --profile db-test down')
      execSync('docker compose --profile db-test up -d')
    } catch (error) {
      console.error('Error in global setup:', (error as Error).message)
      process.exit(1)
    }
  }
}
