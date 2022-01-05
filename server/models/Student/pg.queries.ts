/** Types generated for queries found in "server/models/Student/student.sql" */
import { PreparedQuery } from '@pgtyped/query'

/** 'GetGatesStudentById' parameters type */
export interface IGetGatesStudentByIdParams {
  userId: string
}

/** 'GetGatesStudentById' return type */
export interface IGetGatesStudentByIdResult {
  currentGrade: string
  id: string
  isPartnerSchool: boolean
  studentPartnerOrg: string
}

/** 'GetGatesStudentById' query type */
export interface IGetGatesStudentByIdQuery {
  params: IGetGatesStudentByIdParams
  result: IGetGatesStudentByIdResult
}

const getGatesStudentByIdIR: any = {
  name: 'getGatesStudentById',
  params: [
    {
      name: 'userId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 492, b: 498, line: 13, col: 31 }] },
    },
  ],
  usedParamSet: { userId: true },
  statement: {
    body:
      'SELECT\n  student_profiles.user_id as id,\n  grade_levels.name as current_grade,\n  student_partner_orgs.name as student_partner_org,\n  schools.partner as is_partner_school\nFROM\n  student_profiles\n  JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\n  JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id\n  JOIN schools ON student_profiles.school_id = schools.id\n WHERE\n  \tstudent_profiles.user_id = :userId!',
    loc: { a: 32, b: 498, line: 2, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   student_profiles.user_id as id,
 *   grade_levels.name as current_grade,
 *   student_partner_orgs.name as student_partner_org,
 *   schools.partner as is_partner_school
 * FROM
 *   student_profiles
 *   JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id
 *   JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id
 *   JOIN schools ON student_profiles.school_id = schools.id
 *  WHERE
 *   	student_profiles.user_id = :userId!
 * ```
 */
export const getGatesStudentById = new PreparedQuery<
  IGetGatesStudentByIdParams,
  IGetGatesStudentByIdResult
>(getGatesStudentByIdIR)

/** 'GetStudentContactInfoById' parameters type */
export interface IGetStudentContactInfoByIdParams {
  userId: string
}

/** 'GetStudentContactInfoById' return type */
export interface IGetStudentContactInfoByIdResult {
  email: string
  firstName: string
  id: string
}

/** 'GetStudentContactInfoById' query type */
export interface IGetStudentContactInfoByIdQuery {
  params: IGetStudentContactInfoByIdParams
  result: IGetStudentContactInfoByIdResult
}

const getStudentContactInfoByIdIR: any = {
  name: 'getStudentContactInfoById',
  params: [
    {
      name: 'userId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 660, b: 666, line: 16, col: 120 }] },
    },
  ],
  usedParamSet: { userId: true },
  statement: {
    body:
      'SELECT id, first_name, email FROM users WHERE banned is false AND deactivated is FALSE AND test_user is FALSE AND id = :userId!',
    loc: { a: 540, b: 666, line: 16, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * SELECT id, first_name, email FROM users WHERE banned is false AND deactivated is FALSE AND test_user is FALSE AND id = :userId!
 * ```
 */
export const getStudentContactInfoById = new PreparedQuery<
  IGetStudentContactInfoByIdParams,
  IGetStudentContactInfoByIdResult
>(getStudentContactInfoByIdIR)

/** 'IsTestUser' parameters type */
export interface IIsTestUserParams {
  userId: string
}

/** 'IsTestUser' return type */
export interface IIsTestUserResult {
  testUser: boolean
}

/** 'IsTestUser' query type */
export interface IIsTestUserQuery {
  params: IIsTestUserParams
  result: IIsTestUserResult
}

const isTestUserIR: any = {
  name: 'isTestUser',
  params: [
    {
      name: 'userId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 733, b: 739, line: 19, col: 40 }] },
    },
  ],
  usedParamSet: { userId: true },
  statement: {
    body: 'SELECT test_user FROM users WHERE id = :userId!',
    loc: { a: 693, b: 739, line: 19, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * SELECT test_user FROM users WHERE id = :userId!
 * ```
 */
export const isTestUser = new PreparedQuery<
  IIsTestUserParams,
  IIsTestUserResult
>(isTestUserIR)
