import { log } from '../logger'
import { getVolunteersForNiceToMeetYou } from '../../models/Volunteer/queries'
import * as MailService from '../../services/MailService'
import { Jobs } from '.'

// Runs every day at 10am EST
export default async (): Promise<void> => {
  const oneDay = 1000 * 60 * 60 * 24 * 1
  const oneDayAgo = new Date(Date.now() - oneDay).setHours(0, 0, 0, 0)
  const todaysDate = new Date()
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
  log(`Sent ${Jobs.EmailNiceToMeetYou} to ${totalEmailed} volunteers`)
  if (errors.length) {
    throw new Error(`Failed to send ${Jobs.EmailNiceToMeetYou} to: ${errors}`)
  }
}
