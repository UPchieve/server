import { Job } from 'bull'
import { flatten } from 'lodash'
import logger from '../../logger'
import { getVolunteersForEmailReference } from '../../models/Volunteer'
import * as UserService from '../../services/UserService'

export default async (job: Job<undefined>): Promise<void> => {
  const volunteers = await getVolunteersForEmailReference()

  const unsent = flatten(
    volunteers.map((vol) => {
      return vol.references.map((ref) => ({
        reference: ref,
        volunteer: vol,
      }))
    })
  )

  if (unsent.length === 0) return logger.info('No references to email')

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

  logger.info(`Sent ${job.name} to ${totalEmailed} references`)
  if (errors.length) {
    throw new Error(`Failed to send ${job.name} to: ${errors}`)
  }
}
