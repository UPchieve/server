import { Types } from 'mongoose'
import StudentModel, { Student } from './index'
import { EMAIL_RECIPIENT } from '../../utils/aggregation-snippets'
import { RepoDeleteError, RepoReadError, RepoUpdateError } from '../Errors'

async function wrapRead<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// TODO: proper type for query (emailSessionReported)
export async function getStudent(query: any): Promise<Student | undefined> {
  return await wrapRead(async () => {
    const student = await StudentModel.findOne(query)
      .lean()
      .exec()
    if (student) return student as Student
  })
}

export async function getStudentById(
  studentId: Types.ObjectId
): Promise<Student | undefined> {
  return await wrapRead(async () => {
    const student = await StudentModel.findOne({ _id: studentId })
      .lean()
      .exec()
    if (student) return student as Student
  })
}

export type StudentContactInfo = Pick<Student, '_id' | 'firstname' | 'email'>
export async function getStudentContactInfoById(
  studentId: Types.ObjectId
): Promise<StudentContactInfo | undefined> {
  return await wrapRead(async () => {
    const student = await StudentModel.findOne(
      {
        ...EMAIL_RECIPIENT,
        _id: studentId,
      },
      {
        _id: 1,
        firstname: 1,
        email: 1,
      }
    )
      .lean()
      .exec()
    if (student) return student as StudentContactInfo
  })
}

export async function getTestStudentExistsById(
  studentId: Types.ObjectId
): Promise<boolean> {
  try {
    const student = await StudentModel.findOne({ _id: studentId })
      .select('isTestUser')
      .lean()
      .exec()
    if (student) return student.isTestUser
    return false
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// pg wrappers
import { getClient } from '../../pg'
import * as pgQueries from './pg.queries'
import { Ulid, makeRequired, getDbUlid } from '../pgUtils'

type GatesStudent = {
  id: Ulid
  studentPartnerOrg: string
  currentGrade: string
  isPartnerSchool: boolean
}

export async function getGatesStudentById(
  userId: Ulid
): Promise<GatesStudent | undefined> {
  try {
    const result = await pgQueries.getGatesStudentById.run(
      { userId },
      getClient()
    )
    if (result.length) return makeRequired(result[0])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

type IStudentContactInfo = {
  id: Ulid
  firstName: string
  email: string
}

export async function IgetStudentContactInfoById(
  userId: Ulid
): Promise<IStudentContactInfo | undefined> {
  try {
    const result = await pgQueries.getStudentContactInfoById.run(
      { userId },
      getClient()
    )
    if (result.length) return makeRequired(result[0])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function isTestUser(userId: Ulid): Promise<boolean> {
  try {
    const result = await pgQueries.isTestUser.run({ userId }, getClient())
    if (result.length) return makeRequired(result[0]).testUser
    return false
  } catch (err) {
    if (err instanceof RepoReadError) throw err
    throw new RepoReadError(err)
  }
}

function mockGetTotalFavoriteVolunteers() {
  return [{ total: 4 }]
}

function mockIsFavoriteVolunteer() {
  return [{ mock: 1 }]
}

function mockGetFavoriteVolunteers() {
  const volunteers: FavoriteVolunteer[] = []
  for (let i = 0; i < 5; i++) {
    volunteers.push({
      volunteerId: getDbUlid(),
      firstName: `Mock ${i}`,
      numSessions: i * 2,
    })
  }
  return volunteers
}

export async function getTotalFavoriteVolunteers(
  userId: Ulid
): Promise<number> {
  try {
    /** TODO: use postgres query once postgres migration is complete
    const result = await pgQueries.getTotalFavoriteVolunteers.run(
      { userId },
      client
    )
    */
    const result = mockGetTotalFavoriteVolunteers()
    if (result.length) return makeRequired(result[0]).total
    return 0
  } catch (err) {
    if (err instanceof RepoReadError) throw err
    throw new RepoReadError(err)
  }
}

export async function isFavoriteVolunteer(
  studentId: Ulid,
  volunteerId: Ulid
): Promise<boolean> {
  try {
    /** TODO: use postgres query once postgres migration is complete
    const result = await pgQueries.isFavoriteVolunteer.run(
      { studentId, volunteerId },
      client
    )
    */
    const result = mockIsFavoriteVolunteer()
    if (result.length) return true
    return false
  } catch (err) {
    if (err instanceof RepoReadError) throw err
    throw new RepoReadError(err)
  }
}

type FavoriteVolunteer = {
  volunteerId: Ulid
  firstName: string
  numSessions: number
}

type FavoriteVolunteersResponse = {
  favoriteVolunteers: FavoriteVolunteer[]
  isLastPage: boolean
}

export type UpdateFavoriteVolunteer = {
  studentId: Types.ObjectId
  volunteerId: Types.ObjectId
}

export async function getFavoriteVolunteers(
  userId: Ulid,
  limit: number,
  offset: number
): Promise<FavoriteVolunteersResponse> {
  try {
    /** TODO: use postgres query once postgres migration is complete
    const result = (await pgQueries.getFavoriteVolunteers.run(
      { userId, limit: String(limit), offset: String(offset) },
      client
    )) as FavoriteVolunteer[]
    */
    const result = mockGetFavoriteVolunteers()
    return { favoriteVolunteers: result, isLastPage: result.length < limit }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

function mockDeleteFavoriteVolunteer(): UpdateFavoriteVolunteer[] {
  return [
    { volunteerId: new Types.ObjectId(), studentId: new Types.ObjectId() },
  ]
}

function mockAddFavoriteVolunteer(): UpdateFavoriteVolunteer[] {
  return [
    { volunteerId: new Types.ObjectId(), studentId: new Types.ObjectId() },
  ]
}

export async function deleteFavoriteVolunteer(
  studentId: Types.ObjectId,
  volunteerId: Types.ObjectId
): Promise<UpdateFavoriteVolunteer> {
  try {
    /** TODO: use postgres query once sql migration is complete
     * const result = await pgQueries.deleteFavoriteVolunteer.run({ studentId, volunteerId }, client) as UpdateFavoriteVolunteer
      
    if(result.length)
      return makeRequired(result.rows[0])
     */
    const result = mockDeleteFavoriteVolunteer()
    if (result.length) return makeRequired(result[0])
    throw new RepoDeleteError(
      'Delete query did not return deleted favorited volunteer'
    )
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}

export async function addFavoriteVolunteer(
  studentId: Types.ObjectId,
  volunteerId: Types.ObjectId
): Promise<UpdateFavoriteVolunteer> {
  try {
    /** TODO: use postgres query once sql migration is complete 
    const result = await pgQueries.addFavoriteVolunteer.run({ studentId, volunteerId }, client) as UpdateFavoriteVolunteer
    if(result.length)
      return makeRequired(result.rows[0])
     */
    const result = mockAddFavoriteVolunteer()
    if (result.length) return makeRequired(result[0])
    throw new RepoUpdateError(
      'Update query did not return added favorite volunteer'
    )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}
