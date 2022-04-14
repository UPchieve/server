import { getDbUlid, getUuid, Pgid, Ulid } from '../models/pgUtils'
import { AssistmentsData } from '../models/AssistmentsData'
import { Session } from '../models/Session'
import { Student } from '../models/Student'
import { Availability } from '../models/Availability'
import { User, UserContactInfo } from '../models/User'
import { Pool } from 'pg'
import faker from 'faker'
import _ from 'lodash'
import { CamelCasedProperties } from 'type-fest'
import createNewAvailability from '../utils/create-new-availability'

export const getEmail = faker.internet.email
export const getPhone = faker.phone.phoneNumber
export const getFirstName = faker.name.firstName
export const getLastName = faker.name.lastName
export const getIpAddress = faker.internet.ip

async function getSubjectIdByName(name: string, client: Pool): Promise<Pgid> {
  const result = await client.query('SELECT id FROM subjects WHERE name = $1', [
    name,
  ])
  if (result.rows.length && result.rows[0]) return result.rows[0].id
  throw new Error(`Subject ${name} not found`)
}

export const buildAvailability = (overrides = {}): Availability => {
  const availability = createNewAvailability()

  const mergedAvailability = _.merge(availability, overrides)

  return mergedAvailability
}

export function buildUserContactInfo(
  overrides: Partial<UserContactInfo> = {}
): UserContactInfo {
  return {
    id: getDbUlid(),
    email: getEmail(),
    phone: getPhone(),
    firstName: getFirstName(),
    isVolunteer: false,
    isAdmin: false,
    volunteerPartnerOrg: undefined,
    studentPartnerOrg: undefined,
    lastActivityAt: new Date(),
    banned: false,
    deactivated: false,
    ...overrides,
  }
}

export function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: getDbUlid(),
    verified: true,
    emailVerified: true,
    phoneVerified: false,
    email: getEmail().toLowerCase(),
    password: 'Password123',
    firstName: getFirstName(),
    lastName: getLastName(),
    banned: false,
    testUser: false,
    deactivated: false,
    referralCode: 'ABC',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function buildStudent(overrides: Partial<Student> = {}): Student {
  const userId = buildUser().id
  return {
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function buildAssistmentsData(
  overrides: Partial<AssistmentsData> & { sessionId: Ulid }
): AssistmentsData {
  return {
    id: getDbUlid(),
    problemId: Math.floor(Math.random() * 100),
    assignmentId: getUuid(),
    studentId: getUuid(),
    sent: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

type SessionRow = any
export async function buildSession(
  overrides: Partial<SessionRow> & { studentId: Ulid },
  client: Pool
): Promise<SessionRow> {
  return {
    id: getDbUlid(),
    subjectId: await getSubjectIdByName('algebraOne', client),
    hasWhiteboardDoc: true,
    reviewed: false,
    toReview: false,
    timeTutored: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * The following functions are VERY DANGEROUS and their patterns should not be used
 * anywhere else in the ap outside testing. We need to convert incoming camelCase
 * javascript object keys into  snake_case and back.
 *
 * We provide quick and dirty utility functions for inserting a single row,
 * dropping tables, and making a simple SELECT query for the purposes of writing
 * database query tests ONLY. Check out tests/database/AssistmentsData.test.ts
 * for exmaples of how to use these functions
 */

export function camelCaseKeys<T extends { [k: string]: any }>(
  obj: T
): CamelCasedProperties<T> {
  let newObj: any = {}
  for (const key in obj) {
    const newKey = _.camelCase(key)
    newObj[newKey] = obj[key]
  }
  return newObj as CamelCasedProperties<T>
}

export async function insertSingleRow<T>(
  table: string,
  object: T,
  client: Pool
): Promise<CamelCasedProperties<T>> {
  const entries = Object.entries(object)
  let keyString = ''
  let valueString = ''
  const values: string[] = []
  for (let i = 0; i < entries.length; i++) {
    keyString += `${_.snakeCase(entries[i][0])}`
    valueString += `$${i + 1}`
    if (i !== entries.length - 1) {
      keyString += ', '
      valueString += ', '
    }
    values.push(entries[i][1])
  }
  const query = `INSERT INTO ${table} (${keyString}) VALUES (${valueString}) RETURNING ${keyString};`
  const result = await client.query(query, values)
  if (result.rows[0]) return camelCaseKeys(result.rows[0])
  throw new Error(`Inserting into ${table} failed`)
}

export async function dropTables(
  tables: string[],
  client: Pool
): Promise<void> {
  let deleteString = ''
  for (const table of tables) {
    deleteString += `DELETE FROM ${table} CASCADE;\n`
  }
  await client.query(deleteString)
}

export async function executeQuery(
  queryString: string,
  params: string[],
  client: Pool
) {
  const result = await client.query(queryString, params)
  const rows = []
  for (const row of result.rows) {
    rows.push(camelCaseKeys(row))
  }
  return { rows }
}
