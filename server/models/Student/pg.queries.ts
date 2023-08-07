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
  proxyEmail: string | null;
  schoolId: string | null;
  studentPartnerOrg: string;
}

/** 'GetStudentContactInfoById' query type */
export interface IGetStudentContactInfoByIdQuery {
  params: IGetStudentContactInfoByIdParams;
  result: IGetStudentContactInfoByIdResult;
}

const getStudentContactInfoByIdIR: any = {"name":"getStudentContactInfoById","params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1069,"b":1074,"line":33,"col":27}]}},{"name":"mongoUserId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1111,"b":1121,"line":34,"col":35}]}}],"usedParamSet":{"userId":true,"mongoUserId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    email,\n    proxy_email,\n    student_partner_orgs.key AS student_partner_org,\n    student_profiles.school_id\nFROM\n    users\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\nWHERE\n    banned IS FALSE\n    AND deactivated IS FALSE\n    AND test_user IS FALSE\n    AND (users.id::uuid = :userId\n        OR users.mongo_id::text = :mongoUserId)","loc":{"a":622,"b":1122,"line":18,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     email,
 *     proxy_email,
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

const isTestUserIR: any = {"name":"isTestUser","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1202,"b":1208,"line":43,"col":10}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    test_user\nFROM\n    users\nWHERE\n    id = :userId!","loc":{"a":1150,"b":1208,"line":38,"col":0}}};

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

const getTotalFavoriteVolunteersIR: any = {"name":"getTotalFavoriteVolunteers","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1347,"b":1353,"line":52,"col":18}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    COUNT(*)::int AS total\nFROM\n    student_favorite_volunteers\nWHERE\n    student_id = :userId!","loc":{"a":1252,"b":1353,"line":47,"col":0}}};

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

const isFavoriteVolunteerIR: any = {"name":"isFavoriteVolunteer","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1475,"b":1484,"line":61,"col":18}]}},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1510,"b":1521,"line":62,"col":24}]}}],"usedParamSet":{"studentId":true,"volunteerId":true},"statement":{"body":"SELECT\n    volunteer_id\nFROM\n    student_favorite_volunteers\nWHERE\n    student_id = :studentId!\n    AND volunteer_id = :volunteerId!","loc":{"a":1390,"b":1521,"line":56,"col":0}}};

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

const getFavoriteVolunteersByStudentIdIR: any = {"name":"getFavoriteVolunteersByStudentId","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1793,"b":1802,"line":72,"col":46}]}}],"usedParamSet":{"studentId":true},"statement":{"body":"SELECT\n    student_favorite_volunteers.volunteer_id AS id\nFROM\n    student_favorite_volunteers\n    LEFT JOIN users ON student_favorite_volunteers.volunteer_id = users.id\nWHERE\n    student_favorite_volunteers.student_id = :studentId!","loc":{"a":1571,"b":1802,"line":66,"col":0}}};

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

const getFavoriteVolunteersPaginatedIR: any = {"name":"getFavoriteVolunteersPaginated","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2299,"b":2308,"line":90,"col":35},{"a":2527,"b":2536,"line":95,"col":46}]}},{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2603,"b":2608,"line":98,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2625,"b":2631,"line":98,"col":30}]}}],"usedParamSet":{"studentId":true,"limit":true,"offset":true},"statement":{"body":"SELECT\n    student_favorite_volunteers.volunteer_id AS volunteer_id,\n    users.first_name AS first_name,\n    COALESCE(sessions.total, 0)::int AS num_sessions\nFROM\n    student_favorite_volunteers\n    LEFT JOIN users ON student_favorite_volunteers.volunteer_id = users.id\n    LEFT JOIN (\n        SELECT\n            count(*) AS total,\n            sessions.volunteer_id\n        FROM\n            sessions\n        WHERE\n            sessions.student_id = :studentId!\n        GROUP BY\n            sessions.student_id,\n            sessions.volunteer_id) AS sessions ON sessions.volunteer_id = student_favorite_volunteers.volunteer_id\nWHERE\n    student_favorite_volunteers.student_id = :studentId!\nORDER BY\n    student_favorite_volunteers.created_at DESC\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":1850,"b":2637,"line":76,"col":0}}};

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

const deleteFavoriteVolunteerIR: any = {"name":"deleteFavoriteVolunteer","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2738,"b":2747,"line":103,"col":20}]}},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2773,"b":2784,"line":104,"col":24}]}}],"usedParamSet":{"studentId":true,"volunteerId":true},"statement":{"body":"DELETE FROM student_favorite_volunteers\nWHERE student_id = :studentId!\n    AND volunteer_id = :volunteerId!\nRETURNING\n    student_id,\n    volunteer_id","loc":{"a":2678,"b":2827,"line":102,"col":0}}};

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

const addFavoriteVolunteerIR: any = {"name":"addFavoriteVolunteer","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2987,"b":2996,"line":113,"col":17},{"a":3292,"b":3301,"line":129,"col":22}]}},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3000,"b":3011,"line":113,"col":30},{"a":3335,"b":3346,"line":130,"col":32}]}}],"usedParamSet":{"studentId":true,"volunteerId":true},"statement":{"body":"WITH ins AS (\nINSERT INTO student_favorite_volunteers (student_id, volunteer_id, created_at, updated_at)\n        VALUES (:studentId!, :volunteerId!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        student_id, volunteer_id)\n    SELECT\n        *\n    FROM\n        ins\n    UNION\n    SELECT\n        student_id,\n        volunteer_id\n    FROM\n        student_favorite_volunteers\n    WHERE\n        student_id = :studentId!\n            AND volunteer_id = :volunteerId!","loc":{"a":2865,"b":3346,"line":111,"col":0}}};

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

const getReportedStudentIR: any = {"name":"getReportedStudent","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3919,"b":3925,"line":152,"col":20}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id AS id,\n    first_name,\n    last_name,\n    email,\n    users.created_at AS created_at,\n    test_user AS is_test_user,\n    banned AS is_banned,\n    deactivated AS is_deactivated,\n    FALSE AS is_volunteer,\n    student_partner_orgs.key AS student_partner_org\nFROM\n    users\n    JOIN student_profiles ON users.id = student_profiles.user_id\n    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\nWHERE\n    deactivated IS FALSE\n    AND test_user IS FALSE\n    AND users.id = :userId!","loc":{"a":3382,"b":3925,"line":134,"col":0}}};

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

const getStudentPartnerInfoByIdIR: any = {"name":"getStudentPartnerInfoById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4286,"b":4292,"line":164,"col":32}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    student_profiles.user_id AS id,\n    student_partner_orgs.key AS student_partner_org,\n    student_profiles.school_id AS approved_highschool\nFROM\n    student_profiles\n    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\nWHERE\n    student_profiles.user_id = :userId!","loc":{"a":3968,"b":4292,"line":156,"col":0}}};

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

const deleteStudentIR: any = {"name":"deleteStudent","params":[{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4357,"b":4362,"line":171,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4404,"b":4410,"line":174,"col":10}]}}],"usedParamSet":{"email":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    email = :email!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":4323,"b":4433,"line":168,"col":0}}};

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

const adminUpdateStudentIR: any = {"name":"adminUpdateStudent","params":[{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4508,"b":4517,"line":183,"col":18}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4537,"b":4545,"line":184,"col":17}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4561,"b":4566,"line":185,"col":13}]}},{"name":"verified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4585,"b":4593,"line":186,"col":16}]}},{"name":"banned","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4610,"b":4616,"line":187,"col":14}]}},{"name":"deactivated","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4638,"b":4649,"line":188,"col":19}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4691,"b":4697,"line":191,"col":10}]}}],"usedParamSet":{"firstName":true,"lastName":true,"email":true,"verified":true,"banned":true,"deactivated":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    first_name = :firstName!,\n    last_name = :lastName!,\n    email = :email!,\n    verified = :verified!,\n    banned = :banned!,\n    deactivated = :deactivated!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":4469,"b":4720,"line":180,"col":0}}};

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

const adminUpdateStudentProfileIR: any = {"name":"adminUpdateStudentProfile","params":[{"name":"partnerOrgId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4825,"b":4836,"line":200,"col":30}]}},{"name":"partnerOrgSiteId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4874,"b":4889,"line":201,"col":35}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4936,"b":4942,"line":204,"col":15}]}}],"usedParamSet":{"partnerOrgId":true,"partnerOrgSiteId":true,"userId":true},"statement":{"body":"UPDATE\n    student_profiles\nSET\n    student_partner_org_id = :partnerOrgId,\n    student_partner_org_site_id = :partnerOrgSiteId,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":4763,"b":4970,"line":197,"col":0}}};

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

const getPartnerOrgsByStudentIR: any = {"name":"getPartnerOrgsByStudent","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5345,"b":5354,"line":220,"col":21}]}}],"usedParamSet":{"studentId":true},"statement":{"body":"SELECT\n    spo.name,\n    spo.id,\n    spo.school_id,\n    sposite.name AS site_name\nFROM\n    users_student_partner_orgs_instances uspoi\n    JOIN student_partner_orgs spo ON spo.id = uspoi.student_partner_org_id\n    LEFT JOIN student_partner_org_sites sposite ON sposite.id = uspoi.student_partner_org_site_id\nWHERE\n    uspoi.user_id = :studentId!\n    AND deactivated_on IS NULL","loc":{"a":5011,"b":5385,"line":210,"col":0}}};

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

const adminDeactivateStudentPartnershipInstanceIR: any = {"name":"adminDeactivateStudentPartnershipInstance","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5544,"b":5550,"line":230,"col":15}]}},{"name":"spoId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5586,"b":5591,"line":231,"col":34}]}}],"usedParamSet":{"userId":true,"spoId":true},"statement":{"body":"UPDATE\n    users_student_partner_orgs_instances\nSET\n    deactivated_on = NOW()\nWHERE\n    user_id = :userId!\n    AND student_partner_org_id = :spoId!\nRETURNING\n    user_id AS ok","loc":{"a":5444,"b":5619,"line":225,"col":0}}};

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

const insertStudentPartnershipInstanceIR: any = {"name":"insertStudentPartnershipInstance","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5818,"b":5824,"line":238,"col":13}]}},{"name":"partnerOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5828,"b":5840,"line":238,"col":23}]}},{"name":"partnerOrgSiteId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5844,"b":5859,"line":238,"col":39}]}}],"usedParamSet":{"userId":true,"partnerOrgId":true,"partnerOrgSiteId":true},"statement":{"body":"INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, created_at, updated_at)\n    VALUES (:userId!, :partnerOrgId!, :partnerOrgSiteId, NOW(), NOW())\nRETURNING\n    user_id AS ok","loc":{"a":5669,"b":5902,"line":237,"col":0}}};

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

const getPartnerOrgByKeyIR: any = {"name":"getPartnerOrgByKey","params":[{"name":"partnerOrgSiteName","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6463,"b":6480,"line":261,"col":46}]}},{"name":"partnerOrgKey","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6628,"b":6640,"line":263,"col":32}]}}],"usedParamSet":{"partnerOrgSiteName":true,"partnerOrgKey":true},"statement":{"body":"SELECT\n    student_partner_orgs.id AS partner_id,\n    student_partner_orgs.key AS partner_key,\n    student_partner_orgs.name AS partner_name,\n    student_partner_orgs.school_id AS school_id,\n    student_partner_org_sites.id AS site_id,\n    student_partner_org_sites.name AS site_name\nFROM\n    student_partner_orgs\n    LEFT JOIN (\n        SELECT\n            name,\n            id,\n            student_partner_org_id\n        FROM\n            student_partner_org_sites\n        WHERE\n            student_partner_org_sites.name = :partnerOrgSiteName) AS student_partner_org_sites ON student_partner_orgs.id = student_partner_org_sites.student_partner_org_id\nWHERE\n    student_partner_orgs.key = :partnerOrgKey\nLIMIT 1","loc":{"a":5938,"b":6648,"line":244,"col":0}}};

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

const updateStudentInGatesStudyIR: any = {"name":"updateStudentInGatesStudy","params":[{"name":"inGatesStudy","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6756,"b":6767,"line":271,"col":31}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6807,"b":6813,"line":273,"col":15}]}}],"usedParamSet":{"inGatesStudy":true,"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    in_gates_study = COALESCE(:inGatesStudy, in_gates_study)\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":6691,"b":6841,"line":268,"col":0}}};

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

const createStudentUserIR: any = {"name":"createStudentUser","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7087,"b":7093,"line":280,"col":13}]}},{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7097,"b":7106,"line":280,"col":23}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7110,"b":7118,"line":280,"col":36}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7122,"b":7127,"line":280,"col":48}]}},{"name":"password","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7131,"b":7138,"line":280,"col":57}]}},{"name":"verified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7142,"b":7150,"line":280,"col":68}]}},{"name":"emailVerified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7154,"b":7167,"line":280,"col":80}]}},{"name":"referredBy","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7171,"b":7180,"line":280,"col":97}]}},{"name":"referralCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7184,"b":7196,"line":280,"col":110}]}},{"name":"signupSourceId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7200,"b":7213,"line":280,"col":126}]}},{"name":"otherSignupSource","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7217,"b":7233,"line":280,"col":143}]}}],"usedParamSet":{"userId":true,"firstName":true,"lastName":true,"email":true,"password":true,"verified":true,"emailVerified":true,"referredBy":true,"referralCode":true,"signupSourceId":true,"otherSignupSource":true},"statement":{"body":"INSERT INTO users (id, first_name, last_name, email, PASSWORD, verified, email_verified, referred_by, referral_code, signup_source_id, other_signup_source, last_activity_at, created_at, updated_at)\n    VALUES (:userId!, :firstName!, :lastName!, :email!, :password, :verified!, :emailVerified!, :referredBy, :referralCode!, :signupSourceId, :otherSignupSource, NOW(), NOW(), NOW())\nON CONFLICT (email)\n    DO NOTHING\nRETURNING\n    id, first_name, last_name, email, verified, banned, test_user, deactivated, created_at","loc":{"a":6876,"b":7391,"line":279,"col":0}}};

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

const createStudentProfileIR: any = {"name":"createStudentProfile","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7606,"b":7612,"line":290,"col":5},{"a":8404,"b":8410,"line":317,"col":16}]}},{"name":"postalCode","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7620,"b":7629,"line":291,"col":5}]}},{"name":"schoolId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7745,"b":7752,"line":295,"col":5}]}},{"name":"college","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7760,"b":7766,"line":296,"col":5}]}},{"name":"partnerOrg","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8199,"b":8208,"line":313,"col":40},{"a":8470,"b":8479,"line":321,"col":5}]}},{"name":"partnerSite","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8275,"b":8285,"line":314,"col":44},{"a":8510,"b":8520,"line":322,"col":5}]}},{"name":"gradeLevel","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8351,"b":8360,"line":315,"col":31},{"a":8544,"b":8553,"line":323,"col":5}]}}],"usedParamSet":{"userId":true,"postalCode":true,"schoolId":true,"college":true,"partnerOrg":true,"partnerSite":true,"gradeLevel":true},"statement":{"body":"INSERT INTO student_profiles (user_id, postal_code, student_partner_org_id, student_partner_org_site_id, grade_level_id, school_id, college, created_at, updated_at)\nSELECT\n    :userId!,\n    :postalCode,\n    topquery.student_partner_org_id,\n    topquery.student_partner_org_site_id,\n    topquery.grade_level_id,\n    :schoolId,\n    :college,\n    NOW(),\n    NOW()\nFROM (\n    SELECT\n        subquery.student_partner_org_id AS student_partner_org_id,\n        student_partner_org_sites.id AS student_partner_org_site_id,\n        grade_levels.id AS grade_level_id\n    FROM\n        users\n    LEFT JOIN (\n        SELECT\n            id AS student_partner_org_id,\n            name\n        FROM\n            student_partner_orgs\n        WHERE\n            student_partner_orgs.key = :partnerOrg) AS subquery ON TRUE\n    LEFT JOIN student_partner_org_sites ON :partnerSite = student_partner_org_sites.name\n    LEFT JOIN grade_levels ON :gradeLevel = grade_levels.name\nWHERE\n    users.id = :userId!) AS topquery\nRETURNING\n    user_id,\n    postal_code,\n    :partnerOrg AS student_partner_org,\n    :partnerSite AS partner_site,\n    :gradeLevel AS grade_level,\n    school_id,\n    college,\n    created_at,\n    updated_at","loc":{"a":7429,"b":8628,"line":288,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_profiles (user_id, postal_code, student_partner_org_id, student_partner_org_site_id, grade_level_id, school_id, college, created_at, updated_at)
 * SELECT
 *     :userId!,
 *     :postalCode,
 *     topquery.student_partner_org_id,
 *     topquery.student_partner_org_site_id,
 *     topquery.grade_level_id,
 *     :schoolId,
 *     :college,
 *     NOW(),
 *     NOW()
 * FROM (
 *     SELECT
 *         subquery.student_partner_org_id AS student_partner_org_id,
 *         student_partner_org_sites.id AS student_partner_org_site_id,
 *         grade_levels.id AS grade_level_id
 *     FROM
 *         users
 *     LEFT JOIN (
 *         SELECT
 *             id AS student_partner_org_id,
 *             name
 *         FROM
 *             student_partner_orgs
 *         WHERE
 *             student_partner_orgs.key = :partnerOrg) AS subquery ON TRUE
 *     LEFT JOIN student_partner_org_sites ON :partnerSite = student_partner_org_sites.name
 *     LEFT JOIN grade_levels ON :gradeLevel = grade_levels.name
 * WHERE
 *     users.id = :userId!) AS topquery
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

const createUserStudentPartnerOrgInstanceIR: any = {"name":"createUserStudentPartnerOrgInstance","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8829,"b":8835,"line":333,"col":5}]}},{"name":"spoSiteName","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8866,"b":8876,"line":335,"col":16},{"a":9140,"b":9150,"line":347,"col":11},{"a":9180,"b":9190,"line":348,"col":13}]}},{"name":"spoName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9120,"b":9127,"line":346,"col":16}]}}],"usedParamSet":{"userId":true,"spoSiteName":true,"spoName":true},"statement":{"body":"INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, created_at, updated_at)\nSELECT\n    :userId!,\n    spo.id,\n    CASE WHEN (:spoSiteName)::text IS NOT NULL THEN\n        sposite.id\n    ELSE\n        NULL\n    END,\n    NOW(),\n    NOW()\nFROM\n    student_partner_orgs spo\n    LEFT JOIN student_partner_org_sites sposite ON sposite.student_partner_org_id = spo.id\nWHERE\n    spo.name = :spoName!\n    AND ((:spoSiteName)::text IS NULL\n        OR (:spoSiteName)::text = sposite.name)\nLIMIT 1\nRETURNING\n    user_id AS ok","loc":{"a":8681,"b":9249,"line":331,"col":0}}};

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

const createUserStudentPartnerOrgInstanceWithSchoolIdIR: any = {"name":"createUserStudentPartnerOrgInstanceWithSchoolId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9462,"b":9468,"line":357,"col":5}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9575,"b":9583,"line":365,"col":21}]}}],"usedParamSet":{"userId":true,"schoolId":true},"statement":{"body":"INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, created_at, updated_at)\nSELECT\n    :userId!,\n    spo.id,\n    NULL,\n    NOW(),\n    NOW()\nFROM\n    student_partner_orgs spo\nWHERE\n    spo.school_id = :schoolId!\nRETURNING\n    user_id AS ok","loc":{"a":9314,"b":9611,"line":355,"col":0}}};

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

const getActiveStudentOrgInstanceIR: any = {"name":"getActiveStudentOrgInstance","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9842,"b":9851,"line":378,"col":21}]}},{"name":"spoId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9893,"b":9898,"line":379,"col":40}]}}],"usedParamSet":{"studentId":true,"spoId":true},"statement":{"body":"SELECT\n    spo.name,\n    spo.id\nFROM\n    users_student_partner_orgs_instances uspoi\n    JOIN student_partner_orgs spo ON spo.id = uspoi.student_partner_org_id\nWHERE\n    uspoi.user_id = :studentId!\n    AND uspoi.student_partner_org_id = :spoId!\n    AND deactivated_on IS NULL","loc":{"a":9656,"b":9929,"line":371,"col":0}}};

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

const getSessionReportIR: any = {"name":"getSessionReport","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12367,"b":12372,"line":440,"col":28}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12406,"b":12409,"line":441,"col":32}]}},{"name":"highSchoolId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12460,"b":12471,"line":443,"col":11},{"a":12529,"b":12540,"line":444,"col":41}]}},{"name":"studentPartnerOrg","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12554,"b":12570,"line":445,"col":11},{"a":12626,"b":12642,"line":446,"col":39}]}},{"name":"studentPartnerSite","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12656,"b":12673,"line":447,"col":11},{"a":12735,"b":12752,"line":448,"col":45}]}},{"name":"sponsorOrg","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":12766,"b":12775,"line":449,"col":11},{"a":12896,"b":12905,"line":451,"col":51},{"a":13005,"b":13014,"line":453,"col":46}]}}],"usedParamSet":{"start":true,"end":true,"highSchoolId":true,"studentPartnerOrg":true,"studentPartnerSite":true,"sponsorOrg":true},"statement":{"body":"SELECT\n    sessions.id AS session_id,\n    sessions.created_at AS created_at,\n    sessions.ended_at AS ended_at,\n    topics.name AS topic,\n    subjects.name AS subject,\n    users.first_name AS first_name,\n    users.last_name AS last_name,\n    users.email AS email,\n    student_partner_org_sites.name AS partner_site,\n    (\n        CASE WHEN partner_org_sponsor_org.name IS NOT NULL THEN\n            partner_org_sponsor_org.name\n        WHEN school_sponsor_org.name IS NOT NULL THEN\n            school_sponsor_org.name\n        ELSE\n            NULL\n        END) AS sponsor_org,\n    (\n        CASE WHEN sessions.volunteer_id IS NOT NULL THEN\n            'YES'\n        ELSE\n            'NO'\n        END) AS volunteer_joined,\n    sessions.volunteer_joined_at AS volunteer_joined_at,\n    COALESCE(session_messages.total, 0)::int AS total_messages,\n    (\n        CASE WHEN sessions.volunteer_joined_at IS NOT NULL THEN\n            ROUND(EXTRACT(EPOCH FROM (sessions.volunteer_joined_at - sessions.created_at) / 60), 1)\n        ELSE\n            NULL\n        END)::float AS wait_time_mins\nFROM\n    student_profiles\n    JOIN users ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\n    LEFT JOIN student_partner_org_sites ON student_profiles.student_partner_org_site_id = student_partner_org_sites.id\n    LEFT JOIN student_partner_orgs_sponsor_orgs ON student_profiles.student_partner_org_id = student_partner_orgs_sponsor_orgs.student_partner_org_id\n    LEFT JOIN sponsor_orgs AS partner_org_sponsor_org ON student_partner_orgs_sponsor_orgs.sponsor_org_id = partner_org_sponsor_org.id\n    LEFT JOIN schools_sponsor_orgs ON student_profiles.school_id = schools_sponsor_orgs.school_id\n    LEFT JOIN sponsor_orgs AS school_sponsor_org ON schools_sponsor_orgs.sponsor_org_id = school_sponsor_org.id\n    LEFT JOIN schools ON student_profiles.school_id = schools.id\n    JOIN sessions ON sessions.student_id = student_profiles.user_id\n    LEFT JOIN LATERAL (\n        SELECT\n            session_id,\n            count(*) AS total\n        FROM\n            session_messages\n        WHERE\n            session_id = sessions.id\n        GROUP BY\n            session_id) AS session_messages ON TRUE\n    JOIN subjects ON sessions.subject_id = subjects.id\n    JOIN topics ON subjects.topic_id = topics.id\nWHERE\n    sessions.created_at >= :start!\n    AND sessions.created_at <= :end!\n    AND sessions.ended_at IS NOT NULL\n    AND ((:highSchoolId)::uuid IS NULL\n        OR student_profiles.school_id = :highSchoolId)\n    AND ((:studentPartnerOrg)::text IS NULL\n        OR student_partner_orgs.key = :studentPartnerOrg)\n    AND ((:studentPartnerSite)::text IS NULL\n        OR student_partner_org_sites.name = :studentPartnerSite)\n    AND ((:sponsorOrg)::text IS NULL\n        OR ((partner_org_sponsor_org.key IS NOT NULL\n                AND partner_org_sponsor_org.key = :sponsorOrg)\n            OR (school_sponsor_org.key IS NOT NULL\n                AND school_sponsor_org.key = :sponsorOrg)))\nORDER BY\n    sessions.created_at ASC","loc":{"a":9963,"b":13054,"line":384,"col":0}}};

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

const getUsageReportIR: any = {"name":"getUsageReport","params":[{"name":"sessionStart","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15760,"b":15772,"line":506,"col":48},{"a":16235,"b":16247,"line":512,"col":48},{"a":16631,"b":16643,"line":520,"col":50}]}},{"name":"sessionEnd","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15822,"b":15832,"line":507,"col":48},{"a":16297,"b":16307,"line":513,"col":48},{"a":16693,"b":16703,"line":521,"col":48}]}},{"name":"joinedStart","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17303,"b":17314,"line":542,"col":25}]}},{"name":"joinedEnd","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17345,"b":17354,"line":543,"col":29}]}},{"name":"highSchoolId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17367,"b":17378,"line":544,"col":11},{"a":17436,"b":17447,"line":545,"col":41}]}},{"name":"studentPartnerOrg","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17457,"b":17473,"line":546,"col":7},{"a":17525,"b":17541,"line":547,"col":35}]}},{"name":"studentPartnerSite","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17551,"b":17568,"line":548,"col":7},{"a":17626,"b":17643,"line":549,"col":41}]}},{"name":"sponsorOrg","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":17653,"b":17662,"line":550,"col":7},{"a":17775,"b":17784,"line":552,"col":47},{"a":17876,"b":17885,"line":554,"col":42}]}}],"usedParamSet":{"sessionStart":true,"sessionEnd":true,"joinedStart":true,"joinedEnd":true,"highSchoolId":true,"studentPartnerOrg":true,"studentPartnerSite":true,"sponsorOrg":true},"statement":{"body":"SELECT\n    users.id AS user_id,\n    users.first_name AS first_name,\n    users.last_name AS last_name,\n    users.email AS email,\n    users.created_at AS join_date,\n    student_partner_orgs.name AS student_partner_org,\n    student_partner_org_sites.name AS partner_site,\n    (\n        CASE WHEN partner_org_sponsor_org.name IS NOT NULL THEN\n            partner_org_sponsor_org.name\n        WHEN school_sponsor_org.name IS NOT NULL THEN\n            school_sponsor_org.name\n        ELSE\n            NULL\n        END) AS sponsor_org,\n    schools.name AS school,\n    COALESCE(sessions.total_sessions, 0) AS total_sessions,\n    COALESCE(sessions.total_session_length_mins, 0)::float AS total_session_length_mins,\n    COALESCE(sessions.range_total_sessions, 0) AS range_total_sessions,\n    COALESCE(sessions.range_session_length_mins, 0)::float AS range_session_length_mins\nFROM\n    student_profiles\n    JOIN users ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\n    LEFT JOIN student_partner_org_sites ON student_profiles.student_partner_org_site_id = student_partner_org_sites.id\n    LEFT JOIN student_partner_orgs_sponsor_orgs ON student_profiles.student_partner_org_id = student_partner_orgs_sponsor_orgs.student_partner_org_id\n    LEFT JOIN sponsor_orgs AS partner_org_sponsor_org ON student_partner_orgs_sponsor_orgs.sponsor_org_id = partner_org_sponsor_org.id\n    LEFT JOIN schools_sponsor_orgs ON student_profiles.school_id = schools_sponsor_orgs.school_id\n    LEFT JOIN sponsor_orgs AS school_sponsor_org ON schools_sponsor_orgs.sponsor_org_id = school_sponsor_org.id\n    LEFT JOIN schools ON student_profiles.school_id = schools.id\n    LEFT JOIN (\n        SELECT\n            sum(\n                CASE WHEN TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 60) < 0 THEN\n                    0\n                WHEN sessions.volunteer_joined_at IS NOT NULL\n                    AND TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 3600) >= 1\n                    AND last_message.created_at IS NOT NULL THEN\n                    ROUND(EXTRACT(EPOCH FROM (last_message.created_at - sessions.volunteer_joined_at)) / 60, 2)\n                WHEN sessions.volunteer_joined_at IS NOT NULL THEN\n                    TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 60, 2)\n                ELSE\n                    0\n                END)::int AS total_session_length_mins,\n            sum(\n                CASE WHEN sessions.volunteer_joined_at IS NOT NULL\n                    AND sessions.created_at >= :sessionStart!\n                    AND sessions.created_at <= :sessionEnd!\n                    AND TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 3600) >= 1\n                    AND last_message.created_at IS NOT NULL THEN\n                    ROUND(EXTRACT(EPOCH FROM (last_message.created_at - sessions.volunteer_joined_at)) / 60, 2)\n                WHEN sessions.volunteer_joined_at IS NOT NULL\n                    AND sessions.created_at >= :sessionStart!\n                    AND sessions.created_at <= :sessionEnd! THEN\n                    TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 60, 2)\n                ELSE\n                    0\n                END)::int AS range_session_length_mins,\n            count(*)::int AS total_sessions,\n            sum(\n                CASE WHEN sessions.created_at >= :sessionStart!\n                    AND sessions.created_at <= :sessionEnd! THEN\n                    1\n                ELSE\n                    0\n                END)::int AS range_total_sessions,\n            student_id\n        FROM\n            sessions\n    LEFT JOIN (\n        SELECT\n            MAX(created_at) AS created_at,\n            session_id\n        FROM\n            session_messages\n        GROUP BY\n            session_id) AS last_message ON last_message.session_id = sessions.id\n    WHERE\n        sessions.ended_at IS NOT NULL\n    GROUP BY\n        sessions.student_id) AS sessions ON sessions.student_id = student_profiles.user_id\nWHERE\n    users.created_at >= :joinedStart!\n    AND users.created_at <= :joinedEnd!\n    AND ((:highSchoolId)::uuid IS NULL\n        OR student_profiles.school_id = :highSchoolId)\nAND ((:studentPartnerOrg)::text IS NULL\n    OR student_partner_orgs.key = :studentPartnerOrg)\nAND ((:studentPartnerSite)::text IS NULL\n    OR student_partner_org_sites.name = :studentPartnerSite)\nAND ((:sponsorOrg)::text IS NULL\n    OR ((partner_org_sponsor_org.key IS NOT NULL\n            AND partner_org_sponsor_org.key = :sponsorOrg)\n        OR (school_sponsor_org.key IS NOT NULL\n            AND school_sponsor_org.key = :sponsorOrg)))\nORDER BY\n    users.created_at ASC","loc":{"a":13086,"b":17922,"line":459,"col":0}}};

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

const getStudentSignupSourcesIR: any = {"name":"getStudentSignupSources","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    id,\n    name\nFROM\n    signup_sources\nWHERE\n    name <> 'Roster'\nORDER BY\n    RANDOM()","loc":{"a":17963,"b":18058,"line":560,"col":0}}};

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

const deleteSelfFavoritedVolunteersIR: any = {"name":"deleteSelfFavoritedVolunteers","params":[],"usedParamSet":{},"statement":{"body":"DELETE FROM student_favorite_volunteers\nWHERE student_id = volunteer_id","loc":{"a":18105,"b":18175,"line":572,"col":0}}};

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

const adminUpdateStudentSchoolIR: any = {"name":"adminUpdateStudentSchool","params":[{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18266,"b":18274,"line":580,"col":17}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18297,"b":18303,"line":582,"col":15}]}}],"usedParamSet":{"schoolId":true,"userId":true},"statement":{"body":"UPDATE\n    student_profiles\nSET\n    school_id = :schoolId!\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":18217,"b":18331,"line":577,"col":0}}};

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

const getActivePartnersForStudentIR: any = {"name":"getActivePartnersForStudent","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18581,"b":18590,"line":596,"col":21}]}}],"usedParamSet":{"studentId":true},"statement":{"body":"SELECT\n    spo.name,\n    spo.id,\n    spo.school_id\nFROM\n    users_student_partner_orgs_instances uspoi\n    JOIN student_partner_orgs spo ON spo.id = uspoi.student_partner_org_id\nWHERE\n    uspoi.user_id = :studentId!\n    AND deactivated_on IS NOT NULL","loc":{"a":18376,"b":18625,"line":588,"col":0}}};

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


