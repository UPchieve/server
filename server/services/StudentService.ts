import { Types } from 'mongoose'
import { Jobs } from '../worker/jobs'
import QueueService from './QueueService'

export const queueWelcomeEmails = async (
  studentId: Types.ObjectId
): Promise<void> => {
  await QueueService.add(
    Jobs.EmailStudentUseCases,
    { studentId },
    // process job 1 day after the student account is created
    { delay: 1000 * 60 * 60 * 24 * 1 }
  )
  await QueueService.add(
    Jobs.EmailMeetOurVolunteers,
    { studentId },
    // process job 3 days after the student account is created
    { delay: 1000 * 60 * 60 * 24 * 3 }
  )
  await QueueService.add(
    Jobs.EmailIndependentLearning,
    { studentId },
    // process job 10 days after the student account is created
    { delay: 1000 * 60 * 60 * 24 * 10 }
  )
  await QueueService.add(
    Jobs.EmailStudentGoalSetting,
    { studentId },
    // process job 14 days after the student account is created
    { delay: 1000 * 60 * 60 * 24 * 14 }
  )
}
