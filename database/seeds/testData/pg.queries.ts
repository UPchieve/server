/** Types generated for queries found in "database/seeds/testData/test_data.sql" */
import { PreparedQuery } from '@pgtyped/query'

export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [key: string]: Json }

/** 'InsertSchool' parameters type */
export interface IInsertSchoolParams {
  approved: boolean
  cityId: number
  id: string
  name: string
  partner: boolean
}

/** 'InsertSchool' return type */
export interface IInsertSchoolResult {
  ok: string
}

/** 'InsertSchool' query type */
export interface IInsertSchoolQuery {
  params: IInsertSchoolParams
  result: IInsertSchoolResult
}

const insertSchoolIR: any = {
  name: 'insertSchool',
  params: [
    {
      name: 'id',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 117, b: 119, line: 2, col: 92 }] },
    },
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 123, b: 127, line: 2, col: 98 }] },
    },
    {
      name: 'approved',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 131, b: 139, line: 2, col: 106 }] },
    },
    {
      name: 'partner',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 143, b: 150, line: 2, col: 118 }] },
    },
    {
      name: 'cityId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 154, b: 160, line: 2, col: 129 }] },
    },
  ],
  usedParamSet: {
    id: true,
    name: true,
    approved: true,
    partner: true,
    cityId: true,
  },
  statement: {
    body:
      'INSERT INTO schools (id, name, approved, partner, city_id, created_at, updated_at) VALUES (:id!, :name!, :approved!, :partner!, :cityId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok',
    loc: { a: 25, b: 217, line: 2, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO schools (id, name, approved, partner, city_id, created_at, updated_at) VALUES (:id!, :name!, :approved!, :partner!, :cityId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
 * ```
 */
export const insertSchool = new PreparedQuery<
  IInsertSchoolParams,
  IInsertSchoolResult
>(insertSchoolIR)

/** 'InsertStudentUser' parameters type */
export interface IInsertStudentUserParams {
  email: string
  firstName: string
  id: string
  lastName: string
  password: string
  referralCode: string
  verified: boolean
}

/** 'InsertStudentUser' return type */
export interface IInsertStudentUserResult {
  ok: string | null
}

/** 'InsertStudentUser' query type */
export interface IInsertStudentUserQuery {
  params: IInsertStudentUserParams
  result: IInsertStudentUserResult
}

const insertStudentUserIR: any = {
  name: 'insertStudentUser',
  params: [
    {
      name: 'id',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 385, b: 387, line: 7, col: 9 }] },
    },
    {
      name: 'email',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: {
        used: [
          { a: 391, b: 396, line: 7, col: 15 },
          { a: 601, b: 606, line: 20, col: 13 },
        ],
      },
    },
    {
      name: 'password',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 400, b: 408, line: 7, col: 24 }] },
    },
    {
      name: 'firstName',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 412, b: 421, line: 7, col: 36 }] },
    },
    {
      name: 'lastName',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 425, b: 433, line: 7, col: 49 }] },
    },
    {
      name: 'referralCode',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 437, b: 449, line: 7, col: 61 }] },
    },
    {
      name: 'verified',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 453, b: 461, line: 7, col: 77 }] },
    },
  ],
  usedParamSet: {
    id: true,
    email: true,
    password: true,
    firstName: true,
    lastName: true,
    referralCode: true,
    verified: true,
  },
  statement: {
    body:
      'WITH ins AS(\nINSERT INTO users (id, email, password, first_name, last_name, referral_code, verified, created_at, updated_at)\nVALUES (:id!, :email!, :password!, :firstName!, :lastName!, :referralCode!, :verified!, NOW(), NOW())\nON CONFLICT DO NOTHING\nRETURNING id AS ok)\nSELECT\n    *\nFROM\n    ins\nUNION\nSELECT\n    id\nFROM\n    users\nWHERE\n    email = :email!',
    loc: { a: 251, b: 606, line: 5, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 * INSERT INTO users (id, email, password, first_name, last_name, referral_code, verified, created_at, updated_at)
 * VALUES (:id!, :email!, :password!, :firstName!, :lastName!, :referralCode!, :verified!, NOW(), NOW())
 * ON CONFLICT DO NOTHING
 * RETURNING id AS ok)
 * SELECT
 *     *
 * FROM
 *     ins
 * UNION
 * SELECT
 *     id
 * FROM
 *     users
 * WHERE
 *     email = :email!
 * ```
 */
export const insertStudentUser = new PreparedQuery<
  IInsertStudentUserParams,
  IInsertStudentUserResult
>(insertStudentUserIR)

/** 'InsertStudentProfile' parameters type */
export interface IInsertStudentProfileParams {
  schoolId: string | null | void
  studentPartnerOrgId: string | null | void
  userId: string
}

/** 'InsertStudentProfile' return type */
export interface IInsertStudentProfileResult {
  ok: string
}

/** 'InsertStudentProfile' query type */
export interface IInsertStudentProfileQuery {
  params: IInsertStudentProfileParams
  result: IInsertStudentProfileResult
}

const insertStudentProfileIR: any = {
  name: 'insertStudentProfile',
  params: [
    {
      name: 'userId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 751, b: 757, line: 24, col: 107 }] },
    },
    {
      name: 'studentPartnerOrgId',
      required: false,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 761, b: 779, line: 24, col: 117 }] },
    },
    {
      name: 'schoolId',
      required: false,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 783, b: 790, line: 24, col: 139 }] },
    },
  ],
  usedParamSet: { userId: true, studentPartnerOrgId: true, schoolId: true },
  statement: {
    body:
      'INSERT INTO student_profiles (user_id, student_partner_org_id, school_id, created_at, updated_at) VALUES (:userId!, :studentPartnerOrgId, :schoolId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok',
    loc: { a: 644, b: 852, line: 24, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_profiles (user_id, student_partner_org_id, school_id, created_at, updated_at) VALUES (:userId!, :studentPartnerOrgId, :schoolId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok
 * ```
 */
export const insertStudentProfile = new PreparedQuery<
  IInsertStudentProfileParams,
  IInsertStudentProfileResult
>(insertStudentProfileIR)

/** 'InsertVolunteerUser' parameters type */
export interface IInsertVolunteerUserParams {
  email: string
  firstName: string
  id: string
  lastName: string
  password: string
  phone: string
  referralCode: string
  testUser: boolean
  timeTutored: string
  verified: boolean
}

/** 'InsertVolunteerUser' return type */
export interface IInsertVolunteerUserResult {
  ok: string | null
}

/** 'InsertVolunteerUser' query type */
export interface IInsertVolunteerUserQuery {
  params: IInsertVolunteerUserParams
  result: IInsertVolunteerUserResult
}

const insertVolunteerUserIR: any = {
  name: 'insertVolunteerUser',
  params: [
    {
      name: 'id',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1055, b: 1057, line: 29, col: 9 }] },
    },
    {
      name: 'email',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: {
        used: [
          { a: 1061, b: 1066, line: 29, col: 15 },
          { a: 1307, b: 1312, line: 42, col: 13 },
        ],
      },
    },
    {
      name: 'phone',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1070, b: 1075, line: 29, col: 24 }] },
    },
    {
      name: 'password',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1079, b: 1087, line: 29, col: 33 }] },
    },
    {
      name: 'firstName',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1091, b: 1100, line: 29, col: 45 }] },
    },
    {
      name: 'lastName',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1104, b: 1112, line: 29, col: 58 }] },
    },
    {
      name: 'referralCode',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1116, b: 1128, line: 29, col: 70 }] },
    },
    {
      name: 'verified',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1132, b: 1140, line: 29, col: 86 }] },
    },
    {
      name: 'testUser',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1144, b: 1152, line: 29, col: 98 }] },
    },
    {
      name: 'timeTutored',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1156, b: 1167, line: 29, col: 110 }] },
    },
  ],
  usedParamSet: {
    id: true,
    email: true,
    phone: true,
    password: true,
    firstName: true,
    lastName: true,
    referralCode: true,
    verified: true,
    testUser: true,
    timeTutored: true,
  },
  statement: {
    body:
      'WITH ins AS (\nINSERT INTO users (id, email, phone, password, first_name, last_name, referral_code, verified, test_user, time_tutored, created_at, updated_at)\nVALUES (:id!, :email!, :phone!, :password!, :firstName!, :lastName!, :referralCode!, :verified!, :testUser!, :timeTutored!, NOW(), NOW())\nON CONFLICT DO NOTHING\nRETURNING id AS ok)\nSELECT\n    *\nFROM\n    ins\nUNION\nSELECT\n    id\nFROM\n    users\nWHERE\n    email = :email!',
    loc: { a: 888, b: 1312, line: 27, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS (
 * INSERT INTO users (id, email, phone, password, first_name, last_name, referral_code, verified, test_user, time_tutored, created_at, updated_at)
 * VALUES (:id!, :email!, :phone!, :password!, :firstName!, :lastName!, :referralCode!, :verified!, :testUser!, :timeTutored!, NOW(), NOW())
 * ON CONFLICT DO NOTHING
 * RETURNING id AS ok)
 * SELECT
 *     *
 * FROM
 *     ins
 * UNION
 * SELECT
 *     id
 * FROM
 *     users
 * WHERE
 *     email = :email!
 * ```
 */
export const insertVolunteerUser = new PreparedQuery<
  IInsertVolunteerUserParams,
  IInsertVolunteerUserResult
>(insertVolunteerUserIR)

/** 'InsertUserSessionMetrics' parameters type */
export interface IInsertUserSessionMetricsParams {
  id: string
}

/** 'InsertUserSessionMetrics' return type */
export interface IInsertUserSessionMetricsResult {
  ok: string
}

/** 'InsertUserSessionMetrics' query type */
export interface IInsertUserSessionMetricsQuery {
  params: IInsertUserSessionMetricsParams
  result: IInsertUserSessionMetricsResult
}

const insertUserSessionMetricsIR: any = {
  name: 'insertUserSessionMetrics',
  params: [
    {
      name: 'id',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1428, b: 1430, line: 46, col: 9 }] },
    },
  ],
  usedParamSet: { id: true },
  statement: {
    body:
      'INSERT INTO user_session_metrics(user_id, created_at, updated_at)\nVALUES (:id!, NOW(), NOW())\nRETURNING user_id AS ok',
    loc: { a: 1353, b: 1469, line: 45, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_session_metrics(user_id, created_at, updated_at)
 * VALUES (:id!, NOW(), NOW())
 * RETURNING user_id AS ok
 * ```
 */
export const insertUserSessionMetrics = new PreparedQuery<
  IInsertUserSessionMetricsParams,
  IInsertUserSessionMetricsResult
>(insertUserSessionMetricsIR)

/** 'InsertVolunteerProfile' parameters type */
export interface IInsertVolunteerProfileParams {
  approved: boolean
  college: string
  onboarded: boolean
  timezone: string
  userId: string
  volunteerPartnerOrgId: string | null | void
}

/** 'InsertVolunteerProfile' return type */
export interface IInsertVolunteerProfileResult {
  ok: string
}

/** 'InsertVolunteerProfile' query type */
export interface IInsertVolunteerProfileQuery {
  params: IInsertVolunteerProfileParams
  result: IInsertVolunteerProfileResult
}

const insertVolunteerProfileIR: any = {
  name: 'insertVolunteerProfile',
  params: [
    {
      name: 'userId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1648, b: 1654, line: 50, col: 140 }] },
    },
    {
      name: 'timezone',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1658, b: 1666, line: 50, col: 150 }] },
    },
    {
      name: 'approved',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1670, b: 1678, line: 50, col: 162 }] },
    },
    {
      name: 'onboarded',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1682, b: 1691, line: 50, col: 174 }] },
    },
    {
      name: 'college',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1695, b: 1702, line: 50, col: 187 }] },
    },
    {
      name: 'volunteerPartnerOrgId',
      required: false,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1706, b: 1726, line: 50, col: 198 }] },
    },
  ],
  usedParamSet: {
    userId: true,
    timezone: true,
    approved: true,
    onboarded: true,
    college: true,
    volunteerPartnerOrgId: true,
  },
  statement: {
    body:
      'INSERT INTO volunteer_profiles (user_id, timezone, approved, onboarded, college, volunteer_partner_org_id, created_at, updated_at) VALUES (:userId!, :timezone!, :approved!, :onboarded!, :college!, :volunteerPartnerOrgId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok',
    loc: { a: 1508, b: 1788, line: 50, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO volunteer_profiles (user_id, timezone, approved, onboarded, college, volunteer_partner_org_id, created_at, updated_at) VALUES (:userId!, :timezone!, :approved!, :onboarded!, :college!, :volunteerPartnerOrgId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok
 * ```
 */
export const insertVolunteerProfile = new PreparedQuery<
  IInsertVolunteerProfileParams,
  IInsertVolunteerProfileResult
>(insertVolunteerProfileIR)

/** 'InsertUserCertification' parameters type */
export interface IInsertUserCertificationParams {
  certificationId: number
  userId: string
}

/** 'InsertUserCertification' return type */
export interface IInsertUserCertificationResult {
  ok: string
}

/** 'InsertUserCertification' query type */
export interface IInsertUserCertificationQuery {
  params: IInsertUserCertificationParams
  result: IInsertUserCertificationResult
}

const insertUserCertificationIR: any = {
  name: 'insertUserCertification',
  params: [
    {
      name: 'userId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1922, b: 1928, line: 53, col: 94 }] },
    },
    {
      name: 'certificationId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1932, b: 1947, line: 53, col: 104 }] },
    },
  ],
  usedParamSet: { userId: true, certificationId: true },
  statement: {
    body:
      'INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at) VALUES (:userId!, :certificationId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok',
    loc: { a: 1828, b: 2009, line: 53, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at) VALUES (:userId!, :certificationId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok
 * ```
 */
export const insertUserCertification = new PreparedQuery<
  IInsertUserCertificationParams,
  IInsertUserCertificationResult
>(insertUserCertificationIR)

/** 'InsertIntoUserQuizzes' parameters type */
export interface IInsertIntoUserQuizzesParams {
  attempts: number
  passed: boolean
  quizId: number
  userId: string
}

/** 'InsertIntoUserQuizzes' return type */
export interface IInsertIntoUserQuizzesResult {
  ok: string
}

/** 'InsertIntoUserQuizzes' query type */
export interface IInsertIntoUserQuizzesQuery {
  params: IInsertIntoUserQuizzesParams
  result: IInsertIntoUserQuizzesResult
}

const insertIntoUserQuizzesIR: any = {
  name: 'insertIntoUserQuizzes',
  params: [
    {
      name: 'userId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 2143, b: 2149, line: 56, col: 96 }] },
    },
    {
      name: 'quizId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 2153, b: 2159, line: 56, col: 106 }] },
    },
    {
      name: 'attempts',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 2163, b: 2171, line: 56, col: 116 }] },
    },
    {
      name: 'passed',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 2175, b: 2181, line: 56, col: 128 }] },
    },
  ],
  usedParamSet: { userId: true, quizId: true, attempts: true, passed: true },
  statement: {
    body:
      'INSERT INTO users_quizzes (user_id, quiz_id, attempts, passed, created_at, updated_at) VALUES (:userId!, :quizId!, :attempts!, :passed!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok',
    loc: { a: 2047, b: 2243, line: 56, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_quizzes (user_id, quiz_id, attempts, passed, created_at, updated_at) VALUES (:userId!, :quizId!, :attempts!, :passed!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok
 * ```
 */
export const insertIntoUserQuizzes = new PreparedQuery<
  IInsertIntoUserQuizzesParams,
  IInsertIntoUserQuizzesResult
>(insertIntoUserQuizzesIR)

/** 'InsertAdminProfile' parameters type */
export interface IInsertAdminProfileParams {
  userId: string
}

/** 'InsertAdminProfile' return type */
export interface IInsertAdminProfileResult {
  ok: string
}

/** 'InsertAdminProfile' query type */
export interface IInsertAdminProfileQuery {
  params: IInsertAdminProfileParams
  result: IInsertAdminProfileResult
}

const insertAdminProfileIR: any = {
  name: 'insertAdminProfile',
  params: [
    {
      name: 'userId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 2348, b: 2354, line: 59, col: 70 }] },
    },
  ],
  usedParamSet: { userId: true },
  statement: {
    body:
      'INSERT INTO admin_profiles (user_id, created_at, updated_at) VALUES (:userId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok',
    loc: { a: 2278, b: 2416, line: 59, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO admin_profiles (user_id, created_at, updated_at) VALUES (:userId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok
 * ```
 */
export const insertAdminProfile = new PreparedQuery<
  IInsertAdminProfileParams,
  IInsertAdminProfileResult
>(insertAdminProfileIR)

/** 'InsertSession' parameters type */
export interface IInsertSessionParams {
  id: string
  studentId: string
  subjectId: number
  volunteerId: string
}

/** 'InsertSession' return type */
export interface IInsertSessionResult {
  ok: string
}

/** 'InsertSession' query type */
export interface IInsertSessionQuery {
  params: IInsertSessionParams
  result: IInsertSessionResult
}

const insertSessionIR: any = {
  name: 'insertSession',
  params: [
    {
      name: 'id',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 2543, b: 2545, line: 62, col: 97 }] },
    },
    {
      name: 'studentId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 2549, b: 2558, line: 62, col: 103 }] },
    },
    {
      name: 'volunteerId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 2562, b: 2573, line: 62, col: 116 }] },
    },
    {
      name: 'subjectId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 2577, b: 2586, line: 62, col: 131 }] },
    },
  ],
  usedParamSet: {
    id: true,
    studentId: true,
    volunteerId: true,
    subjectId: true,
  },
  statement: {
    body:
      'INSERT INTO sessions (id, student_id, volunteer_id, subject_id, created_at, updated_at) VALUES (:id!, :studentId!, :volunteerId!, :subjectId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok',
    loc: { a: 2446, b: 2643, line: 62, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO sessions (id, student_id, volunteer_id, subject_id, created_at, updated_at) VALUES (:id!, :studentId!, :volunteerId!, :subjectId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
 * ```
 */
export const insertSession = new PreparedQuery<
  IInsertSessionParams,
  IInsertSessionResult
>(insertSessionIR)

/** 'InsertStudentFavoriteVolunteers' parameters type */
export interface IInsertStudentFavoriteVolunteersParams {
  studentId: string
  volunteerId: string
}

/** 'InsertStudentFavoriteVolunteers' return type */
export interface IInsertStudentFavoriteVolunteersResult {
  ok: string
}

/** 'InsertStudentFavoriteVolunteers' query type */
export interface IInsertStudentFavoriteVolunteersQuery {
  params: IInsertStudentFavoriteVolunteersParams
  result: IInsertStudentFavoriteVolunteersResult
}

const insertStudentFavoriteVolunteersIR: any = {
  name: 'insertStudentFavoriteVolunteers',
  params: [
    {
      name: 'studentId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 2791, b: 2800, line: 65, col: 100 }] },
    },
    {
      name: 'volunteerId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 2804, b: 2815, line: 65, col: 113 }] },
    },
  ],
  usedParamSet: { studentId: true, volunteerId: true },
  statement: {
    body:
      'INSERT INTO student_favorite_volunteers (student_id, volunteer_id, created_at, updated_at) VALUES (:studentId!, :volunteerId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING student_id AS ok',
    loc: { a: 2691, b: 2880, line: 65, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_favorite_volunteers (student_id, volunteer_id, created_at, updated_at) VALUES (:studentId!, :volunteerId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING student_id AS ok
 * ```
 */
export const insertStudentFavoriteVolunteers = new PreparedQuery<
  IInsertStudentFavoriteVolunteersParams,
  IInsertStudentFavoriteVolunteersResult
>(insertStudentFavoriteVolunteersIR)

/** 'GetVolunteerPartnerOrgs' parameters type */
export type IGetVolunteerPartnerOrgsParams = void

/** 'GetVolunteerPartnerOrgs' return type */
export interface IGetVolunteerPartnerOrgsResult {
  id: string
  name: string
}

/** 'GetVolunteerPartnerOrgs' query type */
export interface IGetVolunteerPartnerOrgsQuery {
  params: IGetVolunteerPartnerOrgsParams
  result: IGetVolunteerPartnerOrgsResult
}

const getVolunteerPartnerOrgsIR: any = {
  name: 'getVolunteerPartnerOrgs',
  params: [],
  usedParamSet: {},
  statement: {
    body: 'SELECT\n  id,\n  key AS name\nFROM volunteer_partner_orgs',
    loc: { a: 2920, b: 2973, line: 68, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   id,
 *   key AS name
 * FROM volunteer_partner_orgs
 * ```
 */
export const getVolunteerPartnerOrgs = new PreparedQuery<
  IGetVolunteerPartnerOrgsParams,
  IGetVolunteerPartnerOrgsResult
>(getVolunteerPartnerOrgsIR)

/** 'GetStudentPartnerOrgs' parameters type */
export type IGetStudentPartnerOrgsParams = void

/** 'GetStudentPartnerOrgs' return type */
export interface IGetStudentPartnerOrgsResult {
  id: string
  name: string
}

/** 'GetStudentPartnerOrgs' query type */
export interface IGetStudentPartnerOrgsQuery {
  params: IGetStudentPartnerOrgsParams
  result: IGetStudentPartnerOrgsResult
}

const getStudentPartnerOrgsIR: any = {
  name: 'getStudentPartnerOrgs',
  params: [],
  usedParamSet: {},
  statement: {
    body: 'SELECT\n  id,\n  key AS name\nFROM student_partner_orgs',
    loc: { a: 3011, b: 3062, line: 74, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   id,
 *   key AS name
 * FROM student_partner_orgs
 * ```
 */
export const getStudentPartnerOrgs = new PreparedQuery<
  IGetStudentPartnerOrgsParams,
  IGetStudentPartnerOrgsResult
>(getStudentPartnerOrgsIR)

/** 'GetCertifications' parameters type */
export type IGetCertificationsParams = void

/** 'GetCertifications' return type */
export interface IGetCertificationsResult {
  id: number
  name: string
}

/** 'GetCertifications' query type */
export interface IGetCertificationsQuery {
  params: IGetCertificationsParams
  result: IGetCertificationsResult
}

const getCertificationsIR: any = {
  name: 'getCertifications',
  params: [],
  usedParamSet: {},
  statement: {
    body: 'SELECT id, name FROM certifications',
    loc: { a: 3096, b: 3130, line: 80, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * SELECT id, name FROM certifications
 * ```
 */
export const getCertifications = new PreparedQuery<
  IGetCertificationsParams,
  IGetCertificationsResult
>(getCertificationsIR)

/** 'GetQuizzes' parameters type */
export type IGetQuizzesParams = void

/** 'GetQuizzes' return type */
export interface IGetQuizzesResult {
  id: number
  name: string
}

/** 'GetQuizzes' query type */
export interface IGetQuizzesQuery {
  params: IGetQuizzesParams
  result: IGetQuizzesResult
}

const getQuizzesIR: any = {
  name: 'getQuizzes',
  params: [],
  usedParamSet: {},
  statement: {
    body: 'SELECT id, name FROM quizzes',
    loc: { a: 3157, b: 3184, line: 83, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * SELECT id, name FROM quizzes
 * ```
 */
export const getQuizzes = new PreparedQuery<
  IGetQuizzesParams,
  IGetQuizzesResult
>(getQuizzesIR)

/** 'GetAlgebraOneSubcategories' parameters type */
export type IGetAlgebraOneSubcategoriesParams = void

/** 'GetAlgebraOneSubcategories' return type */
export interface IGetAlgebraOneSubcategoriesResult {
  id: number
  name: string
}

/** 'GetAlgebraOneSubcategories' query type */
export interface IGetAlgebraOneSubcategoriesQuery {
  params: IGetAlgebraOneSubcategoriesParams
  result: IGetAlgebraOneSubcategoriesResult
}

const getAlgebraOneSubcategoriesIR: any = {
  name: 'getAlgebraOneSubcategories',
  params: [],
  usedParamSet: {},
  statement: {
    body:
      "SELECT qs.id, qs.name FROM quiz_subcategories qs JOIN quizzes q ON q.id = qs.quiz_id WHERE q.name = 'algebraOne'",
    loc: { a: 3227, b: 3338, line: 86, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * SELECT qs.id, qs.name FROM quiz_subcategories qs JOIN quizzes q ON q.id = qs.quiz_id WHERE q.name = 'algebraOne'
 * ```
 */
export const getAlgebraOneSubcategories = new PreparedQuery<
  IGetAlgebraOneSubcategoriesParams,
  IGetAlgebraOneSubcategoriesResult
>(getAlgebraOneSubcategoriesIR)

/** 'InsertQuizQuestion' parameters type */
export interface IInsertQuizQuestionParams {
  correctAnswer: string
  possibleAnswers: Json
  questionText: string
  quizSubcategoryId: number
}

/** 'InsertQuizQuestion' return type */
export interface IInsertQuizQuestionResult {
  ok: number
}

/** 'InsertQuizQuestion' query type */
export interface IInsertQuizQuestionQuery {
  params: IInsertQuizQuestionParams
  result: IInsertQuizQuestionResult
}

const insertQuizQuestionIR: any = {
  name: 'insertQuizQuestion',
  params: [
    {
      name: 'questionText',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 3504, b: 3516, line: 90, col: 9 }] },
    },
    {
      name: 'possibleAnswers',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 3520, b: 3535, line: 90, col: 25 }] },
    },
    {
      name: 'correctAnswer',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 3539, b: 3552, line: 90, col: 44 }] },
    },
    {
      name: 'quizSubcategoryId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 3556, b: 3573, line: 90, col: 61 }] },
    },
  ],
  usedParamSet: {
    questionText: true,
    possibleAnswers: true,
    correctAnswer: true,
    quizSubcategoryId: true,
  },
  statement: {
    body:
      'INSERT INTO quiz_questions (question_text, possible_answers, correct_answer, quiz_subcategory_id, created_at, updated_at)\nVALUES (:questionText!, :possibleAnswers!, :correctAnswer!, :quizSubcategoryId!, NOW(), NOW())\nRETURNING id AS ok',
    loc: { a: 3373, b: 3607, line: 89, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO quiz_questions (question_text, possible_answers, correct_answer, quiz_subcategory_id, created_at, updated_at)
 * VALUES (:questionText!, :possibleAnswers!, :correctAnswer!, :quizSubcategoryId!, NOW(), NOW())
 * RETURNING id AS ok
 * ```
 */
export const insertQuizQuestion = new PreparedQuery<
  IInsertQuizQuestionParams,
  IInsertQuizQuestionResult
>(insertQuizQuestionIR)

/** 'InsertCity' parameters type */
export interface IInsertCityParams {
  name: string
  usStateCode: string
}

/** 'InsertCity' return type */
export interface IInsertCityResult {
  ok: number
}

/** 'InsertCity' query type */
export interface IInsertCityQuery {
  params: IInsertCityParams
  result: IInsertCityResult
}

const insertCityIR: any = {
  name: 'insertCity',
  params: [
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 3708, b: 3712, line: 95, col: 9 }] },
    },
    {
      name: 'usStateCode',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 3716, b: 3727, line: 95, col: 17 }] },
    },
  ],
  usedParamSet: { name: true, usStateCode: true },
  statement: {
    body:
      'INSERT INTO cities (name, us_state_code, created_at, updated_at)\nVALUES (:name!, :usStateCode!, NOW(), NOW())\nRETURNING id as ok',
    loc: { a: 3634, b: 3761, line: 94, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO cities (name, us_state_code, created_at, updated_at)
 * VALUES (:name!, :usStateCode!, NOW(), NOW())
 * RETURNING id as ok
 * ```
 */
export const insertCity = new PreparedQuery<
  IInsertCityParams,
  IInsertCityResult
>(insertCityIR)

/** 'InsertUserProductFlags' parameters type */
export interface IInsertUserProductFlagsParams {
  id: string
}

/** 'InsertUserProductFlags' return type */
export interface IInsertUserProductFlagsResult {
  ok: string
}

/** 'InsertUserProductFlags' query type */
export interface IInsertUserProductFlagsQuery {
  params: IInsertUserProductFlagsParams
  result: IInsertUserProductFlagsResult
}

const insertUserProductFlagsIR: any = {
  name: 'insertUserProductFlags',
  params: [
    {
      name: 'id',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 3875, b: 3877, line: 101, col: 9 }] },
    },
  ],
  usedParamSet: { id: true },
  statement: {
    body:
      'INSERT INTO user_product_flags (user_id, created_at, updated_at)\nVALUES (:id!, NOW(), NOW())\nRETURNING user_id AS ok',
    loc: { a: 3801, b: 3916, line: 100, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_product_flags (user_id, created_at, updated_at)
 * VALUES (:id!, NOW(), NOW())
 * RETURNING user_id AS ok
 * ```
 */
export const insertUserProductFlags = new PreparedQuery<
  IInsertUserProductFlagsParams,
  IInsertUserProductFlagsResult
>(insertUserProductFlagsIR)

/** 'InsertSchoolStudentPartners' parameters type */
export interface IInsertSchoolStudentPartnersParams {
  schoolName: string
}

/** 'InsertSchoolStudentPartners' return type */
export interface IInsertSchoolStudentPartnersResult {
  ok: string
}

/** 'InsertSchoolStudentPartners' query type */
export interface IInsertSchoolStudentPartnersQuery {
  params: IInsertSchoolStudentPartnersParams
  result: IInsertSchoolStudentPartnersResult
}

const insertSchoolStudentPartnersIR: any = {
  name: 'insertSchoolStudentPartners',
  params: [
    {
      name: 'schoolName',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 4398, b: 4408, line: 122, col: 16 }] },
    },
  ],
  usedParamSet: { schoolName: true },
  statement: {
    body:
      "INSERT INTO student_partner_orgs (id, KEY, name, signup_code, high_school_signup, college_signup, school_signup_required, school_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    TRANSLATE(BTRIM(LOWER(schools.name)), ' ', '-'),\n    schools.name,\n    TRANSLATE(BTRIM(UPPER(schools.name)), ' ', '-'),\n    TRUE,\n    FALSE,\n    TRUE,\n    schools.id,\n    NOW(),\n    NOW()\nFROM\n    schools\nWHERE\n    partner IS TRUE\n    AND name = :schoolName!\n    RETURNING id as ok",
    loc: { a: 3961, b: 4431, line: 106, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_partner_orgs (id, KEY, name, signup_code, high_school_signup, college_signup, school_signup_required, school_id, created_at, updated_at)
 * SELECT
 *     generate_ulid (),
 *     TRANSLATE(BTRIM(LOWER(schools.name)), ' ', '-'),
 *     schools.name,
 *     TRANSLATE(BTRIM(UPPER(schools.name)), ' ', '-'),
 *     TRUE,
 *     FALSE,
 *     TRUE,
 *     schools.id,
 *     NOW(),
 *     NOW()
 * FROM
 *     schools
 * WHERE
 *     partner IS TRUE
 *     AND name = :schoolName!
 *     RETURNING id as ok
 * ```
 */
export const insertSchoolStudentPartners = new PreparedQuery<
  IInsertSchoolStudentPartnersParams,
  IInsertSchoolStudentPartnersResult
>(insertSchoolStudentPartnersIR)
