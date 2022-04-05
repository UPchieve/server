/** Types generated for queries found in "database/seeds/testData/test_data.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'InsertSchool' parameters type */
export interface IInsertSchoolParams {
  approved: boolean;
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

const insertSchoolIR: any = {"name":"insertSchool","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":108,"b":110,"line":2,"col":83}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":114,"b":118,"line":2,"col":89}]}},{"name":"approved","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":122,"b":130,"line":2,"col":97}]}},{"name":"partner","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":134,"b":141,"line":2,"col":109}]}}],"usedParamSet":{"id":true,"name":true,"approved":true,"partner":true},"statement":{"body":"INSERT INTO schools (id, name, approved, partner, created_at, updated_at) VALUES (:id!, :name!, :approved!, :partner!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":25,"b":198,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO schools (id, name, approved, partner, created_at, updated_at) VALUES (:id!, :name!, :approved!, :partner!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
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

const insertStudentUserIR: any = {"name":"insertStudentUser","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":367,"b":369,"line":7,"col":9}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":373,"b":378,"line":7,"col":15},{"a":584,"b":589,"line":20,"col":13}]}},{"name":"password","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":382,"b":390,"line":7,"col":24}]}},{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":394,"b":403,"line":7,"col":36}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":407,"b":415,"line":7,"col":49}]}},{"name":"referralCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":419,"b":431,"line":7,"col":61}]}},{"name":"verified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":435,"b":443,"line":7,"col":77}]}}],"usedParamSet":{"id":true,"email":true,"password":true,"firstName":true,"lastName":true,"referralCode":true,"verified":true},"statement":{"body":"WITH ins AS(\nINSERT INTO users (id, email, password, first_name, last_name, referral_code, verified, created_at, updated_at) \nVALUES (:id!, :email!, :password!, :firstName!, :lastName!, :referralCode!, :verified!, NOW(), NOW()) \nON CONFLICT DO NOTHING\nRETURNING id AS ok)\nSELECT\n    *\nFROM\n    ins\nUNION\nSELECT\n    id\nFROM\n    users\nWHERE\n    email = :email!","loc":{"a":232,"b":589,"line":5,"col":0}}};

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

const insertStudentProfileIR: any = {"name":"insertStudentProfile","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":734,"b":740,"line":24,"col":107}]}},{"name":"studentPartnerOrgId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":744,"b":762,"line":24,"col":117}]}},{"name":"schoolId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":766,"b":773,"line":24,"col":139}]}}],"usedParamSet":{"userId":true,"studentPartnerOrgId":true,"schoolId":true},"statement":{"body":"INSERT INTO student_profiles (user_id, student_partner_org_id, school_id, created_at, updated_at) VALUES (:userId!, :studentPartnerOrgId, :schoolId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok","loc":{"a":627,"b":835,"line":24,"col":0}}};

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

const insertVolunteerUserIR: any = {"name":"insertVolunteerUser","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1038,"b":1040,"line":29,"col":9}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1044,"b":1049,"line":29,"col":15},{"a":1292,"b":1297,"line":42,"col":13}]}},{"name":"phone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1053,"b":1058,"line":29,"col":24}]}},{"name":"password","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1062,"b":1070,"line":29,"col":33}]}},{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1074,"b":1083,"line":29,"col":45}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1087,"b":1095,"line":29,"col":58}]}},{"name":"referralCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1099,"b":1111,"line":29,"col":70}]}},{"name":"verified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1115,"b":1123,"line":29,"col":86}]}},{"name":"testUser","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1127,"b":1135,"line":29,"col":98}]}},{"name":"timeTutored","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1139,"b":1150,"line":29,"col":110}]}}],"usedParamSet":{"id":true,"email":true,"phone":true,"password":true,"firstName":true,"lastName":true,"referralCode":true,"verified":true,"testUser":true,"timeTutored":true},"statement":{"body":"WITH ins AS (\nINSERT INTO users (id, email, phone, password, first_name, last_name, referral_code, verified, test_user, time_tutored, created_at, updated_at)\nVALUES (:id!, :email!, :phone!, :password!, :firstName!, :lastName!, :referralCode!, :verified!, :testUser!, :timeTutored!, NOW(), NOW()) \nON CONFLICT DO NOTHING \nRETURNING id AS ok)\nSELECT\n    *\nFROM\n    ins\nUNION\nSELECT\n    id\nFROM\n    users\nWHERE\n    email = :email!","loc":{"a":871,"b":1297,"line":27,"col":0}}};

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

const insertVolunteerProfileIR: any = {"name":"insertVolunteerProfile","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1477,"b":1483,"line":46,"col":140}]}},{"name":"timezone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1487,"b":1495,"line":46,"col":150}]}},{"name":"approved","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1499,"b":1507,"line":46,"col":162}]}},{"name":"onboarded","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1511,"b":1520,"line":46,"col":174}]}},{"name":"college","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1524,"b":1531,"line":46,"col":187}]}},{"name":"volunteerPartnerOrgId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1535,"b":1555,"line":46,"col":198}]}}],"usedParamSet":{"userId":true,"timezone":true,"approved":true,"onboarded":true,"college":true,"volunteerPartnerOrgId":true},"statement":{"body":"INSERT INTO volunteer_profiles (user_id, timezone, approved, onboarded, college, volunteer_partner_org_id, created_at, updated_at) VALUES (:userId!, :timezone!, :approved!, :onboarded!, :college!, :volunteerPartnerOrgId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok","loc":{"a":1337,"b":1617,"line":46,"col":0}}};

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

const insertUserCertificationIR: any = {"name":"insertUserCertification","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1751,"b":1757,"line":49,"col":94}]}},{"name":"certificationId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1761,"b":1776,"line":49,"col":104}]}}],"usedParamSet":{"userId":true,"certificationId":true},"statement":{"body":"INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at) VALUES (:userId!, :certificationId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok","loc":{"a":1657,"b":1838,"line":49,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at) VALUES (:userId!, :certificationId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok
 * ```
 */
export const insertUserCertification = new PreparedQuery<IInsertUserCertificationParams,IInsertUserCertificationResult>(insertUserCertificationIR);


/** 'InsertIntoUserQuizzes' parameters type */
export interface IInsertIntoUserQuizzesParams {
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

const insertIntoUserQuizzesIR: any = {"name":"insertIntoUserQuizzes","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1954,"b":1960,"line":52,"col":78}]}},{"name":"quizId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1964,"b":1970,"line":52,"col":88}]}}],"usedParamSet":{"userId":true,"quizId":true},"statement":{"body":"INSERT INTO users_quizzes (user_id, quiz_id, created_at, updated_at) VALUES (:userId!, :quizId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok","loc":{"a":1876,"b":2032,"line":52,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_quizzes (user_id, quiz_id, created_at, updated_at) VALUES (:userId!, :quizId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok
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

const insertAdminProfileIR: any = {"name":"insertAdminProfile","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2137,"b":2143,"line":55,"col":70}]}}],"usedParamSet":{"userId":true},"statement":{"body":"INSERT INTO admin_profiles (user_id, created_at, updated_at) VALUES (:userId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok","loc":{"a":2067,"b":2205,"line":55,"col":0}}};

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

const insertSessionIR: any = {"name":"insertSession","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2332,"b":2334,"line":58,"col":97}]}},{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2338,"b":2347,"line":58,"col":103}]}},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2351,"b":2362,"line":58,"col":116}]}},{"name":"subjectId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2366,"b":2375,"line":58,"col":131}]}}],"usedParamSet":{"id":true,"studentId":true,"volunteerId":true,"subjectId":true},"statement":{"body":"INSERT INTO sessions (id, student_id, volunteer_id, subject_id, created_at, updated_at) VALUES (:id!, :studentId!, :volunteerId!, :subjectId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":2235,"b":2432,"line":58,"col":0}}};

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

const insertStudentFavoriteVolunteersIR: any = {"name":"insertStudentFavoriteVolunteers","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2580,"b":2589,"line":61,"col":100}]}},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2593,"b":2604,"line":61,"col":113}]}}],"usedParamSet":{"studentId":true,"volunteerId":true},"statement":{"body":"INSERT INTO student_favorite_volunteers (student_id, volunteer_id, created_at, updated_at) VALUES (:studentId!, :volunteerId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING student_id AS ok","loc":{"a":2480,"b":2669,"line":61,"col":0}}};

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

const getVolunteerPartnerOrgsIR: any = {"name":"getVolunteerPartnerOrgs","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n  id,\n  key AS name\nFROM volunteer_partner_orgs","loc":{"a":2709,"b":2762,"line":64,"col":0}}};

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

const getStudentPartnerOrgsIR: any = {"name":"getStudentPartnerOrgs","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n  id,\n  key AS name\nFROM student_partner_orgs","loc":{"a":2800,"b":2851,"line":70,"col":0}}};

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

const getCertificationsIR: any = {"name":"getCertifications","params":[],"usedParamSet":{},"statement":{"body":"SELECT id, name FROM certifications","loc":{"a":2885,"b":2919,"line":76,"col":0}}};

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

const getQuizzesIR: any = {"name":"getQuizzes","params":[],"usedParamSet":{},"statement":{"body":"SELECT id, name FROM quizzes","loc":{"a":2946,"b":2973,"line":79,"col":0}}};

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

const getAlgebraOneSubcategoriesIR: any = {"name":"getAlgebraOneSubcategories","params":[],"usedParamSet":{},"statement":{"body":"SELECT qs.id, qs.name FROM quiz_subcategories qs JOIN quizzes q ON q.id = qs.quiz_id WHERE q.name = 'algebraOne'","loc":{"a":3016,"b":3127,"line":82,"col":0}}};

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

const insertQuizQuestionIR: any = {"name":"insertQuizQuestion","params":[{"name":"questionText","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3293,"b":3305,"line":86,"col":9}]}},{"name":"possibleAnswers","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3309,"b":3324,"line":86,"col":25}]}},{"name":"correctAnswer","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3328,"b":3341,"line":86,"col":44}]}},{"name":"quizSubcategoryId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3345,"b":3362,"line":86,"col":61}]}}],"usedParamSet":{"questionText":true,"possibleAnswers":true,"correctAnswer":true,"quizSubcategoryId":true},"statement":{"body":"INSERT INTO quiz_questions (question_text, possible_answers, correct_answer, quiz_subcategory_id, created_at, updated_at)\nVALUES (:questionText!, :possibleAnswers!, :correctAnswer!, :quizSubcategoryId!, NOW(), NOW())\nRETURNING id AS ok","loc":{"a":3162,"b":3396,"line":85,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO quiz_questions (question_text, possible_answers, correct_answer, quiz_subcategory_id, created_at, updated_at)
 * VALUES (:questionText!, :possibleAnswers!, :correctAnswer!, :quizSubcategoryId!, NOW(), NOW())
 * RETURNING id AS ok
 * ```
 */
export const insertQuizQuestion = new PreparedQuery<IInsertQuizQuestionParams,IInsertQuizQuestionResult>(insertQuizQuestionIR);


