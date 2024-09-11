import { runInTransaction, TransactionClient } from '../db'
import { Ulid } from '../models/pgUtils'
import * as AssignmentsRepo from '../models/Assignments'
import * as SubjectsRepo from '../models/Subjects'
import { NotAllowedError, InputError } from '../models/Errors'

type AssignmentInputdata = {
  classId: Ulid
  isRequired: boolean
  description?: string
  title?: string
  numberOfSessions?: number
  minDurationInMinutes?: number
  dueDate?: Date
  startDate?: Date
  subjectId?: number
}

type StudentAssignment = {
  assignmentId: string
  createdAt: Date
  submittedAt?: Date
  updatedAt: Date
  userId: string
}

export async function createAssignment(data: AssignmentInputdata) {
  return runInTransaction(async (tc: TransactionClient) => {
    const assignment = await AssignmentsRepo.createAssignment(data, tc)

    const numSessions = data.numberOfSessions
    const startDate = data.startDate
    const dueDate = data.dueDate
    const subjectId = data.subjectId

    if (numSessions && numSessions <= 0)
      throw new InputError('Number of sessions must be greater than 0.')
    if (startDate && dueDate && startDate > dueDate)
      throw new NotAllowedError('Start date cannot be after the due date.')
    if (subjectId) {
      const allSubjects = await SubjectsRepo.getSubjectsWithTopic()
      const idExists = Object.values(allSubjects).some(
        subject => subject.id === subjectId
      )

      if (!idExists) throw new InputError('Subject id is not valid')
    }
    return assignment
  })
}

export async function getAssignmentsByClassId(
  classId: Ulid
): Promise<AssignmentsRepo.CreateAssignmentPayload[]> {
  return AssignmentsRepo.getAssignmentsByClassId(classId)
}

export async function getAssignmentById(
  assignmentId: Ulid
): Promise<AssignmentsRepo.CreateAssignmentPayload | undefined> {
  return AssignmentsRepo.getAssignmentById(assignmentId)
}

export async function addAssignmentForStudents(
  studentIds: string[],
  assignmentId: Ulid
) {
  return runInTransaction(async (tc: TransactionClient) => {
    try {
      const studentAssignments = await Promise.all(
        studentIds.map(studentId =>
          AssignmentsRepo.createStudentAssignment(studentId, assignmentId, tc)
        )
      )
      return studentAssignments
    } catch (err) {
      throw new Error((err as Error).message)
    }
  })
}

export async function getAssignmentsByStudentId(
  userId: Ulid
): Promise<AssignmentsRepo.StudentAssignment[]> {
  return AssignmentsRepo.getAssignmentsByStudentId(userId)
}
