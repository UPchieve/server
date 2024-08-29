import { runInTransaction, TransactionClient } from '../db'
import { Ulid } from '../models/pgUtils'
import * as AssignmentsRepo from '../models/Assignments'

export async function createAssignment(
  id: Ulid,
  classId: Ulid,
  description?: string,
  title?: string,
  numberOfSessions?: number,
  minDurationInMinutes?: number,
  dueDate?: Date,
  startAt?: Date,
  subjectId?: number
) {
  return runInTransaction(async (tc: TransactionClient) => {
    const assignment = await AssignmentsRepo.createAssignment({
      id,
      classId,
      description,
      title,
      numberOfSessions,
      minDurationInMinutes,
      dueDate,
      startAt,
      subjectId
    },
    tc
  )
    return assignment;
  })
}