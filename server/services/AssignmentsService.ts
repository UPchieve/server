import moment from 'moment'
import { runInTransaction, TransactionClient } from '../db'
import { Ulid, Uuid } from '../models/pgUtils'
import * as AssignmentsRepo from '../models/Assignments'
import * as TeacherRepo from '../models/Teacher'
import * as TeacherClassRepo from '../models/TeacherClass'
import { InputError } from '../models/Errors'
import {
  asDate,
  asBoolean,
  asFactory,
  asNumber,
  asOptional,
  asString,
} from '../utils/type-utils'
import {
  Assignment,
  CreateStudentAssignmentResult,
  StudentAssignment,
} from '../models/Assignments'

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

export async function createAssignment(
  data: CreateAssignmentPayload,
  studentIds: string[]
) {
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

    if (studentIds.length > 0) {
      await addAssignmentForStudents(studentIds, assignment.id, tc)
    } else {
      await addAssignmentForClass(data.classId, assignment.id, tc)
    }

    return assignment
  })
}

export async function getAssignmentsByClassId(
  classId: Ulid
): Promise<AssignmentsRepo.Assignment[]> {
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

/*
 * Add the student to all the assignments that are assigned to the entire class.
 */
export async function addStudentToClassAssignments(
  studentId: Ulid,
  classId: Uuid,
  tc: TransactionClient
) {
  return runInTransaction(async (tc: TransactionClient) => {
    const totalStudentsInClass = await TeacherClassRepo.getTotalStudentsInClass(
      classId,
      tc
    )
    const assignments = await AssignmentsRepo.getAssignmentsByClassId(
      classId,
      tc
    )

    const assignmentsToAdd = (
      await Promise.all(
        assignments.map(async a => {
          const sa = await AssignmentsRepo.getStudentAssignmentCompletion(
            a.id,
            tc
          )
          if (sa.length === totalStudentsInClass) {
            return a
          }
        })
      )
    ).filter((a): a is Assignment => !!a)

    await AssignmentsRepo.createStudentAssignments(
      assignmentsToAdd.map(a => ({ userId: studentId, assignmentId: a.id })),
      tc
    )
  }, tc)
}

export async function getAssignmentsByStudentId(
  userId: Ulid
): Promise<AssignmentsRepo.StudentAssignment[]> {
  return AssignmentsRepo.getAssignmentsByStudentId(userId)
}

export async function getAllAssignmentsForTeacher(
  userId: Ulid
): Promise<Assignment[]> {
  return AssignmentsRepo.getAllAssignmentsForTeacher(userId)
}

export async function getStudentAssignmentCompletion(assignmentId: Ulid) {
  return AssignmentsRepo.getStudentAssignmentCompletion(assignmentId)
}

export async function getStudentAssignmentForSession(
  sessionId: Uuid,
  tc?: TransactionClient
) {
  return AssignmentsRepo.getStudentAssignmentForSession(sessionId, tc)
}

export async function linkSessionToAssignment(
  userId: Ulid,
  sessionId: Uuid,
  assignmentId: Uuid,
  tc: TransactionClient
) {
  return AssignmentsRepo.linkSessionToAssignment(
    userId,
    sessionId,
    assignmentId,
    tc
  )
}

export async function updateStudentAssignmentAfterSession(
  studentId: Ulid,
  sessionId: Uuid,
  tc: TransactionClient
) {
  await runInTransaction(async (tc: TransactionClient) => {
    const assignment = await getStudentAssignmentForSession(sessionId, tc)
    if (!assignment) return

    const assignmentSessions = await AssignmentsRepo.getSessionsForStudentAssignment(
      studentId,
      assignment.id,
      tc
    )

    if (haveSessionsMetAssignmentRequirements(assignment, assignmentSessions)) {
      await AssignmentsRepo.markStudentAssignmentAsCompleted(
        studentId,
        assignment.id,
        tc
      )
    }
  }, tc)
}

// Exported for testing.
export function haveSessionsMetAssignmentRequirements(
  assignment: Omit<StudentAssignment, 'classId'>,
  sessions: { volunteerJoinedAt?: Date; endedAt?: Date }[]
) {
  const filtered = sessions.filter(session => {
    if (!session.volunteerJoinedAt) return false
    if (!session.endedAt) return false

    const timeTutored = moment
      .duration(moment(session.endedAt).diff(moment(session.volunteerJoinedAt)))
      .asMinutes()
    return timeTutored >= (assignment.minDurationInMinutes ?? 0)
  })

  return filtered.length >= (assignment.numberOfSessions ?? 0)
}
