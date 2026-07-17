import moment from 'moment'
import { isImageFile, isPdf } from '../utils/image-utils'
import { runInTransaction, TransactionClient } from '../db'
import { Ulid, Uuid } from '../models/pgUtils'
import * as AssignmentsRepo from '../models/Assignments'
import * as TeacherRepo from '../models/Teacher'
import * as TeacherClassRepo from '../models/TeacherClass'
import { InputError, UnsupportedFileTypeError } from '../models/Errors'
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
import * as ModerationService from './ModerationService/index'
import * as AzureService from './AzureService'
import config from '../config'
import * as cache from '../cache'
import { getSubjectsForTopicByTopicId } from './SubjectsService'
import logger from '../logger'
import { isEmpty } from 'lodash'
import * as ModerationTypes from './ModerationService/types'
import { extractPdfContent } from '../utils/file-utils'
import { moderateAssignmentInfo } from './ModerationService/index'

export type UpsertAssignmentPayload = {
  id?: string
  classId: string
  description?: string
  dueDate?: Date
  isRequired: boolean
  minDurationInMinutes?: number
  numberOfSessions?: number
  startDate?: Date
  subjectId?: number
  title?: string
  // TODO: Remove in favour of `studentsToAdd`.
  // Remove after high-line clean-up.
  studentIds?: string[]
  studentsToAdd?: string[]
  studentsToRemove?: string[]
}

export type CreateMultipleAssignmentsPayload = Omit<
  UpsertAssignmentPayload,
  'id' | 'classId' | 'studentIds' | 'studentsToAdd' | 'studentsToRemove'
> & {
  classIds: string[]
}
const assignmentValidators = {
  id: asOptional(asString),
  classId: asString,
  description: asOptional(asString),
  dueDate: asOptional(asDate),
  isRequired: asBoolean,
  minDurationInMinutes: asOptional(asNumber),
  numberOfSessions: asOptional(asNumber),
  startDate: asOptional(asDate),
  subjectId: asOptional(asNumber),
  title: asOptional(asString),
  studentIds: asOptional(asArray(asString)),
  studentsToAdd: asOptional(asArray(asString)),
  studentsToRemove: asOptional(asArray(asString)),
}

export const asAssignment =
  asFactory<UpsertAssignmentPayload>(assignmentValidators)

const {
  id,
  classId,
  studentIds,
  studentsToAdd,
  studentsToRemove,
  ...multipleAssignmentsValidators
} = assignmentValidators
export const asMultipleAssignments =
  asFactory<CreateMultipleAssignmentsPayload>({
    ...multipleAssignmentsValidators,
    classIds: asArray(asString),
  })

export type AssignmentModerationResult = {
  assignment?: Assignment & { isCreated: boolean }
  moderationInfractions?: ModerationTypes.ModerationInfractionCategories
  imageModerationInfractions?: Record<string, string[]>
}

export async function upsertAssignment(
  data: UpsertAssignmentPayload,
  tc?: TransactionClient
): Promise<AssignmentModerationResult> {
  validateAssignmentData(data)

  const moderationInfractions = await ModerationService.moderateAssignmentInfo(
    `${data.title} ${data.description}`
  )
  if (!isEmpty(moderationInfractions)) {
    return { moderationInfractions }
  }

  return runInTransaction(async (tc: TransactionClient) => {
    const assignment = await AssignmentsRepo.upsertAssignment(
      {
        id: data.id,
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

    if (data.studentsToAdd?.length || data.studentIds?.length) {
      const studentsToAdd = (data.studentIds ?? []).concat(
        data.studentsToAdd ?? []
      )
      await addAssignmentForStudents(studentsToAdd, assignment.id, tc)
    }

    if (data.studentsToRemove?.length) {
      await deleteAssignmentsForStudents(
        data.studentsToRemove,
        assignment.id,
        tc
      )
    }

    return { assignment }
  }, tc)
}

export async function createAssignmentForClasses(
  data: Omit<
    UpsertAssignmentPayload,
    'classId' | 'studentsToAdd' | 'studentsToRemove'
  >,
  classIds: string[]
): Promise<{ assignments?: Assignment[]; moderationInfractions?: string[] }> {
  validateAssignmentData(data)
  const moderationInfractions = await ModerationService.moderateAssignmentInfo(
    `${data.title} ${data.description}`
  )

  if (!isEmpty(moderationInfractions)) {
    return { moderationInfractions }
  }

  return runInTransaction(async (tc: TransactionClient) => {
    const assignments = []

    for (const classId of classIds) {
      const assignment = await AssignmentsRepo.upsertAssignment(
        {
          classId,
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
      assignments.push(assignment)
      await addAssignmentForClass(classId, assignment.id, tc)
    }

    return { assignments }
  })
}

function validateAssignmentData(data: {
  numberOfSessions?: number
  startDate?: Date
  dueDate?: Date
}) {
  const numSessions = data.numberOfSessions
  if (numSessions && numSessions <= 0) {
    throw new InputError('Number of sessions must be greater than 0.')
  }

  const startDate = data.startDate
  const dueDate = data.dueDate
  if (
    startDate &&
    dueDate &&
    moment(startDate).isSameOrAfter(moment(dueDate))
  ) {
    throw new InputError('Start date cannot be after the due date.')
  }
}

export async function getAssignmentsByClassId(
  classId: Ulid
): Promise<AssignmentsRepo.Assignment[]> {
  const assignments = await AssignmentsRepo.getAssignmentsByClassId(classId)
  const updatedAssignments = []
  for (const assignment of assignments) {
    updatedAssignments.push({
      ...assignment,
      isGettingStartedAssignment: await isGettingStartedAssignment(
        assignment.id
      ),
    })
  }
  return updatedAssignments
}

export async function getAssignmentById(
  assignmentId: Ulid
): Promise<AssignmentsRepo.Assignment | undefined> {
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
  const studentIds = await TeacherRepo.getStudentIdsInTeacherClass(tc, classId)
  return addAssignmentForStudents(studentIds, assignmentId, tc)
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
      assignments.map((a) => a.id),
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

    const assignmentSessions =
      await AssignmentsRepo.getSessionsForStudentAssignment(
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

async function deleteAssignmentsForStudents(
  studentsToRemove: Uuid[],
  assignmentId: Uuid,
  tc: TransactionClient
) {
  return runInTransaction(async (tc: TransactionClient) => {
    for (const studentId of studentsToRemove) {
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
    }
  }, tc)
}

// Exported for testing.
export function haveSessionsMetAssignmentRequirements(
  assignment: Omit<StudentAssignment, 'classId'>,
  sessions: { volunteerJoinedAt?: Date; endedAt?: Date }[]
) {
  const filtered = sessions.filter((session) => {
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
        assignments.map(async (a) => {
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
  }, tc)
}

async function moderateAssignmentPdf(
  file: Express.Multer.File,
  assignmentId: string,
  userId: string
): Promise<ModerationTypes.ModerationInfractionCategories> {
  const moderationInfractions: string[] = []
  const extractedContent = await extractPdfContent(file.buffer)

  const textModerationResults = await moderateAssignmentInfo(
    extractedContent.text
  )
  if (!isEmpty(textModerationResults)) {
    moderationInfractions.push(...textModerationResults)
  }

  for (const image of extractedContent.images) {
    const { failures } = await ModerationService.moderateImage(image, {
      source: 'assignment_image',
      assignmentId,
      userId,
    })
    moderationInfractions.push(...failures)
  }

  return moderationInfractions
}

/**
 * Upload and retrieve uploaded assignments to and from Azure.
 *
 * @return a map of file names to their moderation infraction reasons
 */
export async function uploadAssignmentFiles(
  assignmentId: Ulid,
  files: Express.Multer.File[],
  userId: string
): Promise<Record<string, string[]>> {
  const incorrectFileTypes = files.filter(
    (file) => !(isImageFile(file.buffer) || isPdf(file.buffer))
  )
  if (incorrectFileTypes.length) {
    throw new UnsupportedFileTypeError(
      'Unsupported file type: Upload an image files or PDFs'
    )
  }

  let fileNameToModerationInfractions: Record<string, string[]> = {}
  for (const file of files) {
    if (isImageFile(file.buffer)) {
      const { failures } = await ModerationService.moderateImage(file.buffer, {
        source: 'assignment_image',
        assignmentId,
        userId,
      })
      if (failures.length) {
        fileNameToModerationInfractions[file.originalname] = failures
      }
    } else {
      const moderationInfractions = await moderateAssignmentPdf(
        file,
        assignmentId,
        userId
      )
      if (moderationInfractions.length) {
        fileNameToModerationInfractions[file.originalname] =
          moderationInfractions
      }
    }
  }

  // If all files are clean, upload them.
  if (isEmpty(fileNameToModerationInfractions)) {
    await Promise.all(
      files.map((file) => {
        AzureService.uploadBlobFile(
          config.assignmentsStorageAccountName,
          config.assignmentsStorageContainer,
          `${assignmentId}/${file.originalname}`,
          file
        )
      })
    )
  }

  return fileNameToModerationInfractions
}

export async function getAssignmentDocuments(assignmentId: Ulid) {
  return await AzureService.getBlobsInFolder(
    config.assignmentsStorageAccountName,
    config.assignmentsStorageContainer,
    `${assignmentId}`
  )
}

export async function isGettingStartedAssignment(
  assignmentId: Uuid
): Promise<boolean> {
  try {
    const members = await cache.smembers('getting-started-assignments')
    return members.includes(assignmentId)
  } catch (error) {
    logger.error(
      `Failed checking if assignment ${assignmentId} is a getting started assignment. Failed to retrieve members from cache key 'getting-started-assignments'. Error: ${error}`
    )
    return false
  }
}

export async function createGettingStartedAssignment(
  userId: Ulid,
  classId: Uuid,
  topicId?: number
) {
  const studentInstructions = `Welcome to UPchieve!

This assignment is your chance to try out UPchieve, a free tutoring platform you can use anytime to get help with homework, essay help, or college prep!

Your Assignment:
  • Click the “Start a Session” button on this page to request tutoring
  • You'll be matched with a real tutor - try asking a question if you have one, or just say hello to your Tutor and let them know you're trying out UPchieve!

You don't need to complete a full session today - we just want you to try it out and see how it works!

Good luck, and have fun!
`
  let subjectId
  if (topicId) {
    const subjects = await getSubjectsForTopicByTopicId(topicId)
    if (subjects.length) subjectId = subjects[0].id
  }
  const { assignment } = await upsertAssignment({
    classId,
    description: studentInstructions,
    dueDate: moment().add(1, 'week').endOf('day').toDate(),
    isRequired: false,
    minDurationInMinutes: 10,
    numberOfSessions: 1,
    startDate: moment().startOf('day').toDate(),
    subjectId,
    title: 'Getting Started on UPchieve',
  })

  if (!assignment) return
  // TODO: Remove if we decide to add teacher_notes for assignments in the DB
  cache.sadd('getting-started-assignments', assignment.id)
}
