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
      codeRefs: { used: [{ a: 121, b: 123, line: 3, col: 13 }] },
    },
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 127, b: 131, line: 3, col: 19 }] },
    },
    {
      name: 'approved',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 135, b: 143, line: 3, col: 27 }] },
    },
    {
      name: 'partner',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 147, b: 154, line: 3, col: 39 }] },
    },
    {
      name: 'cityId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 158, b: 164, line: 3, col: 50 }] },
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
      'INSERT INTO schools (id, name, approved, partner, city_id, created_at, updated_at)\n    VALUES (:id!, :name!, :approved!, :partner!, :cityId!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    id AS ok',
    loc: { a: 25, b: 229, line: 2, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO schools (id, name, approved, partner, city_id, created_at, updated_at)
 *     VALUES (:id!, :name!, :approved!, :partner!, :cityId!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     id AS ok
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
      codeRefs: { used: [{ a: 407, b: 409, line: 13, col: 17 }] },
    },
    {
      name: 'email',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: {
        used: [
          { a: 413, b: 418, line: 13, col: 23 },
          { a: 691, b: 696, line: 28, col: 17 },
        ],
      },
    },
    {
      name: 'password',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 422, b: 430, line: 13, col: 32 }] },
    },
    {
      name: 'firstName',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 434, b: 443, line: 13, col: 44 }] },
    },
    {
      name: 'lastName',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 447, b: 455, line: 13, col: 57 }] },
    },
    {
      name: 'referralCode',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 459, b: 471, line: 13, col: 69 }] },
    },
    {
      name: 'verified',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 475, b: 483, line: 13, col: 85 }] },
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
      'WITH ins AS (\nINSERT INTO users (id, email, PASSWORD, first_name, last_name, referral_code, verified, created_at, updated_at)\n        VALUES (:id!, :email!, :password!, :firstName!, :lastName!, :referralCode!, :verified!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok)\n    SELECT\n        *\n    FROM\n        ins\n    UNION\n    SELECT\n        id\n    FROM\n        users\n    WHERE\n        email = :email!',
    loc: { a: 264, b: 696, line: 11, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS (
 * INSERT INTO users (id, email, PASSWORD, first_name, last_name, referral_code, verified, created_at, updated_at)
 *         VALUES (:id!, :email!, :password!, :firstName!, :lastName!, :referralCode!, :verified!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok)
 *     SELECT
 *         *
 *     FROM
 *         ins
 *     UNION
 *     SELECT
 *         id
 *     FROM
 *         users
 *     WHERE
 *         email = :email!
 * ```
 */
export const insertStudentUser = new PreparedQuery<
  IInsertStudentUserParams,
  IInsertStudentUserResult
>(insertStudentUserIR)

/** 'InsertStudentProfile' parameters type */
export interface IInsertStudentProfileParams {
  gradeLevelId: number | null | void
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
      codeRefs: { used: [{ a: 861, b: 867, line: 33, col: 13 }] },
    },
    {
      name: 'studentPartnerOrgId',
      required: false,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 871, b: 889, line: 33, col: 23 }] },
    },
    {
      name: 'schoolId',
      required: false,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 893, b: 900, line: 33, col: 45 }] },
    },
    {
      name: 'gradeLevelId',
      required: false,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 904, b: 915, line: 33, col: 56 }] },
    },
  ],
  usedParamSet: {
    userId: true,
    studentPartnerOrgId: true,
    schoolId: true,
    gradeLevelId: true,
  },
  statement: {
    body:
      'INSERT INTO student_profiles (user_id, student_partner_org_id, school_id, grade_level_id, created_at, updated_at)\n    VALUES (:userId!, :studentPartnerOrgId, :schoolId, :gradeLevelId, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    user_id AS ok',
    loc: { a: 734, b: 985, line: 32, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_profiles (user_id, student_partner_org_id, school_id, grade_level_id, created_at, updated_at)
 *     VALUES (:userId!, :studentPartnerOrgId, :schoolId, :gradeLevelId, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     user_id AS ok
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
      codeRefs: { used: [{ a: 1197, b: 1199, line: 43, col: 17 }] },
    },
    {
      name: 'email',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: {
        used: [
          { a: 1203, b: 1208, line: 43, col: 23 },
          { a: 1517, b: 1522, line: 58, col: 17 },
        ],
      },
    },
    {
      name: 'phone',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1212, b: 1217, line: 43, col: 32 }] },
    },
    {
      name: 'password',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1221, b: 1229, line: 43, col: 41 }] },
    },
    {
      name: 'firstName',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1233, b: 1242, line: 43, col: 53 }] },
    },
    {
      name: 'lastName',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1246, b: 1254, line: 43, col: 66 }] },
    },
    {
      name: 'referralCode',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1258, b: 1270, line: 43, col: 78 }] },
    },
    {
      name: 'verified',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1274, b: 1282, line: 43, col: 94 }] },
    },
    {
      name: 'testUser',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1286, b: 1294, line: 43, col: 106 }] },
    },
    {
      name: 'timeTutored',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1298, b: 1309, line: 43, col: 118 }] },
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
      'WITH ins AS (\nINSERT INTO users (id, email, phone, PASSWORD, first_name, last_name, referral_code, verified, test_user, time_tutored, created_at, updated_at)\n        VALUES (:id!, :email!, :phone!, :password!, :firstName!, :lastName!, :referralCode!, :verified!, :testUser!, :timeTutored!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok)\n    SELECT\n        *\n    FROM\n        ins\n    UNION\n    SELECT\n        id\n    FROM\n        users\n    WHERE\n        email = :email!',
    loc: { a: 1022, b: 1522, line: 41, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS (
 * INSERT INTO users (id, email, phone, PASSWORD, first_name, last_name, referral_code, verified, test_user, time_tutored, created_at, updated_at)
 *         VALUES (:id!, :email!, :phone!, :password!, :firstName!, :lastName!, :referralCode!, :verified!, :testUser!, :timeTutored!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok)
 *     SELECT
 *         *
 *     FROM
 *         ins
 *     UNION
 *     SELECT
 *         id
 *     FROM
 *         users
 *     WHERE
 *         email = :email!
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
      codeRefs: { used: [{ a: 1644, b: 1646, line: 63, col: 13 }] },
    },
  ],
  usedParamSet: { id: true },
  statement: {
    body:
      'INSERT INTO user_session_metrics (user_id, created_at, updated_at)\n    VALUES (:id!, NOW(), NOW())\nRETURNING\n    user_id AS ok',
    loc: { a: 1564, b: 1689, line: 62, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_session_metrics (user_id, created_at, updated_at)
 *     VALUES (:id!, NOW(), NOW())
 * RETURNING
 *     user_id AS ok
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
      codeRefs: { used: [{ a: 1873, b: 1879, line: 70, col: 13 }] },
    },
    {
      name: 'timezone',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1883, b: 1891, line: 70, col: 23 }] },
    },
    {
      name: 'approved',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1895, b: 1903, line: 70, col: 35 }] },
    },
    {
      name: 'onboarded',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1907, b: 1916, line: 70, col: 47 }] },
    },
    {
      name: 'college',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1920, b: 1927, line: 70, col: 60 }] },
    },
    {
      name: 'volunteerPartnerOrgId',
      required: false,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 1931, b: 1951, line: 70, col: 71 }] },
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
      'INSERT INTO volunteer_profiles (user_id, timezone, approved, onboarded, college, volunteer_partner_org_id, created_at, updated_at)\n    VALUES (:userId!, :timezone!, :approved!, :onboarded!, :college!, :volunteerPartnerOrgId, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    user_id AS ok',
    loc: { a: 1729, b: 2021, line: 69, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO volunteer_profiles (user_id, timezone, approved, onboarded, college, volunteer_partner_org_id, created_at, updated_at)
 *     VALUES (:userId!, :timezone!, :approved!, :onboarded!, :college!, :volunteerPartnerOrgId, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     user_id AS ok
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
      codeRefs: { used: [{ a: 2160, b: 2166, line: 79, col: 13 }] },
    },
    {
      name: 'certificationId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 2170, b: 2185, line: 79, col: 23 }] },
    },
  ],
  usedParamSet: { userId: true, certificationId: true },
  statement: {
    body:
      'INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at)\n    VALUES (:userId!, :certificationId!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    user_id AS ok',
    loc: { a: 2062, b: 2255, line: 78, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at)
 *     VALUES (:userId!, :certificationId!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     user_id AS ok
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
      codeRefs: { used: [{ a: 2394, b: 2400, line: 88, col: 13 }] },
    },
    {
      name: 'quizId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 2404, b: 2410, line: 88, col: 23 }] },
    },
    {
      name: 'attempts',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 2414, b: 2422, line: 88, col: 33 }] },
    },
    {
      name: 'passed',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 2426, b: 2432, line: 88, col: 45 }] },
    },
  ],
  usedParamSet: { userId: true, quizId: true, attempts: true, passed: true },
  statement: {
    body:
      'INSERT INTO users_quizzes (user_id, quiz_id, attempts, passed, created_at, updated_at)\n    VALUES (:userId!, :quizId!, :attempts!, :passed!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    user_id AS ok',
    loc: { a: 2294, b: 2502, line: 87, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_quizzes (user_id, quiz_id, attempts, passed, created_at, updated_at)
 *     VALUES (:userId!, :quizId!, :attempts!, :passed!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     user_id AS ok
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
      codeRefs: { used: [{ a: 2612, b: 2618, line: 97, col: 13 }] },
    },
  ],
  usedParamSet: { userId: true },
  statement: {
    body:
      'INSERT INTO admin_profiles (user_id, created_at, updated_at)\n    VALUES (:userId!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    user_id AS ok',
    loc: { a: 2538, b: 2688, line: 96, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO admin_profiles (user_id, created_at, updated_at)
 *     VALUES (:userId!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     user_id AS ok
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
      codeRefs: { used: [{ a: 2820, b: 2822, line: 106, col: 13 }] },
    },
    {
      name: 'studentId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 2826, b: 2835, line: 106, col: 19 }] },
    },
    {
      name: 'volunteerId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 2839, b: 2850, line: 106, col: 32 }] },
    },
    {
      name: 'subjectId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 2854, b: 2863, line: 106, col: 47 }] },
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
      'INSERT INTO sessions (id, student_id, volunteer_id, subject_id, created_at, updated_at)\n    VALUES (:id!, :studentId!, :volunteerId!, :subjectId!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    id AS ok',
    loc: { a: 2719, b: 2928, line: 105, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO sessions (id, student_id, volunteer_id, subject_id, created_at, updated_at)
 *     VALUES (:id!, :studentId!, :volunteerId!, :subjectId!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     id AS ok
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
      codeRefs: { used: [{ a: 3081, b: 3090, line: 115, col: 13 }] },
    },
    {
      name: 'volunteerId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 3094, b: 3105, line: 115, col: 26 }] },
    },
  ],
  usedParamSet: { studentId: true, volunteerId: true },
  statement: {
    body:
      'INSERT INTO student_favorite_volunteers (student_id, volunteer_id, created_at, updated_at)\n    VALUES (:studentId!, :volunteerId!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING\nRETURNING\n    student_id AS ok',
    loc: { a: 2977, b: 3178, line: 114, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_favorite_volunteers (student_id, volunteer_id, created_at, updated_at)
 *     VALUES (:studentId!, :volunteerId!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     student_id AS ok
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
    body: 'SELECT\n    id,\n    KEY AS name\nFROM\n    volunteer_partner_orgs',
    loc: { a: 3219, b: 3280, line: 123, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     KEY AS name
 * FROM
 *     volunteer_partner_orgs
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
    body: 'SELECT\n    id,\n    KEY AS name\nFROM\n    student_partner_orgs',
    loc: { a: 3319, b: 3378, line: 131, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     KEY AS name
 * FROM
 *     student_partner_orgs
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
    body: 'SELECT\n    id,\n    name\nFROM\n    certifications',
    loc: { a: 3413, b: 3459, line: 139, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     name
 * FROM
 *     certifications
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
    body: 'SELECT\n    id,\n    name\nFROM\n    quizzes',
    loc: { a: 3487, b: 3526, line: 147, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     name
 * FROM
 *     quizzes
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
      "SELECT\n    qs.id,\n    qs.name\nFROM\n    quiz_subcategories qs\n    JOIN quizzes q ON q.id = qs.quiz_id\nWHERE\n    q.name = 'algebraOne'",
    loc: { a: 3570, b: 3701, line: 155, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     qs.id,
 *     qs.name
 * FROM
 *     quiz_subcategories qs
 *     JOIN quizzes q ON q.id = qs.quiz_id
 * WHERE
 *     q.name = 'algebraOne'
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
      codeRefs: { used: [{ a: 3872, b: 3884, line: 167, col: 13 }] },
    },
    {
      name: 'possibleAnswers',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 3888, b: 3903, line: 167, col: 29 }] },
    },
    {
      name: 'correctAnswer',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 3907, b: 3920, line: 167, col: 48 }] },
    },
    {
      name: 'quizSubcategoryId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 3924, b: 3941, line: 167, col: 65 }] },
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
      'INSERT INTO quiz_questions (question_text, possible_answers, correct_answer, quiz_subcategory_id, created_at, updated_at)\n    VALUES (:questionText!, :possibleAnswers!, :correctAnswer!, :quizSubcategoryId!, NOW(), NOW())\nRETURNING\n    id AS ok',
    loc: { a: 3737, b: 3979, line: 166, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO quiz_questions (question_text, possible_answers, correct_answer, quiz_subcategory_id, created_at, updated_at)
 *     VALUES (:questionText!, :possibleAnswers!, :correctAnswer!, :quizSubcategoryId!, NOW(), NOW())
 * RETURNING
 *     id AS ok
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
      codeRefs: { used: [{ a: 4085, b: 4089, line: 174, col: 13 }] },
    },
    {
      name: 'usStateCode',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 4093, b: 4104, line: 174, col: 21 }] },
    },
  ],
  usedParamSet: { name: true, usStateCode: true },
  statement: {
    body:
      'INSERT INTO cities (name, us_state_code, created_at, updated_at)\n    VALUES (:name!, :usStateCode!, NOW(), NOW())\nRETURNING\n    id AS ok',
    loc: { a: 4007, b: 4142, line: 173, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO cities (name, us_state_code, created_at, updated_at)
 *     VALUES (:name!, :usStateCode!, NOW(), NOW())
 * RETURNING
 *     id AS ok
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
      codeRefs: { used: [{ a: 4260, b: 4262, line: 181, col: 13 }] },
    },
  ],
  usedParamSet: { id: true },
  statement: {
    body:
      'INSERT INTO user_product_flags (user_id, created_at, updated_at)\n    VALUES (:id!, NOW(), NOW())\nRETURNING\n    user_id AS ok',
    loc: { a: 4182, b: 4305, line: 180, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_product_flags (user_id, created_at, updated_at)
 *     VALUES (:id!, NOW(), NOW())
 * RETURNING
 *     user_id AS ok
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
      codeRefs: { used: [{ a: 4787, b: 4797, line: 203, col: 16 }] },
    },
  ],
  usedParamSet: { schoolName: true },
  statement: {
    body:
      "INSERT INTO student_partner_orgs (id, KEY, name, signup_code, high_school_signup, college_signup, school_signup_required, school_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    TRANSLATE(BTRIM(LOWER(schools.name)), ' ', '-'),\n    schools.name,\n    TRANSLATE(BTRIM(UPPER(schools.name)), ' ', '-'),\n    TRUE,\n    FALSE,\n    TRUE,\n    schools.id,\n    NOW(),\n    NOW()\nFROM\n    schools\nWHERE\n    partner IS TRUE\n    AND name = :schoolName!\nRETURNING\n    id AS ok",
    loc: { a: 4350, b: 4820, line: 187, col: 0 },
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
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertSchoolStudentPartners = new PreparedQuery<
  IInsertSchoolStudentPartnersParams,
  IInsertSchoolStudentPartnersResult
>(insertSchoolStudentPartnersIR)
