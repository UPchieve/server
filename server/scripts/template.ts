import * as db from '../db'

async function main() {
  let exitCode = 0
  try {
    await db.connect()

    // Fill script here
    console.log('Doing stuff!')
  } catch (error) {
    console.log(`Uncaught error: ${error}`)
    exitCode = 1
  } finally {
    await db.closeClient()
    process.exit(exitCode)
  }
}

main()
