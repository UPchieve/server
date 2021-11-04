import { flatten } from 'lodash'
import { log } from '../logger'
import { Volunteer, Reference } from '../../models/Volunteer'
import { getVolunteers } from '../../models/Volunteer/queries'
import * as UserService from '../../services/UserService'
import { REFERENCE_STATUS } from '../../constants'
import { EMAIL_RECIPIENT } from '../../utils/aggregation-snippets'
import { Jobs } from '.'

interface UnsentReference {
  reference: Reference
  volunteer: Volunteer
}

export default async (): Promise<void> => {
  const volunteers = await getVolunteers({
    ...EMAIL_RECIPIENT,
    'references.status': REFERENCE_STATUS.UNSENT,
  })

  const unsent: UnsentReference[] = flatten(
    volunteers.map(vol => {
      return vol.references
        .filter(ref => ref.status === REFERENCE_STATUS.UNSENT)
        .map(ref => ({
          reference: ref,
          volunteer: vol,
        }))
    })
  )

  if (unsent.length === 0) return log('No references to email')

  const errors: string[] = []
  let totalEmailed = 0
  for (const u of unsent) {
    try {
      await UserService.notifyReference(u.reference, u.volunteer)
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
