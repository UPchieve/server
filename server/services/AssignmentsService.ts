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
  asArray,
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
  studentIds: Array<string>
}
export type EditAssignmentPayload = {
  id: string
  description?: string
  dueDate?: Date
  isRequired?: boolean
  minDurationInMinutes?: number
  numberOfSessions?: number
  startDate?: Date
  subjectId?: number
  title?: string
  studentsToRemove?: Array<string>
  studentsToAdd?: Array<string>
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
  studentIds: asArray(asString),
})
export const asEditedAssignment = asFactory<EditAssignmentPayload>({
  id: asString,
  description: asOptional(asString),
  dueDate: asOptional(asDate),
  isRequired: asOptional(asBoolean),
  minDurationInMinutes: asOptional(asNumber),
  numberOfSessions: asOptional(asNumber),
  startDate: asOptional(asDate),
  subjectId: asOptional(asNumber),
  title: asOptional(asString),
  studentsToRemove: asOptional(asArray(asString)),
  studentsToAdd: asOptional(asArray(asString)),
})

export async function createAssignment(data: CreateAssignmentPayload) {
  return runInTransaction(async (tc: TransactionClient) => {
    validateAssignmentData(data)

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

    if (data.studentIds && data.studentIds.length > 0) {
      await addAssignmentForStudents(data.studentIds, assignment.id, tc)
    } else {
      await addAssignmentForClass(data.classId, assignment.id, tc)
    }

    return assignment
  })
}

export async function editAssignment(data: EditAssignmentPayload) {
  return runInTransaction(async (tc: TransactionClient) => {
    validateAssignmentData(data)

    const assignment = await AssignmentsRepo.editAssignment(
      {
        id: data.id,
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

    if (data.studentsToRemove && data.studentsToRemove.length) {
      await deleteStudentAssignmentsForStudents(data.studentsToRemove, data.id)
    }

    if (data.studentsToAdd && data.studentsToAdd.length) {
      await addAssignmentForStudents(data.studentsToAdd, data.id, tc)
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
    return AssignmentsRepo.createStudentsAssignmentsForAll(
      studentIds,
      [assignmentId],
      tc
    )
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
 * Add the students to all the assignments that are assigned to the entire class.
 */
export async function addStudentsToClassAssignments(
  studentIds: Ulid[],
  classId: Uuid,
  tc: TransactionClient
) {
  return runInTransaction(async (tc: TransactionClient) => {
    const assignments = await getClassAssignments(classId, tc)
    if (!assignments.length) return
    return AssignmentsRepo.createStudentsAssignmentsForAll(
      studentIds,
      assignments.map(a => a.id),
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

export async function deleteAssignment(assignmentId: Uuid) {
  return runInTransaction(async (tc: TransactionClient) => {
    await AssignmentsRepo.deleteSessionForStudentAssignment(assignmentId, tc)
    await AssignmentsRepo.deleteStudentAssignment(assignmentId, tc)
    await AssignmentsRepo.deleteAssignment(assignmentId, tc)
  })
}

async function deleteStudentAssignmentsForStudents(
  studentsToRemove: Uuid[],
  assignmentId: Uuid
) {
  return runInTransaction(async (tc: TransactionClient) => {
    studentsToRemove.forEach(async studentId => {
      await AssignmentsRepo.deleteSessionStudentAssignmentByStudentId(
        studentId,
        assignmentId,
        tc
      )

      await AssignmentsRepo.deleteStudentAssignmentByStudentId(
        studentId,
        assignmentId,
        tc
      )
    })
  })
}

function validateAssignmentData(
  data: Pick<
    CreateAssignmentPayload,
    'numberOfSessions' | 'startDate' | 'dueDate'
  >
) {
  const numSessions = data.numberOfSessions
  if (numSessions && numSessions <= 0)
    throw new InputError('Number of sessions must be greater than 0.')

  const startDate = data.startDate
  const dueDate = data.dueDate
  if (startDate && dueDate && moment(startDate).isSameOrAfter(moment(dueDate)))
    throw new InputError('Start date cannot be after the due date.')
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

/*
 * Gets the assignments that are assigned to the entire class.
 */
async function getClassAssignments(classId: Ulid, tc: TransactionClient) {
  return runInTransaction(async (tc: TransactionClient) => {
    const totalStudentsInClass = await TeacherClassRepo.getTotalStudentsInClass(
      classId,
      tc
    )
    const assignments = await AssignmentsRepo.getAssignmentsByClassId(
      classId,
      tc
    )

    return (
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
  })
}
