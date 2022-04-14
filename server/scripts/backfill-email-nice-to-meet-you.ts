import * as db from '../db'
import { getVolunteersForNiceToMeetYou } from '../models/Volunteer/queries'
import * as MailService from '../services/MailService'
import { Jobs } from '../worker/jobs'

async function EmailNiceToMeetYou(start: Date): Promise<void> {
  const oneDay = 1000 * 60 * 60 * 24 * 1
  const oneDayAgo = new Date(start.getTime() - oneDay).setHours(0, 0, 0, 0)
  const todaysDate = new Date(start)
  // set the date to midnight
  todaysDate.setHours(0, 0, 0, 0)

  const volunteers = await getVolunteersForNiceToMeetYou(
    new Date(oneDayAgo),
    new Date(todaysDate)
  )

  let totalEmailed = 0

  const errors: string[] = []
  for (const volunteer of volunteers) {
    try {
      await MailService.sendNiceToMeetYou(volunteer)
      totalEmailed++
    } catch (error) {
      errors.push(`volunteer ${volunteer.id}: ${error}`)
    }
  }
  console.log(`Sent ${Jobs.EmailNiceToMeetYou} to ${totalEmailed} volunteers`)
  if (errors.length) {
    throw new Error(`Failed to send ${Jobs.EmailNiceToMeetYou} to: ${errors}`)
  }
}

async function main() {
  let exitCode = 0
  try {
    await db.connect()

    const args = process.argv.slice(2)
    if (!args.length) throw new Error('Provide argument of date to run as')
    if (args.length > 1) throw new Error('More than one argument provided')
    const start = new Date(args[0])
    console.log(`Running ${Jobs.EmailNiceToMeetYou} from date ${start}`)

    await EmailNiceToMeetYou(start)
  } catch (error) {
    console.log(`Uncaught error: ${error}`)
    exitCode = 1
  } finally {
    await db.closeClient()
    process.exit(exitCode)
  }
}

main()
