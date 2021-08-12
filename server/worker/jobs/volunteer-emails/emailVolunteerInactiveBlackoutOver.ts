import moment from 'moment'
import { Jobs } from '../index'
import { updateAvailabilitySnapshot } from '../../../services/AvailabilityService'
import MailService from '../../../services/MailService'
import {
  getVolunteers,
  updateVolunteer
} from '../../../services/VolunteerService'
import createNewAvailability from '../../../utils/create-new-availability'
import { EMAIL_RECIPIENT } from '../../../utils/aggregation-snippets'

export interface ContactInfo {
  _id: string
  firstname: string
  email: string
}

export async function processVolunteer(
  volunteer: ContactInfo
): Promise<string[]> {
  const { email, firstname: firstName, _id } = volunteer

  const errors: string[] = []
  try {
    await MailService.sendVolunteerInactiveBlackoutOver({ email, firstName })
  } catch (error) {
    errors.push(
      `Failed to send blackout over email to volunteer ${_id}: ${error.message}`
    )
  }

  const clearedAvailability = createNewAvailability()
  try {
    await updateVolunteer(
      { _id },
      {
        availability: clearedAvailability,
        sentInactiveNinetyDayEmail: true
      }
    )
  } catch (error) {
    errors.push(
      `Failed to update availability for volunteer ${_id}: ${error.message}`
    )
  }

  try {
    await updateAvailabilitySnapshot(_id, {
      onCallAvailability: clearedAvailability
    })
  } catch (error) {
    errors.push(
      `Failed to update snapshot for volunteer ${_id}: ${error.message}`
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

  const volunteers = ((await getVolunteers(
    {
      ...EMAIL_RECIPIENT,
      sentInactiveNinetyDayEmail: false,
      lastActivityAt: {
        $lt: ninetyDaysAgoStartOfDay
      }
    },
    {
      _id: 1,
      firstname: 1,
      email: 1
    }
  )) as unknown) as ContactInfo[]

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
