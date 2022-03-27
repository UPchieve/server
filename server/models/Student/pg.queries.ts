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

const getGatesStudentByIdIR: any = {"name":"getGatesStudentById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":563,"b":569,"line":14,"col":32}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    student_profiles.user_id AS id,\n    grade_levels.name AS current_grade,\n    student_partner_orgs.name AS student_partner_org,\n    schools.partner AS is_partner_school,\n    student_profiles.school_id AS approved_highschool\nFROM\n    student_profiles\n    JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\n    JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id\n    JOIN schools ON student_profiles.school_id = schools.id\nWHERE\n    student_profiles.user_id = :userId!","loc":{"a":32,"b":569,"line":2,"col":0}}};

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
 *     JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id
 *     JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id
 *     JOIN schools ON student_profiles.school_id = schools.id
 * WHERE
 *     student_profiles.user_id = :userId!
 * ```
 */
export const getGatesStudentById = new PreparedQuery<IGetGatesStudentByIdParams,IGetGatesStudentByIdResult>(getGatesStudentByIdIR);


/** 'GetStudentContactInfoById' parameters type */
export interface IGetStudentContactInfoByIdParams {
  userId: string;
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

const getStudentContactInfoByIdIR: any = {"name":"getStudentContactInfoById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1027,"b":1033,"line":32,"col":20}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id,\n    first_name,\n    email,\n    student_partner_orgs.key AS student_partner_org,\n    student_profiles.school_id\nFROM\n    users\nLEFT JOIN student_profiles ON student_profiles.user_id = users.id\nLEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id\nWHERE\n    banned IS FALSE\n    AND deactivated IS FALSE\n    AND test_user IS FALSE\n    AND users.id = :userId!","loc":{"a":612,"b":1033,"line":18,"col":0}}};

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
 * LEFT JOIN student_profiles ON student_profiles.user_id = users.id
 * LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
 * WHERE
 *     banned IS FALSE
 *     AND deactivated IS FALSE
 *     AND test_user IS FALSE
 *     AND users.id = :userId!
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

const isTestUserIR: any = {"name":"isTestUser","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1113,"b":1119,"line":41,"col":10}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    test_user\nFROM\n    users\nWHERE\n    id = :userId!","loc":{"a":1061,"b":1119,"line":36,"col":0}}};

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

const getTotalFavoriteVolunteersIR: any = {"name":"getTotalFavoriteVolunteers","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1258,"b":1264,"line":50,"col":18}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    COUNT(*)::int AS total\nFROM\n    student_favorite_volunteers\nWHERE\n    student_id = :userId!","loc":{"a":1163,"b":1264,"line":45,"col":0}}};

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

const isFavoriteVolunteerIR: any = {"name":"isFavoriteVolunteer","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1386,"b":1395,"line":59,"col":18}]}},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1421,"b":1432,"line":60,"col":24}]}}],"usedParamSet":{"studentId":true,"volunteerId":true},"statement":{"body":"SELECT\n    volunteer_id\nFROM\n    student_favorite_volunteers\nWHERE\n    student_id = :studentId!\n    AND volunteer_id = :volunteerId!","loc":{"a":1301,"b":1432,"line":54,"col":0}}};

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


/** 'GetFavoriteVolunteers' parameters type */
export interface IGetFavoriteVolunteersParams {
  limit: number;
  offset: number;
  userId: string;
}

/** 'GetFavoriteVolunteers' return type */
export interface IGetFavoriteVolunteersResult {
  firstName: string;
  numSessions: number | null;
  volunteerId: string;
}

/** 'GetFavoriteVolunteers' query type */
export interface IGetFavoriteVolunteersQuery {
  params: IGetFavoriteVolunteersParams;
  result: IGetFavoriteVolunteersResult;
}

const getFavoriteVolunteersIR: any = {"name":"getFavoriteVolunteers","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2088,"b":2094,"line":81,"col":46}]}},{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2161,"b":2166,"line":84,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2183,"b":2189,"line":84,"col":30}]}}],"usedParamSet":{"userId":true,"limit":true,"offset":true},"statement":{"body":"SELECT\n    student_favorite_volunteers.volunteer_id AS volunteer_id,\n    users.first_name AS first_name,\n    COALESCE(sessions.total, 0)::int AS num_sessions\nFROM\n    student_favorite_volunteers\n    LEFT JOIN users ON student_favorite_volunteers.volunteer_id = users.id\n    LEFT JOIN (\n        SELECT\n            count(*) AS total,\n            sessions.volunteer_id\n        FROM\n            sessions\n        GROUP BY\n            sessions.student_id,\n            sessions.volunteer_id) AS sessions ON sessions.volunteer_id = student_favorite_volunteers.volunteer_id\nWHERE\n    student_favorite_volunteers.student_id = :userId!\nORDER BY\n    student_favorite_volunteers.created_at DESC\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":1471,"b":2195,"line":64,"col":0}}};

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
 *         GROUP BY
 *             sessions.student_id,
 *             sessions.volunteer_id) AS sessions ON sessions.volunteer_id = student_favorite_volunteers.volunteer_id
 * WHERE
 *     student_favorite_volunteers.student_id = :userId!
 * ORDER BY
 *     student_favorite_volunteers.created_at DESC
 * LIMIT (:limit!)::int OFFSET (:offset!)::int
 * ```
 */
export const getFavoriteVolunteers = new PreparedQuery<IGetFavoriteVolunteersParams,IGetFavoriteVolunteersResult>(getFavoriteVolunteersIR);


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

const deleteFavoriteVolunteerIR: any = {"name":"deleteFavoriteVolunteer","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2296,"b":2305,"line":89,"col":20}]}},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2331,"b":2342,"line":90,"col":24}]}}],"usedParamSet":{"studentId":true,"volunteerId":true},"statement":{"body":"DELETE FROM student_favorite_volunteers\nWHERE student_id = :studentId!\n    AND volunteer_id = :volunteerId!\nRETURNING\n    student_id,\n    volunteer_id","loc":{"a":2236,"b":2385,"line":88,"col":0}}};

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

const addFavoriteVolunteerIR: any = {"name":"addFavoriteVolunteer","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2545,"b":2554,"line":99,"col":17},{"a":2850,"b":2859,"line":115,"col":22}]}},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2558,"b":2569,"line":99,"col":30},{"a":2893,"b":2904,"line":116,"col":32}]}}],"usedParamSet":{"studentId":true,"volunteerId":true},"statement":{"body":"WITH ins AS (\nINSERT INTO student_favorite_volunteers (student_id, volunteer_id, created_at, updated_at)\n        VALUES (:studentId!, :volunteerId!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        student_id, volunteer_id)\n    SELECT\n        *\n    FROM\n        ins\n    UNION\n    SELECT\n        student_id,\n        volunteer_id\n    FROM\n        student_favorite_volunteers\n    WHERE\n        student_id = :studentId!\n            AND volunteer_id = :volunteerId!","loc":{"a":2423,"b":2904,"line":97,"col":0}}};

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

const getReportedStudentIR: any = {"name":"getReportedStudent","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3476,"b":3482,"line":137,"col":20}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id AS id,\n    first_name,\n    last_name,\n    email,\n    users.created_at AS created_at,\n    test_user AS is_test_user,\n    banned AS is_banned,\n    deactivated AS is_deactivated,\n    FALSE AS is_volunteer,\n    student_partner_orgs.key AS student_partner_org\nFROM\n    users\n    JOIN student_profiles ON users.id = student_profiles.user_id\n    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\nWHERE\n    deactivated IS FALSE\n    AND test_user IS FALSE\n    AND users.id = :userId!","loc":{"a":2939,"b":3482,"line":119,"col":0}}};

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

const getStudentPartnerInfoByIdIR: any = {"name":"getStudentPartnerInfoById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3826,"b":3832,"line":149,"col":32}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    student_profiles.user_id AS id,\n    student_partner_orgs.key AS student_partner_org,\n    school_id AS approved_highschool\nFROM\n    student_profiles\n    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\nWHERE\n    student_profiles.user_id = :userId!","loc":{"a":3525,"b":3832,"line":141,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     student_profiles.user_id AS id,
 *     student_partner_orgs.key AS student_partner_org,
 *     school_id AS approved_highschool
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

const deleteStudentIR: any = {"name":"deleteStudent","params":[{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3897,"b":3902,"line":156,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3944,"b":3950,"line":159,"col":10}]}}],"usedParamSet":{"email":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    email = :email!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":3863,"b":3973,"line":153,"col":0}}};

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

const adminUpdateStudentIR: any = {"name":"adminUpdateStudent","params":[{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4048,"b":4057,"line":168,"col":18}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4077,"b":4085,"line":169,"col":17}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4101,"b":4106,"line":170,"col":13}]}},{"name":"verified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4125,"b":4133,"line":171,"col":16}]}},{"name":"banned","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4150,"b":4156,"line":172,"col":14}]}},{"name":"deactivated","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4178,"b":4189,"line":173,"col":19}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4231,"b":4237,"line":176,"col":10}]}}],"usedParamSet":{"firstName":true,"lastName":true,"email":true,"verified":true,"banned":true,"deactivated":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    first_name = :firstName!,\n    last_name = :lastName!,\n    email = :email!,\n    verified = :verified!,\n    banned = :banned!,\n    deactivated = :deactivated!,\n    updated_at = NOW()\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":4009,"b":4260,"line":165,"col":0}}};

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
  partnerOrgId: string;
  partnerOrgSiteId: string;
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

const adminUpdateStudentProfileIR: any = {"name":"adminUpdateStudentProfile","params":[{"name":"partnerOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4365,"b":4377,"line":185,"col":30}]}},{"name":"partnerOrgSiteId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4415,"b":4431,"line":186,"col":35}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4478,"b":4484,"line":189,"col":15}]}}],"usedParamSet":{"partnerOrgId":true,"partnerOrgSiteId":true,"userId":true},"statement":{"body":"UPDATE\n    student_profiles\nSET\n    student_partner_org_id = :partnerOrgId!,\n    student_partner_org_site_id = :partnerOrgSiteId!,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":4303,"b":4512,"line":182,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     student_profiles
 * SET
 *     student_partner_org_id = :partnerOrgId!,
 *     student_partner_org_site_id = :partnerOrgSiteId!,
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const adminUpdateStudentProfile = new PreparedQuery<IAdminUpdateStudentProfileParams,IAdminUpdateStudentProfileResult>(adminUpdateStudentProfileIR);


/** 'GetPartnerOrgByKey' parameters type */
export interface IGetPartnerOrgByKeyParams {
  partnerOrgKey: string;
  partnerOrgSiteName: string | null | void;
}

/** 'GetPartnerOrgByKey' return type */
export interface IGetPartnerOrgByKeyResult {
  partnerId: string;
  partnerKey: string;
  partnerName: string;
  siteId: string;
  siteName: string;
}

/** 'GetPartnerOrgByKey' query type */
export interface IGetPartnerOrgByKeyQuery {
  params: IGetPartnerOrgByKeyParams;
  result: IGetPartnerOrgByKeyResult;
}

const getPartnerOrgByKeyIR: any = {"name":"getPartnerOrgByKey","params":[{"name":"partnerOrgSiteName","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5024,"b":5041,"line":211,"col":46}]}},{"name":"partnerOrgKey","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5189,"b":5202,"line":213,"col":32}]}}],"usedParamSet":{"partnerOrgSiteName":true,"partnerOrgKey":true},"statement":{"body":"SELECT\n    student_partner_orgs.id AS partner_id,\n    student_partner_orgs.key AS partner_key,\n    student_partner_orgs.name AS partner_name,\n    student_partner_org_sites.id AS site_id,\n    student_partner_org_sites.name AS site_name\nFROM\n    student_partner_orgs\n    LEFT JOIN (\n        SELECT\n            name,\n            id,\n            student_partner_org_id\n        FROM\n            student_partner_org_sites\n        WHERE\n            student_partner_org_sites.name = :partnerOrgSiteName) AS student_partner_org_sites ON student_partner_orgs.id = student_partner_org_sites.student_partner_org_id\nWHERE\n    student_partner_orgs.key = :partnerOrgKey!","loc":{"a":4548,"b":5202,"line":195,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     student_partner_orgs.id AS partner_id,
 *     student_partner_orgs.key AS partner_key,
 *     student_partner_orgs.name AS partner_name,
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
 *     student_partner_orgs.key = :partnerOrgKey!
 * ```
 */
export const getPartnerOrgByKey = new PreparedQuery<IGetPartnerOrgByKeyParams,IGetPartnerOrgByKeyResult>(getPartnerOrgByKeyIR);


/** 'CreateStudentUser' parameters type */
export interface ICreateStudentUserParams {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  referralCode: string;
  referredBy: string | null | void;
  userId: string;
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

const createStudentUserIR: any = {"name":"createStudentUser","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5375,"b":5381,"line":218,"col":13}]}},{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5385,"b":5394,"line":218,"col":23}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5398,"b":5406,"line":218,"col":36}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5410,"b":5415,"line":218,"col":48}]}},{"name":"password","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5419,"b":5427,"line":218,"col":57}]}},{"name":"referredBy","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5438,"b":5447,"line":218,"col":76}]}},{"name":"referralCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5451,"b":5463,"line":218,"col":89}]}}],"usedParamSet":{"userId":true,"firstName":true,"lastName":true,"email":true,"password":true,"referredBy":true,"referralCode":true},"statement":{"body":"INSERT INTO users (id, first_name, last_name, email, PASSWORD, verified, referred_by, referral_code, created_at, updated_at)\n    VALUES (:userId!, :firstName!, :lastName!, :email!, :password!, FALSE, :referredBy, :referralCode!, NOW(), NOW())\nON CONFLICT (email)\n    DO NOTHING\nRETURNING\n    id, first_name, last_name, email, verified, banned, test_user, deactivated, created_at","loc":{"a":5237,"b":5614,"line":217,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users (id, first_name, last_name, email, PASSWORD, verified, referred_by, referral_code, created_at, updated_at)
 *     VALUES (:userId!, :firstName!, :lastName!, :email!, :password!, FALSE, :referredBy, :referralCode!, NOW(), NOW())
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
  highSchool: string | null | void;
  partnerOrg: string | null | void;
  partnerSite: string | null | void;
  postalCode: string | null | void;
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

const createStudentProfileIR: any = {"name":"createStudentProfile","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5829,"b":5835,"line":228,"col":5}]}},{"name":"postalCode","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5843,"b":5852,"line":229,"col":5}]}},{"name":"college","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5968,"b":5974,"line":234,"col":5}]}},{"name":"partnerOrg","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6151,"b":6160,"line":244,"col":36},{"a":6423,"b":6432,"line":251,"col":5}]}},{"name":"partnerSite","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6219,"b":6229,"line":245,"col":44},{"a":6463,"b":6473,"line":252,"col":5}]}},{"name":"gradeLevel","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6295,"b":6304,"line":246,"col":31},{"a":6497,"b":6506,"line":253,"col":5}]}},{"name":"highSchool","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6352,"b":6361,"line":247,"col":26}]}}],"usedParamSet":{"userId":true,"postalCode":true,"college":true,"partnerOrg":true,"partnerSite":true,"gradeLevel":true,"highSchool":true},"statement":{"body":"INSERT INTO student_profiles (user_id, postal_code, student_partner_org_id, student_partner_org_site_id, grade_level_id, school_id, college, created_at, updated_at)\nSELECT\n    :userId!,\n    :postalCode,\n    subquery.student_partner_org_id,\n    student_partner_org_sites.id,\n    grade_levels.id,\n    schools.id,\n    :college,\n    NOW(),\n    NOW()\nFROM (\n    SELECT\n        id AS student_partner_org_id,\n        name\n    FROM\n        student_partner_orgs\n    WHERE\n        student_partner_orgs.key = :partnerOrg) AS subquery\n    LEFT JOIN student_partner_org_sites ON :partnerSite = student_partner_org_sites.name\n    LEFT JOIN grade_levels ON :gradeLevel = grade_levels.name\n    LEFT JOIN schools ON :highSchool = schools.name\nRETURNING\n    user_id,\n    postal_code,\n    :partnerOrg AS student_partner_org,\n    :partnerSite AS partner_site,\n    :gradeLevel AS grade_level,\n    school_id,\n    college,\n    created_at,\n    updated_at","loc":{"a":5652,"b":6581,"line":226,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_profiles (user_id, postal_code, student_partner_org_id, student_partner_org_site_id, grade_level_id, school_id, college, created_at, updated_at)
 * SELECT
 *     :userId!,
 *     :postalCode,
 *     subquery.student_partner_org_id,
 *     student_partner_org_sites.id,
 *     grade_levels.id,
 *     schools.id,
 *     :college,
 *     NOW(),
 *     NOW()
 * FROM (
 *     SELECT
 *         id AS student_partner_org_id,
 *         name
 *     FROM
 *         student_partner_orgs
 *     WHERE
 *         student_partner_orgs.key = :partnerOrg) AS subquery
 *     LEFT JOIN student_partner_org_sites ON :partnerSite = student_partner_org_sites.name
 *     LEFT JOIN grade_levels ON :gradeLevel = grade_levels.name
 *     LEFT JOIN schools ON :highSchool = schools.name
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


