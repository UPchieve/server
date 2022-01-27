/** Types generated for queries found in "database/seeds/scripts/testData/test_data.sql" */
import { PreparedQuery } from '@pgtyped/query';

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
  ok: string;
}

/** 'InsertStudentUser' query type */
export interface IInsertStudentUserQuery {
  params: IInsertStudentUserParams;
  result: IInsertStudentUserResult;
}

const insertStudentUserIR: any = {"name":"insertStudentUser","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":353,"b":355,"line":5,"col":121}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":359,"b":364,"line":5,"col":127}]}},{"name":"password","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":368,"b":376,"line":5,"col":136}]}},{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":380,"b":389,"line":5,"col":148}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":393,"b":401,"line":5,"col":161}]}},{"name":"referralCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":405,"b":417,"line":5,"col":173}]}},{"name":"verified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":421,"b":429,"line":5,"col":189}]}}],"usedParamSet":{"id":true,"email":true,"password":true,"firstName":true,"lastName":true,"referralCode":true,"verified":true},"statement":{"body":"INSERT INTO users (id, email, password, first_name, last_name, referral_code, verified, created_at, updated_at) VALUES (:id!, :email!, :password!, :firstName!, :lastName!, :referralCode!, :verified!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":232,"b":486,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users (id, email, password, first_name, last_name, referral_code, verified, created_at, updated_at) VALUES (:id!, :email!, :password!, :firstName!, :lastName!, :referralCode!, :verified!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
 * ```
 */
export const insertStudentUser = new PreparedQuery<IInsertStudentUserParams,IInsertStudentUserResult>(insertStudentUserIR);


/** 'InsertStudentProfile' parameters type */
export interface IInsertStudentProfileParams {
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

const insertStudentProfileIR: any = {"name":"insertStudentProfile","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":619,"b":625,"line":8,"col":96}]}},{"name":"studentPartnerOrgId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":629,"b":647,"line":8,"col":106}]}}],"usedParamSet":{"userId":true,"studentPartnerOrgId":true},"statement":{"body":"INSERT INTO student_profiles (user_id, student_partner_org_id, created_at, updated_at) VALUES (:userId!, :studentPartnerOrgId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok","loc":{"a":523,"b":709,"line":8,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_profiles (user_id, student_partner_org_id, created_at, updated_at) VALUES (:userId!, :studentPartnerOrgId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok
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
  referralCode: string;
  testUser: boolean;
  timeTutored: string;
  verified: boolean;
}

/** 'InsertVolunteerUser' return type */
export interface IInsertVolunteerUserResult {
  ok: string;
}

/** 'InsertVolunteerUser' query type */
export interface IInsertVolunteerUserQuery {
  params: IInsertVolunteerUserParams;
  result: IInsertVolunteerUserResult;
}

const insertVolunteerUserIR: any = {"name":"insertVolunteerUser","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":891,"b":893,"line":11,"col":146}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":897,"b":902,"line":11,"col":152}]}},{"name":"password","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":906,"b":914,"line":11,"col":161}]}},{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":918,"b":927,"line":11,"col":173}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":931,"b":939,"line":11,"col":186}]}},{"name":"referralCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":943,"b":955,"line":11,"col":198}]}},{"name":"verified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":959,"b":967,"line":11,"col":214}]}},{"name":"testUser","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":971,"b":979,"line":11,"col":226}]}},{"name":"timeTutored","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":983,"b":994,"line":11,"col":238}]}}],"usedParamSet":{"id":true,"email":true,"password":true,"firstName":true,"lastName":true,"referralCode":true,"verified":true,"testUser":true,"timeTutored":true},"statement":{"body":"INSERT INTO users (id, email, password, first_name, last_name, referral_code, verified, test_user, time_tutored, created_at, updated_at) VALUES (:id!, :email!, :password!, :firstName!, :lastName!, :referralCode!, :verified!, :testUser!, :timeTutored!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":745,"b":1051,"line":11,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users (id, email, password, first_name, last_name, referral_code, verified, test_user, time_tutored, created_at, updated_at) VALUES (:id!, :email!, :password!, :firstName!, :lastName!, :referralCode!, :verified!, :testUser!, :timeTutored!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
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

const insertVolunteerProfileIR: any = {"name":"insertVolunteerProfile","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1230,"b":1236,"line":14,"col":140}]}},{"name":"timezone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1240,"b":1248,"line":14,"col":150}]}},{"name":"approved","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1252,"b":1260,"line":14,"col":162}]}},{"name":"onboarded","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1264,"b":1273,"line":14,"col":174}]}},{"name":"college","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1277,"b":1284,"line":14,"col":187}]}},{"name":"volunteerPartnerOrgId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1288,"b":1308,"line":14,"col":198}]}}],"usedParamSet":{"userId":true,"timezone":true,"approved":true,"onboarded":true,"college":true,"volunteerPartnerOrgId":true},"statement":{"body":"INSERT INTO volunteer_profiles (user_id, timezone, approved, onboarded, college, volunteer_partner_org_id, created_at, updated_at) VALUES (:userId!, :timezone!, :approved!, :onboarded!, :college!, :volunteerPartnerOrgId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok","loc":{"a":1090,"b":1370,"line":14,"col":0}}};

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

const insertUserCertificationIR: any = {"name":"insertUserCertification","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1504,"b":1510,"line":17,"col":94}]}},{"name":"certificationId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1514,"b":1529,"line":17,"col":104}]}}],"usedParamSet":{"userId":true,"certificationId":true},"statement":{"body":"INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at) VALUES (:userId!, :certificationId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok","loc":{"a":1410,"b":1591,"line":17,"col":0}}};

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

const insertIntoUserQuizzesIR: any = {"name":"insertIntoUserQuizzes","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1707,"b":1713,"line":20,"col":78}]}},{"name":"quizId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1717,"b":1723,"line":20,"col":88}]}}],"usedParamSet":{"userId":true,"quizId":true},"statement":{"body":"INSERT INTO users_quizzes (user_id, quiz_id, created_at, updated_at) VALUES (:userId!, :quizId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok","loc":{"a":1629,"b":1785,"line":20,"col":0}}};

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

const insertAdminProfileIR: any = {"name":"insertAdminProfile","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1890,"b":1896,"line":23,"col":70}]}}],"usedParamSet":{"userId":true},"statement":{"body":"INSERT INTO admin_profiles (user_id, created_at, updated_at) VALUES (:userId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok","loc":{"a":1820,"b":1958,"line":23,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO admin_profiles (user_id, created_at, updated_at) VALUES (:userId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING user_id AS ok
 * ```
 */
export const insertAdminProfile = new PreparedQuery<IInsertAdminProfileParams,IInsertAdminProfileResult>(insertAdminProfileIR);


