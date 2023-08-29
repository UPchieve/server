/** Types generated for queries found in "server/models/Student/student.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetGatesStudentById' parameters type */
export interface IGetGatesStudentByIdParams {
  userId: string;
}

/** 'GetGatesStudentById' return type */
export interface IGetGatesStudentByIdResult {
  approvedHighschool: string | null;
  currentGrade: string;
  id: string;
  isPartnerSchool: boolean;
  studentPartnerOrg: string;
}

/** 'GetGatesStudentById' query type */
export interface IGetGatesStudentByIdQuery {
  params: IGetGatesStudentByIdParams;
  result: IGetGatesStudentByIdResult;
}

const getGatesStudentByIdIR: any = {"name":"getGatesStudentById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":573,"b":579,"line":14,"col":32}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    student_profiles.user_id AS id,\n    grade_levels.name AS current_grade,\n    student_partner_orgs.name AS student_partner_org,\n    schools.partner AS is_partner_school,\n    student_profiles.school_id AS approved_highschool\nFROM\n    student_profiles\n    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\n    JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id\n    LEFT JOIN schools ON student_profiles.school_id = schools.id\nWHERE\n    student_profiles.user_id = :userId!","loc":{"a":32,"b":579,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     student_profiles.user_id AS id,
 *     grade_levels.name AS current_grade,
 *     student_partner_orgs.name AS student_partner_org,
 *     schools.partner AS is_partner_school,
 *     student_profiles.school_id AS approved_highschool
 * FROM
 *     student_profiles
 *     LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id
 *     JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id
 *     LEFT JOIN schools ON student_profiles.school_id = schools.id
 * WHERE
 *     student_profiles.user_id = :userId!
 * ```
 */
export const getGatesStudentById = new PreparedQuery<IGetGatesStudentByIdParams,IGetGatesStudentByIdResult>(getGatesStudentByIdIR);


/** 'GetStudentContactInfoById' parameters type */
export interface IGetStudentContactInfoByIdParams {
  mongoUserId: string | null | void;
  userId: string | null | void;
}

/** 'GetStudentContactInfoById' return type */
export interface IGetStudentContactInfoByIdResult {
  email: string;
  firstName: string;
  id: string;
  schoolId: string | null;
  studentPartnerOrg: string;
}

/** 'GetStudentContactInfoById' query type */
export interface IGetStudentContactInfoByIdQuery {
  params: IGetStudentContactInfoByIdParams;
  result: IGetStudentContactInfoByIdResult;
}

const getStudentContactInfoByIdIR: any = {"name":"getStudentContactInfoById","params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1052,"b":1057,"line":32,"col":27}]}},{"name":"mongoUserId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1094,"b":1104,"line":33,"col":35}]}}],"usedParamSet":{"userId":true,"mongoUserId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    email,\n    student_partner_orgs.key AS student_partner_org,\n    student_profiles.school_id\nFROM\n    users\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\nWHERE\n    banned IS FALSE\n    AND deactivated IS FALSE\n    AND test_user IS FALSE\n    AND (users.id::uuid = :userId\n        OR users.mongo_id::text = :mongoUserId)","loc":{"a":622,"b":1105,"line":18,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     email,
 *     student_partner_orgs.key AS student_partner_org,
 *     student_profiles.school_id
 * FROM
 *     users
 *     LEFT JOIN student_profiles ON student_profiles.user_id = users.id
 *     LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
 * WHERE
 *     banned IS FALSE
 *     AND deactivated IS FALSE
 *     AND test_user IS FALSE
 *     AND (users.id::uuid = :userId
 *         OR users.mongo_id::text = :mongoUserId)
 * ```
 */
export const getStudentContactInfoById = new PreparedQuery<IGetStudentContactInfoByIdParams,IGetStudentContactInfoByIdResult>(getStudentContactInfoByIdIR);


/** 'IsTestUser' parameters type */
export interface IIsTestUserParams {
  userId: string;
}

/** 'IsTestUser' return type */
export interface IIsTestUserResult {
  testUser: boolean;
}

/** 'IsTestUser' query type */
export interface IIsTestUserQuery {
  params: IIsTestUserParams;
  result: IIsTestUserResult;
}

const isTestUserIR: any = {"name":"isTestUser","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1185,"b":1191,"line":42,"col":10}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    test_user\nFROM\n    users\nWHERE\n    id = :userId!","loc":{"a":1133,"b":1191,"line":37,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     test_user
 * FROM
 *     users
 * WHERE
 *     id = :userId!
 * ```
 */
export const isTestUser = new PreparedQuery<IIsTestUserParams,IIsTestUserResult>(isTestUserIR);


/** 'GetTotalFavoriteVolunteers' parameters type */
export interface IGetTotalFavoriteVolunteersParams {
  userId: string;
}

/** 'GetTotalFavoriteVolunteers' return type */
export interface IGetTotalFavoriteVolunteersResult {
  total: number | null;
}

/** 'GetTotalFavoriteVolunteers' query type */
export interface IGetTotalFavoriteVolunteersQuery {
  params: IGetTotalFavoriteVolunteersParams;
  result: IGetTotalFavoriteVolunteersResult;
}

const getTotalFavoriteVolunteersIR: any = {"name":"getTotalFavoriteVolunteers","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1330,"b":1336,"line":51,"col":18}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    COUNT(*)::int AS total\nFROM\n    student_favorite_volunteers\nWHERE\n    student_id = :userId!","loc":{"a":1235,"b":1336,"line":46,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     COUNT(*)::int AS total
 * FROM
 *     student_favorite_volunteers
 * WHERE
 *     student_id = :userId!
 * ```
 */
export const getTotalFavoriteVolunteers = new PreparedQuery<IGetTotalFavoriteVolunteersParams,IGetTotalFavoriteVolunteersResult>(getTotalFavoriteVolunteersIR);


/** 'IsFavoriteVolunteer' parameters type */
export interface IIsFavoriteVolunteerParams {
  studentId: string;
  volunteerId: string;
}

/** 'IsFavoriteVolunteer' return type */
export interface IIsFavoriteVolunteerResult {
  volunteerId: string;
}

/** 'IsFavoriteVolunteer' query type */
export interface IIsFavoriteVolunteerQuery {
  params: IIsFavoriteVolunteerParams;
  result: IIsFavoriteVolunteerResult;
}

const isFavoriteVolunteerIR: any = {"name":"isFavoriteVolunteer","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1458,"b":1467,"line":60,"col":18}]}},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1493,"b":1504,"line":61,"col":24}]}}],"usedParamSet":{"studentId":true,"volunteerId":true},"statement":{"body":"SELECT\n    volunteer_id\nFROM\n    student_favorite_volunteers\nWHERE\n    student_id = :studentId!\n    AND volunteer_id = :volunteerId!","loc":{"a":1373,"b":1504,"line":55,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     volunteer_id
 * FROM
 *     student_favorite_volunteers
 * WHERE
 *     student_id = :studentId!
 *     AND volunteer_id = :volunteerId!
 * ```
 */
export const isFavoriteVolunteer = new PreparedQuery<IIsFavoriteVolunteerParams,IIsFavoriteVolunteerResult>(isFavoriteVolunteerIR);


/** 'GetFavoriteVolunteersByStudentId' parameters type */
export interface IGetFavoriteVolunteersByStudentIdParams {
  studentId: string;
}

/** 'GetFavoriteVolunteersByStudentId' return type */
export interface IGetFavoriteVolunteersByStudentIdResult {
  id: string;
}

/** 'GetFavoriteVolunteersByStudentId' query type */
export interface IGetFavoriteVolunteersByStudentIdQuery {
  params: IGetFavoriteVolunteersByStudentIdParams;
  result: IGetFavoriteVolunteersByStudentIdResult;
}

const getFavoriteVolunteersByStudentIdIR: any = {"name":"getFavoriteVolunteersByStudentId","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1776,"b":1785,"line":71,"col":46}]}}],"usedParamSet":{"studentId":true},"statement":{"body":"SELECT\n    student_favorite_volunteers.volunteer_id AS id\nFROM\n    student_favorite_volunteers\n    LEFT JOIN users ON student_favorite_volunteers.volunteer_id = users.id\nWHERE\n    student_favorite_volunteers.student_id = :studentId!","loc":{"a":1554,"b":1785,"line":65,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     student_favorite_volunteers.volunteer_id AS id
 * FROM
 *     student_favorite_volunteers
 *     LEFT JOIN users ON student_favorite_volunteers.volunteer_id = users.id
 * WHERE
 *     student_favorite_volunteers.student_id = :studentId!
 * ```
 */
export const getFavoriteVolunteersByStudentId = new PreparedQuery<IGetFavoriteVolunteersByStudentIdParams,IGetFavoriteVolunteersByStudentIdResult>(getFavoriteVolunteersByStudentIdIR);


/** 'GetFavoriteVolunteersPaginated' parameters type */
export interface IGetFavoriteVolunteersPaginatedParams {
  limit: number;
  offset: number;
  studentId: string;
}

/** 'GetFavoriteVolunteersPaginated' return type */
export interface IGetFavoriteVolunteersPaginatedResult {
  firstName: string;
  numSessions: number | null;
  volunteerId: string;
}

/** 'GetFavoriteVolunteersPaginated' query type */
export interface IGetFavoriteVolunteersPaginatedQuery {
  params: IGetFavoriteVolunteersPaginatedParams;
  result: IGetFavoriteVolunteersPaginatedResult;
}

const getFavoriteVolunteersPaginatedIR: any = {"name":"getFavoriteVolunteersPaginated","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2282,"b":2291,"line":89,"col":35},{"a":2510,"b":2519,"line":94,"col":46}]}},{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2586,"b":2591,"line":97,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2608,"b":2614,"line":97,"col":30}]}}],"usedParamSet":{"studentId":true,"limit":true,"offset":true},"statement":{"body":"SELECT\n    student_favorite_volunteers.volunteer_id AS volunteer_id,\n    users.first_name AS first_name,\n    COALESCE(sessions.total, 0)::int AS num_sessions\nFROM\n    student_favorite_volunteers\n    LEFT JOIN users ON student_favorite_volunteers.volunteer_id = users.id\n    LEFT JOIN (\n        SELECT\n            count(*) AS total,\n            sessions.volunteer_id\n        FROM\n            sessions\n        WHERE\n            sessions.student_id = :studentId!\n        GROUP BY\n            sessions.student_id,\n            sessions.volunteer_id) AS sessions ON sessions.volunteer_id = student_favorite_volunteers.volunteer_id\nWHERE\n    student_favorite_volunteers.student_id = :studentId!\nORDER BY\n    student_favorite_volunteers.created_at DESC\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":1833,"b":2620,"line":75,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     student_favorite_volunteers.volunteer_id AS volunteer_id,
 *     users.first_name AS first_name,
 *     COALESCE(sessions.total, 0)::int AS num_sessions
 * FROM
 *     student_favorite_volunteers
 *     LEFT JOIN users ON student_favorite_volunteers.volunteer_id = users.id
 *     LEFT JOIN (
 *         SELECT
 *             count(*) AS total,
 *             sessions.volunteer_id
 *         FROM
 *             sessions
 *         WHERE
 *             sessions.student_id = :studentId!
 *         GROUP BY
 *             sessions.student_id,
 *             sessions.volunteer_id) AS sessions ON sessions.volunteer_id = student_favorite_volunteers.volunteer_id
 * WHERE
 *     student_favorite_volunteers.student_id = :studentId!
 * ORDER BY
 *     student_favorite_volunteers.created_at DESC
 * LIMIT (:limit!)::int OFFSET (:offset!)::int
 * ```
 */
export const getFavoriteVolunteersPaginated = new PreparedQuery<IGetFavoriteVolunteersPaginatedParams,IGetFavoriteVolunteersPaginatedResult>(getFavoriteVolunteersPaginatedIR);


/** 'DeleteFavoriteVolunteer' parameters type */
export interface IDeleteFavoriteVolunteerParams {
  studentId: string;
  volunteerId: string;
}

/** 'DeleteFavoriteVolunteer' return type */
export interface IDeleteFavoriteVolunteerResult {
  studentId: string;
  volunteerId: string;
}

/** 'DeleteFavoriteVolunteer' query type */
export interface IDeleteFavoriteVolunteerQuery {
  params: IDeleteFavoriteVolunteerParams;
  result: IDeleteFavoriteVolunteerResult;
}

const deleteFavoriteVolunteerIR: any = {"name":"deleteFavoriteVolunteer","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2721,"b":2730,"line":102,"col":20}]}},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2756,"b":2767,"line":103,"col":24}]}}],"usedParamSet":{"studentId":true,"volunteerId":true},"statement":{"body":"DELETE FROM student_favorite_volunteers\nWHERE student_id = :studentId!\n    AND volunteer_id = :volunteerId!\nRETURNING\n    student_id,\n    volunteer_id","loc":{"a":2661,"b":2810,"line":101,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM student_favorite_volunteers
 * WHERE student_id = :studentId!
 *     AND volunteer_id = :volunteerId!
 * RETURNING
 *     student_id,
 *     volunteer_id
 * ```
 */
export const deleteFavoriteVolunteer = new PreparedQuery<IDeleteFavoriteVolunteerParams,IDeleteFavoriteVolunteerResult>(deleteFavoriteVolunteerIR);


/** 'AddFavoriteVolunteer' parameters type */
export interface IAddFavoriteVolunteerParams {
  studentId: string;
  volunteerId: string;
}

/** 'AddFavoriteVolunteer' return type */
export interface IAddFavoriteVolunteerResult {
  studentId: string | null;
  volunteerId: string | null;
}

/** 'AddFavoriteVolunteer' query type */
export interface IAddFavoriteVolunteerQuery {
  params: IAddFavoriteVolunteerParams;
  result: IAddFavoriteVolunteerResult;
}

const addFavoriteVolunteerIR: any = {"name":"addFavoriteVolunteer","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2970,"b":2979,"line":112,"col":17},{"a":3275,"b":3284,"line":128,"col":22}]}},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2983,"b":2994,"line":112,"col":30},{"a":3318,"b":3329,"line":129,"col":32}]}}],"usedParamSet":{"studentId":true,"volunteerId":true},"statement":{"body":"WITH ins AS (\nINSERT INTO student_favorite_volunteers (student_id, volunteer_id, created_at, updated_at)\n        VALUES (:studentId!, :volunteerId!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        student_id, volunteer_id)\n    SELECT\n        *\n    FROM\n        ins\n    UNION\n    SELECT\n        student_id,\n        volunteer_id\n    FROM\n        student_favorite_volunteers\n    WHERE\n        student_id = :studentId!\n            AND volunteer_id = :volunteerId!","loc":{"a":2848,"b":3329,"line":110,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS (
 * INSERT INTO student_favorite_volunteers (student_id, volunteer_id, created_at, updated_at)
 *         VALUES (:studentId!, :volunteerId!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         student_id, volunteer_id)
 *     SELECT
 *         *
 *     FROM
 *         ins
 *     UNION
 *     SELECT
 *         student_id,
 *         volunteer_id
 *     FROM
 *         student_favorite_volunteers
 *     WHERE
 *         student_id = :studentId!
 *             AND volunteer_id = :volunteerId!
 * ```
 */
export const addFavoriteVolunteer = new PreparedQuery<IAddFavoriteVolunteerParams,IAddFavoriteVolunteerResult>(addFavoriteVolunteerIR);


/** 'GetReportedStudent' parameters type */
export interface IGetReportedStudentParams {
  userId: string;
}

/** 'GetReportedStudent' return type */
export interface IGetReportedStudentResult {
  createdAt: Date;
  email: string;
  firstName: string;
  id: string;
  isBanned: boolean;
  isDeactivated: boolean;
  isTestUser: boolean;
  isVolunteer: boolean | null;
  lastName: string;
  studentPartnerOrg: string;
}

/** 'GetReportedStudent' query type */
export interface IGetReportedStudentQuery {
  params: IGetReportedStudentParams;
  result: IGetReportedStudentResult;
}

const getReportedStudentIR: any = {"name":"getReportedStudent","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3902,"b":3908,"line":151,"col":20}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id AS id,\n    first_name,\n    last_name,\n    email,\n    users.created_at AS created_at,\n    test_user AS is_test_user,\n    banned AS is_banned,\n    deactivated AS is_deactivated,\n    FALSE AS is_volunteer,\n    student_partner_orgs.key AS student_partner_org\nFROM\n    users\n    JOIN student_profiles ON users.id = student_profiles.user_id\n    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\nWHERE\n    deactivated IS FALSE\n    AND test_user IS FALSE\n    AND users.id = :userId!","loc":{"a":3365,"b":3908,"line":133,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id AS id,
 *     first_name,
 *     last_name,
 *     email,
 *     users.created_at AS created_at,
 *     test_user AS is_test_user,
 *     banned AS is_banned,
 *     deactivated AS is_deactivated,
 *     FALSE AS is_volunteer,
 *     student_partner_orgs.key AS student_partner_org
 * FROM
 *     users
 *     JOIN student_profiles ON users.id = student_profiles.user_id
 *     LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id
 * WHERE
 *     deactivated IS FALSE
 *     AND test_user IS FALSE
 *     AND users.id = :userId!
 * ```
 */
export const getReportedStudent = new PreparedQuery<IGetReportedStudentParams,IGetReportedStudentResult>(getReportedStudentIR);


/** 'GetStudentPartnerInfoById' parameters type */
export interface IGetStudentPartnerInfoByIdParams {
  userId: string;
}

/** 'GetStudentPartnerInfoById' return type */
export interface IGetStudentPartnerInfoByIdResult {
  approvedHighschool: string | null;
  id: string;
  studentPartnerOrg: string;
}

/** 'GetStudentPartnerInfoById' query type */
export interface IGetStudentPartnerInfoByIdQuery {
  params: IGetStudentPartnerInfoByIdParams;
  result: IGetStudentPartnerInfoByIdResult;
}

const getStudentPartnerInfoByIdIR: any = {"name":"getStudentPartnerInfoById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4269,"b":4275,"line":163,"col":32}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    student_profiles.user_id AS id,\n    student_partner_orgs.key AS student_partner_org,\n    student_profiles.school_id AS approved_highschool\nFROM\n    student_profiles\n    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\nWHERE\n    student_profiles.user_id = :userId!","loc":{"a":3951,"b":4275,"line":155,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     student_profiles.user_id AS id,
 *     student_partner_orgs.key AS student_partner_org,
 *     student_profiles.school_id AS approved_highschool
 * FROM
 *     student_profiles
 *     LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id
 * WHERE
 *     student_profiles.user_id = :userId!
 * ```
 */
export const getStudentPartnerInfoById = new PreparedQuery<IGetStudentPartnerInfoByIdParams,IGetStudentPartnerInfoByIdResult>(getStudentPartnerInfoByIdIR);


/** 'DeleteStudent' parameters type */
export interface IDeleteStudentParams {
  email: string;
  userId: string;
}

/** 'DeleteStudent' return type */
export interface IDeleteStudentResult {
  ok: string;
}

/** 'DeleteStudent' query type */
export interface IDeleteStudentQuery {
  params: IDeleteStudentParams;
  result: IDeleteStudentResult;
}

const deleteStudentIR: any = {"name":"deleteStudent","params":[{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4340,"b":4345,"line":170,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4387,"b":4393,"line":173,"col":10}]}}],"usedParamSet":{"email":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    email = :email!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":4306,"b":4416,"line":167,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     email = :email!,
 *     updated_at = NOW()
 * WHERE
 *     id = :userId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const deleteStudent = new PreparedQuery<IDeleteStudentParams,IDeleteStudentResult>(deleteStudentIR);


/** 'AdminUpdateStudent' parameters type */
export interface IAdminUpdateStudentParams {
  banned: boolean;
  deactivated: boolean;
  email: string;
  firstName: string;
  lastName: string;
  userId: string;
  verified: boolean;
}

/** 'AdminUpdateStudent' return type */
export interface IAdminUpdateStudentResult {
  ok: string;
}

/** 'AdminUpdateStudent' query type */
export interface IAdminUpdateStudentQuery {
  params: IAdminUpdateStudentParams;
  result: IAdminUpdateStudentResult;
}

const adminUpdateStudentIR: any = {"name":"adminUpdateStudent","params":[{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4491,"b":4500,"line":182,"col":18}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4520,"b":4528,"line":183,"col":17}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4544,"b":4549,"line":184,"col":13}]}},{"name":"verified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4568,"b":4576,"line":185,"col":16}]}},{"name":"banned","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4593,"b":4599,"line":186,"col":14}]}},{"name":"deactivated","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4621,"b":4632,"line":187,"col":19}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4674,"b":4680,"line":190,"col":10}]}}],"usedParamSet":{"firstName":true,"lastName":true,"email":true,"verified":true,"banned":true,"deactivated":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    first_name = :firstName!,\n    last_name = :lastName!,\n    email = :email!,\n    verified = :verified!,\n    banned = :banned!,\n    deactivated = :deactivated!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":4452,"b":4703,"line":179,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     first_name = :firstName!,
 *     last_name = :lastName!,
 *     email = :email!,
 *     verified = :verified!,
 *     banned = :banned!,
 *     deactivated = :deactivated!,
 *     updated_at = NOW()
 * WHERE
 *     id = :userId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const adminUpdateStudent = new PreparedQuery<IAdminUpdateStudentParams,IAdminUpdateStudentResult>(adminUpdateStudentIR);


/** 'AdminUpdateStudentProfile' parameters type */
export interface IAdminUpdateStudentProfileParams {
  partnerOrgId: string | null | void;
  partnerOrgSiteId: string | null | void;
  userId: string;
}

/** 'AdminUpdateStudentProfile' return type */
export interface IAdminUpdateStudentProfileResult {
  ok: string;
}

/** 'AdminUpdateStudentProfile' query type */
export interface IAdminUpdateStudentProfileQuery {
  params: IAdminUpdateStudentProfileParams;
  result: IAdminUpdateStudentProfileResult;
}

const adminUpdateStudentProfileIR: any = {"name":"adminUpdateStudentProfile","params":[{"name":"partnerOrgId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4808,"b":4819,"line":199,"col":30}]}},{"name":"partnerOrgSiteId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4857,"b":4872,"line":200,"col":35}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4919,"b":4925,"line":203,"col":15}]}}],"usedParamSet":{"partnerOrgId":true,"partnerOrgSiteId":true,"userId":true},"statement":{"body":"UPDATE\n    student_profiles\nSET\n    student_partner_org_id = :partnerOrgId,\n    student_partner_org_site_id = :partnerOrgSiteId,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":4746,"b":4953,"line":196,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     student_profiles
 * SET
 *     student_partner_org_id = :partnerOrgId,
 *     student_partner_org_site_id = :partnerOrgSiteId,
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const adminUpdateStudentProfile = new PreparedQuery<IAdminUpdateStudentProfileParams,IAdminUpdateStudentProfileResult>(adminUpdateStudentProfileIR);


/** 'GetPartnerOrgsByStudent' parameters type */
export interface IGetPartnerOrgsByStudentParams {
  studentId: string;
}

/** 'GetPartnerOrgsByStudent' return type */
export interface IGetPartnerOrgsByStudentResult {
  id: string;
  name: string;
  schoolId: string | null;
  siteName: string;
}

/** 'GetPartnerOrgsByStudent' query type */
export interface IGetPartnerOrgsByStudentQuery {
  params: IGetPartnerOrgsByStudentParams;
  result: IGetPartnerOrgsByStudentResult;
}

const getPartnerOrgsByStudentIR: any = {"name":"getPartnerOrgsByStudent","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5328,"b":5337,"line":219,"col":21}]}}],"usedParamSet":{"studentId":true},"statement":{"body":"SELECT\n    spo.name,\n    spo.id,\n    spo.school_id,\n    sposite.name AS site_name\nFROM\n    users_student_partner_orgs_instances uspoi\n    JOIN student_partner_orgs spo ON spo.id = uspoi.student_partner_org_id\n    LEFT JOIN student_partner_org_sites sposite ON sposite.id = uspoi.student_partner_org_site_id\nWHERE\n    uspoi.user_id = :studentId!\n    AND deactivated_on IS NULL","loc":{"a":4994,"b":5368,"line":209,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     spo.name,
 *     spo.id,
 *     spo.school_id,
 *     sposite.name AS site_name
 * FROM
 *     users_student_partner_orgs_instances uspoi
 *     JOIN student_partner_orgs spo ON spo.id = uspoi.student_partner_org_id
 *     LEFT JOIN student_partner_org_sites sposite ON sposite.id = uspoi.student_partner_org_site_id
 * WHERE
 *     uspoi.user_id = :studentId!
 *     AND deactivated_on IS NULL
 * ```
 */
export const getPartnerOrgsByStudent = new PreparedQuery<IGetPartnerOrgsByStudentParams,IGetPartnerOrgsByStudentResult>(getPartnerOrgsByStudentIR);


/** 'AdminDeactivateStudentPartnershipInstance' parameters type */
export interface IAdminDeactivateStudentPartnershipInstanceParams {
  spoId: string;
  userId: string;
}

/** 'AdminDeactivateStudentPartnershipInstance' return type */
export interface IAdminDeactivateStudentPartnershipInstanceResult {
  ok: string | null;
}

/** 'AdminDeactivateStudentPartnershipInstance' query type */
export interface IAdminDeactivateStudentPartnershipInstanceQuery {
  params: IAdminDeactivateStudentPartnershipInstanceParams;
  result: IAdminDeactivateStudentPartnershipInstanceResult;
}

const adminDeactivateStudentPartnershipInstanceIR: any = {"name":"adminDeactivateStudentPartnershipInstance","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5527,"b":5533,"line":229,"col":15}]}},{"name":"spoId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5569,"b":5574,"line":230,"col":34}]}}],"usedParamSet":{"userId":true,"spoId":true},"statement":{"body":"UPDATE\n    users_student_partner_orgs_instances\nSET\n    deactivated_on = NOW()\nWHERE\n    user_id = :userId!\n    AND student_partner_org_id = :spoId!\nRETURNING\n    user_id AS ok","loc":{"a":5427,"b":5602,"line":224,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users_student_partner_orgs_instances
 * SET
 *     deactivated_on = NOW()
 * WHERE
 *     user_id = :userId!
 *     AND student_partner_org_id = :spoId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const adminDeactivateStudentPartnershipInstance = new PreparedQuery<IAdminDeactivateStudentPartnershipInstanceParams,IAdminDeactivateStudentPartnershipInstanceResult>(adminDeactivateStudentPartnershipInstanceIR);


/** 'InsertStudentPartnershipInstance' parameters type */
export interface IInsertStudentPartnershipInstanceParams {
  partnerOrgId: string;
  partnerOrgSiteId: string | null | void;
  userId: string;
}

/** 'InsertStudentPartnershipInstance' return type */
export interface IInsertStudentPartnershipInstanceResult {
  ok: string | null;
}

/** 'InsertStudentPartnershipInstance' query type */
export interface IInsertStudentPartnershipInstanceQuery {
  params: IInsertStudentPartnershipInstanceParams;
  result: IInsertStudentPartnershipInstanceResult;
}

const insertStudentPartnershipInstanceIR: any = {"name":"insertStudentPartnershipInstance","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5801,"b":5807,"line":237,"col":13}]}},{"name":"partnerOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5811,"b":5823,"line":237,"col":23}]}},{"name":"partnerOrgSiteId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5827,"b":5842,"line":237,"col":39}]}}],"usedParamSet":{"userId":true,"partnerOrgId":true,"partnerOrgSiteId":true},"statement":{"body":"INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, created_at, updated_at)\n    VALUES (:userId!, :partnerOrgId!, :partnerOrgSiteId, NOW(), NOW())\nRETURNING\n    user_id AS ok","loc":{"a":5652,"b":5885,"line":236,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, created_at, updated_at)
 *     VALUES (:userId!, :partnerOrgId!, :partnerOrgSiteId, NOW(), NOW())
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const insertStudentPartnershipInstance = new PreparedQuery<IInsertStudentPartnershipInstanceParams,IInsertStudentPartnershipInstanceResult>(insertStudentPartnershipInstanceIR);


/** 'GetPartnerOrgByKey' parameters type */
export interface IGetPartnerOrgByKeyParams {
  partnerOrgKey: string | null | void;
  partnerOrgSiteName: string | null | void;
}

/** 'GetPartnerOrgByKey' return type */
export interface IGetPartnerOrgByKeyResult {
  partnerId: string;
  partnerKey: string;
  partnerName: string;
  schoolId: string | null;
  siteId: string;
  siteName: string;
}

/** 'GetPartnerOrgByKey' query type */
export interface IGetPartnerOrgByKeyQuery {
  params: IGetPartnerOrgByKeyParams;
  result: IGetPartnerOrgByKeyResult;
}

const getPartnerOrgByKeyIR: any = {"name":"getPartnerOrgByKey","params":[{"name":"partnerOrgSiteName","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6446,"b":6463,"line":260,"col":46}]}},{"name":"partnerOrgKey","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6611,"b":6623,"line":262,"col":32}]}}],"usedParamSet":{"partnerOrgSiteName":true,"partnerOrgKey":true},"statement":{"body":"SELECT\n    student_partner_orgs.id AS partner_id,\n    student_partner_orgs.key AS partner_key,\n    student_partner_orgs.name AS partner_name,\n    student_partner_orgs.school_id AS school_id,\n    student_partner_org_sites.id AS site_id,\n    student_partner_org_sites.name AS site_name\nFROM\n    student_partner_orgs\n    LEFT JOIN (\n        SELECT\n            name,\n            id,\n            student_partner_org_id\n        FROM\n            student_partner_org_sites\n        WHERE\n            student_partner_org_sites.name = :partnerOrgSiteName) AS student_partner_org_sites ON student_partner_orgs.id = student_partner_org_sites.student_partner_org_id\nWHERE\n    student_partner_orgs.key = :partnerOrgKey\nLIMIT 1","loc":{"a":5921,"b":6631,"line":243,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     student_partner_orgs.id AS partner_id,
 *     student_partner_orgs.key AS partner_key,
 *     student_partner_orgs.name AS partner_name,
 *     student_partner_orgs.school_id AS school_id,
 *     student_partner_org_sites.id AS site_id,
 *     student_partner_org_sites.name AS site_name
 * FROM
 *     student_partner_orgs
 *     LEFT JOIN (
 *         SELECT
 *             name,
 *             id,
 *             student_partner_org_id
 *         FROM
 *             student_partner_org_sites
 *         WHERE
 *             student_partner_org_sites.name = :partnerOrgSiteName) AS student_partner_org_sites ON student_partner_orgs.id = student_partner_org_sites.student_partner_org_id
 * WHERE
 *     student_partner_orgs.key = :partnerOrgKey
 * LIMIT 1
 * ```
 */
export const getPartnerOrgByKey = new PreparedQuery<IGetPartnerOrgByKeyParams,IGetPartnerOrgByKeyResult>(getPartnerOrgByKeyIR);


/** 'UpdateStudentInGatesStudy' parameters type */
export interface IUpdateStudentInGatesStudyParams {
  inGatesStudy: boolean | null | void;
  userId: string;
}

/** 'UpdateStudentInGatesStudy' return type */
export interface IUpdateStudentInGatesStudyResult {
  ok: string;
}

/** 'UpdateStudentInGatesStudy' query type */
export interface IUpdateStudentInGatesStudyQuery {
  params: IUpdateStudentInGatesStudyParams;
  result: IUpdateStudentInGatesStudyResult;
}

const updateStudentInGatesStudyIR: any = {"name":"updateStudentInGatesStudy","params":[{"name":"inGatesStudy","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6739,"b":6750,"line":270,"col":31}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6790,"b":6796,"line":272,"col":15}]}}],"usedParamSet":{"inGatesStudy":true,"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    in_gates_study = COALESCE(:inGatesStudy, in_gates_study)\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":6674,"b":6824,"line":267,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     in_gates_study = COALESCE(:inGatesStudy, in_gates_study)
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const updateStudentInGatesStudy = new PreparedQuery<IUpdateStudentInGatesStudyParams,IUpdateStudentInGatesStudyResult>(updateStudentInGatesStudyIR);


/** 'CreateStudentUser' parameters type */
export interface ICreateStudentUserParams {
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  otherSignupSource: string | null | void;
  password: string | null | void;
  referralCode: string;
  referredBy: string | null | void;
  signupSourceId: number | null | void;
  userId: string;
  verified: boolean;
}

/** 'CreateStudentUser' return type */
export interface ICreateStudentUserResult {
  banned: boolean;
  createdAt: Date;
  deactivated: boolean;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  testUser: boolean;
  verified: boolean;
}

/** 'CreateStudentUser' query type */
export interface ICreateStudentUserQuery {
  params: ICreateStudentUserParams;
  result: ICreateStudentUserResult;
}

const createStudentUserIR: any = {"name":"createStudentUser","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7070,"b":7076,"line":279,"col":13}]}},{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7080,"b":7089,"line":279,"col":23}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7093,"b":7101,"line":279,"col":36}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7105,"b":7110,"line":279,"col":48}]}},{"name":"password","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7114,"b":7121,"line":279,"col":57}]}},{"name":"verified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7125,"b":7133,"line":279,"col":68}]}},{"name":"emailVerified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7137,"b":7150,"line":279,"col":80}]}},{"name":"referredBy","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7154,"b":7163,"line":279,"col":97}]}},{"name":"referralCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7167,"b":7179,"line":279,"col":110}]}},{"name":"signupSourceId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7183,"b":7196,"line":279,"col":126}]}},{"name":"otherSignupSource","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7200,"b":7216,"line":279,"col":143}]}}],"usedParamSet":{"userId":true,"firstName":true,"lastName":true,"email":true,"password":true,"verified":true,"emailVerified":true,"referredBy":true,"referralCode":true,"signupSourceId":true,"otherSignupSource":true},"statement":{"body":"INSERT INTO users (id, first_name, last_name, email, PASSWORD, verified, email_verified, referred_by, referral_code, signup_source_id, other_signup_source, last_activity_at, created_at, updated_at)\n    VALUES (:userId!, :firstName!, :lastName!, :email!, :password, :verified!, :emailVerified!, :referredBy, :referralCode!, :signupSourceId, :otherSignupSource, NOW(), NOW(), NOW())\nON CONFLICT (email)\n    DO NOTHING\nRETURNING\n    id, first_name, last_name, email, verified, banned, test_user, deactivated, created_at","loc":{"a":6859,"b":7374,"line":278,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users (id, first_name, last_name, email, PASSWORD, verified, email_verified, referred_by, referral_code, signup_source_id, other_signup_source, last_activity_at, created_at, updated_at)
 *     VALUES (:userId!, :firstName!, :lastName!, :email!, :password, :verified!, :emailVerified!, :referredBy, :referralCode!, :signupSourceId, :otherSignupSource, NOW(), NOW(), NOW())
 * ON CONFLICT (email)
 *     DO NOTHING
 * RETURNING
 *     id, first_name, last_name, email, verified, banned, test_user, deactivated, created_at
 * ```
 */
export const createStudentUser = new PreparedQuery<ICreateStudentUserParams,ICreateStudentUserResult>(createStudentUserIR);


/** 'CreateStudentProfile' parameters type */
export interface ICreateStudentProfileParams {
  college: string | null | void;
  gradeLevel: string | null | void;
  partnerOrg: string | null | void;
  partnerSite: string | null | void;
  postalCode: string | null | void;
  schoolId: string | null | void;
  userId: string;
}

/** 'CreateStudentProfile' return type */
export interface ICreateStudentProfileResult {
  college: string | null;
  createdAt: Date;
  gradeLevel: string | null;
  partnerSite: string | null;
  postalCode: string | null;
  schoolId: string | null;
  studentPartnerOrg: string | null;
  updatedAt: Date;
  userId: string;
}

/** 'CreateStudentProfile' query type */
export interface ICreateStudentProfileQuery {
  params: ICreateStudentProfileParams;
  result: ICreateStudentProfileResult;
}

const createStudentProfileIR: any = {"name":"createStudentProfile","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7590,"b":7596,"line":288,"col":13}]}},{"name":"postalCode","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7600,"b":7609,"line":288,"col":23}]}},{"name":"partnerOrg","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7768,"b":7777,"line":294,"col":44},{"a":8304,"b":8313,"line":319,"col":5}]}},{"name":"partnerSite","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7976,"b":7986,"line":302,"col":50},{"a":8344,"b":8354,"line":320,"col":5}]}},{"name":"gradeLevel","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8159,"b":8168,"line":310,"col":37},{"a":8378,"b":8387,"line":321,"col":5}]}},{"name":"schoolId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8201,"b":8208,"line":312,"col":9}]}},{"name":"college","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8220,"b":8226,"line":313,"col":9}]}}],"usedParamSet":{"userId":true,"postalCode":true,"partnerOrg":true,"partnerSite":true,"gradeLevel":true,"schoolId":true,"college":true},"statement":{"body":"INSERT INTO student_profiles (user_id, postal_code, student_partner_org_id, student_partner_org_site_id, grade_level_id, school_id, college, created_at, updated_at)\n    VALUES (:userId!, :postalCode, (\n            SELECT\n                id\n            FROM\n                student_partner_orgs\n            WHERE\n                student_partner_orgs.key = :partnerOrg\n            LIMIT 1),\n        (\n            SELECT\n                id\n            FROM\n                student_partner_org_sites\n            WHERE\n                student_partner_org_sites.name = :partnerSite\n            LIMIT 1),\n        (\n            SELECT\n                id\n            FROM\n                grade_levels\n            WHERE\n                grade_levels.name = :gradeLevel\n            LIMIT 1),\n        :schoolId,\n        :college,\n        NOW(),\n        NOW())\nRETURNING\n    user_id,\n    postal_code,\n    :partnerOrg AS student_partner_org,\n    :partnerSite AS partner_site,\n    :gradeLevel AS grade_level,\n    school_id,\n    college,\n    created_at,\n    updated_at","loc":{"a":7412,"b":8462,"line":287,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_profiles (user_id, postal_code, student_partner_org_id, student_partner_org_site_id, grade_level_id, school_id, college, created_at, updated_at)
 *     VALUES (:userId!, :postalCode, (
 *             SELECT
 *                 id
 *             FROM
 *                 student_partner_orgs
 *             WHERE
 *                 student_partner_orgs.key = :partnerOrg
 *             LIMIT 1),
 *         (
 *             SELECT
 *                 id
 *             FROM
 *                 student_partner_org_sites
 *             WHERE
 *                 student_partner_org_sites.name = :partnerSite
 *             LIMIT 1),
 *         (
 *             SELECT
 *                 id
 *             FROM
 *                 grade_levels
 *             WHERE
 *                 grade_levels.name = :gradeLevel
 *             LIMIT 1),
 *         :schoolId,
 *         :college,
 *         NOW(),
 *         NOW())
 * RETURNING
 *     user_id,
 *     postal_code,
 *     :partnerOrg AS student_partner_org,
 *     :partnerSite AS partner_site,
 *     :gradeLevel AS grade_level,
 *     school_id,
 *     college,
 *     created_at,
 *     updated_at
 * ```
 */
export const createStudentProfile = new PreparedQuery<ICreateStudentProfileParams,ICreateStudentProfileResult>(createStudentProfileIR);


/** 'CreateUserStudentPartnerOrgInstance' parameters type */
export interface ICreateUserStudentPartnerOrgInstanceParams {
  spoName: string;
  spoSiteName: string | null | void;
  userId: string;
}

/** 'CreateUserStudentPartnerOrgInstance' return type */
export interface ICreateUserStudentPartnerOrgInstanceResult {
  ok: string | null;
}

/** 'CreateUserStudentPartnerOrgInstance' query type */
export interface ICreateUserStudentPartnerOrgInstanceQuery {
  params: ICreateUserStudentPartnerOrgInstanceParams;
  result: ICreateUserStudentPartnerOrgInstanceResult;
}

const createUserStudentPartnerOrgInstanceIR: any = {"name":"createUserStudentPartnerOrgInstance","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8663,"b":8669,"line":331,"col":5}]}},{"name":"spoSiteName","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8700,"b":8710,"line":333,"col":16},{"a":8974,"b":8984,"line":345,"col":11},{"a":9014,"b":9024,"line":346,"col":13}]}},{"name":"spoName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8954,"b":8961,"line":344,"col":16}]}}],"usedParamSet":{"userId":true,"spoSiteName":true,"spoName":true},"statement":{"body":"INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, created_at, updated_at)\nSELECT\n    :userId!,\n    spo.id,\n    CASE WHEN (:spoSiteName)::text IS NOT NULL THEN\n        sposite.id\n    ELSE\n        NULL\n    END,\n    NOW(),\n    NOW()\nFROM\n    student_partner_orgs spo\n    LEFT JOIN student_partner_org_sites sposite ON sposite.student_partner_org_id = spo.id\nWHERE\n    spo.name = :spoName!\n    AND ((:spoSiteName)::text IS NULL\n        OR (:spoSiteName)::text = sposite.name)\nLIMIT 1\nRETURNING\n    user_id AS ok","loc":{"a":8515,"b":9083,"line":329,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, created_at, updated_at)
 * SELECT
 *     :userId!,
 *     spo.id,
 *     CASE WHEN (:spoSiteName)::text IS NOT NULL THEN
 *         sposite.id
 *     ELSE
 *         NULL
 *     END,
 *     NOW(),
 *     NOW()
 * FROM
 *     student_partner_orgs spo
 *     LEFT JOIN student_partner_org_sites sposite ON sposite.student_partner_org_id = spo.id
 * WHERE
 *     spo.name = :spoName!
 *     AND ((:spoSiteName)::text IS NULL
 *         OR (:spoSiteName)::text = sposite.name)
 * LIMIT 1
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const createUserStudentPartnerOrgInstance = new PreparedQuery<ICreateUserStudentPartnerOrgInstanceParams,ICreateUserStudentPartnerOrgInstanceResult>(createUserStudentPartnerOrgInstanceIR);


/** 'CreateUserStudentPartnerOrgInstanceWithSchoolId' parameters type */
export interface ICreateUserStudentPartnerOrgInstanceWithSchoolIdParams {
  schoolId: string;
  userId: string;
}

/** 'CreateUserStudentPartnerOrgInstanceWithSchoolId' return type */
export interface ICreateUserStudentPartnerOrgInstanceWithSchoolIdResult {
  ok: string | null;
}

/** 'CreateUserStudentPartnerOrgInstanceWithSchoolId' query type */
export interface ICreateUserStudentPartnerOrgInstanceWithSchoolIdQuery {
  params: ICreateUserStudentPartnerOrgInstanceWithSchoolIdParams;
  result: ICreateUserStudentPartnerOrgInstanceWithSchoolIdResult;
}

const createUserStudentPartnerOrgInstanceWithSchoolIdIR: any = {"name":"createUserStudentPartnerOrgInstanceWithSchoolId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9296,"b":9302,"line":355,"col":5}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9409,"b":9417,"line":363,"col":21}]}}],"usedParamSet":{"userId":true,"schoolId":true},"statement":{"body":"INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, created_at, updated_at)\nSELECT\n    :userId!,\n    spo.id,\n    NULL,\n    NOW(),\n    NOW()\nFROM\n    student_partner_orgs spo\nWHERE\n    spo.school_id = :schoolId!\nRETURNING\n    user_id AS ok","loc":{"a":9148,"b":9445,"line":353,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, created_at, updated_at)
 * SELECT
 *     :userId!,
 *     spo.id,
 *     NULL,
 *     NOW(),
 *     NOW()
 * FROM
 *     student_partner_orgs spo
 * WHERE
 *     spo.school_id = :schoolId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const createUserStudentPartnerOrgInstanceWithSchoolId = new PreparedQuery<ICreateUserStudentPartnerOrgInstanceWithSchoolIdParams,ICreateUserStudentPartnerOrgInstanceWithSchoolIdResult>(createUserStudentPartnerOrgInstanceWithSchoolIdIR);


/** 'GetActiveStudentOrgInstance' parameters type */
export interface IGetActiveStudentOrgInstanceParams {
  spoId: string;
  studentId: string;
}

/** 'GetActiveStudentOrgInstance' return type */
export interface IGetActiveStudentOrgInstanceResult {
  id: string;
  name: string;
}

/** 'GetActiveStudentOrgInstance' query type */
export interface IGetActiveStudentOrgInstanceQuery {
  params: IGetActiveStudentOrgInstanceParams;
  result: IGetActiveStudentOrgInstanceResult;
}

const getActiveStudentOrgInstanceIR: any = {"name":"getActiveStudentOrgInstance","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9676,"b":9685,"line":376,"col":21}]}},{"name":"spoId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9727,"b":9732,"line":377,"col":40}]}}],"usedParamSet":{"studentId":true,"spoId":true},"statement":{"body":"SELECT\n    spo.name,\n    spo.id\nFROM\n    users_student_partner_orgs_instances uspoi\n    JOIN student_partner_orgs spo ON spo.id = uspoi.student_partner_org_id\nWHERE\n    uspoi.user_id = :studentId!\n    AND uspoi.student_partner_org_id = :spoId!\n    AND deactivated_on IS NULL","loc":{"a":9490,"b":9763,"line":369,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     spo.name,
 *     spo.id
 * FROM
 *     users_student_partner_orgs_instances uspoi
 *     JOIN student_partner_orgs spo ON spo.id = uspoi.student_partner_org_id
 * WHERE
 *     uspoi.user_id = :studentId!
 *     AND uspoi.student_partner_org_id = :spoId!
 *     AND deactivated_on IS NULL
 * ```
 */
export const getActiveStudentOrgInstance = new PreparedQuery<IGetActiveStudentOrgInstanceParams,IGetActiveStudentOrgInstanceResult>(getActiveStudentOrgInstanceIR);


/** 'GetSessionReport' parameters type */
export interface IGetSessionReportParams {
  end: Date;
  highSchoolId: string | null | void;
  sponsorOrg: string | null | void;
  start: Date;
  studentPartnerOrg: string | null | void;
  studentPartnerSite: string | null | void;
}

/** 'GetSessionReport' return type */
export interface IGetSessionReportResult {
  createdAt: Date;
  email: string;
  endedAt: Date | null;
  firstName: string;
  lastName: string;
  partnerSite: string;
  sessionId: string;
  sponsorOrg: string | null;
  subject: string;
  topic: string;
  totalMessages: number | null;
  volunteerJoined: string | null;
  volunteerJoinedAt: Date | null;
  waitTimeMins: number | null;
}

/** 'GetSessionReport' query type */
export interface IGetSessionReportQuery {
  params: IGetSessionReportParams;
  result: IGetSessionReportResult;
}

const getSessionReportIR: any = {"name":"getSessionReport","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12201,"b":12206,"line":438,"col":28}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12240,"b":12243,"line":439,"col":32}]}},{"name":"highSchoolId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12294,"b":12305,"line":441,"col":11},{"a":12363,"b":12374,"line":442,"col":41}]}},{"name":"studentPartnerOrg","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12388,"b":12404,"line":443,"col":11},{"a":12460,"b":12476,"line":444,"col":39}]}},{"name":"studentPartnerSite","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12490,"b":12507,"line":445,"col":11},{"a":12569,"b":12586,"line":446,"col":45}]}},{"name":"sponsorOrg","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12600,"b":12609,"line":447,"col":11},{"a":12730,"b":12739,"line":449,"col":51},{"a":12839,"b":12848,"line":451,"col":46}]}}],"usedParamSet":{"start":true,"end":true,"highSchoolId":true,"studentPartnerOrg":true,"studentPartnerSite":true,"sponsorOrg":true},"statement":{"body":"SELECT\n    sessions.id AS session_id,\n    sessions.created_at AS created_at,\n    sessions.ended_at AS ended_at,\n    topics.name AS topic,\n    subjects.name AS subject,\n    users.first_name AS first_name,\n    users.last_name AS last_name,\n    users.email AS email,\n    student_partner_org_sites.name AS partner_site,\n    (\n        CASE WHEN partner_org_sponsor_org.name IS NOT NULL THEN\n            partner_org_sponsor_org.name\n        WHEN school_sponsor_org.name IS NOT NULL THEN\n            school_sponsor_org.name\n        ELSE\n            NULL\n        END) AS sponsor_org,\n    (\n        CASE WHEN sessions.volunteer_id IS NOT NULL THEN\n            'YES'\n        ELSE\n            'NO'\n        END) AS volunteer_joined,\n    sessions.volunteer_joined_at AS volunteer_joined_at,\n    COALESCE(session_messages.total, 0)::int AS total_messages,\n    (\n        CASE WHEN sessions.volunteer_joined_at IS NOT NULL THEN\n            ROUND(EXTRACT(EPOCH FROM (sessions.volunteer_joined_at - sessions.created_at) / 60), 1)\n        ELSE\n            NULL\n        END)::float AS wait_time_mins\nFROM\n    student_profiles\n    JOIN users ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\n    LEFT JOIN student_partner_org_sites ON student_profiles.student_partner_org_site_id = student_partner_org_sites.id\n    LEFT JOIN student_partner_orgs_sponsor_orgs ON student_profiles.student_partner_org_id = student_partner_orgs_sponsor_orgs.student_partner_org_id\n    LEFT JOIN sponsor_orgs AS partner_org_sponsor_org ON student_partner_orgs_sponsor_orgs.sponsor_org_id = partner_org_sponsor_org.id\n    LEFT JOIN schools_sponsor_orgs ON student_profiles.school_id = schools_sponsor_orgs.school_id\n    LEFT JOIN sponsor_orgs AS school_sponsor_org ON schools_sponsor_orgs.sponsor_org_id = school_sponsor_org.id\n    LEFT JOIN schools ON student_profiles.school_id = schools.id\n    JOIN sessions ON sessions.student_id = student_profiles.user_id\n    LEFT JOIN LATERAL (\n        SELECT\n            session_id,\n            count(*) AS total\n        FROM\n            session_messages\n        WHERE\n            session_id = sessions.id\n        GROUP BY\n            session_id) AS session_messages ON TRUE\n    JOIN subjects ON sessions.subject_id = subjects.id\n    JOIN topics ON subjects.topic_id = topics.id\nWHERE\n    sessions.created_at >= :start!\n    AND sessions.created_at <= :end!\n    AND sessions.ended_at IS NOT NULL\n    AND ((:highSchoolId)::uuid IS NULL\n        OR student_profiles.school_id = :highSchoolId)\n    AND ((:studentPartnerOrg)::text IS NULL\n        OR student_partner_orgs.key = :studentPartnerOrg)\n    AND ((:studentPartnerSite)::text IS NULL\n        OR student_partner_org_sites.name = :studentPartnerSite)\n    AND ((:sponsorOrg)::text IS NULL\n        OR ((partner_org_sponsor_org.key IS NOT NULL\n                AND partner_org_sponsor_org.key = :sponsorOrg)\n            OR (school_sponsor_org.key IS NOT NULL\n                AND school_sponsor_org.key = :sponsorOrg)))\nORDER BY\n    sessions.created_at ASC","loc":{"a":9797,"b":12888,"line":382,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id AS session_id,
 *     sessions.created_at AS created_at,
 *     sessions.ended_at AS ended_at,
 *     topics.name AS topic,
 *     subjects.name AS subject,
 *     users.first_name AS first_name,
 *     users.last_name AS last_name,
 *     users.email AS email,
 *     student_partner_org_sites.name AS partner_site,
 *     (
 *         CASE WHEN partner_org_sponsor_org.name IS NOT NULL THEN
 *             partner_org_sponsor_org.name
 *         WHEN school_sponsor_org.name IS NOT NULL THEN
 *             school_sponsor_org.name
 *         ELSE
 *             NULL
 *         END) AS sponsor_org,
 *     (
 *         CASE WHEN sessions.volunteer_id IS NOT NULL THEN
 *             'YES'
 *         ELSE
 *             'NO'
 *         END) AS volunteer_joined,
 *     sessions.volunteer_joined_at AS volunteer_joined_at,
 *     COALESCE(session_messages.total, 0)::int AS total_messages,
 *     (
 *         CASE WHEN sessions.volunteer_joined_at IS NOT NULL THEN
 *             ROUND(EXTRACT(EPOCH FROM (sessions.volunteer_joined_at - sessions.created_at) / 60), 1)
 *         ELSE
 *             NULL
 *         END)::float AS wait_time_mins
 * FROM
 *     student_profiles
 *     JOIN users ON student_profiles.user_id = users.id
 *     LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id
 *     LEFT JOIN student_partner_org_sites ON student_profiles.student_partner_org_site_id = student_partner_org_sites.id
 *     LEFT JOIN student_partner_orgs_sponsor_orgs ON student_profiles.student_partner_org_id = student_partner_orgs_sponsor_orgs.student_partner_org_id
 *     LEFT JOIN sponsor_orgs AS partner_org_sponsor_org ON student_partner_orgs_sponsor_orgs.sponsor_org_id = partner_org_sponsor_org.id
 *     LEFT JOIN schools_sponsor_orgs ON student_profiles.school_id = schools_sponsor_orgs.school_id
 *     LEFT JOIN sponsor_orgs AS school_sponsor_org ON schools_sponsor_orgs.sponsor_org_id = school_sponsor_org.id
 *     LEFT JOIN schools ON student_profiles.school_id = schools.id
 *     JOIN sessions ON sessions.student_id = student_profiles.user_id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             session_id,
 *             count(*) AS total
 *         FROM
 *             session_messages
 *         WHERE
 *             session_id = sessions.id
 *         GROUP BY
 *             session_id) AS session_messages ON TRUE
 *     JOIN subjects ON sessions.subject_id = subjects.id
 *     JOIN topics ON subjects.topic_id = topics.id
 * WHERE
 *     sessions.created_at >= :start!
 *     AND sessions.created_at <= :end!
 *     AND sessions.ended_at IS NOT NULL
 *     AND ((:highSchoolId)::uuid IS NULL
 *         OR student_profiles.school_id = :highSchoolId)
 *     AND ((:studentPartnerOrg)::text IS NULL
 *         OR student_partner_orgs.key = :studentPartnerOrg)
 *     AND ((:studentPartnerSite)::text IS NULL
 *         OR student_partner_org_sites.name = :studentPartnerSite)
 *     AND ((:sponsorOrg)::text IS NULL
 *         OR ((partner_org_sponsor_org.key IS NOT NULL
 *                 AND partner_org_sponsor_org.key = :sponsorOrg)
 *             OR (school_sponsor_org.key IS NOT NULL
 *                 AND school_sponsor_org.key = :sponsorOrg)))
 * ORDER BY
 *     sessions.created_at ASC
 * ```
 */
export const getSessionReport = new PreparedQuery<IGetSessionReportParams,IGetSessionReportResult>(getSessionReportIR);


/** 'GetUsageReport' parameters type */
export interface IGetUsageReportParams {
  highSchoolId: string | null | void;
  joinedEnd: Date;
  joinedStart: Date;
  sessionEnd: Date;
  sessionStart: Date;
  sponsorOrg: string | null | void;
  studentPartnerOrg: string | null | void;
  studentPartnerSite: string | null | void;
}

/** 'GetUsageReport' return type */
export interface IGetUsageReportResult {
  email: string;
  firstName: string;
  joinDate: Date;
  lastName: string;
  partnerSite: string;
  rangeSessionLengthMins: number | null;
  rangeTotalSessions: number | null;
  school: string;
  sponsorOrg: string | null;
  studentPartnerOrg: string;
  totalSessionLengthMins: number | null;
  totalSessions: number | null;
  userId: string;
}

/** 'GetUsageReport' query type */
export interface IGetUsageReportQuery {
  params: IGetUsageReportParams;
  result: IGetUsageReportResult;
}

const getUsageReportIR: any = {"name":"getUsageReport","params":[{"name":"sessionStart","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15594,"b":15606,"line":504,"col":48},{"a":16069,"b":16081,"line":510,"col":48},{"a":16465,"b":16477,"line":518,"col":50}]}},{"name":"sessionEnd","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15656,"b":15666,"line":505,"col":48},{"a":16131,"b":16141,"line":511,"col":48},{"a":16527,"b":16537,"line":519,"col":48}]}},{"name":"joinedStart","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17137,"b":17148,"line":540,"col":25}]}},{"name":"joinedEnd","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17179,"b":17188,"line":541,"col":29}]}},{"name":"highSchoolId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17201,"b":17212,"line":542,"col":11},{"a":17270,"b":17281,"line":543,"col":41}]}},{"name":"studentPartnerOrg","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17291,"b":17307,"line":544,"col":7},{"a":17359,"b":17375,"line":545,"col":35}]}},{"name":"studentPartnerSite","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17385,"b":17402,"line":546,"col":7},{"a":17460,"b":17477,"line":547,"col":41}]}},{"name":"sponsorOrg","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17487,"b":17496,"line":548,"col":7},{"a":17609,"b":17618,"line":550,"col":47},{"a":17710,"b":17719,"line":552,"col":42}]}}],"usedParamSet":{"sessionStart":true,"sessionEnd":true,"joinedStart":true,"joinedEnd":true,"highSchoolId":true,"studentPartnerOrg":true,"studentPartnerSite":true,"sponsorOrg":true},"statement":{"body":"SELECT\n    users.id AS user_id,\n    users.first_name AS first_name,\n    users.last_name AS last_name,\n    users.email AS email,\n    users.created_at AS join_date,\n    student_partner_orgs.name AS student_partner_org,\n    student_partner_org_sites.name AS partner_site,\n    (\n        CASE WHEN partner_org_sponsor_org.name IS NOT NULL THEN\n            partner_org_sponsor_org.name\n        WHEN school_sponsor_org.name IS NOT NULL THEN\n            school_sponsor_org.name\n        ELSE\n            NULL\n        END) AS sponsor_org,\n    schools.name AS school,\n    COALESCE(sessions.total_sessions, 0) AS total_sessions,\n    COALESCE(sessions.total_session_length_mins, 0)::float AS total_session_length_mins,\n    COALESCE(sessions.range_total_sessions, 0) AS range_total_sessions,\n    COALESCE(sessions.range_session_length_mins, 0)::float AS range_session_length_mins\nFROM\n    student_profiles\n    JOIN users ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\n    LEFT JOIN student_partner_org_sites ON student_profiles.student_partner_org_site_id = student_partner_org_sites.id\n    LEFT JOIN student_partner_orgs_sponsor_orgs ON student_profiles.student_partner_org_id = student_partner_orgs_sponsor_orgs.student_partner_org_id\n    LEFT JOIN sponsor_orgs AS partner_org_sponsor_org ON student_partner_orgs_sponsor_orgs.sponsor_org_id = partner_org_sponsor_org.id\n    LEFT JOIN schools_sponsor_orgs ON student_profiles.school_id = schools_sponsor_orgs.school_id\n    LEFT JOIN sponsor_orgs AS school_sponsor_org ON schools_sponsor_orgs.sponsor_org_id = school_sponsor_org.id\n    LEFT JOIN schools ON student_profiles.school_id = schools.id\n    LEFT JOIN (\n        SELECT\n            sum(\n                CASE WHEN TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 60) < 0 THEN\n                    0\n                WHEN sessions.volunteer_joined_at IS NOT NULL\n                    AND TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 3600) >= 1\n                    AND last_message.created_at IS NOT NULL THEN\n                    ROUND(EXTRACT(EPOCH FROM (last_message.created_at - sessions.volunteer_joined_at)) / 60, 2)\n                WHEN sessions.volunteer_joined_at IS NOT NULL THEN\n                    TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 60, 2)\n                ELSE\n                    0\n                END)::int AS total_session_length_mins,\n            sum(\n                CASE WHEN sessions.volunteer_joined_at IS NOT NULL\n                    AND sessions.created_at >= :sessionStart!\n                    AND sessions.created_at <= :sessionEnd!\n                    AND TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 3600) >= 1\n                    AND last_message.created_at IS NOT NULL THEN\n                    ROUND(EXTRACT(EPOCH FROM (last_message.created_at - sessions.volunteer_joined_at)) / 60, 2)\n                WHEN sessions.volunteer_joined_at IS NOT NULL\n                    AND sessions.created_at >= :sessionStart!\n                    AND sessions.created_at <= :sessionEnd! THEN\n                    TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 60, 2)\n                ELSE\n                    0\n                END)::int AS range_session_length_mins,\n            count(*)::int AS total_sessions,\n            sum(\n                CASE WHEN sessions.created_at >= :sessionStart!\n                    AND sessions.created_at <= :sessionEnd! THEN\n                    1\n                ELSE\n                    0\n                END)::int AS range_total_sessions,\n            student_id\n        FROM\n            sessions\n    LEFT JOIN (\n        SELECT\n            MAX(created_at) AS created_at,\n            session_id\n        FROM\n            session_messages\n        GROUP BY\n            session_id) AS last_message ON last_message.session_id = sessions.id\n    WHERE\n        sessions.ended_at IS NOT NULL\n    GROUP BY\n        sessions.student_id) AS sessions ON sessions.student_id = student_profiles.user_id\nWHERE\n    users.created_at >= :joinedStart!\n    AND users.created_at <= :joinedEnd!\n    AND ((:highSchoolId)::uuid IS NULL\n        OR student_profiles.school_id = :highSchoolId)\nAND ((:studentPartnerOrg)::text IS NULL\n    OR student_partner_orgs.key = :studentPartnerOrg)\nAND ((:studentPartnerSite)::text IS NULL\n    OR student_partner_org_sites.name = :studentPartnerSite)\nAND ((:sponsorOrg)::text IS NULL\n    OR ((partner_org_sponsor_org.key IS NOT NULL\n            AND partner_org_sponsor_org.key = :sponsorOrg)\n        OR (school_sponsor_org.key IS NOT NULL\n            AND school_sponsor_org.key = :sponsorOrg)))\nORDER BY\n    users.created_at ASC","loc":{"a":12920,"b":17756,"line":457,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id AS user_id,
 *     users.first_name AS first_name,
 *     users.last_name AS last_name,
 *     users.email AS email,
 *     users.created_at AS join_date,
 *     student_partner_orgs.name AS student_partner_org,
 *     student_partner_org_sites.name AS partner_site,
 *     (
 *         CASE WHEN partner_org_sponsor_org.name IS NOT NULL THEN
 *             partner_org_sponsor_org.name
 *         WHEN school_sponsor_org.name IS NOT NULL THEN
 *             school_sponsor_org.name
 *         ELSE
 *             NULL
 *         END) AS sponsor_org,
 *     schools.name AS school,
 *     COALESCE(sessions.total_sessions, 0) AS total_sessions,
 *     COALESCE(sessions.total_session_length_mins, 0)::float AS total_session_length_mins,
 *     COALESCE(sessions.range_total_sessions, 0) AS range_total_sessions,
 *     COALESCE(sessions.range_session_length_mins, 0)::float AS range_session_length_mins
 * FROM
 *     student_profiles
 *     JOIN users ON student_profiles.user_id = users.id
 *     LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id
 *     LEFT JOIN student_partner_org_sites ON student_profiles.student_partner_org_site_id = student_partner_org_sites.id
 *     LEFT JOIN student_partner_orgs_sponsor_orgs ON student_profiles.student_partner_org_id = student_partner_orgs_sponsor_orgs.student_partner_org_id
 *     LEFT JOIN sponsor_orgs AS partner_org_sponsor_org ON student_partner_orgs_sponsor_orgs.sponsor_org_id = partner_org_sponsor_org.id
 *     LEFT JOIN schools_sponsor_orgs ON student_profiles.school_id = schools_sponsor_orgs.school_id
 *     LEFT JOIN sponsor_orgs AS school_sponsor_org ON schools_sponsor_orgs.sponsor_org_id = school_sponsor_org.id
 *     LEFT JOIN schools ON student_profiles.school_id = schools.id
 *     LEFT JOIN (
 *         SELECT
 *             sum(
 *                 CASE WHEN TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 60) < 0 THEN
 *                     0
 *                 WHEN sessions.volunteer_joined_at IS NOT NULL
 *                     AND TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 3600) >= 1
 *                     AND last_message.created_at IS NOT NULL THEN
 *                     ROUND(EXTRACT(EPOCH FROM (last_message.created_at - sessions.volunteer_joined_at)) / 60, 2)
 *                 WHEN sessions.volunteer_joined_at IS NOT NULL THEN
 *                     TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 60, 2)
 *                 ELSE
 *                     0
 *                 END)::int AS total_session_length_mins,
 *             sum(
 *                 CASE WHEN sessions.volunteer_joined_at IS NOT NULL
 *                     AND sessions.created_at >= :sessionStart!
 *                     AND sessions.created_at <= :sessionEnd!
 *                     AND TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 3600) >= 1
 *                     AND last_message.created_at IS NOT NULL THEN
 *                     ROUND(EXTRACT(EPOCH FROM (last_message.created_at - sessions.volunteer_joined_at)) / 60, 2)
 *                 WHEN sessions.volunteer_joined_at IS NOT NULL
 *                     AND sessions.created_at >= :sessionStart!
 *                     AND sessions.created_at <= :sessionEnd! THEN
 *                     TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 60, 2)
 *                 ELSE
 *                     0
 *                 END)::int AS range_session_length_mins,
 *             count(*)::int AS total_sessions,
 *             sum(
 *                 CASE WHEN sessions.created_at >= :sessionStart!
 *                     AND sessions.created_at <= :sessionEnd! THEN
 *                     1
 *                 ELSE
 *                     0
 *                 END)::int AS range_total_sessions,
 *             student_id
 *         FROM
 *             sessions
 *     LEFT JOIN (
 *         SELECT
 *             MAX(created_at) AS created_at,
 *             session_id
 *         FROM
 *             session_messages
 *         GROUP BY
 *             session_id) AS last_message ON last_message.session_id = sessions.id
 *     WHERE
 *         sessions.ended_at IS NOT NULL
 *     GROUP BY
 *         sessions.student_id) AS sessions ON sessions.student_id = student_profiles.user_id
 * WHERE
 *     users.created_at >= :joinedStart!
 *     AND users.created_at <= :joinedEnd!
 *     AND ((:highSchoolId)::uuid IS NULL
 *         OR student_profiles.school_id = :highSchoolId)
 * AND ((:studentPartnerOrg)::text IS NULL
 *     OR student_partner_orgs.key = :studentPartnerOrg)
 * AND ((:studentPartnerSite)::text IS NULL
 *     OR student_partner_org_sites.name = :studentPartnerSite)
 * AND ((:sponsorOrg)::text IS NULL
 *     OR ((partner_org_sponsor_org.key IS NOT NULL
 *             AND partner_org_sponsor_org.key = :sponsorOrg)
 *         OR (school_sponsor_org.key IS NOT NULL
 *             AND school_sponsor_org.key = :sponsorOrg)))
 * ORDER BY
 *     users.created_at ASC
 * ```
 */
export const getUsageReport = new PreparedQuery<IGetUsageReportParams,IGetUsageReportResult>(getUsageReportIR);


/** 'GetStudentSignupSources' parameters type */
export type IGetStudentSignupSourcesParams = void;

/** 'GetStudentSignupSources' return type */
export interface IGetStudentSignupSourcesResult {
  id: number;
  name: string;
}

/** 'GetStudentSignupSources' query type */
export interface IGetStudentSignupSourcesQuery {
  params: IGetStudentSignupSourcesParams;
  result: IGetStudentSignupSourcesResult;
}

const getStudentSignupSourcesIR: any = {"name":"getStudentSignupSources","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    id,\n    name\nFROM\n    signup_sources\nWHERE\n    name <> 'Roster'\nORDER BY\n    RANDOM()","loc":{"a":17797,"b":17892,"line":558,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     name
 * FROM
 *     signup_sources
 * WHERE
 *     name <> 'Roster'
 * ORDER BY
 *     RANDOM()
 * ```
 */
export const getStudentSignupSources = new PreparedQuery<IGetStudentSignupSourcesParams,IGetStudentSignupSourcesResult>(getStudentSignupSourcesIR);


/** 'DeleteSelfFavoritedVolunteers' parameters type */
export type IDeleteSelfFavoritedVolunteersParams = void;

/** 'DeleteSelfFavoritedVolunteers' return type */
export type IDeleteSelfFavoritedVolunteersResult = void;

/** 'DeleteSelfFavoritedVolunteers' query type */
export interface IDeleteSelfFavoritedVolunteersQuery {
  params: IDeleteSelfFavoritedVolunteersParams;
  result: IDeleteSelfFavoritedVolunteersResult;
}

const deleteSelfFavoritedVolunteersIR: any = {"name":"deleteSelfFavoritedVolunteers","params":[],"usedParamSet":{},"statement":{"body":"DELETE FROM student_favorite_volunteers\nWHERE student_id = volunteer_id","loc":{"a":17939,"b":18009,"line":570,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM student_favorite_volunteers
 * WHERE student_id = volunteer_id
 * ```
 */
export const deleteSelfFavoritedVolunteers = new PreparedQuery<IDeleteSelfFavoritedVolunteersParams,IDeleteSelfFavoritedVolunteersResult>(deleteSelfFavoritedVolunteersIR);


/** 'AdminUpdateStudentSchool' parameters type */
export interface IAdminUpdateStudentSchoolParams {
  schoolId: string;
  userId: string;
}

/** 'AdminUpdateStudentSchool' return type */
export interface IAdminUpdateStudentSchoolResult {
  ok: string;
}

/** 'AdminUpdateStudentSchool' query type */
export interface IAdminUpdateStudentSchoolQuery {
  params: IAdminUpdateStudentSchoolParams;
  result: IAdminUpdateStudentSchoolResult;
}

const adminUpdateStudentSchoolIR: any = {"name":"adminUpdateStudentSchool","params":[{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18100,"b":18108,"line":578,"col":17}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18131,"b":18137,"line":580,"col":15}]}}],"usedParamSet":{"schoolId":true,"userId":true},"statement":{"body":"UPDATE\n    student_profiles\nSET\n    school_id = :schoolId!\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":18051,"b":18165,"line":575,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     student_profiles
 * SET
 *     school_id = :schoolId!
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const adminUpdateStudentSchool = new PreparedQuery<IAdminUpdateStudentSchoolParams,IAdminUpdateStudentSchoolResult>(adminUpdateStudentSchoolIR);


/** 'GetActivePartnersForStudent' parameters type */
export interface IGetActivePartnersForStudentParams {
  studentId: string;
}

/** 'GetActivePartnersForStudent' return type */
export interface IGetActivePartnersForStudentResult {
  id: string;
  name: string;
  schoolId: string | null;
}

/** 'GetActivePartnersForStudent' query type */
export interface IGetActivePartnersForStudentQuery {
  params: IGetActivePartnersForStudentParams;
  result: IGetActivePartnersForStudentResult;
}

const getActivePartnersForStudentIR: any = {"name":"getActivePartnersForStudent","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18415,"b":18424,"line":594,"col":21}]}}],"usedParamSet":{"studentId":true},"statement":{"body":"SELECT\n    spo.name,\n    spo.id,\n    spo.school_id\nFROM\n    users_student_partner_orgs_instances uspoi\n    JOIN student_partner_orgs spo ON spo.id = uspoi.student_partner_org_id\nWHERE\n    uspoi.user_id = :studentId!\n    AND deactivated_on IS NOT NULL","loc":{"a":18210,"b":18459,"line":586,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     spo.name,
 *     spo.id,
 *     spo.school_id
 * FROM
 *     users_student_partner_orgs_instances uspoi
 *     JOIN student_partner_orgs spo ON spo.id = uspoi.student_partner_org_id
 * WHERE
 *     uspoi.user_id = :studentId!
 *     AND deactivated_on IS NOT NULL
 * ```
 */
export const getActivePartnersForStudent = new PreparedQuery<IGetActivePartnersForStudentParams,IGetActivePartnersForStudentResult>(getActivePartnersForStudentIR);


/** 'GetStudentsForGradeLevelUpdate' parameters type */
export interface IGetStudentsForGradeLevelUpdateParams {
  limit: number;
  offset: number;
}

/** 'GetStudentsForGradeLevelUpdate' return type */
export interface IGetStudentsForGradeLevelUpdateResult {
  createdAt: Date;
  gradeLevel: string;
  userId: string;
}

/** 'GetStudentsForGradeLevelUpdate' query type */
export interface IGetStudentsForGradeLevelUpdateQuery {
  params: IGetStudentsForGradeLevelUpdateParams;
  result: IGetStudentsForGradeLevelUpdateResult;
}

const getStudentsForGradeLevelUpdateIR: any = {"name":"getStudentsForGradeLevelUpdate","params":[{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18823,"b":18828,"line":611,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18845,"b":18851,"line":611,"col":30}]}}],"usedParamSet":{"limit":true,"offset":true},"statement":{"body":"SELECT\n    sp.user_id,\n    sp.created_at,\n    gl.name AS grade_level\nFROM\n    student_profiles sp\n    JOIN grade_levels gl ON gl.id = sp.grade_level_id\nWHERE\n    NOT gl.name = ANY ('{\"College\", \"Other\"}')\n    AND sp.created_at < DATE_TRUNC('year', NOW()) + INTERVAL '7 months'\nORDER BY\n    sp.created_at ASC\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":18507,"b":18857,"line":599,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sp.user_id,
 *     sp.created_at,
 *     gl.name AS grade_level
 * FROM
 *     student_profiles sp
 *     JOIN grade_levels gl ON gl.id = sp.grade_level_id
 * WHERE
 *     NOT gl.name = ANY ('{"College", "Other"}')
 *     AND sp.created_at < DATE_TRUNC('year', NOW()) + INTERVAL '7 months'
 * ORDER BY
 *     sp.created_at ASC
 * LIMIT (:limit!)::int OFFSET (:offset!)::int
 * ```
 */
export const getStudentsForGradeLevelUpdate = new PreparedQuery<IGetStudentsForGradeLevelUpdateParams,IGetStudentsForGradeLevelUpdateResult>(getStudentsForGradeLevelUpdateIR);


/** 'UpdateStudentsGradeLevel' parameters type */
export interface IUpdateStudentsGradeLevelParams {
  gradeLevel: string;
  userId: string;
}

/** 'UpdateStudentsGradeLevel' return type */
export interface IUpdateStudentsGradeLevelResult {
  ok: string;
}

/** 'UpdateStudentsGradeLevel' query type */
export interface IUpdateStudentsGradeLevelQuery {
  params: IUpdateStudentsGradeLevelParams;
  result: IUpdateStudentsGradeLevelResult;
}

const updateStudentsGradeLevelIR: any = {"name":"updateStudentsGradeLevel","params":[{"name":"gradeLevel","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19099,"b":19109,"line":626,"col":29}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19145,"b":19151,"line":628,"col":15}]}}],"usedParamSet":{"gradeLevel":true,"userId":true},"statement":{"body":"UPDATE\n    student_profiles\nSET\n    grade_level_id = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        grade_levels.id\n    FROM\n        grade_levels\n    WHERE\n        grade_levels.name = :gradeLevel!) AS subquery\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":18899,"b":19179,"line":615,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     student_profiles
 * SET
 *     grade_level_id = subquery.id,
 *     updated_at = NOW()
 * FROM (
 *     SELECT
 *         grade_levels.id
 *     FROM
 *         grade_levels
 *     WHERE
 *         grade_levels.name = :gradeLevel!) AS subquery
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const updateStudentsGradeLevel = new PreparedQuery<IUpdateStudentsGradeLevelParams,IUpdateStudentsGradeLevelResult>(updateStudentsGradeLevelIR);


