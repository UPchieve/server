import moment from 'moment'
import { Jobs } from '../index'
import {
  clearAvailabilityForVolunteer,
  saveCurrentAvailabilityAsHistory,
} from '../../../models/Availability'
import * as MailService from '../../../services/MailService'
import {
  VolunteerContactInfo,
  getVolunteersForBlackoutOver,
} from '../../../models/Volunteer'

export async function processVolunteer(
  volunteer: VolunteerContactInfo
): Promise<string[]> {
  const { email, firstName, id } = volunteer

  const errors: string[] = []
  try {
    await MailService.sendVolunteerInactiveBlackoutOver(email, firstName)
  } catch (error) {
    errors.push(
      `Failed to send blackout over email to volunteer ${id}: ${
        (error as Error).message
      }`
    )
  }

  try {
    await saveCurrentAvailabilityAsHistory(volunteer.id)
    await clearAvailabilityForVolunteer(id)
  } catch (error) {
    errors.push(
      `Failed to update availability for volunteer ${id}: ${
        (error as Error).message
      }`
    )
  }

  return errors
}

export default async (): Promise<void> => {
  const ninetyDaysAgoStartOfDay = moment()
    .utc()
    .subtract(90, 'days')
    .startOf('day')
    .toDate()

  const volunteers = await getVolunteersForBlackoutOver(ninetyDaysAgoStartOfDay)

  if (volunteers.length) {
    const errors: string[] = []
    for (const volunteer of volunteers) {
      errors.push(...(await processVolunteer(volunteer)))
    }
    if (errors.length) {
      let errMsg = `Failed to fully process ${Jobs.EmailVolunteerInactiveBlackoutOver}:\n`
      for (const err of errors) {
        errMsg += `${err}\n`
      }
      throw new Error(errMsg)
    }
  }
}
