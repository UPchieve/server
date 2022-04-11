import { Jobs } from '.'
import { getReferencesToFollowup } from '../../models/Volunteer'
import * as MailService from '../../services/MailService'
import { log } from '../logger'

// Runs every day at 10am EST
export default async (): Promise<void> => {
  const oneDay = 1000 * 60 * 60 * 24 * 1
  const threeDaysAgo = Date.now() - oneDay * 3
  const fourDaysAgo = threeDaysAgo - oneDay

  const referencesToEmail = await getReferencesToFollowup(
    new Date(fourDaysAgo),
    new Date(threeDaysAgo)
  )

  let totalEmailed = 0
  const errors: string[] = []

  if (referencesToEmail.length === 0)
    return log('No references to email for a follow-up')

  for (const reference of referencesToEmail) {
    try {
      await MailService.sendReferenceFollowup(
        {
          id: reference.referenceId,
          email: reference.referenceEmail,
          firstName: reference.referenceFirstName,
          lastName: reference.referenceLastName,
        },
        {
          id: reference.volunteerId,
          email: '', // not needed for this email
          phone: '', // not needed for this email
          firstName: reference.volunteerFirstName,
          lastName: reference.volunteerLastName,
        }
      )
      totalEmailed++
    } catch (error) {
      errors.push(`reference ${reference.referenceId}: ${error}`)
    }
  }

  log(`Sent ${Jobs.EmailReferenceFollowup} to ${totalEmailed} references.`)
  if (errors.length) {
    throw new Error(
      `Failed to send ${Jobs.EmailReferenceFollowup} to: ${errors}`
    )
  }
}
