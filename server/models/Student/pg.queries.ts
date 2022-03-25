/** Types generated for queries found in "server/models/Student/student.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetGatesStudentById' parameters type */
export interface IGetGatesStudentByIdParams {
  userId: string;
}

/** 'GetGatesStudentById' return type */
export interface IGetGatesStudentByIdResult {
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

const getGatesStudentByIdIR: any = {"name":"getGatesStudentById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":508,"b":514,"line":13,"col":32}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    student_profiles.user_id AS id,\n    grade_levels.name AS current_grade,\n    student_partner_orgs.name AS student_partner_org,\n    schools.partner AS is_partner_school\nFROM\n    student_profiles\n    JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\n    JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id\n    JOIN schools ON student_profiles.school_id = schools.id\nWHERE\n    student_profiles.user_id = :userId!","loc":{"a":32,"b":514,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     student_profiles.user_id AS id,
 *     grade_levels.name AS current_grade,
 *     student_partner_orgs.name AS student_partner_org,
 *     schools.partner AS is_partner_school
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
}

/** 'GetStudentContactInfoById' query type */
export interface IGetStudentContactInfoByIdQuery {
  params: IGetStudentContactInfoByIdParams;
  result: IGetStudentContactInfoByIdResult;
}

const getStudentContactInfoByIdIR: any = {"name":"getStudentContactInfoById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":709,"b":715,"line":27,"col":14}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    id,\n    first_name,\n    email\nFROM\n    users\nWHERE\n    banned IS FALSE\n    AND deactivated IS FALSE\n    AND test_user IS FALSE\n    AND id = :userId!","loc":{"a":557,"b":715,"line":17,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     first_name,
 *     email
 * FROM
 *     users
 * WHERE
 *     banned IS FALSE
 *     AND deactivated IS FALSE
 *     AND test_user IS FALSE
 *     AND id = :userId!
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

const isTestUserIR: any = {"name":"isTestUser","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":795,"b":801,"line":36,"col":10}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    test_user\nFROM\n    users\nWHERE\n    id = :userId!","loc":{"a":743,"b":801,"line":31,"col":0}}};

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

const getTotalFavoriteVolunteersIR: any = {"name":"getTotalFavoriteVolunteers","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":940,"b":946,"line":45,"col":18}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    COUNT(*)::int AS total\nFROM\n    student_favorite_volunteers\nWHERE\n    student_id = :userId!","loc":{"a":845,"b":946,"line":40,"col":0}}};

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

const isFavoriteVolunteerIR: any = {"name":"isFavoriteVolunteer","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1068,"b":1077,"line":54,"col":18}]}},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1103,"b":1114,"line":55,"col":24}]}}],"usedParamSet":{"studentId":true,"volunteerId":true},"statement":{"body":"SELECT\n    volunteer_id\nFROM\n    student_favorite_volunteers\nWHERE\n    student_id = :studentId!\n    AND volunteer_id = :volunteerId!","loc":{"a":983,"b":1114,"line":49,"col":0}}};

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

const getFavoriteVolunteersIR: any = {"name":"getFavoriteVolunteers","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1770,"b":1776,"line":76,"col":46}]}},{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1843,"b":1848,"line":79,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1865,"b":1871,"line":79,"col":30}]}}],"usedParamSet":{"userId":true,"limit":true,"offset":true},"statement":{"body":"SELECT\n    student_favorite_volunteers.volunteer_id AS volunteer_id,\n    users.first_name AS first_name,\n    COALESCE(sessions.total, 0)::int AS num_sessions\nFROM\n    student_favorite_volunteers\n    LEFT JOIN users ON student_favorite_volunteers.volunteer_id = users.id\n    LEFT JOIN (\n        SELECT\n            count(*) AS total,\n            sessions.volunteer_id\n        FROM\n            sessions\n        GROUP BY\n            sessions.student_id,\n            sessions.volunteer_id) AS sessions ON sessions.volunteer_id = student_favorite_volunteers.volunteer_id\nWHERE\n    student_favorite_volunteers.student_id = :userId!\nORDER BY\n    student_favorite_volunteers.created_at DESC\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":1153,"b":1877,"line":59,"col":0}}};

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

const deleteFavoriteVolunteerIR: any = {"name":"deleteFavoriteVolunteer","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1978,"b":1987,"line":84,"col":20}]}},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2013,"b":2024,"line":85,"col":24}]}}],"usedParamSet":{"studentId":true,"volunteerId":true},"statement":{"body":"DELETE FROM student_favorite_volunteers\nWHERE student_id = :studentId!\n    AND volunteer_id = :volunteerId!\nRETURNING\n    student_id,\n    volunteer_id","loc":{"a":1918,"b":2067,"line":83,"col":0}}};

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

const addFavoriteVolunteerIR: any = {"name":"addFavoriteVolunteer","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2227,"b":2236,"line":94,"col":17},{"a":2532,"b":2541,"line":110,"col":22}]}},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2240,"b":2251,"line":94,"col":30},{"a":2575,"b":2586,"line":111,"col":32}]}}],"usedParamSet":{"studentId":true,"volunteerId":true},"statement":{"body":"WITH ins AS (\nINSERT INTO student_favorite_volunteers (student_id, volunteer_id, created_at, updated_at)\n        VALUES (:studentId!, :volunteerId!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        student_id, volunteer_id)\n    SELECT\n        *\n    FROM\n        ins\n    UNION\n    SELECT\n        student_id,\n        volunteer_id\n    FROM\n        student_favorite_volunteers\n    WHERE\n        student_id = :studentId!\n            AND volunteer_id = :volunteerId!","loc":{"a":2105,"b":2586,"line":92,"col":0}}};

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

const getReportedStudentIR: any = {"name":"getReportedStudent","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3159,"b":3165,"line":133,"col":20}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    users.id AS id,\n    first_name,\n    last_name,\n    email,\n    users.created_at AS created_at,\n    test_user AS is_test_user,\n    banned AS is_banned,\n    deactivated AS is_deactivated,\n    FALSE AS is_volunteer,\n    student_partner_orgs.key AS student_partner_org\nFROM\n    users\n    JOIN student_profiles ON users.id = student_profiles.user_id\n    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\nWHERE\n    deactivated IS FALSE\n    AND test_user IS FALSE\n    AND users.id = :userId!","loc":{"a":2622,"b":3165,"line":115,"col":0}}};

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

const getStudentPartnerInfoByIdIR: any = {"name":"getStudentPartnerInfoById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3509,"b":3515,"line":145,"col":32}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    student_profiles.user_id AS id,\n    student_partner_orgs.key AS student_partner_org,\n    school_id AS approved_highschool\nFROM\n    student_profiles\n    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id\nWHERE\n    student_profiles.user_id = :userId!","loc":{"a":3208,"b":3515,"line":137,"col":0}}};

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

const deleteStudentIR: any = {"name":"deleteStudent","params":[{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3580,"b":3585,"line":152,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3633,"b":3639,"line":155,"col":10}]}}],"usedParamSet":{"email":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    email = :email!,\n    updated_at = NOW()::date\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":3546,"b":3662,"line":149,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     email = :email!,
 *     updated_at = NOW()::date
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

const adminUpdateStudentIR: any = {"name":"adminUpdateStudent","params":[{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3737,"b":3746,"line":164,"col":18}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3766,"b":3774,"line":165,"col":17}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3790,"b":3795,"line":166,"col":13}]}},{"name":"verified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3814,"b":3822,"line":167,"col":16}]}},{"name":"banned","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3839,"b":3845,"line":168,"col":14}]}},{"name":"deactivated","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3867,"b":3878,"line":169,"col":19}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3926,"b":3932,"line":172,"col":10}]}}],"usedParamSet":{"firstName":true,"lastName":true,"email":true,"verified":true,"banned":true,"deactivated":true,"userId":true},"statement":{"body":"UPDATE\n    users\nSET\n    first_name = :firstName!,\n    last_name = :lastName!,\n    email = :email!,\n    verified = :verified!,\n    banned = :banned!,\n    deactivated = :deactivated!,\n    updated_at = NOW()::date\nWHERE\n    id = :userId!\nRETURNING\n    id AS ok","loc":{"a":3698,"b":3955,"line":161,"col":0}}};

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
 *     updated_at = NOW()::date
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

const adminUpdateStudentProfileIR: any = {"name":"adminUpdateStudentProfile","params":[{"name":"partnerOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4060,"b":4072,"line":181,"col":30}]}},{"name":"partnerOrgSiteId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4110,"b":4126,"line":182,"col":35}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4179,"b":4185,"line":185,"col":15}]}}],"usedParamSet":{"partnerOrgId":true,"partnerOrgSiteId":true,"userId":true},"statement":{"body":"UPDATE\n    student_profiles\nSET\n    student_partner_org_id = :partnerOrgId!,\n    student_partner_org_site_id = :partnerOrgSiteId!,\n    updated_at = NOW()::date\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":3998,"b":4213,"line":178,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     student_profiles
 * SET
 *     student_partner_org_id = :partnerOrgId!,
 *     student_partner_org_site_id = :partnerOrgSiteId!,
 *     updated_at = NOW()::date
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

const getPartnerOrgByKeyIR: any = {"name":"getPartnerOrgByKey","params":[{"name":"partnerOrgSiteName","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4725,"b":4742,"line":207,"col":46}]}},{"name":"partnerOrgKey","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4890,"b":4903,"line":209,"col":32}]}}],"usedParamSet":{"partnerOrgSiteName":true,"partnerOrgKey":true},"statement":{"body":"SELECT\n    student_partner_orgs.id AS partner_id,\n    student_partner_orgs.key AS partner_key,\n    student_partner_orgs.name AS partner_name,\n    student_partner_org_sites.id AS site_id,\n    student_partner_org_sites.name AS site_name\nFROM\n    student_partner_orgs\n    LEFT JOIN (\n        SELECT\n            name,\n            id,\n            student_partner_org_id\n        FROM\n            student_partner_org_sites\n        WHERE\n            student_partner_org_sites.name = :partnerOrgSiteName) AS student_partner_org_sites ON student_partner_orgs.id = student_partner_org_sites.student_partner_org_id\nWHERE\n    student_partner_orgs.key = :partnerOrgKey!","loc":{"a":4249,"b":4903,"line":191,"col":0}}};

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

const createStudentUserIR: any = {"name":"createStudentUser","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5076,"b":5082,"line":214,"col":13}]}},{"name":"firstName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5086,"b":5095,"line":214,"col":23}]}},{"name":"lastName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5099,"b":5107,"line":214,"col":36}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5111,"b":5116,"line":214,"col":48}]}},{"name":"password","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5120,"b":5128,"line":214,"col":57}]}},{"name":"referredBy","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5139,"b":5148,"line":214,"col":76}]}},{"name":"referralCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5152,"b":5164,"line":214,"col":89}]}}],"usedParamSet":{"userId":true,"firstName":true,"lastName":true,"email":true,"password":true,"referredBy":true,"referralCode":true},"statement":{"body":"INSERT INTO users (id, first_name, last_name, email, PASSWORD, verified, referred_by, referral_code, created_at, updated_at)\n    VALUES (:userId!, :firstName!, :lastName!, :email!, :password!, FALSE, :referredBy, :referralCode!, NOW(), NOW())\nON CONFLICT (email)\n    DO NOTHING\nRETURNING\n    id, first_name, last_name, email, verified, banned, test_user, deactivated, created_at","loc":{"a":4938,"b":5315,"line":213,"col":0}}};

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
  postalCode: string;
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

const createStudentProfileIR: any = {"name":"createStudentProfile","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5530,"b":5536,"line":224,"col":5}]}},{"name":"postalCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5544,"b":5554,"line":225,"col":5}]}},{"name":"college","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5670,"b":5676,"line":230,"col":5}]}},{"name":"partnerOrg","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5853,"b":5862,"line":240,"col":36},{"a":6125,"b":6134,"line":247,"col":5}]}},{"name":"partnerSite","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5921,"b":5931,"line":241,"col":44},{"a":6165,"b":6175,"line":248,"col":5}]}},{"name":"gradeLevel","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5997,"b":6006,"line":242,"col":31},{"a":6199,"b":6208,"line":249,"col":5}]}},{"name":"highSchool","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6054,"b":6063,"line":243,"col":26}]}}],"usedParamSet":{"userId":true,"postalCode":true,"college":true,"partnerOrg":true,"partnerSite":true,"gradeLevel":true,"highSchool":true},"statement":{"body":"INSERT INTO student_profiles (user_id, postal_code, student_partner_org_id, student_partner_org_site_id, grade_level_id, school_id, college, created_at, updated_at)\nSELECT\n    :userId!,\n    :postalCode!,\n    subquery.student_partner_org_id,\n    student_partner_org_sites.id,\n    grade_levels.id,\n    schools.id,\n    :college,\n    NOW(),\n    NOW()\nFROM (\n    SELECT\n        id AS student_partner_org_id,\n        name\n    FROM\n        student_partner_orgs\n    WHERE\n        student_partner_orgs.key = :partnerOrg) AS subquery\n    LEFT JOIN student_partner_org_sites ON :partnerSite = student_partner_org_sites.name\n    LEFT JOIN grade_levels ON :gradeLevel = grade_levels.name\n    LEFT JOIN schools ON :highSchool = schools.name\nRETURNING\n    user_id,\n    postal_code,\n    :partnerOrg AS student_partner_org,\n    :partnerSite AS partner_site,\n    :gradeLevel AS grade_level,\n    school_id,\n    college,\n    created_at,\n    updated_at","loc":{"a":5353,"b":6283,"line":222,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_profiles (user_id, postal_code, student_partner_org_id, student_partner_org_site_id, grade_level_id, school_id, college, created_at, updated_at)
 * SELECT
 *     :userId!,
 *     :postalCode!,
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


