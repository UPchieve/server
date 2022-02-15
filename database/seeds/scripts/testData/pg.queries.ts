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
  ok: string | null;
}

/** 'InsertSchool' query type */
export interface IInsertSchoolQuery {
  params: IInsertSchoolParams;
  result: IInsertSchoolResult;
}

const insertSchoolIR: any = {"name":"insertSchool","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":133,"b":135,"line":4,"col":17},{"a":318,"b":320,"line":12,"col":43}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":139,"b":143,"line":4,"col":23}]}},{"name":"approved","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":147,"b":155,"line":4,"col":31}]}},{"name":"partner","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":159,"b":166,"line":4,"col":43}]}}],"usedParamSet":{"id":true,"name":true,"approved":true,"partner":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO schools (id, name, approved, partner, created_at, updated_at)\n        VALUES (:id!, :name!, :approved!, :partner!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM schools WHERE id=:id!","loc":{"a":25,"b":320,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO schools (id, name, approved, partner, created_at, updated_at)
 *         VALUES (:id!, :name!, :approved!, :partner!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM schools WHERE id=:id!
 * ```
 */
export const insertSchool = new PreparedQuery<IInsertSchoolParams,IInsertSchoolResult>(insertSchoolIR);


/** 'InsertStudentUser' parameters type */
export interface IInsertStudentUserParams {
  banned: boolean | null | void;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  password: string;
  referralCode: string;
  referredBy: string | null | void;
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

const insertStudentUserIR: any = {"name":"insertStudentUser","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":522,"b":524,"line":18,"col":17},{"a":770,"b":772,"line":26,"col":41}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":528,"b":533,"line":18,"col":23}]}},{"name":"password","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":537,"b":545,"line":18,"col":32}]}},{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":549,"b":558,"line":18,"col":44}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":562,"b":570,"line":18,"col":57}]}},{"name":"referralCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":574,"b":586,"line":18,"col":69}]}},{"name":"referredBy","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":590,"b":599,"line":18,"col":85}]}},{"name":"verified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":603,"b":611,"line":18,"col":98}]}},{"name":"banned","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":615,"b":620,"line":18,"col":110}]}}],"usedParamSet":{"id":true,"email":true,"password":true,"firstName":true,"lastName":true,"referralCode":true,"referredBy":true,"verified":true,"banned":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO users (id, email, password, first_name, last_name, referral_code, referred_by, verified, banned, created_at, updated_at)\n        VALUES (:id!, :email!, :password!, :firstName!, :lastName!, :referralCode!, :referredBy, :verified!, :banned, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM users WHERE id=:id!","loc":{"a":355,"b":772,"line":16,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO users (id, email, password, first_name, last_name, referral_code, referred_by, verified, banned, created_at, updated_at)
 *         VALUES (:id!, :email!, :password!, :firstName!, :lastName!, :referralCode!, :referredBy, :verified!, :banned, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM users WHERE id=:id!
 * ```
 */
export const insertStudentUser = new PreparedQuery<IInsertStudentUserParams,IInsertStudentUserResult>(insertStudentUserIR);


/** 'InsertStudentProfile' parameters type */
export interface IInsertStudentProfileParams {
  studentPartnerOrgId: string | null | void;
  studentPartnerOrgUserId: string | null | void;
  userId: string;
}

/** 'InsertStudentProfile' return type */
export interface IInsertStudentProfileResult {
  ok: string | null;
}

/** 'InsertStudentProfile' query type */
export interface IInsertStudentProfileQuery {
  params: IInsertStudentProfileParams;
  result: IInsertStudentProfileResult;
}

const insertStudentProfileIR: any = {"name":"insertStudentProfile","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":960,"b":966,"line":32,"col":17},{"a":1190,"b":1196,"line":40,"col":62}]}},{"name":"studentPartnerOrgId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":970,"b":988,"line":32,"col":27}]}},{"name":"studentPartnerOrgUserId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":992,"b":1014,"line":32,"col":49}]}}],"usedParamSet":{"userId":true,"studentPartnerOrgId":true,"studentPartnerOrgUserId":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO student_profiles (user_id, student_partner_org_id, student_partner_org_user_id, created_at, updated_at)\n        VALUES (:userId!, :studentPartnerOrgId, :studentPartnerOrgUserId, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        user_id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT user_id AS ok FROM student_profiles WHERE user_id=:userId!","loc":{"a":810,"b":1196,"line":30,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO student_profiles (user_id, student_partner_org_id, student_partner_org_user_id, created_at, updated_at)
 *         VALUES (:userId!, :studentPartnerOrgId, :studentPartnerOrgUserId, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         user_id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT user_id AS ok FROM student_profiles WHERE user_id=:userId!
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

const insertVolunteerUserIR: any = {"name":"insertVolunteerUser","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1411,"b":1413,"line":46,"col":17},{"a":1673,"b":1675,"line":54,"col":41}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1417,"b":1422,"line":46,"col":23}]}},{"name":"phone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1426,"b":1431,"line":46,"col":32}]}},{"name":"password","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1435,"b":1443,"line":46,"col":41}]}},{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1447,"b":1456,"line":46,"col":53}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1460,"b":1468,"line":46,"col":66}]}},{"name":"referralCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1472,"b":1484,"line":46,"col":78}]}},{"name":"verified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1488,"b":1496,"line":46,"col":94}]}},{"name":"testUser","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1500,"b":1508,"line":46,"col":106}]}},{"name":"timeTutored","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1512,"b":1523,"line":46,"col":118}]}}],"usedParamSet":{"id":true,"email":true,"phone":true,"password":true,"firstName":true,"lastName":true,"referralCode":true,"verified":true,"testUser":true,"timeTutored":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO users (id, email, PASSWORD, phone, first_name, last_name, referral_code, verified, test_user, time_tutored, created_at, updated_at)\n        VALUES (:id!, :email!, :phone!, :password!, :firstName!, :lastName!, :referralCode!, :verified!, :testUser!, :timeTutored!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM users WHERE id=:id!","loc":{"a":1233,"b":1675,"line":44,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO users (id, email, PASSWORD, phone, first_name, last_name, referral_code, verified, test_user, time_tutored, created_at, updated_at)
 *         VALUES (:id!, :email!, :phone!, :password!, :firstName!, :lastName!, :referralCode!, :verified!, :testUser!, :timeTutored!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM users WHERE id=:id!
 * ```
 */
export const insertVolunteerUser = new PreparedQuery<IInsertVolunteerUserParams,IInsertVolunteerUserResult>(insertVolunteerUserIR);


/** 'InsertVolunteerProfile' parameters type */
export interface IInsertVolunteerProfileParams {
  approved: boolean;
  college: string;
  onboarded: boolean;
  photoIdStatus: number | null | void;
  timezone: string;
  userId: string;
  volunteerPartnerOrgId: string | null | void;
}

/** 'InsertVolunteerProfile' return type */
export interface IInsertVolunteerProfileResult {
  ok: string | null;
}

/** 'InsertVolunteerProfile' query type */
export interface IInsertVolunteerProfileQuery {
  params: IInsertVolunteerProfileParams;
  result: IInsertVolunteerProfileResult;
}

const insertVolunteerProfileIR: any = {"name":"insertVolunteerProfile","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1897,"b":1903,"line":60,"col":17},{"a":2169,"b":2175,"line":68,"col":64}]}},{"name":"timezone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1907,"b":1915,"line":60,"col":27}]}},{"name":"approved","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1919,"b":1927,"line":60,"col":39}]}},{"name":"onboarded","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1931,"b":1940,"line":60,"col":51}]}},{"name":"college","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1944,"b":1951,"line":60,"col":64}]}},{"name":"volunteerPartnerOrgId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1955,"b":1975,"line":60,"col":75}]}},{"name":"photoIdStatus","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1979,"b":1991,"line":60,"col":99}]}}],"usedParamSet":{"userId":true,"timezone":true,"approved":true,"onboarded":true,"college":true,"volunteerPartnerOrgId":true,"photoIdStatus":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO volunteer_profiles (user_id, timezone, approved, onboarded, college, volunteer_partner_org_id, photo_id_status, created_at, updated_at)\n        VALUES (:userId!, :timezone!, :approved!, :onboarded!, :college!, :volunteerPartnerOrgId, :photoIdStatus, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        user_id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT user_id AS ok FROM volunteer_profiles WHERE user_id=:userId!","loc":{"a":1715,"b":2175,"line":58,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO volunteer_profiles (user_id, timezone, approved, onboarded, college, volunteer_partner_org_id, photo_id_status, created_at, updated_at)
 *         VALUES (:userId!, :timezone!, :approved!, :onboarded!, :college!, :volunteerPartnerOrgId, :photoIdStatus, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         user_id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT user_id AS ok FROM volunteer_profiles WHERE user_id=:userId!
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
  ok: string | null;
}

/** 'InsertUserCertification' query type */
export interface IInsertUserCertificationQuery {
  params: IInsertUserCertificationParams;
  result: IInsertUserCertificationResult;
}

const insertUserCertificationIR: any = {"name":"insertUserCertification","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2335,"b":2341,"line":74,"col":17},{"a":2540,"b":2546,"line":82,"col":66}]}},{"name":"certificationId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2345,"b":2360,"line":74,"col":27},{"a":2570,"b":2585,"line":82,"col":96}]}}],"usedParamSet":{"userId":true,"certificationId":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at)\n        VALUES (:userId!, :certificationId!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        user_id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT user_id AS ok FROM users_certifications WHERE user_id=:userId! AND certification_id=:certificationId!","loc":{"a":2216,"b":2585,"line":72,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at)
 *         VALUES (:userId!, :certificationId!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         user_id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT user_id AS ok FROM users_certifications WHERE user_id=:userId! AND certification_id=:certificationId!
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
  ok: string | null;
}

/** 'InsertIntoUserQuizzes' query type */
export interface IInsertIntoUserQuizzesQuery {
  params: IInsertIntoUserQuizzesParams;
  result: IInsertIntoUserQuizzesResult;
}

const insertIntoUserQuizzesIR: any = {"name":"insertIntoUserQuizzes","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2727,"b":2733,"line":88,"col":17},{"a":2916,"b":2922,"line":96,"col":59}]}},{"name":"quizId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2737,"b":2743,"line":88,"col":27},{"a":2937,"b":2943,"line":96,"col":80}]}}],"usedParamSet":{"userId":true,"quizId":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO users_quizzes (user_id, quiz_id, created_at, updated_at)\n        VALUES (:userId!, :quizId!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        user_id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT user_id AS ok FROM users_quizzes WHERE user_id=:userId! AND quiz_id=:quizId!","loc":{"a":2624,"b":2943,"line":86,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO users_quizzes (user_id, quiz_id, created_at, updated_at)
 *         VALUES (:userId!, :quizId!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         user_id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT user_id AS ok FROM users_quizzes WHERE user_id=:userId! AND quiz_id=:quizId!
 * ```
 */
export const insertIntoUserQuizzes = new PreparedQuery<IInsertIntoUserQuizzesParams,IInsertIntoUserQuizzesResult>(insertIntoUserQuizzesIR);


/** 'InsertAdminProfile' parameters type */
export interface IInsertAdminProfileParams {
  userId: string;
}

/** 'InsertAdminProfile' return type */
export interface IInsertAdminProfileResult {
  ok: string | null;
}

/** 'InsertAdminProfile' query type */
export interface IInsertAdminProfileQuery {
  params: IInsertAdminProfileParams;
  result: IInsertAdminProfileResult;
}

const insertAdminProfileIR: any = {"name":"insertAdminProfile","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3074,"b":3080,"line":102,"col":17},{"a":3254,"b":3260,"line":110,"col":60}]}}],"usedParamSet":{"userId":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO admin_profiles (user_id, created_at, updated_at)\n        VALUES (:userId!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        user_id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT user_id AS ok FROM admin_profiles WHERE user_id=:userId!","loc":{"a":2979,"b":3260,"line":100,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO admin_profiles (user_id, created_at, updated_at)
 *         VALUES (:userId!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         user_id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT user_id AS ok FROM admin_profiles WHERE user_id=:userId!
 * ```
 */
export const insertAdminProfile = new PreparedQuery<IInsertAdminProfileParams,IInsertAdminProfileResult>(insertAdminProfileIR);


/** 'InsertUserProductFlag' parameters type */
export interface IInsertUserProductFlagParams {
  userId: string;
}

/** 'InsertUserProductFlag' return type */
export interface IInsertUserProductFlagResult {
  ok: string | null;
}

/** 'InsertUserProductFlag' query type */
export interface IInsertUserProductFlagQuery {
  params: IInsertUserProductFlagParams;
  result: IInsertUserProductFlagResult;
}

const insertUserProductFlagIR: any = {"name":"insertUserProductFlag","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3398,"b":3404,"line":116,"col":17},{"a":3582,"b":3588,"line":124,"col":64}]}}],"usedParamSet":{"userId":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO user_product_flags (user_id, created_at, updated_at)\n        VALUES (:userId!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        user_id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT user_id AS ok FROM user_product_flags WHERE user_id=:userId!","loc":{"a":3299,"b":3588,"line":114,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO user_product_flags (user_id, created_at, updated_at)
 *         VALUES (:userId!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         user_id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT user_id AS ok FROM user_product_flags WHERE user_id=:userId!
 * ```
 */
export const insertUserProductFlag = new PreparedQuery<IInsertUserProductFlagParams,IInsertUserProductFlagResult>(insertUserProductFlagIR);


/** 'InsertUserSessionMetric' parameters type */
export interface IInsertUserSessionMetricParams {
  userId: string;
}

/** 'InsertUserSessionMetric' return type */
export interface IInsertUserSessionMetricResult {
  ok: string | null;
}

/** 'InsertUserSessionMetric' query type */
export interface IInsertUserSessionMetricQuery {
  params: IInsertUserSessionMetricParams;
  result: IInsertUserSessionMetricResult;
}

const insertUserSessionMetricIR: any = {"name":"insertUserSessionMetric","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3730,"b":3736,"line":130,"col":17},{"a":3916,"b":3922,"line":138,"col":66}]}}],"usedParamSet":{"userId":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO user_session_metrics (user_id, created_at, updated_at)\n        VALUES (:userId!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        user_id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT user_id AS ok FROM user_session_metrics WHERE user_id=:userId!","loc":{"a":3629,"b":3922,"line":128,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO user_session_metrics (user_id, created_at, updated_at)
 *         VALUES (:userId!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         user_id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT user_id AS ok FROM user_session_metrics WHERE user_id=:userId!
 * ```
 */
export const insertUserSessionMetric = new PreparedQuery<IInsertUserSessionMetricParams,IInsertUserSessionMetricResult>(insertUserSessionMetricIR);


/** 'InsertIneligibleStudent' parameters type */
export interface IInsertIneligibleStudentParams {
  email: string;
  id: string;
}

/** 'InsertIneligibleStudent' return type */
export interface IInsertIneligibleStudentResult {
  ok: string | null;
}

/** 'InsertIneligibleStudent' query type */
export interface IInsertIneligibleStudentQuery {
  params: IInsertIneligibleStudentParams;
  result: IInsertIneligibleStudentResult;
}

const insertIneligibleStudentIR: any = {"name":"insertIneligibleStudent","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4065,"b":4067,"line":144,"col":17},{"a":4240,"b":4242,"line":152,"col":55}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4071,"b":4076,"line":144,"col":23}]}}],"usedParamSet":{"id":true,"email":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO ineligible_students (id, email, created_at, updated_at)\n        VALUES (:id!, :email!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM ineligible_students WHERE id=:id!","loc":{"a":3963,"b":4242,"line":142,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO ineligible_students (id, email, created_at, updated_at)
 *         VALUES (:id!, :email!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM ineligible_students WHERE id=:id!
 * ```
 */
export const insertIneligibleStudent = new PreparedQuery<IInsertIneligibleStudentParams,IInsertIneligibleStudentResult>(insertIneligibleStudentIR);


/** 'InsertAvailability' parameters type */
export interface IInsertAvailabilityParams {
  availableEnd: number;
  availableStart: number;
  id: string;
  timezone: string;
  userId: string;
  weekdayId: number;
}

/** 'InsertAvailability' return type */
export interface IInsertAvailabilityResult {
  ok: string | null;
}

/** 'InsertAvailability' query type */
export interface IInsertAvailabilityQuery {
  params: IInsertAvailabilityParams;
  result: IInsertAvailabilityResult;
}

const insertAvailabilityIR: any = {"name":"insertAvailability","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4429,"b":4431,"line":157,"col":16},{"a":4659,"b":4661,"line":165,"col":50}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4435,"b":4441,"line":157,"col":22}]}},{"name":"weekdayId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4445,"b":4454,"line":157,"col":32}]}},{"name":"availableStart","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4458,"b":4472,"line":157,"col":45}]}},{"name":"availableEnd","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4476,"b":4488,"line":157,"col":63}]}},{"name":"timezone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4492,"b":4500,"line":157,"col":79}]}}],"usedParamSet":{"id":true,"userId":true,"weekdayId":true,"availableStart":true,"availableEnd":true,"timezone":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO availabilities (id, user_id, weekday_id, available_start, available_end, timezone, created_at, updated_at)\n        VALUES(:id!, :userId!, :weekdayId!, :availableStart!, :availableEnd!, :timezone!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id as ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM availabilities WHERE id=:id!","loc":{"a":4277,"b":4661,"line":155,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO availabilities (id, user_id, weekday_id, available_start, available_end, timezone, created_at, updated_at)
 *         VALUES(:id!, :userId!, :weekdayId!, :availableStart!, :availableEnd!, :timezone!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id as ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM availabilities WHERE id=:id!
 * ```
 */
export const insertAvailability = new PreparedQuery<IInsertAvailabilityParams,IInsertAvailabilityResult>(insertAvailabilityIR);


/** 'InsertSession' parameters type */
export interface IInsertSessionParams {
  createdAt: Date;
  endedAt: Date;
  endedByRoleId: number;
  hasWhiteboardDoc: boolean;
  id: string;
  quillDoc: string | null | void;
  reviewed: boolean;
  studentBanned: boolean | null | void;
  studentId: string;
  subjectId: number;
  timeTutored: string;
  toReview: boolean;
  volunteerId: string | null | void;
  volunteerJoinedAt: Date | null | void;
}

/** 'InsertSession' return type */
export interface IInsertSessionResult {
  ok: string | null;
}

/** 'InsertSession' query type */
export interface IInsertSessionQuery {
  params: IInsertSessionParams;
  result: IInsertSessionResult;
}

const insertSessionIR: any = {"name":"insertSession","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5075,"b":5077,"line":187,"col":9},{"a":5532,"b":5534,"line":210,"col":44}]}},{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5089,"b":5098,"line":188,"col":9}]}},{"name":"volunteerId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5110,"b":5120,"line":189,"col":9}]}},{"name":"subjectId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5132,"b":5141,"line":190,"col":9}]}},{"name":"hasWhiteboardDoc","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5153,"b":5169,"line":191,"col":9}]}},{"name":"quillDoc","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5181,"b":5188,"line":192,"col":9}]}},{"name":"volunteerJoinedAt","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5200,"b":5216,"line":193,"col":9}]}},{"name":"endedAt","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5228,"b":5235,"line":194,"col":9},{"a":5380,"b":5387,"line":201,"col":9}]}},{"name":"endedByRoleId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5247,"b":5260,"line":195,"col":9}]}},{"name":"reviewed","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5272,"b":5280,"line":196,"col":9}]}},{"name":"toReview","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5292,"b":5300,"line":197,"col":9}]}},{"name":"studentBanned","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5312,"b":5324,"line":198,"col":9}]}},{"name":"timeTutored","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5336,"b":5347,"line":199,"col":9}]}},{"name":"createdAt","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5359,"b":5368,"line":200,"col":9}]}}],"usedParamSet":{"id":true,"studentId":true,"volunteerId":true,"subjectId":true,"hasWhiteboardDoc":true,"quillDoc":true,"volunteerJoinedAt":true,"endedAt":true,"endedByRoleId":true,"reviewed":true,"toReview":true,"studentBanned":true,"timeTutored":true,"createdAt":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO sessions (\n        id,\n        student_id,\n        volunteer_id,\n        subject_id,\n        has_whiteboard_doc,\n        quill_doc,\n        volunteer_joined_at,\n        ended_at,\n        ended_by_role_id,\n        reviewed,\n        to_review,\n        student_banned,\n        time_tutored,\n        created_at,\n        updated_at\n    )\n    VALUES (\n        :id!,\n        :studentId!,\n        :volunteerId,\n        :subjectId!,\n        :hasWhiteboardDoc!,\n        :quillDoc,\n        :volunteerJoinedAt,\n        :endedAt!,\n        :endedByRoleId!,\n        :reviewed!,\n        :toReview!,\n        :studentBanned,\n        :timeTutored!,\n        :createdAt!,\n        :endedAt!\n    )\n    ON CONFLICT\n        DO NOTHING\n    RETURNING \n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM sessions WHERE id=:id!","loc":{"a":4691,"b":5534,"line":168,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO sessions (
 *         id,
 *         student_id,
 *         volunteer_id,
 *         subject_id,
 *         has_whiteboard_doc,
 *         quill_doc,
 *         volunteer_joined_at,
 *         ended_at,
 *         ended_by_role_id,
 *         reviewed,
 *         to_review,
 *         student_banned,
 *         time_tutored,
 *         created_at,
 *         updated_at
 *     )
 *     VALUES (
 *         :id!,
 *         :studentId!,
 *         :volunteerId,
 *         :subjectId!,
 *         :hasWhiteboardDoc!,
 *         :quillDoc,
 *         :volunteerJoinedAt,
 *         :endedAt!,
 *         :endedByRoleId!,
 *         :reviewed!,
 *         :toReview!,
 *         :studentBanned,
 *         :timeTutored!,
 *         :createdAt!,
 *         :endedAt!
 *     )
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING 
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM sessions WHERE id=:id!
 * ```
 */
export const insertSession = new PreparedQuery<IInsertSessionParams,IInsertSessionResult>(insertSessionIR);


/** 'InsertAssistmentsData' parameters type */
export interface IInsertAssistmentsDataParams {
  assistment: readonly ({
    id: string,
    problemId: number,
    assignmentId: string,
    studentId: string,
    sessionId: string,
    sent: boolean,
    sentAt: Date | null | void,
    createdAt: Date | null | void,
    updatedAt: Date | null | void
  })[];
}

/** 'InsertAssistmentsData' return type */
export interface IInsertAssistmentsDataResult {
  ok: string;
}

/** 'InsertAssistmentsData' query type */
export interface IInsertAssistmentsDataQuery {
  params: IInsertAssistmentsDataParams;
  result: IInsertAssistmentsDataResult;
}

const insertAssistmentsDataIR: any = {"name":"insertAssistmentsData","params":[{"name":"assistment","codeRefs":{"defined":{"a":5584,"b":5593,"line":214,"col":11},"used":[{"a":5836,"b":5845,"line":217,"col":12}]},"transform":{"type":"pick_array_spread","keys":[{"name":"id","required":true},{"name":"problemId","required":true},{"name":"assignmentId","required":true},{"name":"studentId","required":true},{"name":"sessionId","required":true},{"name":"sent","required":true},{"name":"sentAt","required":false},{"name":"createdAt","required":false},{"name":"updatedAt","required":false}]},"required":false}],"usedParamSet":{"assistment":true},"statement":{"body":"INSERT INTO assistments_data (id, problem_id, assignment_id, student_id, session_id, sent, sent_at, created_at, updated_at)\n    VALUES :assistment\nON CONFLICT\n    DO NOTHING\nRETURNING\n    id AS ok","loc":{"a":5700,"b":5895,"line":216,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO assistments_data (id, problem_id, assignment_id, student_id, session_id, sent, sent_at, created_at, updated_at)
 *     VALUES :assistment
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertAssistmentsData = new PreparedQuery<IInsertAssistmentsDataParams,IInsertAssistmentsDataResult>(insertAssistmentsDataIR);


/** 'InsertMessages' parameters type */
export interface IInsertMessagesParams {
  message: readonly ({
    id: string,
    senderId: string,
    sessionId: string,
    contents: string,
    createdAt: Date,
    updatedAt: Date
  })[];
}

/** 'InsertMessages' return type */
export interface IInsertMessagesResult {
  ok: string;
}

/** 'InsertMessages' query type */
export interface IInsertMessagesQuery {
  params: IInsertMessagesParams;
  result: IInsertMessagesResult;
}

const insertMessagesIR: any = {"name":"insertMessages","params":[{"name":"message","codeRefs":{"defined":{"a":5939,"b":5945,"line":225,"col":11},"used":[{"a":6125,"b":6132,"line":228,"col":12}]},"transform":{"type":"pick_array_spread","keys":[{"name":"id","required":true},{"name":"senderId","required":true},{"name":"sessionId","required":true},{"name":"contents","required":true},{"name":"createdAt","required":true},{"name":"updatedAt","required":true}]},"required":true}],"usedParamSet":{"message":true},"statement":{"body":"INSERT INTO session_messages (id, sender_id, session_id, contents, created_at, updated_at)\n    VALUES :message!\nON CONFLICT\n    DO NOTHING\nRETURNING\n    id AS ok","loc":{"a":6022,"b":6182,"line":227,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_messages (id, sender_id, session_id, contents, created_at, updated_at)
 *     VALUES :message!
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertMessages = new PreparedQuery<IInsertMessagesParams,IInsertMessagesResult>(insertMessagesIR);


/** 'InsertSessionReport' parameters type */
export interface IInsertSessionReportParams {
  report: readonly ({
    id: string,
    reportReasonId: number,
    reportMessage: string,
    reportingUserId: string,
    reportedUserId: string,
    sessionId: string,
    createdAt: Date | null | void,
    updatedAt: Date | null | void
  })[];
}

/** 'InsertSessionReport' return type */
export interface IInsertSessionReportResult {
  ok: string;
}

/** 'InsertSessionReport' query type */
export interface IInsertSessionReportQuery {
  params: IInsertSessionReportParams;
  result: IInsertSessionReportResult;
}

const insertSessionReportIR: any = {"name":"insertSessionReport","params":[{"name":"report","codeRefs":{"defined":{"a":6232,"b":6237,"line":236,"col":11},"used":[{"a":6510,"b":6515,"line":239,"col":12}]},"transform":{"type":"pick_array_spread","keys":[{"name":"id","required":true},{"name":"reportReasonId","required":true},{"name":"reportMessage","required":true},{"name":"reportingUserId","required":true},{"name":"reportedUserId","required":true},{"name":"sessionId","required":true},{"name":"createdAt","required":false},{"name":"updatedAt","required":false}]},"required":false}],"usedParamSet":{"report":true},"statement":{"body":"INSERT INTO session_reports (id, report_reason_id, report_message, reporting_user_id, reported_user_id, session_id, created_at, updated_at)\n    VALUES :report\nON CONFLICT\n    DO NOTHING\nRETURNING\n    id AS ok","loc":{"a":6358,"b":6565,"line":238,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO session_reports (id, report_reason_id, report_message, reporting_user_id, reported_user_id, session_id, created_at, updated_at)
 *     VALUES :report
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertSessionReport = new PreparedQuery<IInsertSessionReportParams,IInsertSessionReportResult>(insertSessionReportIR);


