import { Job } from 'bull'
import moment from 'moment'
import { log } from '../../logger'
import * as MailService from '../../../services/MailService'
import { Jobs } from '../index'
import { getVolunteerContactInfoById } from '../../../models/Volunteer/queries'
import { getStudentContactInfoById } from '../../../models/Student/queries'
import { ISOString } from '../../../constants'
import formatMultiWordSubject from '../../../utils/format-multi-word-subject'
import { asFactory, asString } from '../../../utils/type-utils'
import { Ulid } from '../../../models/pgUtils'

interface VolunteerSessionActionsJobData {
  volunteerId: Ulid
  studentId: Ulid
  sessionSubtopic: string
  sessionDate: ISOString
}

const asVolunteerActionsData = asFactory<VolunteerSessionActionsJobData>({
  studentId: asString,
  volunteerId: asString,
  sessionSubtopic: asString,
  sessionDate: asString,
})

export default async (
  job: Job<VolunteerSessionActionsJobData>
): Promise<void> => {
  const { data, name: currentJob } = job
  const {
    studentId,
    volunteerId,
    sessionSubtopic,
    sessionDate,
  } = asVolunteerActionsData(data)
  const volunteer = await getVolunteerContactInfoById(volunteerId)
  const student = await getStudentContactInfoById(studentId)

  if (student && volunteer) {
    try {
      const { firstName, email } = volunteer
      if (currentJob === Jobs.EmailVolunteerAbsentWarning)
        await MailService.sendVolunteerAbsentWarning(
          firstName,
          email,
          student.firstName,
          formatMultiWordSubject(sessionSubtopic),
          moment(sessionDate).format('MMMM Do')
        )
      if (currentJob === Jobs.EmailVolunteerAbsentStudentApology)
        await MailService.sendVolunteerAbsentStudentApology(
          firstName,
          email,
          student.firstName,
          formatMultiWordSubject(sessionSubtopic),
          moment(sessionDate).format('MMMM Do')
        )

      log(`Emailed ${currentJob} to volunteer ${volunteerId}`)
    } catch (error) {
      throw new Error(
        `Failed to email ${currentJob} to volunteer ${volunteerId}: ${error}`
      )
    }
  }
}
