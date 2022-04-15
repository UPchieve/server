import { IneligibleStudent } from './types'
import { RepoCreateError, RepoReadError } from '../Errors'
import { getClient } from '../../db'
import * as pgQueries from './pg.queries'
import {
  Ulid,
  makeSomeRequired,
  getDbUlid,
  makeRequired,
  makeSomeOptional,
} from '../pgUtils'

export async function getIneligibleStudentByEmail(
  email: string
): Promise<IneligibleStudent | undefined> {
  try {
    const result = await pgQueries.getIneligibleStudentByEmail.run(
      { email },
      getClient()
    )
    if (!result.length) return
    return makeSomeRequired(result[0], [
      'zipCode',
      'ipAddress',
      'school',
      'currentGrade',
    ])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type IneligibleStudentsWithSchoolInfo = {
  updatedAt: Date
  createdAt: Date
  email: string
  zipCode?: string
  medianIncome?: number
  schoolId?: Ulid
  schoolName?: string
  schoolState?: string
  schoolCity?: string
  schoolZipCode?: string
  isApproved?: boolean
  ipAddress?: string
}

export async function getIneligibleStudentsPaginated(
  limit: number,
  offset: number
): Promise<IneligibleStudentsWithSchoolInfo[]> {
  try {
    const result = await pgQueries.getIneligibleStudentsPaginated.run(
      { limit, offset },
      getClient()
    )
    return result.map(v =>
      makeSomeOptional(v, ['createdAt', 'email', 'updatedAt'])
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function insertIneligibleStudent(
  email: string,
  schoolId?: Ulid,
  postalCode?: string,
  gradeLevel?: string,
  referredBy?: Ulid,
  ip?: string
): Promise<void> {
  try {
    const result = await pgQueries.insertIneligibleStudent.run(
      {
        id: getDbUlid(),
        email,
        schoolId,
        postalCode,
        gradeLevel,
        referredBy,
        ip,
      },
      getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new Error('Insert did not return new row')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}
