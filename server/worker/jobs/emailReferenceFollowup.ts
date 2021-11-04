import { Jobs } from '.'
import { REFERENCE_STATUS } from '../../constants'
import VolunteerModel, { Reference, Volunteer } from '../../models/Volunteer'
import * as MailService from '../../services/MailService'
import { EMAIL_RECIPIENT } from '../../utils/aggregation-snippets'
import { log } from '../logger'

interface ReferencesToEmail {
  reference: Reference
  volunteer: Volunteer
}

// Runs every day at 10am EST
export default async (): Promise<void> => {
  const oneDay = 1000 * 60 * 60 * 24 * 1
  const threeDaysAgo = Date.now() - oneDay * 3
  const fourDaysAgo = threeDaysAgo - oneDay
  const query = {
    ...EMAIL_RECIPIENT,
    'references.status': REFERENCE_STATUS.SENT,
    'references.sentAt': {
      $gt: new Date(fourDaysAgo),
      $lt: new Date(threeDaysAgo),
    },
  }
  const referencesToEmail: ReferencesToEmail[] = await VolunteerModel.aggregate(
    [
      {
        $match: query,
      },
      {
        $unwind: '$references',
      },
      {
        /**
         * Since references are stored in an array on the volunteer, one reference with a status of
         * "SENT" and another with a status of "SUBMITTED" would pass through the first $match stage.
         * $unwind allows us to get separate documents from that array, but we need to filter by the
         * same query to get only references with a status of "SENT"
         **/
        $match: query,
      },
      {
        $project: {
          _id: 0,
          volunteer: {
            firstname: '$firstname',
            lastname: '$lastname',
          },
          reference: '$references',
        },
      },
    ]
  )

  let totalEmailed = 0
  const errors: string[] = []

  if (referencesToEmail.length === 0)
    return log('No references to email for a follow-up')

  for (const { reference, volunteer } of referencesToEmail) {
    try {
      await MailService.sendReferenceFollowup(reference, volunteer)
      totalEmailed++
    } catch (error) {
      errors.push(`reference ${reference._id}: ${error}`)
    }
  }

  log(`Sent ${Jobs.EmailReferenceFollowup} to ${totalEmailed} references.`)
  if (errors.length) {
    throw new Error(
      `Failed to send ${Jobs.EmailReferenceFollowup} to: ${errors}`
    )
  }
}
