import { Job } from 'bull'
import moment from 'moment'
import { log } from '../../logger'
import * as MailService from '../../../services/MailService'
import { Jobs } from '../index'
import { getVolunteerContactInfoById } from '../../../models/Volunteer/queries'
import { getStudentContactInfoById } from '../../../models/Student/queries'
import { ISOString } from '../../../constants'
import formatMultiWordSubject from '../../../utils/format-multi-word-subject'
import { asObjectId } from '../../../utils/type-utils'

interface VolunteerSessionTriggers {
  volunteerId: string
  studentId: string
  sessionSubtopic: string
  sessionDate: ISOString
}

export default async (job: Job<VolunteerSessionTriggers>): Promise<void> => {
  const {
    data: { sessionSubtopic, sessionDate },
    name: currentJob,
  } = job
  const studentId = asObjectId(job.data.studentId)
  const volunteerId = asObjectId(job.data.volunteerId)
  const volunteer = await getVolunteerContactInfoById(volunteerId)
  const student = await getStudentContactInfoById(studentId)

  if (student && volunteer) {
    try {
      const { firstname, email } = volunteer
      if (currentJob === Jobs.EmailVolunteerAbsentWarning)
        await MailService.sendVolunteerAbsentWarning(
          firstname,
          email,
          student.firstname,
          formatMultiWordSubject(sessionSubtopic),
          moment(sessionDate).format('MMMM Do')
        )
      if (currentJob === Jobs.EmailVolunteerAbsentStudentApology)
        await MailService.sendVolunteerAbsentStudentApology(
          firstname,
          email,
          student.firstname,
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
