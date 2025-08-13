import { Job } from 'bull'
import { Uuid } from 'id128'
import {
  classifyFeedback,
  getStudentFeedbackForSession,
} from '../../../services/SurveyService'
import { asUlid } from '../../../utils/type-utils'
import { getUserReferralLink } from '../../../models/User/index'
import { getSessionById } from '../../../models/Session/index'
import config from '../../../config'
import { sendPositiveStudentFeedbackEmailToVolunteer } from '../../../services/MailService'
import { getSendPositiveStudentFeedbackEmailFeatureFlag } from '../../../services/FeatureFlagService'
import logger from '../../../logger'

type JobData = {
  sessionId: Uuid
}

export default async (job: Job<JobData>): Promise<void> => {
  const { data, name } = job
  const sessionId = asUlid(data.sessionId)
  try {
    const studentFeedbackForVolunteer =
      await getStudentFeedbackForSession(sessionId)

    const classifedFeedback = classifyFeedback(studentFeedbackForVolunteer)

    if (classifedFeedback.isPositive) {
      const session = await getSessionById(sessionId)

      const volunteer = await getUserReferralLink(asUlid(session.volunteerId))

      if (!session.volunteerId || !volunteer)
        throw Error(`no volunteer found for session: ${sessionId}`)

      const isFeatureFlagEnabled =
        await getSendPositiveStudentFeedbackEmailFeatureFlag(
          session.volunteerId
        )

      if (!isFeatureFlagEnabled) {
        logger.info(
          `${name}: Skipping email send since the feature flag is not enabled`
        )
        return
      }

      const student = await getUserReferralLink(asUlid(session.studentId))
      const referralLink = `https://${config.client.host}/referral/${volunteer?.referralCode}`

      if (!student) throw Error(`no student found for session: ${sessionId}`)

      const emailArgs = {
        email: volunteer.email,
        firstName: volunteer.firstName,
        referralLink,
        studentFirstName: student.firstName,
        subject: session.subjectDisplayName,
        ...classifedFeedback.feedback,
      }

      await sendPositiveStudentFeedbackEmailToVolunteer(emailArgs)
    }
  } catch (error) {
    throw new Error(
      `JOB: ${name} - Failed to email volunteer for session id ${sessionId}: ${error}`
    )
  }
}
