import { initStaticSeedData } from './initStaticSeeds'
import { ExpectedErrors } from './utils'

export async function seedData(): Promise<void> {
  let exitCode = 0
  try {
    const args = process.argv
    const numZipCodes = args[2] ? Number(args[2]) : undefined
    await initStaticSeedData(numZipCodes)
    console.log('All static data is seeded!')
    if (ExpectedErrors.length)
      console.log(
        `Tried to re-seed ${ExpectedErrors.length} objects already in database`
      )
  } catch (err) {
    exitCode = 1
    console.log(err as Error)
  } finally {
    process.exit(exitCode)
  }
}

seedData()
