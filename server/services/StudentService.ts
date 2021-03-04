import { Types } from 'mongoose'
import StudentModel, { Student } from '../models/Student'
import { Jobs } from '../worker/jobs'
import QueueService from './QueueService'

export const getStudent = async (query, projection = {}): Promise<Student> =>
  StudentModel.findOne(query)
    .select(projection)
    .lean()
    .exec()

export const getStudents = async (query, projection = {}): Promise<Student[]> =>
  StudentModel.find(query)
    .select(projection)
    .lean()
    .exec()

export const queueWelcomeEmails = async (
  studentId: Types.ObjectId | string
): Promise<void> => {
  QueueService.add(
    Jobs.EmailStudentUseCases,
    { studentId },
    // process job 1 day after the student account is created
    { delay: 1000 * 60 * 60 * 24 * 1 }
  )
  QueueService.add(
    Jobs.EmailMeetOurVolunteers,
    { studentId },
    // process job 3 days after the student account is created
    { delay: 1000 * 60 * 60 * 24 * 3 }
  )
  QueueService.add(
    Jobs.EmailIndependentLearning,
    { studentId },
    // process job 10 days after the student account is created
    { delay: 1000 * 60 * 60 * 24 * 10 }
  )
}
