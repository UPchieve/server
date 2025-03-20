import { Job } from 'bull'
import moment from 'moment'
import { log } from '../../logger'
import * as MailService from '../../../services/MailService'
import { Jobs } from '../index'
import { getVolunteerContactInfoById } from '../../../models/Volunteer/queries'
import { getStudentContactInfoById } from '../../../models/Student/queries'
import { Uuid } from '../../../models/pgUtils'
import { getSessionById } from '../../../models/Session'

interface VolunteerSessionActionsJobData {
  sessionId: Uuid
}

export default async (
  job: Job<VolunteerSessionActionsJobData>
): Promise<void> => {
  const { data, name: currentJob } = job
  const session = await getSessionById(data.sessionId)
  if (!session.volunteerId) return
  const volunteer = await getVolunteerContactInfoById(session.volunteerId, {
    deactivated: false,
    testUser: false,
    banned: false,
  })
  const student = await getStudentContactInfoById(session.studentId)

  if (student && volunteer) {
    try {
      const { firstName, email } = volunteer
      if (currentJob === Jobs.EmailVolunteerAbsentWarning)
        await MailService.sendVolunteerAbsentWarning(
          firstName,
          email,
          student.firstName,
          session.subjectDisplayName,
          moment(session.createdAt).format('MMMM Do')
        )
      if (currentJob === Jobs.EmailVolunteerAbsentStudentApology)
        await MailService.sendVolunteerAbsentStudentApology(
          firstName,
          email,
          student.firstName,
          session.subjectDisplayName,
          moment(session.createdAt).format('MMMM Do')
        )

      log(`Emailed ${currentJob} to volunteer ${volunteer.id}`)
    } catch (error) {
      throw new Error(
        `Failed to email ${currentJob} to volunteer ${volunteer.id}: ${error}`
      )
    }
  }
}
