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
