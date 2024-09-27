import { faker } from '@faker-js/faker'
import { getDbUlid } from '../../../database/seeds/utils'
import { getClient } from '../../db'
import * as TeacherClassRepo from '../../models/TeacherClass'
import {
  addTestStudentToTestTeacherClass,
  createTestStudent,
  createTestTeacherClass,
} from './seed-utils'

const client = getClient()

afterEach(async () => {
  await client.query('SET search_path TO upchieve')
})

describe('getTotalStudentInClass', () => {
  test('returns the number of students in the class', async () => {
    const teacherClass = await createTestTeacherClass(client)
    const student1 = await createTestStudent(client)
    const student2 = await createTestStudent(client)
    const student3 = await createTestStudent(client)

    await addTestStudentToTestTeacherClass(
      student1.user_id,
      teacherClass.id,
      client
    )
    await addTestStudentToTestTeacherClass(
      student2.user_id,
      teacherClass.id,
      client
    )
    await addTestStudentToTestTeacherClass(
      student3.user_id,
      teacherClass.id,
      client
    )

    const result = await TeacherClassRepo.getTotalStudentsInClass(
      teacherClass.id,
      client
    )
    expect(result).toBe(3)
  })

  test('returns 0 if no students in the class', async () => {
    const teacherClass = await createTestTeacherClass(client)
    const result = await TeacherClassRepo.getTotalStudentsInClass(
      teacherClass.id,
      client
    )
    expect(result).toBe(0)
  })

  test('returns 0 if no class found for id', async () => {
    const randomId = getDbUlid()
    const result = await TeacherClassRepo.getTotalStudentsInClass(
      randomId,
      client
    )
    expect(result).toBe(0)
  })
})
