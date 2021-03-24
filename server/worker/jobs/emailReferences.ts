import { flatten } from 'lodash'
import logger, {
  logEmailJobSent,
  logEmailJobError,
  LogEmailJob
} from '../../logger'
import VolunteerModel, { Volunteer, Reference } from '../../models/Volunteer'
import UserService from '../../services/UserService'
import { REFERENCE_STATUS } from '../../constants'
import { Jobs } from '.'

interface UnsentReference {
  reference: Reference
  volunteer: Volunteer
}

export default async (): Promise<void> => {
  const volunteers = (await VolunteerModel.find({
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

  if (unsent.length === 0)
    return logger.info(`No references to send ${Jobs.EmailReferences}`)

  let totalEmailed = 0

  for (const u of unsent) {
    const logData: LogEmailJob = {
      job: Jobs.EmailReferences,
      userId: u.reference._id,
      userType: 'reference'
    }
    try {
      await UserService.notifyReference({
        reference: u.reference,
        volunteer: u.volunteer
      })
      logEmailJobSent(logData)
      totalEmailed++
    } catch (error) {
      logData.error = error
      logEmailJobError(logData)
    }
  }

  return logger.info(
    `Sent ${Jobs.EmailReferences} to ${totalEmailed} references`
  )
}
