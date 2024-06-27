import { flatten } from 'lodash'
import { log } from '../logger'
import { getVolunteersForEmailReference } from '../../models/Volunteer'
import * as UserService from '../../services/UserService'
import { Jobs } from '.'

export default async (): Promise<void> => {
  const volunteers = await getVolunteersForEmailReference()

  const unsent = flatten(
    volunteers.map(vol => {
      return vol.references.map(ref => ({
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
      errors.push(`reference ${u.reference.id}: ${error}`)
    }
  }

  log(`Sent ${Jobs.EmailReferences} to ${totalEmailed} references`)
  if (errors.length) {
    throw new Error(`Failed to send ${Jobs.EmailReferences} to: ${errors}`)
  }
}
