/** Types generated for queries found in "database/seeds/testData/test_data.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'InsertSchool' parameters type */
export interface IInsertSchoolParams {
  approved: boolean;
  cityId: number;
  id: string;
  name: string;
  partner: boolean;
}

/** 'InsertSchool' return type */
export interface IInsertSchoolResult {
  ok: string;
}

/** 'InsertSchool' query type */
export interface IInsertSchoolQuery {
  params: IInsertSchoolParams;
  result: IInsertSchoolResult;
}

const insertSchoolIR: any = {"name":"insertSchool","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":117,"b":119,"line":2,"col":92}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":123,"b":127,"line":2,"col":98}]}},{"name":"approved","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":131,"b":139,"line":2,"col":106}]}},{"name":"partner","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":143,"b":150,"line":2,"col":118}]}},{"name":"cityId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":154,"b":160,"line":2,"col":129}]}}],"usedParamSet":{"id":true,"name":true,"approved":true,"partner":true,"cityId":true},"statement":{"body":"INSERT INTO schools (id, name, approved, partner, city_id, created_at, updated_at) VALUES (:id!, :name!, :approved!, :partner!, :cityId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":25,"b":217,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO schools (id, name, approved, partner, city_id, created_at, updated_at) VALUES (:id!, :name!, :approved!, :partner!, :cityId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
 * ```
 */
export const insertSchool = new PreparedQuery<IInsertSchoolParams,IInsertSchoolResult>(insertSchoolIR);


/** 'InsertStudentUser' parameters type */
export interface IInsertStudentUserParams {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  password: string;
  referralCode: string;
  verified: boolean;
}

/** 'InsertStudentUser' return type */
export interface IInsertStudentUserResult {
  ok: string | null;
}

/** 'InsertStudentUser' query type */
export interface IInsertStudentUserQuery {
  params: IInsertStudentUserParams;
  result: IInsertStudentUserResult;
}

const insertStudentUserIR: any = {"name":"insertStudentUser","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":385,"b":387,"line":7,"col":9}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":391,"b":396,"line":7,"col":15},{"a":601,"b":606,"line":20,"col":13}]}},{"name":"password","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":400,"b":408,"line":7,"col":24}]}},{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":412,"b":421,"line":7,"col":36}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":425,"b":433,"line":7,"col":49}]}},{"name":"referralCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":437,"b":449,"line":7,"col":61}]}},{"name":"verified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":453,"b":461,"line":7,"col":77}]}}],"usedParamSet":{"id":true,"email":true,"password":true,"firstName":true,"lastName":true,"referralCode":true,"verified":true},"statement":{"body":"WITH ins AS(\nINSERT INTO users (id, email, password, first_name, last_name, referral_code, verified, created_at, updated_at)\nVALUES (:id!, :email!, :password!, :firstName!, :lastName!, :referralCode!, :verified!, NOW(), NOW())\nON CONFLICT DO NOTHING\nRETURNING id AS ok)\nSELECT\n    *\nFROM\n    ins\nUNION\nSELECT\n    id\nFROM\n    users\nWHERE\n    email = :email!","loc":{"a":251,"b":606,"line":5,"col":0}}};

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
export const insertStudentUser = new PreparedQuery<IInsertStudentUserParams,IInsertStudentUserResult>(insertStudentUserIR);


/** 'InsertStudentProfile' parameters type */
export interface IInsertStudentProfileParams {
  schoolId: string | null | void;
  studentPartnerOrgId: string | null | void;
  userId: string;
}

/** 'InsertStudentProfile' return type */
export interface IInsertStudentProfileResult {
  ok: string;
}

/** 'InsertStudentProfile' query type */
export interface IInsertStudentProfileQuery {
  params: IInsertStudentProfileParams;
  result: IInsertStudentProfileResult;
}

const insertStudentProfileIR: any = {"name":"insertStudentProfile","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":751,"b":757,"line":24,"col":107}]}},{"name":"studentPartnerOrgId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":761,"b":779,"line":24,"col":117}]}},{"name":"schoolId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":783,"b":790,"line":24,"col":139}]}}],"usedParamSet":{"userId":true,"studentPartnerOrgId":true,"schoolId":true},"statement":{"body":"INSERT INTO student_profiles (user_id, student_partner_org_id, school_id, created_at, updated_at) VALUES (:userId!, :studentPartnerOrgId, :schoolId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok","loc":{"a":644,"b":852,"line":24,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_profiles (user_id, student_partner_org_id, school_id, created_at, updated_at) VALUES (:userId!, :studentPartnerOrgId, :schoolId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok
 * ```
 */
export const insertStudentProfile = new PreparedQuery<IInsertStudentProfileParams,IInsertStudentProfileResult>(insertStudentProfileIR);


/** 'InsertVolunteerUser' parameters type */
export interface IInsertVolunteerUserParams {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  password: string;
  phone: string;
  referralCode: string;
  testUser: boolean;
  timeTutored: string;
  verified: boolean;
}

/** 'InsertVolunteerUser' return type */
export interface IInsertVolunteerUserResult {
  ok: string | null;
}

/** 'InsertVolunteerUser' query type */
export interface IInsertVolunteerUserQuery {
  params: IInsertVolunteerUserParams;
  result: IInsertVolunteerUserResult;
}

const insertVolunteerUserIR: any = {"name":"insertVolunteerUser","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1055,"b":1057,"line":29,"col":9}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1061,"b":1066,"line":29,"col":15},{"a":1307,"b":1312,"line":42,"col":13}]}},{"name":"phone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1070,"b":1075,"line":29,"col":24}]}},{"name":"password","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1079,"b":1087,"line":29,"col":33}]}},{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1091,"b":1100,"line":29,"col":45}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1104,"b":1112,"line":29,"col":58}]}},{"name":"referralCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1116,"b":1128,"line":29,"col":70}]}},{"name":"verified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1132,"b":1140,"line":29,"col":86}]}},{"name":"testUser","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1144,"b":1152,"line":29,"col":98}]}},{"name":"timeTutored","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1156,"b":1167,"line":29,"col":110}]}}],"usedParamSet":{"id":true,"email":true,"phone":true,"password":true,"firstName":true,"lastName":true,"referralCode":true,"verified":true,"testUser":true,"timeTutored":true},"statement":{"body":"WITH ins AS (\nINSERT INTO users (id, email, phone, password, first_name, last_name, referral_code, verified, test_user, time_tutored, created_at, updated_at)\nVALUES (:id!, :email!, :phone!, :password!, :firstName!, :lastName!, :referralCode!, :verified!, :testUser!, :timeTutored!, NOW(), NOW())\nON CONFLICT DO NOTHING\nRETURNING id AS ok)\nSELECT\n    *\nFROM\n    ins\nUNION\nSELECT\n    id\nFROM\n    users\nWHERE\n    email = :email!","loc":{"a":888,"b":1312,"line":27,"col":0}}};

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
export const insertVolunteerUser = new PreparedQuery<IInsertVolunteerUserParams,IInsertVolunteerUserResult>(insertVolunteerUserIR);


/** 'InsertUserSessionMetrics' parameters type */
export interface IInsertUserSessionMetricsParams {
  id: string;
}

/** 'InsertUserSessionMetrics' return type */
export interface IInsertUserSessionMetricsResult {
  ok: string;
}

/** 'InsertUserSessionMetrics' query type */
export interface IInsertUserSessionMetricsQuery {
  params: IInsertUserSessionMetricsParams;
  result: IInsertUserSessionMetricsResult;
}

const insertUserSessionMetricsIR: any = {"name":"insertUserSessionMetrics","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1428,"b":1430,"line":46,"col":9}]}}],"usedParamSet":{"id":true},"statement":{"body":"INSERT INTO user_session_metrics(user_id, created_at, updated_at)\nVALUES (:id!, NOW(), NOW())\nRETURNING user_id AS ok                                                                                                                                                                                                                                                                                                                                                               ","loc":{"a":1353,"b":1469,"line":45,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_session_metrics(user_id, created_at, updated_at)
 * VALUES (:id!, NOW(), NOW())
 * RETURNING user_id AS ok                                                                                                                                                                                                                                                                                                                                                               
 * ```
 */
export const insertUserSessionMetrics = new PreparedQuery<IInsertUserSessionMetricsParams,IInsertUserSessionMetricsResult>(insertUserSessionMetricsIR);


/** 'InsertVolunteerProfile' parameters type */
export interface IInsertVolunteerProfileParams {
  approved: boolean;
  college: string;
  onboarded: boolean;
  timezone: string;
  userId: string;
  volunteerPartnerOrgId: string | null | void;
}

/** 'InsertVolunteerProfile' return type */
export interface IInsertVolunteerProfileResult {
  ok: string;
}

/** 'InsertVolunteerProfile' query type */
export interface IInsertVolunteerProfileQuery {
  params: IInsertVolunteerProfileParams;
  result: IInsertVolunteerProfileResult;
}

const insertVolunteerProfileIR: any = {"name":"insertVolunteerProfile","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2001,"b":2007,"line":53,"col":140}]}},{"name":"timezone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2011,"b":2019,"line":53,"col":150}]}},{"name":"approved","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2023,"b":2031,"line":53,"col":162}]}},{"name":"onboarded","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2035,"b":2044,"line":53,"col":174}]}},{"name":"college","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2048,"b":2055,"line":53,"col":187}]}},{"name":"volunteerPartnerOrgId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2059,"b":2079,"line":53,"col":198}]}}],"usedParamSet":{"userId":true,"timezone":true,"approved":true,"onboarded":true,"college":true,"volunteerPartnerOrgId":true},"statement":{"body":"INSERT INTO volunteer_profiles (user_id, timezone, approved, onboarded, college, volunteer_partner_org_id, created_at, updated_at) VALUES (:userId!, :timezone!, :approved!, :onboarded!, :college!, :volunteerPartnerOrgId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok","loc":{"a":1861,"b":2141,"line":53,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO volunteer_profiles (user_id, timezone, approved, onboarded, college, volunteer_partner_org_id, created_at, updated_at) VALUES (:userId!, :timezone!, :approved!, :onboarded!, :college!, :volunteerPartnerOrgId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok
 * ```
 */
export const insertVolunteerProfile = new PreparedQuery<IInsertVolunteerProfileParams,IInsertVolunteerProfileResult>(insertVolunteerProfileIR);


/** 'InsertUserCertification' parameters type */
export interface IInsertUserCertificationParams {
  certificationId: number;
  userId: string;
}

/** 'InsertUserCertification' return type */
export interface IInsertUserCertificationResult {
  ok: string;
}

/** 'InsertUserCertification' query type */
export interface IInsertUserCertificationQuery {
  params: IInsertUserCertificationParams;
  result: IInsertUserCertificationResult;
}

const insertUserCertificationIR: any = {"name":"insertUserCertification","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2275,"b":2281,"line":56,"col":94}]}},{"name":"certificationId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2285,"b":2300,"line":56,"col":104}]}}],"usedParamSet":{"userId":true,"certificationId":true},"statement":{"body":"INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at) VALUES (:userId!, :certificationId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok","loc":{"a":2181,"b":2362,"line":56,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at) VALUES (:userId!, :certificationId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok
 * ```
 */
export const insertUserCertification = new PreparedQuery<IInsertUserCertificationParams,IInsertUserCertificationResult>(insertUserCertificationIR);


/** 'InsertIntoUserQuizzes' parameters type */
export interface IInsertIntoUserQuizzesParams {
  attempts: number;
  passed: boolean;
  quizId: number;
  userId: string;
}

/** 'InsertIntoUserQuizzes' return type */
export interface IInsertIntoUserQuizzesResult {
  ok: string;
}

/** 'InsertIntoUserQuizzes' query type */
export interface IInsertIntoUserQuizzesQuery {
  params: IInsertIntoUserQuizzesParams;
  result: IInsertIntoUserQuizzesResult;
}

const insertIntoUserQuizzesIR: any = {"name":"insertIntoUserQuizzes","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2496,"b":2502,"line":59,"col":96}]}},{"name":"quizId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2506,"b":2512,"line":59,"col":106}]}},{"name":"attempts","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2516,"b":2524,"line":59,"col":116}]}},{"name":"passed","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2528,"b":2534,"line":59,"col":128}]}}],"usedParamSet":{"userId":true,"quizId":true,"attempts":true,"passed":true},"statement":{"body":"INSERT INTO users_quizzes (user_id, quiz_id, attempts, passed, created_at, updated_at) VALUES (:userId!, :quizId!, :attempts!, :passed!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok","loc":{"a":2400,"b":2596,"line":59,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_quizzes (user_id, quiz_id, attempts, passed, created_at, updated_at) VALUES (:userId!, :quizId!, :attempts!, :passed!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok
 * ```
 */
export const insertIntoUserQuizzes = new PreparedQuery<IInsertIntoUserQuizzesParams,IInsertIntoUserQuizzesResult>(insertIntoUserQuizzesIR);


/** 'InsertAdminProfile' parameters type */
export interface IInsertAdminProfileParams {
  userId: string;
}

/** 'InsertAdminProfile' return type */
export interface IInsertAdminProfileResult {
  ok: string;
}

/** 'InsertAdminProfile' query type */
export interface IInsertAdminProfileQuery {
  params: IInsertAdminProfileParams;
  result: IInsertAdminProfileResult;
}

const insertAdminProfileIR: any = {"name":"insertAdminProfile","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2701,"b":2707,"line":62,"col":70}]}}],"usedParamSet":{"userId":true},"statement":{"body":"INSERT INTO admin_profiles (user_id, created_at, updated_at) VALUES (:userId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok","loc":{"a":2631,"b":2769,"line":62,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO admin_profiles (user_id, created_at, updated_at) VALUES (:userId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok
 * ```
 */
export const insertAdminProfile = new PreparedQuery<IInsertAdminProfileParams,IInsertAdminProfileResult>(insertAdminProfileIR);


/** 'InsertSession' parameters type */
export interface IInsertSessionParams {
  id: string;
  studentId: string;
  subjectId: number;
  volunteerId: string;
}

/** 'InsertSession' return type */
export interface IInsertSessionResult {
  ok: string;
}

/** 'InsertSession' query type */
export interface IInsertSessionQuery {
  params: IInsertSessionParams;
  result: IInsertSessionResult;
}

const insertSessionIR: any = {"name":"insertSession","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2896,"b":2898,"line":65,"col":97}]}},{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2902,"b":2911,"line":65,"col":103}]}},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2915,"b":2926,"line":65,"col":116}]}},{"name":"subjectId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2930,"b":2939,"line":65,"col":131}]}}],"usedParamSet":{"id":true,"studentId":true,"volunteerId":true,"subjectId":true},"statement":{"body":"INSERT INTO sessions (id, student_id, volunteer_id, subject_id, created_at, updated_at) VALUES (:id!, :studentId!, :volunteerId!, :subjectId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":2799,"b":2996,"line":65,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO sessions (id, student_id, volunteer_id, subject_id, created_at, updated_at) VALUES (:id!, :studentId!, :volunteerId!, :subjectId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
 * ```
 */
export const insertSession = new PreparedQuery<IInsertSessionParams,IInsertSessionResult>(insertSessionIR);


/** 'InsertStudentFavoriteVolunteers' parameters type */
export interface IInsertStudentFavoriteVolunteersParams {
  studentId: string;
  volunteerId: string;
}

/** 'InsertStudentFavoriteVolunteers' return type */
export interface IInsertStudentFavoriteVolunteersResult {
  ok: string;
}

/** 'InsertStudentFavoriteVolunteers' query type */
export interface IInsertStudentFavoriteVolunteersQuery {
  params: IInsertStudentFavoriteVolunteersParams;
  result: IInsertStudentFavoriteVolunteersResult;
}

const insertStudentFavoriteVolunteersIR: any = {"name":"insertStudentFavoriteVolunteers","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3144,"b":3153,"line":68,"col":100}]}},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3157,"b":3168,"line":68,"col":113}]}}],"usedParamSet":{"studentId":true,"volunteerId":true},"statement":{"body":"INSERT INTO student_favorite_volunteers (student_id, volunteer_id, created_at, updated_at) VALUES (:studentId!, :volunteerId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING student_id AS ok","loc":{"a":3044,"b":3233,"line":68,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_favorite_volunteers (student_id, volunteer_id, created_at, updated_at) VALUES (:studentId!, :volunteerId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING student_id AS ok
 * ```
 */
export const insertStudentFavoriteVolunteers = new PreparedQuery<IInsertStudentFavoriteVolunteersParams,IInsertStudentFavoriteVolunteersResult>(insertStudentFavoriteVolunteersIR);


/** 'GetVolunteerPartnerOrgs' parameters type */
export type IGetVolunteerPartnerOrgsParams = void;

/** 'GetVolunteerPartnerOrgs' return type */
export interface IGetVolunteerPartnerOrgsResult {
  id: string;
  name: string;
}

/** 'GetVolunteerPartnerOrgs' query type */
export interface IGetVolunteerPartnerOrgsQuery {
  params: IGetVolunteerPartnerOrgsParams;
  result: IGetVolunteerPartnerOrgsResult;
}

const getVolunteerPartnerOrgsIR: any = {"name":"getVolunteerPartnerOrgs","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n  id,\n  key AS name\nFROM volunteer_partner_orgs","loc":{"a":3273,"b":3326,"line":71,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   id,
 *   key AS name
 * FROM volunteer_partner_orgs
 * ```
 */
export const getVolunteerPartnerOrgs = new PreparedQuery<IGetVolunteerPartnerOrgsParams,IGetVolunteerPartnerOrgsResult>(getVolunteerPartnerOrgsIR);


/** 'GetStudentPartnerOrgs' parameters type */
export type IGetStudentPartnerOrgsParams = void;

/** 'GetStudentPartnerOrgs' return type */
export interface IGetStudentPartnerOrgsResult {
  id: string;
  name: string;
}

/** 'GetStudentPartnerOrgs' query type */
export interface IGetStudentPartnerOrgsQuery {
  params: IGetStudentPartnerOrgsParams;
  result: IGetStudentPartnerOrgsResult;
}

const getStudentPartnerOrgsIR: any = {"name":"getStudentPartnerOrgs","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n  id,\n  key AS name\nFROM student_partner_orgs","loc":{"a":3364,"b":3415,"line":77,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   id,
 *   key AS name
 * FROM student_partner_orgs
 * ```
 */
export const getStudentPartnerOrgs = new PreparedQuery<IGetStudentPartnerOrgsParams,IGetStudentPartnerOrgsResult>(getStudentPartnerOrgsIR);


/** 'GetCertifications' parameters type */
export type IGetCertificationsParams = void;

/** 'GetCertifications' return type */
export interface IGetCertificationsResult {
  id: number;
  name: string;
}

/** 'GetCertifications' query type */
export interface IGetCertificationsQuery {
  params: IGetCertificationsParams;
  result: IGetCertificationsResult;
}

const getCertificationsIR: any = {"name":"getCertifications","params":[],"usedParamSet":{},"statement":{"body":"SELECT id, name FROM certifications","loc":{"a":3449,"b":3483,"line":83,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, name FROM certifications
 * ```
 */
export const getCertifications = new PreparedQuery<IGetCertificationsParams,IGetCertificationsResult>(getCertificationsIR);


/** 'GetQuizzes' parameters type */
export type IGetQuizzesParams = void;

/** 'GetQuizzes' return type */
export interface IGetQuizzesResult {
  id: number;
  name: string;
}

/** 'GetQuizzes' query type */
export interface IGetQuizzesQuery {
  params: IGetQuizzesParams;
  result: IGetQuizzesResult;
}

const getQuizzesIR: any = {"name":"getQuizzes","params":[],"usedParamSet":{},"statement":{"body":"SELECT id, name FROM quizzes","loc":{"a":3510,"b":3537,"line":86,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, name FROM quizzes
 * ```
 */
export const getQuizzes = new PreparedQuery<IGetQuizzesParams,IGetQuizzesResult>(getQuizzesIR);


/** 'GetAlgebraOneSubcategories' parameters type */
export type IGetAlgebraOneSubcategoriesParams = void;

/** 'GetAlgebraOneSubcategories' return type */
export interface IGetAlgebraOneSubcategoriesResult {
  id: number;
  name: string;
}

/** 'GetAlgebraOneSubcategories' query type */
export interface IGetAlgebraOneSubcategoriesQuery {
  params: IGetAlgebraOneSubcategoriesParams;
  result: IGetAlgebraOneSubcategoriesResult;
}

const getAlgebraOneSubcategoriesIR: any = {"name":"getAlgebraOneSubcategories","params":[],"usedParamSet":{},"statement":{"body":"SELECT qs.id, qs.name FROM quiz_subcategories qs JOIN quizzes q ON q.id = qs.quiz_id WHERE q.name = 'algebraOne'","loc":{"a":3580,"b":3691,"line":89,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT qs.id, qs.name FROM quiz_subcategories qs JOIN quizzes q ON q.id = qs.quiz_id WHERE q.name = 'algebraOne'
 * ```
 */
export const getAlgebraOneSubcategories = new PreparedQuery<IGetAlgebraOneSubcategoriesParams,IGetAlgebraOneSubcategoriesResult>(getAlgebraOneSubcategoriesIR);


/** 'InsertQuizQuestion' parameters type */
export interface IInsertQuizQuestionParams {
  correctAnswer: string;
  possibleAnswers: Json;
  questionText: string;
  quizSubcategoryId: number;
}

/** 'InsertQuizQuestion' return type */
export interface IInsertQuizQuestionResult {
  ok: number;
}

/** 'InsertQuizQuestion' query type */
export interface IInsertQuizQuestionQuery {
  params: IInsertQuizQuestionParams;
  result: IInsertQuizQuestionResult;
}

const insertQuizQuestionIR: any = {"name":"insertQuizQuestion","params":[{"name":"questionText","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3857,"b":3869,"line":93,"col":9}]}},{"name":"possibleAnswers","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3873,"b":3888,"line":93,"col":25}]}},{"name":"correctAnswer","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3892,"b":3905,"line":93,"col":44}]}},{"name":"quizSubcategoryId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3909,"b":3926,"line":93,"col":61}]}}],"usedParamSet":{"questionText":true,"possibleAnswers":true,"correctAnswer":true,"quizSubcategoryId":true},"statement":{"body":"INSERT INTO quiz_questions (question_text, possible_answers, correct_answer, quiz_subcategory_id, created_at, updated_at)\nVALUES (:questionText!, :possibleAnswers!, :correctAnswer!, :quizSubcategoryId!, NOW(), NOW())\nRETURNING id AS ok","loc":{"a":3726,"b":3960,"line":92,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO quiz_questions (question_text, possible_answers, correct_answer, quiz_subcategory_id, created_at, updated_at)
 * VALUES (:questionText!, :possibleAnswers!, :correctAnswer!, :quizSubcategoryId!, NOW(), NOW())
 * RETURNING id AS ok
 * ```
 */
export const insertQuizQuestion = new PreparedQuery<IInsertQuizQuestionParams,IInsertQuizQuestionResult>(insertQuizQuestionIR);


/** 'InsertCity' parameters type */
export interface IInsertCityParams {
  name: string;
  usStateCode: string;
}

/** 'InsertCity' return type */
export interface IInsertCityResult {
  ok: number;
}

/** 'InsertCity' query type */
export interface IInsertCityQuery {
  params: IInsertCityParams;
  result: IInsertCityResult;
}

const insertCityIR: any = {"name":"insertCity","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4061,"b":4065,"line":98,"col":9}]}},{"name":"usStateCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4069,"b":4080,"line":98,"col":17}]}}],"usedParamSet":{"name":true,"usStateCode":true},"statement":{"body":"INSERT INTO cities (name, us_state_code, created_at, updated_at)\nVALUES (:name!, :usStateCode!, NOW(), NOW())\nRETURNING id as ok","loc":{"a":3987,"b":4114,"line":97,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO cities (name, us_state_code, created_at, updated_at)
 * VALUES (:name!, :usStateCode!, NOW(), NOW())
 * RETURNING id as ok
 * ```
 */
export const insertCity = new PreparedQuery<IInsertCityParams,IInsertCityResult>(insertCityIR);


