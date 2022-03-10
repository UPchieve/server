import { Types } from 'mongoose'
import StudentModel, { Student } from './index'
import { EMAIL_RECIPIENT } from '../../utils/aggregation-snippets'
import { RepoReadError } from '../Errors'

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
import { Ulid, makeRequired } from '../pgUtils'

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
