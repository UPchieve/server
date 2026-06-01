import { Ulid } from '../../types/shared'
import { Job } from 'bull'
import * as UserService from '../../services/UserService'
import logger from '../../logger'
import { sendInvitationToCoachEmail } from '../../services/MailService'

interface SendInvitationToCoachEmailJobData {
  invitingUserId: Ulid
  invitedUserId: Ulid
  coachingSkills: string[]
}

const logPrefix = `SendInvitationToCoachEmail job: `

export default async function (
  job: Job<SendInvitationToCoachEmailJobData>
): Promise<any> {
  const invitedUser = await UserService.getUserContactInfo(
    job.data.invitedUserId
  )
  if (!invitedUser) {
    logger.error(
      {
        invitedUserId: job.data.invitedUserId,
        invitingUserId: job.data.invitingUserId,
      },
      `${logPrefix}Could not find contact info for invited user`
    )
    throw new Error('Could not find contact info for user invited to coach')
  }

  await sendInvitationToCoachEmail(invitedUser.email, job.data.coachingSkills)
  logger.info(
    {
      invitedUserId: job.data.invitedUserId,
      invitingUserId: job.data.invitingUserId,
    },
    `${logPrefix}Sent invitation to coach email to invitee's primary email`
  )
  if (invitedUser.proxyEmail && invitedUser.proxyEmail !== invitedUser.email) {
    await sendInvitationToCoachEmail(
      invitedUser.proxyEmail,
      job.data.coachingSkills
    )
    logger.info(
      {
        invitedUserId: job.data.invitedUserId,
        invitingUserId: job.data.invitingUserId,
      },
      `${logPrefix}Sent invitation to coach email to invitee's proxy email`
    )
  }
}
