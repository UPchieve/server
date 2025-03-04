/**
 * @group database/parallel
 */

import { faker } from '@faker-js/faker'
import { getClient } from '../../db'
import {
  getDbUlid,
  makeRequired,
  makeSomeOptional,
  Ulid,
  Uuid,
} from '../../models/pgUtils'
import * as AssignmentsRepo from '../../models/Assignments'

const client = getClient()

afterEach(async () => {
  await client.query('SET search_path TO upchieve')
})

describe('createAssignment', () => {
  test('creates the assignment', async () => {
    const teacherClass = await createTestTeacherClass()

    const input = {
      classId: teacherClass.id,
      description: faker.lorem.sentence(),
      dueDate: faker.date.soon({ days: 7 }),
      isRequired: false,
      minDurationInMinutes: faker.number.int({ min: 15, max: 60 }),
      numberOfSessions: faker.number.int({ min: 0, max: 5 }),
      startDate: faker.date.recent(),
      subjectId: 15,
      title: faker.lorem.words(3),
    }

    const created = await AssignmentsRepo.createAssignment(input)
    expect(created.id).toBeDefined()
    expect(created.createdAt).toBeDefined()
    expect(created.updatedAt).toBeDefined()
    expect(created.classId).toBe(input.classId)
    expect(created.description).toBe(input.description)
    expect(created.dueDate).toEqual(input.dueDate)
    expect(created.isRequired).toBe(input.isRequired)
    expect(created.minDurationInMinutes).toBe(input.minDurationInMinutes)
    expect(created.numberOfSessions).toBe(input.numberOfSessions)
    expect(created.startDate).toEqual(input.startDate)
    expect(created.subjectId).toBe(input.subjectId)
    expect(created.title).toBe(input.title)

    const actualRows = await client.query(
      'SELECT * FROM assignments WHERE class_id = $1',
      [teacherClass.id]
    )
    expect(actualRows.rowCount).toBe(1)
    const actual = makeRequired(actualRows.rows[0])
    expect(created.id).toBe(actual.id)
    expect(created.createdAt).toEqual(actual.createdAt)
    expect(created.updatedAt).toEqual(actual.updatedAt)
    expect(created.classId).toBe(actual.classId)
    expect(created.description).toBe(actual.description)
    expect(created.dueDate).toEqual(actual.dueDate)
    expect(created.isRequired).toBe(actual.isRequired)
    expect(created.minDurationInMinutes).toBe(actual.minDurationInMinutes)
    expect(created.numberOfSessions).toBe(actual.numberOfSessions)
    expect(created.startDate).toEqual(actual.startDate)
    expect(created.subjectId).toBe(actual.subjectId)
    expect(created.title).toBe(actual.title)
  })

  test('throws an error if invalid class id', async () => {
    const input = {
      classId: getDbUlid(), // Some random id.
      isRequired: true,
    }

    await expect(AssignmentsRepo.createAssignment(input)).rejects.toThrow(
      'Database create error: insert or update on table "assignments" violates foreign key constraint "assignments_class_id_fkey"'
    )
  })

  test('throws an error if invalid subject id', async () => {
    const subjects = await client.query(
      'SELECT * FROM subjects ORDER BY id DESC'
    )
    const subjectId = subjects.rows[0].id + 1 // Subject ids are sequential, 1 more than the current largest id will be invalid.
    const teacherClass = await createTestTeacherClass()
    const input = {
      classId: teacherClass.id,
      isRequired: true,
      subjectId,
    }

    await expect(AssignmentsRepo.createAssignment(input)).rejects.toThrow(
      'Database create error: insert or update on table "assignments" violates foreign key constraint "assignments_subject_id_fkey"'
    )
  })
})

describe('createStudentsAssignmentsForAll', () => {
  test('inserts a students_assignments for each student and assignment combo', async () => {
    const teacherClass = await createTestTeacherClass()
    const assignment1 = await createTestAssignment(teacherClass.id)
    const assignment2 = await createTestAssignment(teacherClass.id)
    const student1 = await createTestStudent()
    const student2 = await createTestStudent()

    const result = await AssignmentsRepo.createStudentsAssignmentsForAll(
      [student1.user_id, student2.user_id],
      [assignment1.id, assignment2.id],
      client
    )
    expect(result.length).toBe(4)
    expect(result[0].userId).toBe(student1.user_id)
    expect(result[0].assignmentId).toBe(assignment1.id)
    expect(result[1].userId).toBe(student1.user_id)
    expect(result[1].assignmentId).toBe(assignment2.id)
    expect(result[2].userId).toBe(student2.user_id)
    expect(result[2].assignmentId).toBe(assignment1.id)
    expect(result[3].userId).toBe(student2.user_id)
    expect(result[3].assignmentId).toBe(assignment2.id)

    const actualRows = await client.query(
      'SELECT * FROM students_assignments WHERE assignment_id = $1 OR assignment_id = $2',
      [assignment1.id, assignment2.id]
    )
    expect(actualRows.rowCount).toBe(4)
    const actual = actualRows.rows.map((r) =>
      makeSomeOptional(r, ['submittedAt'])
    )
    expect(result).toEqual(expect.objectContaining(actual))
  })
})

describe('getAssignmentsByClassId', () => {
  test('gets all the assignments for a class', async () => {
    const teacherClass = await createTestTeacherClass()
    const otherTeacherClass = await createTestTeacherClass()

    // Three assignments for `teacherClass`.
    await createTestAssignment(teacherClass.id)
    await createTestAssignment(teacherClass.id)
    await createTestAssignment(teacherClass.id)

    // One assignment for `otherTeacherClass`.
    await createTestAssignment(otherTeacherClass.id)

    const teacherClassAssignments =
      await AssignmentsRepo.getAssignmentsByClassId(teacherClass.id)
    expect(teacherClassAssignments.length).toBe(3)
    for (const c of teacherClassAssignments) {
      expect(c).toMatchObject({
        classId: teacherClass.id,
        createdAt: new Date(c.createdAt),
        description: expect.any(String),
        dueDate: new Date(c.dueDate!),
        id: expect.any(String),
        isRequired: expect.any(Boolean),
        minDurationInMinutes: expect.any(Number),
        numberOfSessions: expect.any(Number),
        startDate: new Date(c.startDate!),
        subjectId: expect.any(Number),
        title: expect.any(String),
        updatedAt: new Date(c.updatedAt),
      })
    }

    const otherTeacherClassAssignments =
      await AssignmentsRepo.getAssignmentsByClassId(otherTeacherClass.id)
    expect(otherTeacherClassAssignments.length).toBe(1)
    for (const c of teacherClassAssignments) {
      expect(c).toMatchObject({
        classId: teacherClass.id,
        createdAt: new Date(c.createdAt),
        description: expect.any(String),
        dueDate: new Date(c.dueDate!),
        id: expect.any(String),
        isRequired: expect.any(Boolean),
        minDurationInMinutes: expect.any(Number),
        numberOfSessions: expect.any(Number),
        startDate: new Date(c.startDate!),
        subjectId: expect.any(Number),
        title: expect.any(String),
        updatedAt: new Date(c.updatedAt),
      })
    }
  })
})

describe('getAssignmentById', () => {
  test('gets the assignment with the provided id', async () => {
    const teacherClass = await createTestTeacherClass()
    const assignment = await createTestAssignment(teacherClass.id)

    const actualAssignment = await AssignmentsRepo.getAssignmentById(
      assignment.id
    )

    const expectedAssignment = await client.query(
      'SELECT * FROM assignments WHERE id = $1',
      [assignment.id]
    )
    expect(actualAssignment).toEqual(
      expect.objectContaining(makeRequired(expectedAssignment.rows[0]))
    )
  })
})

describe('getAssignmentsByStudentId', () => {
  test('gets all the assignments for a student', async () => {
    const student = await createTestStudent()
    const otherStudent = await createTestStudent()
    const teacherClass1 = await createTestTeacherClass()
    const teacherClass2 = await createTestTeacherClass()

    // Create four assignments for `teacherClass1` that the student is assigned.
    await createTestAssignment(teacherClass1.id, student.user_id)
    await createTestAssignment(teacherClass1.id, student.user_id)
    await createTestAssignment(teacherClass1.id, student.user_id)
    await createTestAssignment(teacherClass1.id, student.user_id)
    // Create 1 assignment for `teacherClass1` that the student is not assigned.
    await createTestAssignment(teacherClass1.id, otherStudent.user_id)

    // Create two assignments for `teacherClass2` that the student is assigned.
    await createTestAssignment(teacherClass2.id, student.user_id)
    await createTestAssignment(teacherClass2.id, student.user_id)

    // Create five assignments for `teacherClass2` that the student is not assigned.
    await createTestAssignment(teacherClass1.id, otherStudent.user_id)
    await createTestAssignment(teacherClass1.id, otherStudent.user_id)
    await createTestAssignment(teacherClass1.id, otherStudent.user_id)
    await createTestAssignment(teacherClass1.id)
    await createTestAssignment(teacherClass1.id)

    const actual = await AssignmentsRepo.getAssignmentsByStudentId(
      student.user_id
    )
    expect(actual.length).toBe(6)
  })

  test('returns empty array if no assignments for the student', async () => {
    const student = await createTestStudent()
    const actual = await AssignmentsRepo.getAssignmentsByStudentId(
      student.user_id
    )
    expect(actual).toEqual([])
  })
})

// TODO: Merge with other test seeds utils.
async function createTestUser(): Promise<{ id: string }> {
  return (
    await client.query(
      'INSERT INTO users (id, first_name, last_name, email, referral_code) VALUES($1, $2, $3, $4, $5) RETURNING id',
      [
        getDbUlid(),
        faker.person.firstName(),
        faker.person.lastName(),
        faker.internet.email(),
        faker.string.alphanumeric(6),
      ]
    )
  ).rows[0]
}

async function createTestTeacher(userId: Ulid) {
  await client.query(
    'INSERT INTO teacher_profiles (user_id, created_at, updated_at) VALUES ($1, NOW(), NOW())',
    [userId]
  )
}

async function createTestStudent() {
  const user = await createTestUser()
  return (
    await client.query(
      'INSERT INTO student_profiles (user_id) VALUES ($1) RETURNING user_id',
      [user.id]
    )
  ).rows[0]
}

async function createTestVolunteer() {
  const user = await createTestUser()
  return (
    await client.query(
      'INSERT INTO volunteer_profiles (user_id) VALUES ($1) RETURNING user_id',
      [user.id]
    )
  ).rows[0]
}

async function createTestTeacherClass(): Promise<{ id: Ulid }> {
  const user = await createTestUser()
  await createTestTeacher(user.id)
  return (
    await client.query(
      'INSERT INTO teacher_classes (id, user_id, name, code, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id',
      [getDbUlid(), user.id, faker.lorem.word(2), faker.lorem.slug()]
    )
  ).rows[0]
}

async function createTestAssignment(classId: Uuid, studentId?: Ulid) {
  const assignment = (
    await client.query(
      'INSERT INTO assignments (id, class_id, description, title, number_of_sessions, min_duration_in_minutes, due_date, start_date, is_required, subject_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id',
      [
        getDbUlid(),
        classId,
        faker.lorem.sentence(2),
        faker.lorem.words(3),
        faker.number.int({ min: 0, max: 5 }),
        faker.number.int({ min: 15, max: 60 }),
        faker.date.soon({ days: 7 }),
        faker.date.recent(),
        false,
        1,
      ]
    )
  ).rows[0]

  if (studentId) {
    await client.query(
      'INSERT INTO students_assignments (user_id, assignment_id, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
      [studentId, assignment.id]
    )
  }

  return assignment
}
