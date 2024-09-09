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

export async function createAssignment(data: AssignmentInputdata) {
  return runInTransaction(async (tc: TransactionClient) => {
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

    const assignment = await AssignmentsRepo.createAssignment(data, tc)

    return assignment
  })
}

export async function getAssignmentsByClassId(classId: Ulid) {
  return AssignmentsRepo.getAssignmentsByClassId(classId)
}
