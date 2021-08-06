import { flatten } from 'lodash'
import { log } from '../logger'
import VolunteerModel, { Volunteer, Reference } from '../../models/Volunteer'
import UserService from '../../services/UserService'
import { REFERENCE_STATUS } from '../../constants'
import { EMAIL_RECIPIENT } from '../../utils/aggregation-snippets'
import { Jobs } from '.'

interface UnsentReference {
  reference: Reference
  volunteer: Volunteer
}

export default async (): Promise<void> => {
  const volunteers = (await VolunteerModel.find({
    ...EMAIL_RECIPIENT,
    'references.status': REFERENCE_STATUS.UNSENT
  })
    .lean()
    .exec()) as Volunteer[]

  const unsent: UnsentReference[] = flatten(
    volunteers.map(vol => {
      return vol.references
        .filter(ref => ref.status === REFERENCE_STATUS.UNSENT)
        .map(ref => ({
          reference: ref,
          volunteer: vol
        }))
    })
  )

  if (unsent.length === 0) return log('No references to email')

  const errors = []
  let totalEmailed = 0
  for (const u of unsent) {
    try {
      await UserService.notifyReference({
        reference: u.reference,
        volunteer: u.volunteer
      })
      totalEmailed += 1
    } catch (error) {
      errors.push(`reference ${u.reference._id}: ${error}`)
    }
  }

  log(`Sent ${Jobs.EmailReferences} to ${totalEmailed} references`)
  if (errors.length) {
    throw new Error(`Failed to send ${Jobs.EmailReferences} to: ${errors}`)
  }
}
