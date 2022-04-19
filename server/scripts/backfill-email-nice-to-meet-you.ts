import { getVolunteersForNiceToMeetYou } from '../models/Volunteer'
import * as MailService from '../services/MailService'
import { Jobs } from '../worker/jobs'
import { Job } from 'bull'
import { asString } from '../utils/type-utils'
import { log } from '../worker/logger'

type BackfillEmailNiceToMeetYouData = {
  startDate: string
}

export default async function BackfillEmailNiceToMeetYou(
  job: Job<BackfillEmailNiceToMeetYouData>
): Promise<void> {
  const start = new Date(asString(job.data.startDate))

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
  log(`Sent ${Jobs.EmailNiceToMeetYou} to ${totalEmailed} volunteers`)
  if (errors.length) {
    throw new Error(`Failed to send ${Jobs.EmailNiceToMeetYou} to: ${errors}`)
  }
}
