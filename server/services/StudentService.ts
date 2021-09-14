import { ObjectId } from 'mongodb'
import { Types } from 'mongoose'
import { UserNotFoundError } from '../models/Errors'
import { Session } from '../models/Session'
import StudentModel, { Student } from '../models/Student'
import { Jobs } from '../worker/jobs'
import QueueService from './QueueService'
import { getSessionById } from './SessionService'

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

export const updateStudent = (query, update) =>
  StudentModel.updateOne(query, update)

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
  QueueService.add(
    Jobs.EmailStudentGoalSetting,
    { studentId },
    // process job 14 days after the student account is created
    { delay: 1000 * 60 * 60 * 24 * 14 }
  )
}

interface RecentSessionInfo {
  type: string,
  subTopic: string,
}

/**
 * Return the most recent unique session subTopics with associated type attended by a student.
 * @param studentID ID of the student for which to list sessions
 * @param count count of session subTopics to return, starting with the last session
 * @returns list of most recent unique session subTopics with associated type
 */
export async function getMostRecentSessionInfo(
  studentID: string,
  count: number
): Promise<RecentSessionInfo[]> {
  let student: Student
  try {
    student = await getStudent(
      {
        _id: studentID
      },
      {
        pastSessions: 1
      }
    )
  } catch (err) {
    if (err.name === 'CastError') throw new UserNotFoundError('id', studentID)
  }

  if (!student) {
    throw new UserNotFoundError('id', studentID)
  } else {
    const recentSessions: RecentSessionInfo[] = []
    // Starting from the end of the list of sessions, add the last 3 unique subTopics,
    // stop if you are back to the beginning of the list
    for (let i = student.pastSessions.length - 1; i >= 0; i--) {
      let type: string
      let subTopic: string
      if ('subTopic' in student.pastSessions[i]) {
        const pastSessionLiteral = student.pastSessions[i] as Session
        subTopic = pastSessionLiteral.subTopic
        type = pastSessionLiteral.type
      } else {
        const pastSessionID = student.pastSessions[i] as ObjectId
        const pastSession = await getSessionById(pastSessionID)
        if (pastSession) {
          subTopic = pastSession.subTopic
          type = pastSession.type
        }
      }
      if (subTopic && !recentSessions.map((recent)=>recent.subTopic).includes(subTopic)) {
        recentSessions.push({
          type,
          subTopic,
        })
        if (recentSessions.length >= count) {
          break
        }
      }
    }
    return recentSessions
  }
}
