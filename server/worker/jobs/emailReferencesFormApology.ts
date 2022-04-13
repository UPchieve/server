import { flatten } from 'lodash'
import { log } from '../logger'
import { getVolunteersForEmailReferenceApology } from '../../models/Volunteer'
import * as UserService from '../../services/UserService'
import { Jobs } from '.'

export default async (): Promise<void> => {
  const volunteers = await getVolunteersForEmailReferenceApology()

  const alreadySent = flatten(
    volunteers.map(vol => {
      return vol.references.map(ref => ({
        reference: ref,
        volunteer: vol,
      }))
    })
  )

  if (alreadySent.length === 0) return log('No references to email')

  const errors: string[] = []
  let totalEmailed = 0
  for (const s of alreadySent) {
    try {
      await UserService.notifyReferenceApology(s.reference, s.volunteer)
      totalEmailed += 1
    } catch (error) {
      errors.push(`reference ${s.reference.id}: ${error}`)
    }
  }

  log(`Sent ${Jobs.EmailReferencesFormApology} to ${totalEmailed} references`)
  if (errors.length) {
    throw new Error(`Failed to send ${Jobs.EmailReferences} to: ${errors}`)
  }

  process.exit(0)
}
