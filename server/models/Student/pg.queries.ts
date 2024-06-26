/** Types generated for queries found in "server/models/Student/student.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type ban_types = 'complete' | 'shadow';

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

const getStudentContactInfoByIdIR: any = {"name":"getStudentContactInfoById","params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1099,"b":1104,"line":33,"col":27}]}},{"name":"mongoUserId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1141,"b":1151,"line":34,"col":35}]}}],"usedParamSet":{"userId":true,"mongoUserId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    email,\n    student_partner_orgs.key AS student_partner_org,\n    student_profiles.school_id\nFROM\n    users\n    LEFT JOIN student_profiles ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\nWHERE\n    banned IS FALSE\n    AND (ban_type IS DISTINCT FROM 'complete')\n    AND deactivated IS FALSE\n    AND test_user IS FALSE\n    AND (users.id::uuid = :userId\n        OR users.mongo_id::text = :mongoUserId)","loc":{"a":622,"b":1152,"line":18,"col":0}}};

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
 *     AND (ban_type IS DISTINCT FROM 'complete')
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

const isTestUserIR: any = {"name":"isTestUser","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1232,"b":1238,"line":43,"col":10}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    test_user\nFROM\n    users\nWHERE\n    id = :userId!","loc":{"a":1180,"b":1238,"line":38,"col":0}}};

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

const getTotalFavoriteVolunteersIR: any = {"name":"getTotalFavoriteVolunteers","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1377,"b":1383,"line":52,"col":18}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    COUNT(*)::int AS total\nFROM\n    student_favorite_volunteers\nWHERE\n    student_id = :userId!","loc":{"a":1282,"b":1383,"line":47,"col":0}}};

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

const isFavoriteVolunteerIR: any = {"name":"isFavoriteVolunteer","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1505,"b":1514,"line":61,"col":18}]}},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1540,"b":1551,"line":62,"col":24}]}}],"usedParamSet":{"studentId":true,"volunteerId":true},"statement":{"body":"SELECT\n    volunteer_id\nFROM\n    student_favorite_volunteers\nWHERE\n    student_id = :studentId!\n    AND volunteer_id = :volunteerId!","loc":{"a":1420,"b":1551,"line":56,"col":0}}};

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

const getFavoriteVolunteersByStudentIdIR: any = {"name":"getFavoriteVolunteersByStudentId","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1823,"b":1832,"line":72,"col":46}]}}],"usedParamSet":{"studentId":true},"statement":{"body":"SELECT\n    student_favorite_volunteers.volunteer_id AS id\nFROM\n    student_favorite_volunteers\n    LEFT JOIN users ON student_favorite_volunteers.volunteer_id = users.id\nWHERE\n    student_favorite_volunteers.student_id = :studentId!","loc":{"a":1601,"b":1832,"line":66,"col":0}}};

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

const getFavoriteVolunteersPaginatedIR: any = {"name":"getFavoriteVolunteersPaginated","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2329,"b":2338,"line":90,"col":35},{"a":2557,"b":2566,"line":95,"col":46}]}},{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2633,"b":2638,"line":98,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2655,"b":2661,"line":98,"col":30}]}}],"usedParamSet":{"studentId":true,"limit":true,"offset":true},"statement":{"body":"SELECT\n    student_favorite_volunteers.volunteer_id AS volunteer_id,\n    users.first_name AS first_name,\n    COALESCE(sessions.total, 0)::int AS num_sessions\nFROM\n    student_favorite_volunteers\n    LEFT JOIN users ON student_favorite_volunteers.volunteer_id = users.id\n    LEFT JOIN (\n        SELECT\n            count(*) AS total,\n            sessions.volunteer_id\n        FROM\n            sessions\n        WHERE\n            sessions.student_id = :studentId!\n        GROUP BY\n            sessions.student_id,\n            sessions.volunteer_id) AS sessions ON sessions.volunteer_id = student_favorite_volunteers.volunteer_id\nWHERE\n    student_favorite_volunteers.student_id = :studentId!\nORDER BY\n    student_favorite_volunteers.created_at DESC\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":1880,"b":2667,"line":76,"col":0}}};

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

const deleteFavoriteVolunteerIR: any = {"name":"deleteFavoriteVolunteer","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2768,"b":2777,"line":103,"col":20}]}},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2803,"b":2814,"line":104,"col":24}]}}],"usedParamSet":{"studentId":true,"volunteerId":true},"statement":{"body":"DELETE FROM student_favorite_volunteers\nWHERE student_id = :studentId!\n    AND volunteer_id = :volunteerId!\nRETURNING\n    student_id,\n    volunteer_id","loc":{"a":2708,"b":2857,"line":102,"col":0}}};

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

const addFavoriteVolunteerIR: any = {"name":"addFavoriteVolunteer","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3017,"b":3026,"line":113,"col":17},{"a":3322,"b":3331,"line":129,"col":22}]}},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3030,"b":3041,"line":113,"col":30},{"a":3365,"b":3376,"line":130,"col":32}]}}],"usedParamSet":{"studentId":true,"volunteerId":true},"statement":{"body":"WITH ins AS (\nINSERT INTO student_favorite_volunteers (student_id, volunteer_id, created_at, updated_at)\n        VALUES (:studentId!, :volunteerId!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        student_id, volunteer_id)\n    SELECT\n        *\n    FROM\n        ins\n    UNION\n    SELECT\n        student_id,\n        volunteer_id\n    FROM\n        student_favorite_volunteers\n    WHERE\n        student_id = :studentId!\n            AND volunteer_id = :volunteerId!","loc":{"a":2895,"b":3376,"line":111,"col":0}}};

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

const getStudentPartnerInfoByIdIR: any = {"name":"getStudentPartnerInfoById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3737,"b":3743,"line":142,"col":32}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    student_profiles.user_id AS id,\n    student_partner_orgs.key AS student_partner_org,\n    student_profiles.school_id AS approved_highschool\nFROM\n    student_profiles\n    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\nWHERE\n    student_profiles.user_id = :userId!","loc":{"a":3419,"b":3743,"line":134,"col":0}}};

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

const deleteStudentIR: any = {"name":"deleteStudent","params":[{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3808,"b":3813,"line":149,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3855,"b":3861,"line":152,"col":10}]}}],"usedParamSet":{"email":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    email = :email!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":3774,"b":3884,"line":146,"col":0}}};

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
  banType: ban_types | null | void;
  deactivated: boolean;
  email: string;
  firstName: string | null | void;
  lastName: string | null | void;
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

const adminUpdateStudentIR: any = {"name":"adminUpdateStudent","params":[{"name":"firstName","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3968,"b":3976,"line":161,"col":27}]}},{"name":"lastName","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4018,"b":4025,"line":162,"col":26}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4053,"b":4058,"line":163,"col":13}]}},{"name":"verified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4077,"b":4085,"line":164,"col":16}]}},{"name":"banType","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4104,"b":4110,"line":165,"col":16}]}},{"name":"deactivated","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4132,"b":4143,"line":166,"col":19}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4185,"b":4191,"line":169,"col":10}]}}],"usedParamSet":{"firstName":true,"lastName":true,"email":true,"verified":true,"banType":true,"deactivated":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    first_name = COALESCE(:firstName, first_name),\n    last_name = COALESCE(:lastName, last_name),\n    email = :email!,\n    verified = :verified!,\n    ban_type = :banType,\n    deactivated = :deactivated!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":3920,"b":4214,"line":158,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     first_name = COALESCE(:firstName, first_name),
 *     last_name = COALESCE(:lastName, last_name),
 *     email = :email!,
 *     verified = :verified!,
 *     ban_type = :banType,
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

const adminUpdateStudentProfileIR: any = {"name":"adminUpdateStudentProfile","params":[{"name":"partnerOrgId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4319,"b":4330,"line":178,"col":30}]}},{"name":"partnerOrgSiteId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4368,"b":4383,"line":179,"col":35}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4430,"b":4436,"line":182,"col":15}]}}],"usedParamSet":{"partnerOrgId":true,"partnerOrgSiteId":true,"userId":true},"statement":{"body":"UPDATE\n    student_profiles\nSET\n    student_partner_org_id = :partnerOrgId,\n    student_partner_org_site_id = :partnerOrgSiteId,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":4257,"b":4464,"line":175,"col":0}}};

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

const getPartnerOrgsByStudentIR: any = {"name":"getPartnerOrgsByStudent","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4839,"b":4848,"line":198,"col":21}]}}],"usedParamSet":{"studentId":true},"statement":{"body":"SELECT\n    spo.name,\n    spo.id,\n    spo.school_id,\n    sposite.name AS site_name\nFROM\n    users_student_partner_orgs_instances uspoi\n    JOIN student_partner_orgs spo ON spo.id = uspoi.student_partner_org_id\n    LEFT JOIN student_partner_org_sites sposite ON sposite.id = uspoi.student_partner_org_site_id\nWHERE\n    uspoi.user_id = :studentId!\n    AND deactivated_on IS NULL","loc":{"a":4505,"b":4879,"line":188,"col":0}}};

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

const adminDeactivateStudentPartnershipInstanceIR: any = {"name":"adminDeactivateStudentPartnershipInstance","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5038,"b":5044,"line":208,"col":15}]}},{"name":"spoId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5080,"b":5085,"line":209,"col":34}]}}],"usedParamSet":{"userId":true,"spoId":true},"statement":{"body":"UPDATE\n    users_student_partner_orgs_instances\nSET\n    deactivated_on = NOW()\nWHERE\n    user_id = :userId!\n    AND student_partner_org_id = :spoId!\nRETURNING\n    user_id AS ok","loc":{"a":4938,"b":5113,"line":203,"col":0}}};

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

const insertStudentPartnershipInstanceIR: any = {"name":"insertStudentPartnershipInstance","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5312,"b":5318,"line":216,"col":13}]}},{"name":"partnerOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5322,"b":5334,"line":216,"col":23}]}},{"name":"partnerOrgSiteId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5338,"b":5353,"line":216,"col":39}]}}],"usedParamSet":{"userId":true,"partnerOrgId":true,"partnerOrgSiteId":true},"statement":{"body":"INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, created_at, updated_at)\n    VALUES (:userId!, :partnerOrgId!, :partnerOrgSiteId, NOW(), NOW())\nRETURNING\n    user_id AS ok","loc":{"a":5163,"b":5396,"line":215,"col":0}}};

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

const getPartnerOrgByKeyIR: any = {"name":"getPartnerOrgByKey","params":[{"name":"partnerOrgSiteName","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5957,"b":5974,"line":239,"col":46}]}},{"name":"partnerOrgKey","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6122,"b":6134,"line":241,"col":32}]}}],"usedParamSet":{"partnerOrgSiteName":true,"partnerOrgKey":true},"statement":{"body":"SELECT\n    student_partner_orgs.id AS partner_id,\n    student_partner_orgs.key AS partner_key,\n    student_partner_orgs.name AS partner_name,\n    student_partner_orgs.school_id AS school_id,\n    student_partner_org_sites.id AS site_id,\n    student_partner_org_sites.name AS site_name\nFROM\n    student_partner_orgs\n    LEFT JOIN (\n        SELECT\n            name,\n            id,\n            student_partner_org_id\n        FROM\n            student_partner_org_sites\n        WHERE\n            student_partner_org_sites.name = :partnerOrgSiteName) AS student_partner_org_sites ON student_partner_orgs.id = student_partner_org_sites.student_partner_org_id\nWHERE\n    student_partner_orgs.key = :partnerOrgKey\nLIMIT 1","loc":{"a":5432,"b":6142,"line":222,"col":0}}};

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

const updateStudentInGatesStudyIR: any = {"name":"updateStudentInGatesStudy","params":[{"name":"inGatesStudy","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6250,"b":6261,"line":249,"col":31}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6301,"b":6307,"line":251,"col":15}]}}],"usedParamSet":{"inGatesStudy":true,"userId":true},"statement":{"body":"UPDATE\n    user_product_flags\nSET\n    in_gates_study = COALESCE(:inGatesStudy, in_gates_study)\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":6185,"b":6335,"line":246,"col":0}}};

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
  banType: ban_types | null;
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

const createStudentUserIR: any = {"name":"createStudentUser","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6581,"b":6587,"line":258,"col":13}]}},{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6591,"b":6600,"line":258,"col":23}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6604,"b":6612,"line":258,"col":36}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6616,"b":6621,"line":258,"col":48}]}},{"name":"password","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6625,"b":6632,"line":258,"col":57}]}},{"name":"verified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6636,"b":6644,"line":258,"col":68}]}},{"name":"emailVerified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6648,"b":6661,"line":258,"col":80}]}},{"name":"referredBy","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6665,"b":6674,"line":258,"col":97}]}},{"name":"referralCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6678,"b":6690,"line":258,"col":110}]}},{"name":"signupSourceId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6694,"b":6707,"line":258,"col":126}]}},{"name":"otherSignupSource","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6711,"b":6727,"line":258,"col":143}]}}],"usedParamSet":{"userId":true,"firstName":true,"lastName":true,"email":true,"password":true,"verified":true,"emailVerified":true,"referredBy":true,"referralCode":true,"signupSourceId":true,"otherSignupSource":true},"statement":{"body":"INSERT INTO users (id, first_name, last_name, email, PASSWORD, verified, email_verified, referred_by, referral_code, signup_source_id, other_signup_source, last_activity_at, created_at, updated_at)\n    VALUES (:userId!, :firstName!, :lastName!, :email!, :password, :verified!, :emailVerified!, :referredBy, :referralCode!, :signupSourceId, :otherSignupSource, NOW(), NOW(), NOW())\nON CONFLICT (email)\n    DO NOTHING\nRETURNING\n    id, first_name, last_name, email, verified, banned, ban_type, test_user, deactivated, created_at","loc":{"a":6370,"b":6895,"line":257,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users (id, first_name, last_name, email, PASSWORD, verified, email_verified, referred_by, referral_code, signup_source_id, other_signup_source, last_activity_at, created_at, updated_at)
 *     VALUES (:userId!, :firstName!, :lastName!, :email!, :password, :verified!, :emailVerified!, :referredBy, :referralCode!, :signupSourceId, :otherSignupSource, NOW(), NOW(), NOW())
 * ON CONFLICT (email)
 *     DO NOTHING
 * RETURNING
 *     id, first_name, last_name, email, verified, banned, ban_type, test_user, deactivated, created_at
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

const createStudentProfileIR: any = {"name":"createStudentProfile","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7111,"b":7117,"line":267,"col":13}]}},{"name":"postalCode","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7121,"b":7130,"line":267,"col":23}]}},{"name":"partnerOrg","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7289,"b":7298,"line":273,"col":44},{"a":7825,"b":7834,"line":298,"col":5}]}},{"name":"partnerSite","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7497,"b":7507,"line":281,"col":50},{"a":7865,"b":7875,"line":299,"col":5}]}},{"name":"gradeLevel","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7680,"b":7689,"line":289,"col":37},{"a":7899,"b":7908,"line":300,"col":5}]}},{"name":"schoolId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7722,"b":7729,"line":291,"col":9}]}},{"name":"college","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7741,"b":7747,"line":292,"col":9}]}}],"usedParamSet":{"userId":true,"postalCode":true,"partnerOrg":true,"partnerSite":true,"gradeLevel":true,"schoolId":true,"college":true},"statement":{"body":"INSERT INTO student_profiles (user_id, postal_code, student_partner_org_id, student_partner_org_site_id, grade_level_id, school_id, college, created_at, updated_at)\n    VALUES (:userId!, :postalCode, (\n            SELECT\n                id\n            FROM\n                student_partner_orgs\n            WHERE\n                student_partner_orgs.key = :partnerOrg\n            LIMIT 1),\n        (\n            SELECT\n                id\n            FROM\n                student_partner_org_sites\n            WHERE\n                student_partner_org_sites.name = :partnerSite\n            LIMIT 1),\n        (\n            SELECT\n                id\n            FROM\n                grade_levels\n            WHERE\n                grade_levels.name = :gradeLevel\n            LIMIT 1),\n        :schoolId,\n        :college,\n        NOW(),\n        NOW())\nRETURNING\n    user_id,\n    postal_code,\n    :partnerOrg AS student_partner_org,\n    :partnerSite AS partner_site,\n    :gradeLevel AS grade_level,\n    school_id,\n    college,\n    created_at,\n    updated_at","loc":{"a":6933,"b":7983,"line":266,"col":0}}};

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


/** 'UpsertStudentProfile' parameters type */
export interface IUpsertStudentProfileParams {
  college: string | null | void;
  gradeLevel: string | null | void;
  partnerOrg: string | null | void;
  partnerSite: string | null | void;
  postalCode: string | null | void;
  schoolId: string | null | void;
  userId: string;
}

/** 'UpsertStudentProfile' return type */
export interface IUpsertStudentProfileResult {
  college: string | null;
  createdAt: Date;
  gradeLevel: string | null;
  isCreated: boolean | null;
  partnerSite: string | null;
  postalCode: string | null;
  schoolId: string | null;
  studentPartnerOrg: string | null;
  updatedAt: Date;
  userId: string;
}

/** 'UpsertStudentProfile' query type */
export interface IUpsertStudentProfileQuery {
  params: IUpsertStudentProfileParams;
  result: IUpsertStudentProfileResult;
}

const upsertStudentProfileIR: any = {"name":"upsertStudentProfile","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8199,"b":8205,"line":309,"col":13}]}},{"name":"postalCode","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8209,"b":8218,"line":309,"col":23},{"a":8931,"b":8940,"line":339,"col":23}]}},{"name":"partnerOrg","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8377,"b":8386,"line":315,"col":44},{"a":9132,"b":9141,"line":346,"col":44},{"a":9614,"b":9623,"line":370,"col":5}]}},{"name":"partnerSite","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8585,"b":8595,"line":323,"col":50},{"a":9342,"b":9352,"line":354,"col":46},{"a":9654,"b":9664,"line":371,"col":5}]}},{"name":"gradeLevel","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8768,"b":8777,"line":331,"col":37},{"a":9482,"b":9491,"line":362,"col":29},{"a":9688,"b":9697,"line":372,"col":5}]}},{"name":"schoolId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8810,"b":8817,"line":333,"col":9},{"a":9520,"b":9527,"line":364,"col":13}]}},{"name":"college","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8829,"b":8835,"line":334,"col":9},{"a":9541,"b":9547,"line":365,"col":11}]}}],"usedParamSet":{"userId":true,"postalCode":true,"partnerOrg":true,"partnerSite":true,"gradeLevel":true,"schoolId":true,"college":true},"statement":{"body":"INSERT INTO student_profiles (user_id, postal_code, student_partner_org_id, student_partner_org_site_id, grade_level_id, school_id, college, created_at, updated_at)\n    VALUES (:userId!, :postalCode, (\n            SELECT\n                id\n            FROM\n                student_partner_orgs\n            WHERE\n                student_partner_orgs.key = :partnerOrg\n            LIMIT 1),\n        (\n            SELECT\n                id\n            FROM\n                student_partner_org_sites\n            WHERE\n                student_partner_org_sites.name = :partnerSite\n            LIMIT 1),\n        (\n            SELECT\n                id\n            FROM\n                grade_levels\n            WHERE\n                grade_levels.name = :gradeLevel\n            LIMIT 1),\n        :schoolId,\n        :college,\n        NOW(),\n        NOW())\nON CONFLICT (user_id)\n    DO UPDATE SET\n        postal_code = :postalCode,\n        student_partner_org_id = (\n            SELECT\n                id\n            FROM\n                student_partner_orgs\n            WHERE\n                student_partner_orgs.key = :partnerOrg\n            LIMIT 1),\n    student_partner_org_site_id = (\n        SELECT\n            id\n        FROM\n            student_partner_org_sites\n        WHERE\n            student_partner_org_sites.name = :partnerSite\n        LIMIT 1),\ngrade_level_id = (\n    SELECT\n        id\n    FROM\n        grade_levels\n    WHERE\n        grade_levels.name = :gradeLevel\n    LIMIT 1),\nschool_id = :schoolId,\ncollege = :college,\nupdated_at = NOW()\nRETURNING\n    user_id,\n    postal_code,\n    :partnerOrg AS student_partner_org,\n    :partnerSite AS partner_site,\n    :gradeLevel AS grade_level,\n    school_id,\n    college,\n    created_at,\n    updated_at,\n    (xmax = 0) AS is_created","loc":{"a":8021,"b":9802,"line":308,"col":0}}};

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
 * ON CONFLICT (user_id)
 *     DO UPDATE SET
 *         postal_code = :postalCode,
 *         student_partner_org_id = (
 *             SELECT
 *                 id
 *             FROM
 *                 student_partner_orgs
 *             WHERE
 *                 student_partner_orgs.key = :partnerOrg
 *             LIMIT 1),
 *     student_partner_org_site_id = (
 *         SELECT
 *             id
 *         FROM
 *             student_partner_org_sites
 *         WHERE
 *             student_partner_org_sites.name = :partnerSite
 *         LIMIT 1),
 * grade_level_id = (
 *     SELECT
 *         id
 *     FROM
 *         grade_levels
 *     WHERE
 *         grade_levels.name = :gradeLevel
 *     LIMIT 1),
 * school_id = :schoolId,
 * college = :college,
 * updated_at = NOW()
 * RETURNING
 *     user_id,
 *     postal_code,
 *     :partnerOrg AS student_partner_org,
 *     :partnerSite AS partner_site,
 *     :gradeLevel AS grade_level,
 *     school_id,
 *     college,
 *     created_at,
 *     updated_at,
 *     (xmax = 0) AS is_created
 * ```
 */
export const upsertStudentProfile = new PreparedQuery<IUpsertStudentProfileParams,IUpsertStudentProfileResult>(upsertStudentProfileIR);


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

const createUserStudentPartnerOrgInstanceIR: any = {"name":"createUserStudentPartnerOrgInstance","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10003,"b":10009,"line":383,"col":5}]}},{"name":"spoSiteName","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10040,"b":10050,"line":385,"col":16},{"a":10314,"b":10324,"line":397,"col":11},{"a":10354,"b":10364,"line":398,"col":13}]}},{"name":"spoName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10294,"b":10301,"line":396,"col":16}]}}],"usedParamSet":{"userId":true,"spoSiteName":true,"spoName":true},"statement":{"body":"INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, created_at, updated_at)\nSELECT\n    :userId!,\n    spo.id,\n    CASE WHEN (:spoSiteName)::text IS NOT NULL THEN\n        sposite.id\n    ELSE\n        NULL\n    END,\n    NOW(),\n    NOW()\nFROM\n    student_partner_orgs spo\n    LEFT JOIN student_partner_org_sites sposite ON sposite.student_partner_org_id = spo.id\nWHERE\n    spo.name = :spoName!\n    AND ((:spoSiteName)::text IS NULL\n        OR (:spoSiteName)::text = sposite.name)\nLIMIT 1\nRETURNING\n    user_id AS ok","loc":{"a":9855,"b":10423,"line":381,"col":0}}};

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

const createUserStudentPartnerOrgInstanceWithSchoolIdIR: any = {"name":"createUserStudentPartnerOrgInstanceWithSchoolId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10636,"b":10642,"line":407,"col":5}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10749,"b":10757,"line":415,"col":21}]}}],"usedParamSet":{"userId":true,"schoolId":true},"statement":{"body":"INSERT INTO users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, created_at, updated_at)\nSELECT\n    :userId!,\n    spo.id,\n    NULL,\n    NOW(),\n    NOW()\nFROM\n    student_partner_orgs spo\nWHERE\n    spo.school_id = :schoolId!\nRETURNING\n    user_id AS ok","loc":{"a":10488,"b":10785,"line":405,"col":0}}};

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

const getActiveStudentOrgInstanceIR: any = {"name":"getActiveStudentOrgInstance","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11016,"b":11025,"line":428,"col":21}]}},{"name":"spoId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11067,"b":11072,"line":429,"col":40}]}}],"usedParamSet":{"studentId":true,"spoId":true},"statement":{"body":"SELECT\n    spo.name,\n    spo.id\nFROM\n    users_student_partner_orgs_instances uspoi\n    JOIN student_partner_orgs spo ON spo.id = uspoi.student_partner_org_id\nWHERE\n    uspoi.user_id = :studentId!\n    AND uspoi.student_partner_org_id = :spoId!\n    AND deactivated_on IS NULL","loc":{"a":10830,"b":11103,"line":421,"col":0}}};

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
  sessionRating: number;
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

const getSessionReportIR: any = {"name":"getSessionReport","params":[{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11938,"b":11943,"line":461,"col":32}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11981,"b":11984,"line":462,"col":36}]}},{"name":"highSchoolId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":14955,"b":14966,"line":523,"col":9},{"a":15020,"b":15031,"line":524,"col":37}]}},{"name":"studentPartnerOrg","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15041,"b":15057,"line":525,"col":7},{"a":15109,"b":15125,"line":526,"col":35}]}},{"name":"studentPartnerSite","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15135,"b":15152,"line":527,"col":7},{"a":15210,"b":15227,"line":528,"col":41}]}},{"name":"sponsorOrg","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":15237,"b":15246,"line":529,"col":7},{"a":15359,"b":15368,"line":531,"col":47},{"a":15460,"b":15469,"line":533,"col":42}]}}],"usedParamSet":{"start":true,"end":true,"highSchoolId":true,"studentPartnerOrg":true,"studentPartnerSite":true,"sponsorOrg":true},"statement":{"body":"WITH student_sessions AS (\n    SELECT\n        sessions.id AS session_id,\n        sessions.created_at,\n        ended_at,\n        volunteer_joined_at,\n        student_id,\n        subject_id,\n        (\n            CASE WHEN sessions.volunteer_id IS NOT NULL THEN\n                'YES'\n            ELSE\n                'NO'\n            END) AS volunteer_joined,\n        (\n            CASE WHEN sessions.volunteer_joined_at IS NOT NULL THEN\n                round(extract(EPOCH FROM (sessions.volunteer_joined_at - sessions.created_at) / 60), 1)\n            ELSE\n                NULL\n            END)::float AS wait_time_mins,\n        first_name,\n        last_name,\n        email\n    FROM\n        sessions\n        INNER JOIN users ON users.id = sessions.student_id\n    WHERE\n        sessions.created_at >= :start!\n        AND sessions.created_at <= :end!\n        AND sessions.ended_at IS NOT NULL\n),\nsession_ratings AS (\n    SELECT\n        users_surveys.session_id,\n        survey_response_choices.score AS session_rating\n    FROM\n        users_surveys\n        INNER JOIN users_surveys_submissions ON users_surveys.id = users_surveys_submissions.user_survey_id\n        INNER JOIN survey_questions ON users_surveys_submissions.survey_question_id = survey_questions.id\n        INNER JOIN survey_response_choices ON users_surveys_submissions.survey_response_choice_id = survey_response_choices.id\n    WHERE\n        survey_questions.question_text = 'Your goal for this session was to %s. Did UPchieve help you achieve your goal?'\n)\nSELECT\n    student_sessions.session_id AS session_id,\n    student_sessions.created_at AS created_at,\n    student_sessions.ended_at AS ended_at,\n    student_sessions.volunteer_joined AS volunteer_joined,\n    student_sessions.volunteer_joined_at AS volunteer_joined_at,\n    student_sessions.wait_time_mins AS wait_time_mins,\n    student_sessions.first_name AS first_name,\n    student_sessions.last_name AS last_name,\n    student_sessions.email AS email,\n    session_ratings.session_rating AS session_rating,\n    topics.name AS topic,\n    subjects.name AS subject,\n    student_partner_org_sites.name AS partner_site,\n    (\n        CASE WHEN partner_org_sponsor_org.name IS NOT NULL THEN\n            partner_org_sponsor_org.name\n        WHEN school_sponsor_org.name IS NOT NULL THEN\n            school_sponsor_org.name\n        ELSE\n            NULL\n        END) AS sponsor_org,\n    coalesce(messages.total, 0)::int AS total_messages\nFROM\n    student_sessions\n    JOIN subjects ON student_sessions.subject_id = subjects.id\n    JOIN topics ON subjects.topic_id = topics.id\n    JOIN student_profiles ON student_profiles.user_id = student_sessions.student_id\n    LEFT JOIN session_ratings ON session_ratings.session_id = student_sessions.session_id\n    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\n    LEFT JOIN student_partner_org_sites ON student_profiles.student_partner_org_site_id = student_partner_org_sites.id\n    LEFT JOIN student_partner_orgs_sponsor_orgs ON student_profiles.student_partner_org_id = student_partner_orgs_sponsor_orgs.student_partner_org_id\n    LEFT JOIN sponsor_orgs AS partner_org_sponsor_org ON student_partner_orgs_sponsor_orgs.sponsor_org_id = partner_org_sponsor_org.id\n    LEFT JOIN schools_sponsor_orgs ON student_profiles.school_id = schools_sponsor_orgs.school_id\n    LEFT JOIN sponsor_orgs AS school_sponsor_org ON schools_sponsor_orgs.sponsor_org_id = school_sponsor_org.id\n    LEFT JOIN schools ON student_profiles.school_id = schools.id\n    LEFT JOIN LATERAL (\n        SELECT\n            session_id,\n            count(*) AS total\n        FROM\n            session_messages\n        WHERE\n            session_id = student_sessions.session_id\n        GROUP BY\n            session_id) AS messages ON TRUE\nWHERE ((:highSchoolId)::uuid IS NULL\n    OR student_profiles.school_id = :highSchoolId)\nAND ((:studentPartnerOrg)::text IS NULL\n    OR student_partner_orgs.key = :studentPartnerOrg)\nAND ((:studentPartnerSite)::text IS NULL\n    OR student_partner_org_sites.name = :studentPartnerSite)\nAND ((:sponsorOrg)::text IS NULL\n    OR ((partner_org_sponsor_org.key IS NOT NULL\n            AND partner_org_sponsor_org.key = :sponsorOrg)\n        OR (school_sponsor_org.key IS NOT NULL\n            AND school_sponsor_org.key = :sponsorOrg)))\nORDER BY\n    student_sessions.created_at ASC","loc":{"a":11137,"b":15517,"line":434,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH student_sessions AS (
 *     SELECT
 *         sessions.id AS session_id,
 *         sessions.created_at,
 *         ended_at,
 *         volunteer_joined_at,
 *         student_id,
 *         subject_id,
 *         (
 *             CASE WHEN sessions.volunteer_id IS NOT NULL THEN
 *                 'YES'
 *             ELSE
 *                 'NO'
 *             END) AS volunteer_joined,
 *         (
 *             CASE WHEN sessions.volunteer_joined_at IS NOT NULL THEN
 *                 round(extract(EPOCH FROM (sessions.volunteer_joined_at - sessions.created_at) / 60), 1)
 *             ELSE
 *                 NULL
 *             END)::float AS wait_time_mins,
 *         first_name,
 *         last_name,
 *         email
 *     FROM
 *         sessions
 *         INNER JOIN users ON users.id = sessions.student_id
 *     WHERE
 *         sessions.created_at >= :start!
 *         AND sessions.created_at <= :end!
 *         AND sessions.ended_at IS NOT NULL
 * ),
 * session_ratings AS (
 *     SELECT
 *         users_surveys.session_id,
 *         survey_response_choices.score AS session_rating
 *     FROM
 *         users_surveys
 *         INNER JOIN users_surveys_submissions ON users_surveys.id = users_surveys_submissions.user_survey_id
 *         INNER JOIN survey_questions ON users_surveys_submissions.survey_question_id = survey_questions.id
 *         INNER JOIN survey_response_choices ON users_surveys_submissions.survey_response_choice_id = survey_response_choices.id
 *     WHERE
 *         survey_questions.question_text = 'Your goal for this session was to %s. Did UPchieve help you achieve your goal?'
 * )
 * SELECT
 *     student_sessions.session_id AS session_id,
 *     student_sessions.created_at AS created_at,
 *     student_sessions.ended_at AS ended_at,
 *     student_sessions.volunteer_joined AS volunteer_joined,
 *     student_sessions.volunteer_joined_at AS volunteer_joined_at,
 *     student_sessions.wait_time_mins AS wait_time_mins,
 *     student_sessions.first_name AS first_name,
 *     student_sessions.last_name AS last_name,
 *     student_sessions.email AS email,
 *     session_ratings.session_rating AS session_rating,
 *     topics.name AS topic,
 *     subjects.name AS subject,
 *     student_partner_org_sites.name AS partner_site,
 *     (
 *         CASE WHEN partner_org_sponsor_org.name IS NOT NULL THEN
 *             partner_org_sponsor_org.name
 *         WHEN school_sponsor_org.name IS NOT NULL THEN
 *             school_sponsor_org.name
 *         ELSE
 *             NULL
 *         END) AS sponsor_org,
 *     coalesce(messages.total, 0)::int AS total_messages
 * FROM
 *     student_sessions
 *     JOIN subjects ON student_sessions.subject_id = subjects.id
 *     JOIN topics ON subjects.topic_id = topics.id
 *     JOIN student_profiles ON student_profiles.user_id = student_sessions.student_id
 *     LEFT JOIN session_ratings ON session_ratings.session_id = student_sessions.session_id
 *     LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id
 *     LEFT JOIN student_partner_org_sites ON student_profiles.student_partner_org_site_id = student_partner_org_sites.id
 *     LEFT JOIN student_partner_orgs_sponsor_orgs ON student_profiles.student_partner_org_id = student_partner_orgs_sponsor_orgs.student_partner_org_id
 *     LEFT JOIN sponsor_orgs AS partner_org_sponsor_org ON student_partner_orgs_sponsor_orgs.sponsor_org_id = partner_org_sponsor_org.id
 *     LEFT JOIN schools_sponsor_orgs ON student_profiles.school_id = schools_sponsor_orgs.school_id
 *     LEFT JOIN sponsor_orgs AS school_sponsor_org ON schools_sponsor_orgs.sponsor_org_id = school_sponsor_org.id
 *     LEFT JOIN schools ON student_profiles.school_id = schools.id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             session_id,
 *             count(*) AS total
 *         FROM
 *             session_messages
 *         WHERE
 *             session_id = student_sessions.session_id
 *         GROUP BY
 *             session_id) AS messages ON TRUE
 * WHERE ((:highSchoolId)::uuid IS NULL
 *     OR student_profiles.school_id = :highSchoolId)
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
 *     student_sessions.created_at ASC
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

const getUsageReportIR: any = {"name":"getUsageReport","params":[{"name":"sessionStart","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18223,"b":18235,"line":586,"col":48},{"a":18698,"b":18710,"line":592,"col":48},{"a":19094,"b":19106,"line":600,"col":50}]}},{"name":"sessionEnd","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":18285,"b":18295,"line":587,"col":48},{"a":18760,"b":18770,"line":593,"col":48},{"a":19156,"b":19166,"line":601,"col":48}]}},{"name":"joinedStart","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19766,"b":19777,"line":622,"col":25}]}},{"name":"joinedEnd","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19808,"b":19817,"line":623,"col":29}]}},{"name":"highSchoolId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19830,"b":19841,"line":624,"col":11},{"a":19899,"b":19910,"line":625,"col":41}]}},{"name":"studentPartnerOrg","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":19920,"b":19936,"line":626,"col":7},{"a":19988,"b":20004,"line":627,"col":35}]}},{"name":"studentPartnerSite","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":20014,"b":20031,"line":628,"col":7},{"a":20089,"b":20106,"line":629,"col":41}]}},{"name":"sponsorOrg","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":20116,"b":20125,"line":630,"col":7},{"a":20238,"b":20247,"line":632,"col":47},{"a":20339,"b":20348,"line":634,"col":42}]}}],"usedParamSet":{"sessionStart":true,"sessionEnd":true,"joinedStart":true,"joinedEnd":true,"highSchoolId":true,"studentPartnerOrg":true,"studentPartnerSite":true,"sponsorOrg":true},"statement":{"body":"SELECT\n    users.id AS user_id,\n    users.first_name AS first_name,\n    users.last_name AS last_name,\n    users.email AS email,\n    users.created_at AS join_date,\n    student_partner_orgs.name AS student_partner_org,\n    student_partner_org_sites.name AS partner_site,\n    (\n        CASE WHEN partner_org_sponsor_org.name IS NOT NULL THEN\n            partner_org_sponsor_org.name\n        WHEN school_sponsor_org.name IS NOT NULL THEN\n            school_sponsor_org.name\n        ELSE\n            NULL\n        END) AS sponsor_org,\n    schools.name AS school,\n    COALESCE(sessions.total_sessions, 0) AS total_sessions,\n    COALESCE(sessions.total_session_length_mins, 0)::float AS total_session_length_mins,\n    COALESCE(sessions.range_total_sessions, 0) AS range_total_sessions,\n    COALESCE(sessions.range_session_length_mins, 0)::float AS range_session_length_mins\nFROM\n    student_profiles\n    JOIN users ON student_profiles.user_id = users.id\n    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\n    LEFT JOIN student_partner_org_sites ON student_profiles.student_partner_org_site_id = student_partner_org_sites.id\n    LEFT JOIN student_partner_orgs_sponsor_orgs ON student_profiles.student_partner_org_id = student_partner_orgs_sponsor_orgs.student_partner_org_id\n    LEFT JOIN sponsor_orgs AS partner_org_sponsor_org ON student_partner_orgs_sponsor_orgs.sponsor_org_id = partner_org_sponsor_org.id\n    LEFT JOIN schools_sponsor_orgs ON student_profiles.school_id = schools_sponsor_orgs.school_id\n    LEFT JOIN sponsor_orgs AS school_sponsor_org ON schools_sponsor_orgs.sponsor_org_id = school_sponsor_org.id\n    LEFT JOIN schools ON student_profiles.school_id = schools.id\n    LEFT JOIN (\n        SELECT\n            sum(\n                CASE WHEN TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 60) < 0 THEN\n                    0\n                WHEN sessions.volunteer_joined_at IS NOT NULL\n                    AND TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 3600) >= 1\n                    AND last_message.created_at IS NOT NULL THEN\n                    ROUND(EXTRACT(EPOCH FROM (last_message.created_at - sessions.volunteer_joined_at)) / 60, 2)\n                WHEN sessions.volunteer_joined_at IS NOT NULL THEN\n                    TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 60, 2)\n                ELSE\n                    0\n                END)::int AS total_session_length_mins,\n            sum(\n                CASE WHEN sessions.volunteer_joined_at IS NOT NULL\n                    AND sessions.created_at >= :sessionStart!\n                    AND sessions.created_at <= :sessionEnd!\n                    AND TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 3600) >= 1\n                    AND last_message.created_at IS NOT NULL THEN\n                    ROUND(EXTRACT(EPOCH FROM (last_message.created_at - sessions.volunteer_joined_at)) / 60, 2)\n                WHEN sessions.volunteer_joined_at IS NOT NULL\n                    AND sessions.created_at >= :sessionStart!\n                    AND sessions.created_at <= :sessionEnd! THEN\n                    TRUNC(EXTRACT(EPOCH FROM (sessions.ended_at - sessions.volunteer_joined_at)) / 60, 2)\n                ELSE\n                    0\n                END)::int AS range_session_length_mins,\n            count(*)::int AS total_sessions,\n            sum(\n                CASE WHEN sessions.created_at >= :sessionStart!\n                    AND sessions.created_at <= :sessionEnd! THEN\n                    1\n                ELSE\n                    0\n                END)::int AS range_total_sessions,\n            student_id\n        FROM\n            sessions\n    LEFT JOIN (\n        SELECT\n            MAX(created_at) AS created_at,\n            session_id\n        FROM\n            session_messages\n        GROUP BY\n            session_id) AS last_message ON last_message.session_id = sessions.id\n    WHERE\n        sessions.ended_at IS NOT NULL\n    GROUP BY\n        sessions.student_id) AS sessions ON sessions.student_id = student_profiles.user_id\nWHERE\n    users.created_at >= :joinedStart!\n    AND users.created_at <= :joinedEnd!\n    AND ((:highSchoolId)::uuid IS NULL\n        OR student_profiles.school_id = :highSchoolId)\nAND ((:studentPartnerOrg)::text IS NULL\n    OR student_partner_orgs.key = :studentPartnerOrg)\nAND ((:studentPartnerSite)::text IS NULL\n    OR student_partner_org_sites.name = :studentPartnerSite)\nAND ((:sponsorOrg)::text IS NULL\n    OR ((partner_org_sponsor_org.key IS NOT NULL\n            AND partner_org_sponsor_org.key = :sponsorOrg)\n        OR (school_sponsor_org.key IS NOT NULL\n            AND school_sponsor_org.key = :sponsorOrg)))\nORDER BY\n    users.created_at ASC","loc":{"a":15549,"b":20385,"line":539,"col":0}}};

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

const getStudentSignupSourcesIR: any = {"name":"getStudentSignupSources","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    id,\n    name\nFROM\n    signup_sources\nWHERE\n    name <> 'Roster'\nORDER BY\n    RANDOM()","loc":{"a":20426,"b":20521,"line":640,"col":0}}};

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

const deleteSelfFavoritedVolunteersIR: any = {"name":"deleteSelfFavoritedVolunteers","params":[],"usedParamSet":{},"statement":{"body":"DELETE FROM student_favorite_volunteers\nWHERE student_id = volunteer_id","loc":{"a":20568,"b":20638,"line":652,"col":0}}};

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

const adminUpdateStudentSchoolIR: any = {"name":"adminUpdateStudentSchool","params":[{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":20729,"b":20737,"line":660,"col":17}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":20760,"b":20766,"line":662,"col":15}]}}],"usedParamSet":{"schoolId":true,"userId":true},"statement":{"body":"UPDATE\n    student_profiles\nSET\n    school_id = :schoolId!\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":20680,"b":20794,"line":657,"col":0}}};

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

const getActivePartnersForStudentIR: any = {"name":"getActivePartnersForStudent","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21044,"b":21053,"line":676,"col":21}]}}],"usedParamSet":{"studentId":true},"statement":{"body":"SELECT\n    spo.name,\n    spo.id,\n    spo.school_id\nFROM\n    users_student_partner_orgs_instances uspoi\n    JOIN student_partner_orgs spo ON spo.id = uspoi.student_partner_org_id\nWHERE\n    uspoi.user_id = :studentId!\n    AND deactivated_on IS NOT NULL","loc":{"a":20839,"b":21088,"line":668,"col":0}}};

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
  fromDate: string;
  toDate: string;
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

const getStudentsForGradeLevelUpdateIR: any = {"name":"getStudentsForGradeLevelUpdate","params":[{"name":"fromDate","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21452,"b":21460,"line":691,"col":39}]}},{"name":"toDate","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21526,"b":21532,"line":692,"col":38}]}}],"usedParamSet":{"fromDate":true,"toDate":true},"statement":{"body":"SELECT\n    sp.user_id,\n    sp.created_at,\n    gl.name AS grade_level\nFROM\n    student_profiles sp\n    JOIN grade_levels gl ON gl.id = sp.grade_level_id\nWHERE\n    NOT gl.name = ANY ('{\"College\", \"Other\"}')\n    AND sp.created_at < DATE_TRUNC('year', NOW()) + INTERVAL '7 months'\n    AND sp.created_at >= to_timestamp(:fromDate!, 'YYYY-MM-DD HH24:MI:SS')\n    AND sp.created_at < to_timestamp(:toDate!, 'YYYY-MM-DD HH24:MI:SS')\nORDER BY\n    sp.created_at DESC","loc":{"a":21136,"b":21590,"line":681,"col":0}}};

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
 *     AND sp.created_at >= to_timestamp(:fromDate!, 'YYYY-MM-DD HH24:MI:SS')
 *     AND sp.created_at < to_timestamp(:toDate!, 'YYYY-MM-DD HH24:MI:SS')
 * ORDER BY
 *     sp.created_at DESC
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

const updateStudentsGradeLevelIR: any = {"name":"updateStudentsGradeLevel","params":[{"name":"gradeLevel","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21832,"b":21842,"line":709,"col":29}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":21878,"b":21884,"line":711,"col":15}]}}],"usedParamSet":{"gradeLevel":true,"userId":true},"statement":{"body":"UPDATE\n    student_profiles\nSET\n    grade_level_id = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        grade_levels.id\n    FROM\n        grade_levels\n    WHERE\n        grade_levels.name = :gradeLevel!) AS subquery\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":21632,"b":21912,"line":698,"col":0}}};

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


/** 'CountDuplicateStudentVolunteerFavorites' parameters type */
export type ICountDuplicateStudentVolunteerFavoritesParams = void;

/** 'CountDuplicateStudentVolunteerFavorites' return type */
export interface ICountDuplicateStudentVolunteerFavoritesResult {
  duplicates: number | null;
}

/** 'CountDuplicateStudentVolunteerFavorites' query type */
export interface ICountDuplicateStudentVolunteerFavoritesQuery {
  params: ICountDuplicateStudentVolunteerFavoritesParams;
  result: ICountDuplicateStudentVolunteerFavoritesResult;
}

const countDuplicateStudentVolunteerFavoritesIR: any = {"name":"countDuplicateStudentVolunteerFavorites","params":[],"usedParamSet":{},"statement":{"body":"WITH favorites_partition AS (\n    SELECT\n        student_id,\n        volunteer_id,\n        updated_at,\n        created_at,\n        row_number() OVER (PARTITION BY student_id,\n            volunteer_id ORDER BY updated_at DESC) AS rn\n    FROM\n        upchieve.student_favorite_volunteers\n)\nSELECT\n    count(*)::int AS duplicates\nFROM\n    favorites_partition\nWHERE\n    rn <> 1","loc":{"a":21969,"b":22341,"line":717,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH favorites_partition AS (
 *     SELECT
 *         student_id,
 *         volunteer_id,
 *         updated_at,
 *         created_at,
 *         row_number() OVER (PARTITION BY student_id,
 *             volunteer_id ORDER BY updated_at DESC) AS rn
 *     FROM
 *         upchieve.student_favorite_volunteers
 * )
 * SELECT
 *     count(*)::int AS duplicates
 * FROM
 *     favorites_partition
 * WHERE
 *     rn <> 1
 * ```
 */
export const countDuplicateStudentVolunteerFavorites = new PreparedQuery<ICountDuplicateStudentVolunteerFavoritesParams,ICountDuplicateStudentVolunteerFavoritesResult>(countDuplicateStudentVolunteerFavoritesIR);


/** 'DeleteDuplicateStudentVolunteerFavorites' parameters type */
export type IDeleteDuplicateStudentVolunteerFavoritesParams = void;

/** 'DeleteDuplicateStudentVolunteerFavorites' return type */
export interface IDeleteDuplicateStudentVolunteerFavoritesResult {
  deleted: number | null;
}

/** 'DeleteDuplicateStudentVolunteerFavorites' query type */
export interface IDeleteDuplicateStudentVolunteerFavoritesQuery {
  params: IDeleteDuplicateStudentVolunteerFavoritesParams;
  result: IDeleteDuplicateStudentVolunteerFavoritesResult;
}

const deleteDuplicateStudentVolunteerFavoritesIR: any = {"name":"deleteDuplicateStudentVolunteerFavorites","params":[],"usedParamSet":{},"statement":{"body":"WITH favorites_partition AS (\n    SELECT\n        student_id,\n        volunteer_id,\n        updated_at,\n        created_at,\n        row_number() OVER (PARTITION BY student_id,\n            volunteer_id ORDER BY updated_at DESC) AS rn\n    FROM\n        upchieve.student_favorite_volunteers\n),\nduplicate_favorites AS (\n    SELECT\n        student_id,\n        volunteer_id,\n        updated_at,\n        created_at\n    FROM\n        favorites_partition\n    WHERE\n        rn <> 1\n),\ndeleted_rows AS (\n    DELETE FROM upchieve.student_favorite_volunteers\n    WHERE (student_id,\n            volunteer_id,\n            updated_at,\n            created_at) IN (\n            SELECT\n                *\n            FROM\n                duplicate_favorites)\n        RETURNING\n            *\n)\nSELECT\n    COUNT(*)::int AS deleted\nFROM\n    deleted_rows","loc":{"a":22399,"b":23225,"line":737,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH favorites_partition AS (
 *     SELECT
 *         student_id,
 *         volunteer_id,
 *         updated_at,
 *         created_at,
 *         row_number() OVER (PARTITION BY student_id,
 *             volunteer_id ORDER BY updated_at DESC) AS rn
 *     FROM
 *         upchieve.student_favorite_volunteers
 * ),
 * duplicate_favorites AS (
 *     SELECT
 *         student_id,
 *         volunteer_id,
 *         updated_at,
 *         created_at
 *     FROM
 *         favorites_partition
 *     WHERE
 *         rn <> 1
 * ),
 * deleted_rows AS (
 *     DELETE FROM upchieve.student_favorite_volunteers
 *     WHERE (student_id,
 *             volunteer_id,
 *             updated_at,
 *             created_at) IN (
 *             SELECT
 *                 *
 *             FROM
 *                 duplicate_favorites)
 *         RETURNING
 *             *
 * )
 * SELECT
 *     COUNT(*)::int AS deleted
 * FROM
 *     deleted_rows
 * ```
 */
export const deleteDuplicateStudentVolunteerFavorites = new PreparedQuery<IDeleteDuplicateStudentVolunteerFavoritesParams,IDeleteDuplicateStudentVolunteerFavoritesResult>(deleteDuplicateStudentVolunteerFavoritesIR);


/** 'GetStudentProfileByUserId' parameters type */
export interface IGetStudentProfileByUserIdParams {
  userId: string;
}

/** 'GetStudentProfileByUserId' return type */
export interface IGetStudentProfileByUserIdResult {
  createdAt: Date;
  gradeLevel: string;
  updatedAt: Date;
  userId: string;
}

/** 'GetStudentProfileByUserId' query type */
export interface IGetStudentProfileByUserIdQuery {
  params: IGetStudentProfileByUserIdParams;
  result: IGetStudentProfileByUserIdResult;
}

const getStudentProfileByUserIdIR: any = {"name":"getStudentProfileByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":23584,"b":23590,"line":789,"col":32}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    student_profiles.user_id,\n    grade_levels.name AS grade_level,\n    users.created_at,\n    users.updated_at\nFROM\n    student_profiles\n    JOIN users ON student_profiles.user_id = users.id\n    LEFT JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id\nWHERE\n    student_profiles.user_id = :userId!","loc":{"a":23268,"b":23590,"line":779,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     student_profiles.user_id,
 *     grade_levels.name AS grade_level,
 *     users.created_at,
 *     users.updated_at
 * FROM
 *     student_profiles
 *     JOIN users ON student_profiles.user_id = users.id
 *     LEFT JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id
 * WHERE
 *     student_profiles.user_id = :userId!
 * ```
 */
export const getStudentProfileByUserId = new PreparedQuery<IGetStudentProfileByUserIdParams,IGetStudentProfileByUserIdResult>(getStudentProfileByUserIdIR);


