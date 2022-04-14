import { processStudentTrackingPostHog } from '../services/StudentService'
import { asUlid } from '../utils/type-utils'
import * as db from '../db'

async function main() {
  let exitCode = 0
  try {
    await db.connect()

    const args = process.argv.slice(2)
    if (!args.length) throw new Error('Provide argument of student id')
    if (args.length > 1) throw new Error('More than one argument provided')
    const studentId = asUlid(args[0])

    await processStudentTrackingPostHog(studentId)
    console.log(
      `Successfully updated posthog association for student ${studentId}`
    )
  } catch (error) {
    console.log(`Uncaught error: ${error}`)
    exitCode = 1
  } finally {
    await db.closeClient()
    process.exit(exitCode)
  }
}

main()
