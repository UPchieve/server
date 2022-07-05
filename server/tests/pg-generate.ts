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
import { VolunteerPartnerOrg } from '../models/VolunteerPartnerOrg'
import { StudentPartnerOrg } from '../models/StudentPartnerOrg'
import { School } from '../models/School'
import {
  OpenStudentRegData,
  PartnerStudentRegData,
  PartnerVolunteerRegData,
  VolunteerRegData,
} from '../utils/auth-utils'
import { GRADES } from '../constants'
import { AppStudent, AppUser, AppVolunteer } from './types'
import {
  PresessionSurvey,
  PresessionSurveyResponseData,
  StudentPresessionSurveyResponse,
  Survey,
} from '../models/Survey'

export function getEmail(): string {
  return faker.internet.email().toLowerCase()
}
export function getPhoneNumber(): string {
  const phoneNumber = faker.phone.phoneNumberFormat(0)
  const formattedPhoneNumber = phoneNumber.replace(/-/g, '')
  return `+1${formattedPhoneNumber}`
}
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
    phone: getPhoneNumber(),
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

export function buildUserRow(overrides: Partial<User> = {}): User {
  return {
    id: getDbUlid(),
    verified: true,
    emailVerified: true,
    phoneVerified: false,
    email: getEmail().toLowerCase(),
    phone: getPhoneNumber(),
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

export function buildUser(overrides: Partial<AppUser> = {}): AppUser {
  const userRow = buildUserRow()
  return {
    ...userRow,
    firstname: userRow.firstName,
    lastname: userRow.lastName,
    isBanned: userRow.banned,
    isDeactivated: userRow.deactivated,
    isTestUser: userRow.testUser,
    isAdmin: false,
    isVolunteer: false,
    ...overrides,
  }
}

export function buildStudentProfile(overrides: Partial<Student> = {}): Student {
  const userId = buildUser().id
  return {
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function buildStudent(overrides: Partial<AppStudent> = {}): AppStudent {
  const student = {
    ...buildUser({ isVolunteer: false }),
    zipCode: '11201',
    schoolId: getDbUlid(),
    currentGrade: GRADES.EIGHTH,
    signupSourceId: 1,
    studentPartnerOrg: '',
    studentPartnerSite: '',
    partnerUserId: '',
    college: 'UPchieve University',
    ...overrides,
  }

  return student
}

export function buildVolunteer(
  overrides: Partial<AppVolunteer> = {}
): AppVolunteer {
  return {
    ...buildUser({ isVolunteer: true }),
    volunteerPartnerOrg: '',
    phone: getPhoneNumber(),

    ...overrides,
  }
}

export function buildStudentRow(overrides: Partial<Student> = {}): Student {
  const userId = buildUserRow().id
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
  client?: Pool
): Promise<SessionRow> {
  return {
    id: getDbUlid(),
    subjectId: client ? await getSubjectIdByName('algebraOne', client) : 1,
    hasWhiteboardDoc: true,
    reviewed: false,
    toReview: false,
    timeTutored: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function buildVolunteerPartnerOrg(
  overrides: Partial<VolunteerPartnerOrg> = {}
): VolunteerPartnerOrg {
  return {
    key: 'health-co',
    name: 'Health Co',
    receiveWeeklyHourSummaryEmail: false,
    domains: [],
    ...overrides,
  }
}

export function buildStudentPartnerOrg(
  overrides: Partial<StudentPartnerOrg> = {}
): StudentPartnerOrg {
  return {
    key: 'school-helpers',
    name: 'School Helpers',
    highSchoolSignup: false,
    schoolSignupRequired: false,
    collegeSignup: false,
    signupCode: 'SCHOOLHELPERS',
    sites: [],
    ...overrides,
  }
}

export function buildSchool(overrides: Partial<School> = {}): School {
  return {
    id: getDbUlid(),
    nameStored: 'Approved School',
    stateStored: 'NY',
    isApproved: true,
    isPartner: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    cityNameStored: 'Brooklyn',
    ...overrides,
  }
}

export const buildStudentRegistrationForm = (
  overrides: Partial<OpenStudentRegData> = {}
): OpenStudentRegData => {
  const student = buildUserRow()
  const form = {
    ip: getIpAddress(),
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    password: student.password,
    terms: true,
    zipCode: '11201',
    highSchoolId: '111111111111',
    currentGrade: GRADES.EIGHTH,
    ...overrides,
  } as OpenStudentRegData

  return form
}

export const buildPartnerStudentRegistrationForm = (
  overrides: Partial<PartnerStudentRegData> = {}
): PartnerStudentRegData => {
  const student = buildUserRow()
  const partnerOrg = buildStudentPartnerOrg()
  const form = {
    ip: getIpAddress(),
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    password: student.password,
    terms: true,
    studentPartnerOrg: partnerOrg.name,
    studentPartnerSite: undefined,
    partnerUserId: partnerOrg.key,
    college: 'UPchieve University',
    ...overrides,
  } as PartnerStudentRegData

  return form
}

export const buildVolunteerRegistrationForm = (
  overrides: Partial<VolunteerRegData> = {}
): VolunteerRegData => {
  const volunteer = buildUserRow()
  const form = {
    ip: getIpAddress(),
    firstName: volunteer.firstName,
    lastName: volunteer.lastName,
    email: volunteer.email,
    password: volunteer.password,
    phone: volunteer.phone,
    terms: true,
    ...overrides,
  } as VolunteerRegData

  return form
}

export const buildPartnerVolunteerRegistrationForm = (
  overrides: Partial<PartnerVolunteerRegData> = {}
): PartnerVolunteerRegData => {
  const volunteer = buildUserRow()
  const form = {
    ip: getIpAddress(),
    volunteerPartnerOrg: 'example',
    firstName: volunteer.firstName,
    lastName: volunteer.lastName,
    email: volunteer.email,
    password: volunteer.password,
    phone: volunteer.phone,
    terms: true,
    ...overrides,
  } as PartnerVolunteerRegData

  return form
}

export function buildPresessionLegacySurveyResponse(
  overrides: Partial<PresessionSurveyResponseData> = {}
): PresessionSurveyResponseData {
  return {
    'primary-goal': {
      answer: 'To finish my homework.',
    },
    'topic-understanding': {
      answer: 2,
    },
    ...overrides,
  }
}

export const buildPressionSurveyLegacy = (
  overrides: Partial<Survey> = {}
): Survey => {
  const survey = {
    id: getDbUlid(),
    userId: getDbUlid(),
    sessionId: getDbUlid(),
    responseData: buildPresessionLegacySurveyResponse(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }

  return survey
}

export const buildPressionSurvey = (
  overrides: Partial<PresessionSurvey> = {}
): PresessionSurvey => {
  const survey = {
    questionId: '1',
    questionText: "What is your primary goal for today's session?",
    displayPriority: 1,
    questionType: 'multiple choice',
    responses: [
      {
        responseId: 1,
        responseText: 'Complete a homework assignment',
        responseDisplayPriority: 1,
      },
    ],
    ...overrides,
  }

  return survey
}

export const buildPresessionSurveyResponse = (
  overrides: Partial<StudentPresessionSurveyResponse> = {}
): StudentPresessionSurveyResponse => {
  const survey = {
    displayLabel: 'Their goal:',
    response: 'Complete a homework assignment',
    score: 1,
    displayOrder: 10,
    ...overrides,
  }

  return survey
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
