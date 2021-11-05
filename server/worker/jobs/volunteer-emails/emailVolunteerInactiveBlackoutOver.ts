import moment from 'moment'
import { Jobs } from '../index'
import { updateSnapshotOnCallByVolunteerId } from '../../../models/Availability/queries'
import * as MailService from '../../../services/MailService'
import createNewAvailability from '../../../utils/create-new-availability'
import {
  VolunteerContactInfo,
  getVolunteersForBlackoutOver,
  updateVolunteerInactiveAvailability,
} from '../../../models/Volunteer/queries'

export async function processVolunteer(
  volunteer: VolunteerContactInfo
): Promise<string[]> {
  const { email, firstname, _id } = volunteer

  const errors: string[] = []
  try {
    await MailService.sendVolunteerInactiveBlackoutOver(email, firstname)
  } catch (error) {
    errors.push(
      `Failed to send blackout over email to volunteer ${_id}: ${
        (error as Error).message
      }`
    )
  }

  const clearedAvailability = createNewAvailability()
  try {
    await updateVolunteerInactiveAvailability(_id, clearedAvailability)
  } catch (error) {
    errors.push(
      `Failed to update availability for volunteer ${_id}: ${
        (error as Error).message
      }`
    )
  }

  try {
    await updateSnapshotOnCallByVolunteerId(_id, clearedAvailability)
  } catch (error) {
    errors.push(
      `Failed to update snapshot for volunteer ${_id}: ${
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
