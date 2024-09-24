import { runInTransaction, TransactionClient } from '../db'
import { Ulid } from '../models/pgUtils'
import * as AssignmentsRepo from '../models/Assignments'
import * as TeacherRepo from '../models/Teacher'
import { InputError } from '../models/Errors'
import {
  asDate,
  asBoolean,
  asFactory,
  asNumber,
  asOptional,
  asString,
} from '../utils/type-utils'
import moment from 'moment'
import { CreateStudentAssignmentResult } from '../models/Assignments'

export type CreateAssignmentPayload = {
  classId: string
  description?: string
  dueDate?: Date
  isRequired: boolean
  minDurationInMinutes?: number
  numberOfSessions?: number
  startDate?: Date
  subjectId?: number
  title?: string
}
export const asAssignment = asFactory<CreateAssignmentPayload>({
  classId: asString,
  description: asOptional(asString),
  dueDate: asOptional(asDate),
  isRequired: asBoolean,
  minDurationInMinutes: asOptional(asNumber),
  numberOfSessions: asOptional(asNumber),
  startDate: asOptional(asDate),
  subjectId: asOptional(asNumber),
  title: asOptional(asString),
})

export async function createAssignment(data: CreateAssignmentPayload) {
  return runInTransaction(async (tc: TransactionClient) => {
    const numSessions = data.numberOfSessions
    if (numSessions && numSessions <= 0)
      throw new InputError('Number of sessions must be greater than 0.')

    const startDate = data.startDate
    const dueDate = data.dueDate
    if (
      startDate &&
      dueDate &&
      moment(startDate).isSameOrAfter(moment(dueDate))
    )
      throw new InputError('Start date cannot be after the due date.')

    const assignment = await AssignmentsRepo.createAssignment(
      {
        classId: data.classId,
        description: data.description,
        dueDate: data.dueDate,
        isRequired: data.isRequired ?? false,
        minDurationInMinutes: data.minDurationInMinutes,
        numberOfSessions: data.numberOfSessions,
        startDate: data.startDate,
        subjectId: data.subjectId,
        title: data.title,
      },
      tc
    )

    await addAssignmentForClass(data.classId, assignment.id, tc)

    return assignment
  })
}

export async function getAssignmentsByClassId(
  classId: Ulid
): Promise<AssignmentsRepo.CreateAssignmentInput[]> {
  return AssignmentsRepo.getAssignmentsByClassId(classId)
}

export async function getAssignmentById(
  assignmentId: Ulid
): Promise<AssignmentsRepo.CreateAssignmentInput | undefined> {
  return AssignmentsRepo.getAssignmentById(assignmentId)
}

export async function addAssignmentForStudents(
  studentIds: string[],
  assignmentId: Ulid,
  tc?: TransactionClient
): Promise<CreateStudentAssignmentResult[]> {
  return runInTransaction(async (tc: TransactionClient) => {
    try {
      const studentAssignments = await Promise.all(
        studentIds.map(studentId => {
          console.log(studentId)
          return AssignmentsRepo.createStudentAssignment(
            studentId,
            assignmentId,
            tc
          )
        })
      )
      return studentAssignments
    } catch (err) {
      throw new Error((err as Error).message)
    }
  }, tc)
}

export async function addAssignmentForClass(
  classId: Ulid,
  assignmentId: Ulid,
  tc: TransactionClient
): Promise<CreateStudentAssignmentResult[]> {
  return runInTransaction(async (tc: TransactionClient) => {
    const studentIds = await TeacherRepo.getStudentIdsInTeacherClass(
      tc,
      classId
    )
    return addAssignmentForStudents(studentIds, assignmentId, tc)
  }, tc)
}

export async function getAssignmentsByStudentId(
  userId: Ulid
): Promise<AssignmentsRepo.StudentAssignment[]> {
  return AssignmentsRepo.getAssignmentsByStudentId(userId)
}

export async function getAllAssignmentsForTeacher(
  userId: Ulid
): Promise<AssignmentsRepo.StudentAssignment[]> {
  return AssignmentsRepo.getAllAssignmentsForTeacher(userId)
}

export async function getStudentAssignmentCompletion(assignmentId: Ulid) {
  return AssignmentsRepo.getStudentAssignmentCompletion(assignmentId)
}
