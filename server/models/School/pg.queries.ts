/** Types generated for queries found in "server/models/School/school.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type NumberOrString = number | string;

export type stringArray = (string)[];

/** 'GetSchoolById' parameters type */
export interface IGetSchoolByIdParams {
  schoolId: string;
}

/** 'GetSchoolById' return type */
export interface IGetSchoolByIdResult {
  city: string | null;
  district: string | null;
  frlEligible: number | null;
  id: string;
  isAdminApproved: boolean;
  isPartner: boolean | null;
  isSchoolWideTitle1: boolean;
  name: string | null;
  nationalSchoolLunchProgram: string | null;
  ncesId: string | null;
  nslpDirectCertification: number | null;
  schoolYear: string | null;
  state: string | null;
  title1SchoolStatus: string | null;
  totalStudents: number | null;
  zip: string | null;
}

/** 'GetSchoolById' query type */
export interface IGetSchoolByIdQuery {
  params: IGetSchoolByIdParams;
  result: IGetSchoolByIdResult;
}

const getSchoolByIdIR: any = {"usedParamSet":{"schoolId":true},"params":[{"name":"schoolId","required":true,"transform":{"type":"scalar"},"locs":[{"a":1102,"b":1111}]}],"statement":"SELECT\n    schools.id,\n    meta.ncessch AS nces_id,\n    COALESCE(schools.name, meta.sch_name) AS name,\n    COALESCE(cities.name, meta.lcity) AS city,\n    COALESCE(cities.us_state_code, meta.st) AS state,\n    meta.lzip AS zip,\n    meta.lea_name AS district,\n    meta.school_year,\n    approved AS is_admin_approved,\n    (spo.id IS NOT NULL\n        AND spoui.deactivated_on IS NULL) AS is_partner,\n    meta.is_school_wide_title1,\n    meta.title1_school_status,\n    meta.national_school_lunch_program,\n    meta.total_students,\n    meta.nslp_direct_certification,\n    meta.frl_eligible\nFROM\n    schools\n    LEFT JOIN cities ON schools.city_id = cities.id\n    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id\n    LEFT JOIN student_partner_orgs spo ON schools.id = spo.school_id\n    LEFT JOIN LATERAL (\n        SELECT\n            spoui.deactivated_on\n        FROM\n            student_partner_orgs_upchieve_instances spoui\n        WHERE\n            spoui.student_partner_org_id = spo.id\n        ORDER BY\n            spoui.updated_at DESC\n        LIMIT 1) spoui ON TRUE\nWHERE\n    schools.id = :schoolId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     schools.id,
 *     meta.ncessch AS nces_id,
 *     COALESCE(schools.name, meta.sch_name) AS name,
 *     COALESCE(cities.name, meta.lcity) AS city,
 *     COALESCE(cities.us_state_code, meta.st) AS state,
 *     meta.lzip AS zip,
 *     meta.lea_name AS district,
 *     meta.school_year,
 *     approved AS is_admin_approved,
 *     (spo.id IS NOT NULL
 *         AND spoui.deactivated_on IS NULL) AS is_partner,
 *     meta.is_school_wide_title1,
 *     meta.title1_school_status,
 *     meta.national_school_lunch_program,
 *     meta.total_students,
 *     meta.nslp_direct_certification,
 *     meta.frl_eligible
 * FROM
 *     schools
 *     LEFT JOIN cities ON schools.city_id = cities.id
 *     LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id
 *     LEFT JOIN student_partner_orgs spo ON schools.id = spo.school_id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             spoui.deactivated_on
 *         FROM
 *             student_partner_orgs_upchieve_instances spoui
 *         WHERE
 *             spoui.student_partner_org_id = spo.id
 *         ORDER BY
 *             spoui.updated_at DESC
 *         LIMIT 1) spoui ON TRUE
 * WHERE
 *     schools.id = :schoolId!
 * ```
 */
export const getSchoolById = new PreparedQuery<IGetSchoolByIdParams,IGetSchoolByIdResult>(getSchoolByIdIR);


/** 'GetSchoolByNcesId' parameters type */
export interface IGetSchoolByNcesIdParams {
  ncessch: string;
}

/** 'GetSchoolByNcesId' return type */
export interface IGetSchoolByNcesIdResult {
  id: string;
}

/** 'GetSchoolByNcesId' query type */
export interface IGetSchoolByNcesIdQuery {
  params: IGetSchoolByNcesIdParams;
  result: IGetSchoolByNcesIdResult;
}

const getSchoolByNcesIdIR: any = {"usedParamSet":{"ncessch":true},"params":[{"name":"ncessch","required":true,"transform":{"type":"scalar"},"locs":[{"a":98,"b":106}]}],"statement":"SELECT\n    school_id AS id\nFROM\n    school_nces_metadata\nWHERE\n    school_nces_metadata.ncessch = :ncessch!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     school_id AS id
 * FROM
 *     school_nces_metadata
 * WHERE
 *     school_nces_metadata.ncessch = :ncessch!
 * ```
 */
export const getSchoolByNcesId = new PreparedQuery<IGetSchoolByNcesIdParams,IGetSchoolByNcesIdResult>(getSchoolByNcesIdIR);


/** 'GetFilteredSchools' parameters type */
export interface IGetFilteredSchoolsParams {
  city?: string | null | void;
  isPartner?: boolean | null | void;
  limit: NumberOrString;
  name?: string | null | void;
  ncesId?: string | null | void;
  offset: NumberOrString;
  state?: string | null | void;
}

/** 'GetFilteredSchools' return type */
export interface IGetFilteredSchoolsResult {
  city: string | null;
  district: string | null;
  frlEligible: number | null;
  id: string;
  isAdminApproved: boolean;
  isPartner: boolean | null;
  isSchoolWideTitle1: boolean;
  name: string | null;
  nationalSchoolLunchProgram: string | null;
  ncesId: string | null;
  nslpDirectCertification: number | null;
  state: string | null;
  title1SchoolStatus: string | null;
  totalStudents: number | null;
  zip: string | null;
}

/** 'GetFilteredSchools' query type */
export interface IGetFilteredSchoolsQuery {
  params: IGetFilteredSchoolsParams;
  result: IGetFilteredSchoolsResult;
}

const getFilteredSchoolsIR: any = {"usedParamSet":{"name":true,"state":true,"city":true,"ncesId":true,"isPartner":true,"limit":true,"offset":true},"params":[{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":1064,"b":1068},{"a":1117,"b":1121},{"a":1164,"b":1168}]},{"name":"state","required":false,"transform":{"type":"scalar"},"locs":[{"a":1183,"b":1188},{"a":1225,"b":1230},{"a":1266,"b":1271}]},{"name":"city","required":false,"transform":{"type":"scalar"},"locs":[{"a":1279,"b":1283},{"a":1330,"b":1334},{"a":1374,"b":1378},{"a":1419,"b":1423}]},{"name":"ncesId","required":false,"transform":{"type":"scalar"},"locs":[{"a":1438,"b":1444},{"a":1482,"b":1488}]},{"name":"isPartner","required":false,"transform":{"type":"scalar"},"locs":[{"a":1496,"b":1505},{"a":1531,"b":1540}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":1622,"b":1628}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":1637,"b":1644}]}],"statement":"SELECT\n    schools.id,\n    meta.ncessch AS nces_id,\n    COALESCE(schools.name, meta.sch_name) AS name,\n    COALESCE(cities.name, meta.lcity) AS city,\n    COALESCE(cities.us_state_code, meta.st) AS state,\n    meta.lzip AS zip,\n    meta.lea_name AS district,\n    approved AS is_admin_approved,\n    (spo.id IS NOT NULL\n        AND spoui.deactivated_on IS NULL) AS is_partner,\n    meta.is_school_wide_title1,\n    meta.title1_school_status,\n    meta.national_school_lunch_program,\n    meta.total_students,\n    meta.nslp_direct_certification,\n    meta.frl_eligible\nFROM\n    schools\n    LEFT JOIN cities ON schools.city_id = cities.id\n    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id\n    LEFT JOIN student_partner_orgs spo ON schools.id = spo.school_id\n    LEFT JOIN LATERAL (\n        SELECT\n            spoui.deactivated_on\n        FROM\n            student_partner_orgs_upchieve_instances spoui\n        WHERE\n            spoui.student_partner_org_id = spo.id\n        ORDER BY\n            spoui.updated_at DESC\n        LIMIT 1) spoui ON TRUE\nWHERE (:name::text IS NULL\n    OR schools.name ILIKE '%' || :name || '%'\n    OR meta.sch_name ILIKE '%' || :name || '%')\nAND (:state::text IS NULL\n    OR meta.st ILIKE :state\n    OR cities.us_state_code ILIKE :state)\nAND (:city::text IS NULL\n    OR meta.mcity ILIKE '%' || :city || '%'\n    OR meta.lcity ILIKE '%' || :city || '%'\n    OR cities.name ILIKE '%' || :city || '%')\nAND (:ncesId::text IS NULL\n    OR meta.ncessch = :ncesId)\nAND (:isPartner::boolean IS NULL\n    OR :isPartner::boolean = (spo.id IS NOT NULL\n        AND spoui.deactivated_on IS NULL))\nLIMIT :limit! OFFSET :offset!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     schools.id,
 *     meta.ncessch AS nces_id,
 *     COALESCE(schools.name, meta.sch_name) AS name,
 *     COALESCE(cities.name, meta.lcity) AS city,
 *     COALESCE(cities.us_state_code, meta.st) AS state,
 *     meta.lzip AS zip,
 *     meta.lea_name AS district,
 *     approved AS is_admin_approved,
 *     (spo.id IS NOT NULL
 *         AND spoui.deactivated_on IS NULL) AS is_partner,
 *     meta.is_school_wide_title1,
 *     meta.title1_school_status,
 *     meta.national_school_lunch_program,
 *     meta.total_students,
 *     meta.nslp_direct_certification,
 *     meta.frl_eligible
 * FROM
 *     schools
 *     LEFT JOIN cities ON schools.city_id = cities.id
 *     LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id
 *     LEFT JOIN student_partner_orgs spo ON schools.id = spo.school_id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             spoui.deactivated_on
 *         FROM
 *             student_partner_orgs_upchieve_instances spoui
 *         WHERE
 *             spoui.student_partner_org_id = spo.id
 *         ORDER BY
 *             spoui.updated_at DESC
 *         LIMIT 1) spoui ON TRUE
 * WHERE (:name::text IS NULL
 *     OR schools.name ILIKE '%' || :name || '%'
 *     OR meta.sch_name ILIKE '%' || :name || '%')
 * AND (:state::text IS NULL
 *     OR meta.st ILIKE :state
 *     OR cities.us_state_code ILIKE :state)
 * AND (:city::text IS NULL
 *     OR meta.mcity ILIKE '%' || :city || '%'
 *     OR meta.lcity ILIKE '%' || :city || '%'
 *     OR cities.name ILIKE '%' || :city || '%')
 * AND (:ncesId::text IS NULL
 *     OR meta.ncessch = :ncesId)
 * AND (:isPartner::boolean IS NULL
 *     OR :isPartner::boolean = (spo.id IS NOT NULL
 *         AND spoui.deactivated_on IS NULL))
 * LIMIT :limit! OFFSET :offset!
 * ```
 */
export const getFilteredSchools = new PreparedQuery<IGetFilteredSchoolsParams,IGetFilteredSchoolsResult>(getFilteredSchoolsIR);


/** 'GetFilteredSchoolsTotalCount' parameters type */
export interface IGetFilteredSchoolsTotalCountParams {
  city?: string | null | void;
  isPartner?: boolean | null | void;
  name?: string | null | void;
  ncesId?: string | null | void;
  state?: string | null | void;
}

/** 'GetFilteredSchoolsTotalCount' return type */
export interface IGetFilteredSchoolsTotalCountResult {
  count: string | null;
}

/** 'GetFilteredSchoolsTotalCount' query type */
export interface IGetFilteredSchoolsTotalCountQuery {
  params: IGetFilteredSchoolsTotalCountParams;
  result: IGetFilteredSchoolsTotalCountResult;
}

const getFilteredSchoolsTotalCountIR: any = {"usedParamSet":{"name":true,"state":true,"city":true,"ncesId":true,"isPartner":true},"params":[{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":525,"b":529},{"a":578,"b":582},{"a":625,"b":629}]},{"name":"state","required":false,"transform":{"type":"scalar"},"locs":[{"a":644,"b":649},{"a":686,"b":691},{"a":727,"b":732}]},{"name":"city","required":false,"transform":{"type":"scalar"},"locs":[{"a":740,"b":744},{"a":791,"b":795},{"a":835,"b":839},{"a":880,"b":884}]},{"name":"ncesId","required":false,"transform":{"type":"scalar"},"locs":[{"a":899,"b":905},{"a":943,"b":949}]},{"name":"isPartner","required":false,"transform":{"type":"scalar"},"locs":[{"a":957,"b":966},{"a":992,"b":1001}]}],"statement":"SELECT\n    COUNT(*)\nFROM\n    schools\n    LEFT JOIN cities ON schools.city_id = cities.id\n    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id\n    LEFT JOIN student_partner_orgs spo ON schools.id = spo.school_id\n    LEFT JOIN LATERAL (\n        SELECT\n            spoui.deactivated_on\n        FROM\n            student_partner_orgs_upchieve_instances spoui\n        WHERE\n            spoui.student_partner_org_id = spo.id\n        ORDER BY\n            spoui.updated_at DESC\n        LIMIT 1) spoui ON TRUE\nWHERE (:name::text IS NULL\n    OR schools.name ILIKE '%' || :name || '%'\n    OR meta.sch_name ILIKE '%' || :name || '%')\nAND (:state::text IS NULL\n    OR meta.st ILIKE :state\n    OR cities.us_state_code ILIKE :state)\nAND (:city::text IS NULL\n    OR meta.mcity ILIKE '%' || :city || '%'\n    OR meta.lcity ILIKE '%' || :city || '%'\n    OR cities.name ILIKE '%' || :city || '%')\nAND (:ncesId::text IS NULL\n    OR meta.ncessch = :ncesId)\nAND (:isPartner::boolean IS NULL\n    OR :isPartner::boolean = (spo.id IS NOT NULL\n        AND spoui.deactivated_on IS NULL))"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     COUNT(*)
 * FROM
 *     schools
 *     LEFT JOIN cities ON schools.city_id = cities.id
 *     LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id
 *     LEFT JOIN student_partner_orgs spo ON schools.id = spo.school_id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             spoui.deactivated_on
 *         FROM
 *             student_partner_orgs_upchieve_instances spoui
 *         WHERE
 *             spoui.student_partner_org_id = spo.id
 *         ORDER BY
 *             spoui.updated_at DESC
 *         LIMIT 1) spoui ON TRUE
 * WHERE (:name::text IS NULL
 *     OR schools.name ILIKE '%' || :name || '%'
 *     OR meta.sch_name ILIKE '%' || :name || '%')
 * AND (:state::text IS NULL
 *     OR meta.st ILIKE :state
 *     OR cities.us_state_code ILIKE :state)
 * AND (:city::text IS NULL
 *     OR meta.mcity ILIKE '%' || :city || '%'
 *     OR meta.lcity ILIKE '%' || :city || '%'
 *     OR cities.name ILIKE '%' || :city || '%')
 * AND (:ncesId::text IS NULL
 *     OR meta.ncessch = :ncesId)
 * AND (:isPartner::boolean IS NULL
 *     OR :isPartner::boolean = (spo.id IS NOT NULL
 *         AND spoui.deactivated_on IS NULL))
 * ```
 */
export const getFilteredSchoolsTotalCount = new PreparedQuery<IGetFilteredSchoolsTotalCountParams,IGetFilteredSchoolsTotalCountResult>(getFilteredSchoolsTotalCountIR);


/** 'SchoolSearch' parameters type */
export interface ISchoolSearchParams {
  query: string;
}

/** 'SchoolSearch' return type */
export interface ISchoolSearchResult {
  city: string | null;
  district: string | null;
  id: string;
  name: string | null;
  similarityScore: number | null;
  state: string | null;
}

/** 'SchoolSearch' query type */
export interface ISchoolSearchQuery {
  params: ISchoolSearchParams;
  result: ISchoolSearchResult;
}

const schoolSearchIR: any = {"usedParamSet":{"query":true},"params":[{"name":"query","required":true,"transform":{"type":"scalar"},"locs":[{"a":243,"b":249},{"a":466,"b":472}]}],"statement":"SELECT\n    schools.id,\n    COALESCE(schools.name, meta.sch_name) AS name,\n    COALESCE(cities.us_state_code, meta.st) AS state,\n    COALESCE(cities.name, meta.lcity) AS city,\n    meta.lea_name AS district,\n    public.similarity (schools.name, :query!::text) AS similarity_score\nFROM\n    schools\n    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id\n    LEFT JOIN cities ON schools.city_id = cities.id\nWHERE\n    schools.name OPERATOR (public. %)\n    :query!::text\nORDER BY\n    similarity_score DESC\nLIMIT 100"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     schools.id,
 *     COALESCE(schools.name, meta.sch_name) AS name,
 *     COALESCE(cities.us_state_code, meta.st) AS state,
 *     COALESCE(cities.name, meta.lcity) AS city,
 *     meta.lea_name AS district,
 *     public.similarity (schools.name, :query!::text) AS similarity_score
 * FROM
 *     schools
 *     LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id
 *     LEFT JOIN cities ON schools.city_id = cities.id
 * WHERE
 *     schools.name OPERATOR (public. %)
 *     :query!::text
 * ORDER BY
 *     similarity_score DESC
 * LIMIT 100
 * ```
 */
export const schoolSearch = new PreparedQuery<ISchoolSearchParams,ISchoolSearchResult>(schoolSearchIR);


/** 'UpdateApproval' parameters type */
export interface IUpdateApprovalParams {
  isApproved: boolean;
  schoolId: string;
}

/** 'UpdateApproval' return type */
export type IUpdateApprovalResult = void;

/** 'UpdateApproval' query type */
export interface IUpdateApprovalQuery {
  params: IUpdateApprovalParams;
  result: IUpdateApprovalResult;
}

const updateApprovalIR: any = {"usedParamSet":{"isApproved":true,"schoolId":true},"params":[{"name":"isApproved","required":true,"transform":{"type":"scalar"},"locs":[{"a":38,"b":49}]},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"locs":[{"a":90,"b":99}]}],"statement":"UPDATE\n    schools\nSET\n    approved = :isApproved!,\n    updated_at = NOW()\nWHERE\n    id = :schoolId!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     schools
 * SET
 *     approved = :isApproved!,
 *     updated_at = NOW()
 * WHERE
 *     id = :schoolId!
 * ```
 */
export const updateApproval = new PreparedQuery<IUpdateApprovalParams,IUpdateApprovalResult>(updateApprovalIR);


/** 'UpdateIsPartner' parameters type */
export interface IUpdateIsPartnerParams {
  isPartner: boolean;
  schoolId: string;
}

/** 'UpdateIsPartner' return type */
export type IUpdateIsPartnerResult = void;

/** 'UpdateIsPartner' query type */
export interface IUpdateIsPartnerQuery {
  params: IUpdateIsPartnerParams;
  result: IUpdateIsPartnerResult;
}

const updateIsPartnerIR: any = {"usedParamSet":{"isPartner":true,"schoolId":true},"params":[{"name":"isPartner","required":true,"transform":{"type":"scalar"},"locs":[{"a":37,"b":47}]},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"locs":[{"a":88,"b":97}]}],"statement":"UPDATE\n    schools\nSET\n    partner = :isPartner!,\n    updated_at = NOW()\nWHERE\n    id = :schoolId!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     schools
 * SET
 *     partner = :isPartner!,
 *     updated_at = NOW()
 * WHERE
 *     id = :schoolId!
 * ```
 */
export const updateIsPartner = new PreparedQuery<IUpdateIsPartnerParams,IUpdateIsPartnerResult>(updateIsPartnerIR);


/** 'AdminUpdateSchool' parameters type */
export interface IAdminUpdateSchoolParams {
  cityId?: number | null | void;
  isApproved?: boolean | null | void;
  name?: string | null | void;
  schoolId: string;
}

/** 'AdminUpdateSchool' return type */
export type IAdminUpdateSchoolResult = void;

/** 'AdminUpdateSchool' query type */
export interface IAdminUpdateSchoolQuery {
  params: IAdminUpdateSchoolParams;
  result: IAdminUpdateSchoolResult;
}

const adminUpdateSchoolIR: any = {"usedParamSet":{"name":true,"isApproved":true,"cityId":true,"schoolId":true},"params":[{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":43,"b":47}]},{"name":"isApproved","required":false,"transform":{"type":"scalar"},"locs":[{"a":89,"b":99}]},{"name":"cityId","required":false,"transform":{"type":"scalar"},"locs":[{"a":168,"b":174}]},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"locs":[{"a":217,"b":226}]}],"statement":"UPDATE\n    schools\nSET\n    name = COALESCE(:name, schools.name),\n    approved = COALESCE(:isApproved, schools.approved),\n    updated_at = NOW(),\n    city_id = COALESCE(:cityId, schools.city_id)\nWHERE\n    schools.id = :schoolId!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     schools
 * SET
 *     name = COALESCE(:name, schools.name),
 *     approved = COALESCE(:isApproved, schools.approved),
 *     updated_at = NOW(),
 *     city_id = COALESCE(:cityId, schools.city_id)
 * WHERE
 *     schools.id = :schoolId!
 * ```
 */
export const adminUpdateSchool = new PreparedQuery<IAdminUpdateSchoolParams,IAdminUpdateSchoolResult>(adminUpdateSchoolIR);


/** 'AdminUpdateSchoolMetaData' parameters type */
export interface IAdminUpdateSchoolMetaDataParams {
  schoolId: string;
  zip?: string | null | void;
}

/** 'AdminUpdateSchoolMetaData' return type */
export type IAdminUpdateSchoolMetaDataResult = void;

/** 'AdminUpdateSchoolMetaData' query type */
export interface IAdminUpdateSchoolMetaDataQuery {
  params: IAdminUpdateSchoolMetaDataParams;
  result: IAdminUpdateSchoolMetaDataResult;
}

const adminUpdateSchoolMetaDataIR: any = {"usedParamSet":{"zip":true,"schoolId":true},"params":[{"name":"zip","required":false,"transform":{"type":"scalar"},"locs":[{"a":56,"b":59},{"a":110,"b":113}]},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"locs":[{"a":189,"b":198}]}],"statement":"UPDATE\n    school_nces_metadata\nSET\n    mzip = COALESCE(:zip, school_nces_metadata.mzip),\n    lzip = COALESCE(:zip, school_nces_metadata.lzip),\n    updated_at = NOW()\nWHERE\n    school_id = :schoolId!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     school_nces_metadata
 * SET
 *     mzip = COALESCE(:zip, school_nces_metadata.mzip),
 *     lzip = COALESCE(:zip, school_nces_metadata.lzip),
 *     updated_at = NOW()
 * WHERE
 *     school_id = :schoolId!
 * ```
 */
export const adminUpdateSchoolMetaData = new PreparedQuery<IAdminUpdateSchoolMetaDataParams,IAdminUpdateSchoolMetaDataResult>(adminUpdateSchoolMetaDataIR);


/** 'TitlecaseSchoolNames' parameters type */
export type ITitlecaseSchoolNamesParams = void;

/** 'TitlecaseSchoolNames' return type */
export type ITitlecaseSchoolNamesResult = void;

/** 'TitlecaseSchoolNames' query type */
export interface ITitlecaseSchoolNamesQuery {
  params: ITitlecaseSchoolNamesParams;
  result: ITitlecaseSchoolNamesResult;
}

const titlecaseSchoolNamesIR: any = {"usedParamSet":{},"params":[],"statement":"UPDATE\n    schools\nSET\n    name = INITCAP(name)\nWHERE\n    name ~ '^[A-Z\\s\\d]*$'"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     schools
 * SET
 *     name = INITCAP(name)
 * WHERE
 *     name ~ '^[A-Z\s\d]*$'
 * ```
 */
export const titlecaseSchoolNames = new PreparedQuery<ITitlecaseSchoolNamesParams,ITitlecaseSchoolNamesResult>(titlecaseSchoolNamesIR);


/** 'TitlecaseMetadataSchoolNames' parameters type */
export type ITitlecaseMetadataSchoolNamesParams = void;

/** 'TitlecaseMetadataSchoolNames' return type */
export type ITitlecaseMetadataSchoolNamesResult = void;

/** 'TitlecaseMetadataSchoolNames' query type */
export interface ITitlecaseMetadataSchoolNamesQuery {
  params: ITitlecaseMetadataSchoolNamesParams;
  result: ITitlecaseMetadataSchoolNamesResult;
}

const titlecaseMetadataSchoolNamesIR: any = {"usedParamSet":{},"params":[],"statement":"UPDATE\n    school_nces_metadata\nSET\n    sch_name = INITCAP(sch_name)\nWHERE\n    sch_name ~ '^[A-Z\\s\\d]*$'"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     school_nces_metadata
 * SET
 *     sch_name = INITCAP(sch_name)
 * WHERE
 *     sch_name ~ '^[A-Z\s\d]*$'
 * ```
 */
export const titlecaseMetadataSchoolNames = new PreparedQuery<ITitlecaseMetadataSchoolNamesParams,ITitlecaseMetadataSchoolNamesResult>(titlecaseMetadataSchoolNamesIR);


/** 'CreateSchool' parameters type */
export interface ICreateSchoolParams {
  city_id?: number | null | void;
  id: string;
  name: string;
}

/** 'CreateSchool' return type */
export interface ICreateSchoolResult {
  id: string;
}

/** 'CreateSchool' query type */
export interface ICreateSchoolQuery {
  params: ICreateSchoolParams;
  result: ICreateSchoolResult;
}

const createSchoolIR: any = {"usedParamSet":{"id":true,"name":true,"city_id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":52,"b":55}]},{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":58,"b":63}]},{"name":"city_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":66,"b":73}]}],"statement":"INSERT INTO schools (id, name, city_id)\n    VALUES (:id!, :name!, :city_id)\nRETURNING\n    id"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO schools (id, name, city_id)
 *     VALUES (:id!, :name!, :city_id)
 * RETURNING
 *     id
 * ```
 */
export const createSchool = new PreparedQuery<ICreateSchoolParams,ICreateSchoolResult>(createSchoolIR);


/** 'CreateSchoolMetadata' parameters type */
export interface ICreateSchoolMetadataParams {
  effective_date?: string | null | void;
  frl_eligible?: number | null | void;
  g_1_offered?: string | null | void;
  g_10_offered?: string | null | void;
  g_11_offered?: string | null | void;
  g_12_offered?: string | null | void;
  g_13_offered?: string | null | void;
  g_2_offered?: string | null | void;
  g_3_offered?: string | null | void;
  g_4_offered?: string | null | void;
  g_5_offered?: string | null | void;
  g_6_offered?: string | null | void;
  g_7_offered?: string | null | void;
  g_8_offered?: string | null | void;
  g_9_offered?: string | null | void;
  g_ae_offered?: string | null | void;
  g_kg_offered?: string | null | void;
  g_pk_offered?: string | null | void;
  g_ug_offered?: string | null | void;
  gshi?: string | null | void;
  gslo?: string | null | void;
  is_school_wide_title1?: boolean | null | void;
  lcity?: string | null | void;
  lea_name?: string | null | void;
  level?: string | null | void;
  lzip?: string | null | void;
  mcity?: string | null | void;
  mstate?: string | null | void;
  mzip?: string | null | void;
  national_school_lunch_program?: string | null | void;
  ncessch: string;
  nogrades?: string | null | void;
  nslp_direct_certification?: number | null | void;
  phone?: string | null | void;
  sch_name?: string | null | void;
  sch_type_text?: string | null | void;
  school_id: string;
  school_year?: string | null | void;
  st?: string | null | void;
  sy_status_text?: string | null | void;
  title1_school_status?: string | null | void;
  total_students?: number | null | void;
  updated_status_text?: string | null | void;
  website?: string | null | void;
}

/** 'CreateSchoolMetadata' return type */
export type ICreateSchoolMetadataResult = void;

/** 'CreateSchoolMetadata' query type */
export interface ICreateSchoolMetadataQuery {
  params: ICreateSchoolMetadataParams;
  result: ICreateSchoolMetadataResult;
}

const createSchoolMetadataIR: any = {"usedParamSet":{"school_id":true,"ncessch":true,"school_year":true,"st":true,"sch_name":true,"lea_name":true,"lcity":true,"lzip":true,"mcity":true,"mstate":true,"mzip":true,"phone":true,"website":true,"sy_status_text":true,"updated_status_text":true,"effective_date":true,"sch_type_text":true,"nogrades":true,"g_pk_offered":true,"g_kg_offered":true,"g_1_offered":true,"g_2_offered":true,"g_3_offered":true,"g_4_offered":true,"g_5_offered":true,"g_6_offered":true,"g_7_offered":true,"g_8_offered":true,"g_9_offered":true,"g_10_offered":true,"g_11_offered":true,"g_12_offered":true,"g_13_offered":true,"g_ug_offered":true,"g_ae_offered":true,"gslo":true,"gshi":true,"level":true,"total_students":true,"is_school_wide_title1":true,"title1_school_status":true,"national_school_lunch_program":true,"nslp_direct_certification":true,"frl_eligible":true},"params":[{"name":"school_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":612,"b":622}]},{"name":"ncessch","required":true,"transform":{"type":"scalar"},"locs":[{"a":625,"b":633}]},{"name":"school_year","required":false,"transform":{"type":"scalar"},"locs":[{"a":636,"b":647}]},{"name":"st","required":false,"transform":{"type":"scalar"},"locs":[{"a":650,"b":652}]},{"name":"sch_name","required":false,"transform":{"type":"scalar"},"locs":[{"a":655,"b":663}]},{"name":"lea_name","required":false,"transform":{"type":"scalar"},"locs":[{"a":666,"b":674}]},{"name":"lcity","required":false,"transform":{"type":"scalar"},"locs":[{"a":677,"b":682}]},{"name":"lzip","required":false,"transform":{"type":"scalar"},"locs":[{"a":685,"b":689}]},{"name":"mcity","required":false,"transform":{"type":"scalar"},"locs":[{"a":692,"b":697}]},{"name":"mstate","required":false,"transform":{"type":"scalar"},"locs":[{"a":700,"b":706}]},{"name":"mzip","required":false,"transform":{"type":"scalar"},"locs":[{"a":709,"b":713}]},{"name":"phone","required":false,"transform":{"type":"scalar"},"locs":[{"a":716,"b":721}]},{"name":"website","required":false,"transform":{"type":"scalar"},"locs":[{"a":724,"b":731}]},{"name":"sy_status_text","required":false,"transform":{"type":"scalar"},"locs":[{"a":734,"b":748}]},{"name":"updated_status_text","required":false,"transform":{"type":"scalar"},"locs":[{"a":751,"b":770}]},{"name":"effective_date","required":false,"transform":{"type":"scalar"},"locs":[{"a":773,"b":787}]},{"name":"sch_type_text","required":false,"transform":{"type":"scalar"},"locs":[{"a":790,"b":803}]},{"name":"nogrades","required":false,"transform":{"type":"scalar"},"locs":[{"a":806,"b":814}]},{"name":"g_pk_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":817,"b":829}]},{"name":"g_kg_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":832,"b":844}]},{"name":"g_1_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":847,"b":858}]},{"name":"g_2_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":861,"b":872}]},{"name":"g_3_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":875,"b":886}]},{"name":"g_4_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":889,"b":900}]},{"name":"g_5_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":903,"b":914}]},{"name":"g_6_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":917,"b":928}]},{"name":"g_7_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":931,"b":942}]},{"name":"g_8_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":945,"b":956}]},{"name":"g_9_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":959,"b":970}]},{"name":"g_10_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":973,"b":985}]},{"name":"g_11_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":988,"b":1000}]},{"name":"g_12_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":1003,"b":1015}]},{"name":"g_13_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":1018,"b":1030}]},{"name":"g_ug_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":1033,"b":1045}]},{"name":"g_ae_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":1048,"b":1060}]},{"name":"gslo","required":false,"transform":{"type":"scalar"},"locs":[{"a":1063,"b":1067}]},{"name":"gshi","required":false,"transform":{"type":"scalar"},"locs":[{"a":1070,"b":1074}]},{"name":"level","required":false,"transform":{"type":"scalar"},"locs":[{"a":1077,"b":1082}]},{"name":"total_students","required":false,"transform":{"type":"scalar"},"locs":[{"a":1085,"b":1099}]},{"name":"is_school_wide_title1","required":false,"transform":{"type":"scalar"},"locs":[{"a":1102,"b":1123}]},{"name":"title1_school_status","required":false,"transform":{"type":"scalar"},"locs":[{"a":1126,"b":1146}]},{"name":"national_school_lunch_program","required":false,"transform":{"type":"scalar"},"locs":[{"a":1149,"b":1178}]},{"name":"nslp_direct_certification","required":false,"transform":{"type":"scalar"},"locs":[{"a":1181,"b":1206}]},{"name":"frl_eligible","required":false,"transform":{"type":"scalar"},"locs":[{"a":1209,"b":1221}]}],"statement":"INSERT INTO school_nces_metadata (school_id, ncessch, school_year, st, sch_name, lea_name, lcity, lzip, mcity, mstate, mzip, phone, website, sy_status_text, updated_status_text, effective_date, sch_type_text, nogrades, g_pk_offered, g_kg_offered, g_1_offered, g_2_offered, g_3_offered, g_4_offered, g_5_offered, g_6_offered, g_7_offered, g_8_offered, g_9_offered, g_10_offered, g_11_offered, g_12_offered, g_13_offered, g_ug_offered, g_ae_offered, gslo, gshi, level, total_students, is_school_wide_title1, title1_school_status, national_school_lunch_program, nslp_direct_certification, frl_eligible)\n    VALUES (:school_id!, :ncessch!, :school_year, :st, :sch_name, :lea_name, :lcity, :lzip, :mcity, :mstate, :mzip, :phone, :website, :sy_status_text, :updated_status_text, :effective_date, :sch_type_text, :nogrades, :g_pk_offered, :g_kg_offered, :g_1_offered, :g_2_offered, :g_3_offered, :g_4_offered, :g_5_offered, :g_6_offered, :g_7_offered, :g_8_offered, :g_9_offered, :g_10_offered, :g_11_offered, :g_12_offered, :g_13_offered, :g_ug_offered, :g_ae_offered, :gslo, :gshi, :level, :total_students, :is_school_wide_title1, :title1_school_status, :national_school_lunch_program, :nslp_direct_certification, :frl_eligible)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO school_nces_metadata (school_id, ncessch, school_year, st, sch_name, lea_name, lcity, lzip, mcity, mstate, mzip, phone, website, sy_status_text, updated_status_text, effective_date, sch_type_text, nogrades, g_pk_offered, g_kg_offered, g_1_offered, g_2_offered, g_3_offered, g_4_offered, g_5_offered, g_6_offered, g_7_offered, g_8_offered, g_9_offered, g_10_offered, g_11_offered, g_12_offered, g_13_offered, g_ug_offered, g_ae_offered, gslo, gshi, level, total_students, is_school_wide_title1, title1_school_status, national_school_lunch_program, nslp_direct_certification, frl_eligible)
 *     VALUES (:school_id!, :ncessch!, :school_year, :st, :sch_name, :lea_name, :lcity, :lzip, :mcity, :mstate, :mzip, :phone, :website, :sy_status_text, :updated_status_text, :effective_date, :sch_type_text, :nogrades, :g_pk_offered, :g_kg_offered, :g_1_offered, :g_2_offered, :g_3_offered, :g_4_offered, :g_5_offered, :g_6_offered, :g_7_offered, :g_8_offered, :g_9_offered, :g_10_offered, :g_11_offered, :g_12_offered, :g_13_offered, :g_ug_offered, :g_ae_offered, :gslo, :gshi, :level, :total_students, :is_school_wide_title1, :title1_school_status, :national_school_lunch_program, :nslp_direct_certification, :frl_eligible)
 * ```
 */
export const createSchoolMetadata = new PreparedQuery<ICreateSchoolMetadataParams,ICreateSchoolMetadataResult>(createSchoolMetadataIR);


/** 'UpdateSchoolMetadata' parameters type */
export interface IUpdateSchoolMetadataParams {
  effective_date?: string | null | void;
  frl_eligible?: number | null | void;
  g_1_offered?: string | null | void;
  g_10_offered?: string | null | void;
  g_11_offered?: string | null | void;
  g_12_offered?: string | null | void;
  g_13_offered?: string | null | void;
  g_2_offered?: string | null | void;
  g_3_offered?: string | null | void;
  g_4_offered?: string | null | void;
  g_5_offered?: string | null | void;
  g_6_offered?: string | null | void;
  g_7_offered?: string | null | void;
  g_8_offered?: string | null | void;
  g_9_offered?: string | null | void;
  g_ae_offered?: string | null | void;
  g_kg_offered?: string | null | void;
  g_pk_offered?: string | null | void;
  g_ug_offered?: string | null | void;
  gshi?: string | null | void;
  gslo?: string | null | void;
  is_school_wide_title1?: boolean | null | void;
  lcity?: string | null | void;
  lea_name?: string | null | void;
  level?: string | null | void;
  lzip?: string | null | void;
  mcity?: string | null | void;
  mstate?: string | null | void;
  mzip?: string | null | void;
  national_school_lunch_program?: string | null | void;
  nogrades?: string | null | void;
  nslp_direct_certification?: number | null | void;
  phone?: string | null | void;
  sch_name?: string | null | void;
  sch_type_text?: string | null | void;
  school_id: string;
  school_year: string;
  st?: string | null | void;
  sy_status_text?: string | null | void;
  title1_school_status?: string | null | void;
  total_students?: number | null | void;
  updated_status_text?: string | null | void;
  website?: string | null | void;
}

/** 'UpdateSchoolMetadata' return type */
export type IUpdateSchoolMetadataResult = void;

/** 'UpdateSchoolMetadata' query type */
export interface IUpdateSchoolMetadataQuery {
  params: IUpdateSchoolMetadataParams;
  result: IUpdateSchoolMetadataResult;
}

const updateSchoolMetadataIR: any = {"usedParamSet":{"school_year":true,"st":true,"sch_name":true,"lea_name":true,"lcity":true,"lzip":true,"mcity":true,"mstate":true,"mzip":true,"phone":true,"website":true,"sy_status_text":true,"updated_status_text":true,"effective_date":true,"sch_type_text":true,"nogrades":true,"g_pk_offered":true,"g_kg_offered":true,"g_1_offered":true,"g_2_offered":true,"g_3_offered":true,"g_4_offered":true,"g_5_offered":true,"g_6_offered":true,"g_7_offered":true,"g_8_offered":true,"g_9_offered":true,"g_10_offered":true,"g_11_offered":true,"g_12_offered":true,"g_13_offered":true,"g_ug_offered":true,"g_ae_offered":true,"gslo":true,"gshi":true,"level":true,"total_students":true,"is_school_wide_title1":true,"title1_school_status":true,"national_school_lunch_program":true,"nslp_direct_certification":true,"frl_eligible":true,"school_id":true},"params":[{"name":"school_year","required":true,"transform":{"type":"scalar"},"locs":[{"a":54,"b":66}]},{"name":"st","required":false,"transform":{"type":"scalar"},"locs":[{"a":78,"b":80}]},{"name":"sch_name","required":false,"transform":{"type":"scalar"},"locs":[{"a":98,"b":106}]},{"name":"lea_name","required":false,"transform":{"type":"scalar"},"locs":[{"a":124,"b":132}]},{"name":"lcity","required":false,"transform":{"type":"scalar"},"locs":[{"a":147,"b":152}]},{"name":"lzip","required":false,"transform":{"type":"scalar"},"locs":[{"a":166,"b":170}]},{"name":"mcity","required":false,"transform":{"type":"scalar"},"locs":[{"a":185,"b":190}]},{"name":"mstate","required":false,"transform":{"type":"scalar"},"locs":[{"a":206,"b":212}]},{"name":"mzip","required":false,"transform":{"type":"scalar"},"locs":[{"a":226,"b":230}]},{"name":"phone","required":false,"transform":{"type":"scalar"},"locs":[{"a":245,"b":250}]},{"name":"website","required":false,"transform":{"type":"scalar"},"locs":[{"a":267,"b":274}]},{"name":"sy_status_text","required":false,"transform":{"type":"scalar"},"locs":[{"a":298,"b":312}]},{"name":"updated_status_text","required":false,"transform":{"type":"scalar"},"locs":[{"a":341,"b":360}]},{"name":"effective_date","required":false,"transform":{"type":"scalar"},"locs":[{"a":384,"b":398}]},{"name":"sch_type_text","required":false,"transform":{"type":"scalar"},"locs":[{"a":421,"b":434}]},{"name":"nogrades","required":false,"transform":{"type":"scalar"},"locs":[{"a":452,"b":460}]},{"name":"g_pk_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":482,"b":494}]},{"name":"g_kg_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":516,"b":528}]},{"name":"g_1_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":549,"b":560}]},{"name":"g_2_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":581,"b":592}]},{"name":"g_3_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":613,"b":624}]},{"name":"g_4_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":645,"b":656}]},{"name":"g_5_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":677,"b":688}]},{"name":"g_6_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":709,"b":720}]},{"name":"g_7_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":741,"b":752}]},{"name":"g_8_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":773,"b":784}]},{"name":"g_9_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":805,"b":816}]},{"name":"g_10_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":838,"b":850}]},{"name":"g_11_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":872,"b":884}]},{"name":"g_12_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":906,"b":918}]},{"name":"g_13_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":940,"b":952}]},{"name":"g_ug_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":974,"b":986}]},{"name":"g_ae_offered","required":false,"transform":{"type":"scalar"},"locs":[{"a":1008,"b":1020}]},{"name":"gslo","required":false,"transform":{"type":"scalar"},"locs":[{"a":1034,"b":1038}]},{"name":"gshi","required":false,"transform":{"type":"scalar"},"locs":[{"a":1052,"b":1056}]},{"name":"level","required":false,"transform":{"type":"scalar"},"locs":[{"a":1071,"b":1076}]},{"name":"total_students","required":false,"transform":{"type":"scalar"},"locs":[{"a":1100,"b":1114}]},{"name":"is_school_wide_title1","required":false,"transform":{"type":"scalar"},"locs":[{"a":1145,"b":1166}]},{"name":"title1_school_status","required":false,"transform":{"type":"scalar"},"locs":[{"a":1196,"b":1216}]},{"name":"national_school_lunch_program","required":false,"transform":{"type":"scalar"},"locs":[{"a":1255,"b":1284}]},{"name":"nslp_direct_certification","required":false,"transform":{"type":"scalar"},"locs":[{"a":1319,"b":1344}]},{"name":"frl_eligible","required":false,"transform":{"type":"scalar"},"locs":[{"a":1366,"b":1378}]},{"name":"school_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":1423,"b":1433}]}],"statement":"UPDATE\n    school_nces_metadata\nSET\n    school_year = :school_year!,\n    st = :st,\n    sch_name = :sch_name,\n    lea_name = :lea_name,\n    lcity = :lcity,\n    lzip = :lzip,\n    mcity = :mcity,\n    mstate = :mstate,\n    mzip = :mzip,\n    phone = :phone,\n    website = :website,\n    sy_status_text = :sy_status_text,\n    updated_status_text = :updated_status_text,\n    effective_date = :effective_date,\n    sch_type_text = :sch_type_text,\n    nogrades = :nogrades,\n    g_pk_offered = :g_pk_offered,\n    g_kg_offered = :g_kg_offered,\n    g_1_offered = :g_1_offered,\n    g_2_offered = :g_2_offered,\n    g_3_offered = :g_3_offered,\n    g_4_offered = :g_4_offered,\n    g_5_offered = :g_5_offered,\n    g_6_offered = :g_6_offered,\n    g_7_offered = :g_7_offered,\n    g_8_offered = :g_8_offered,\n    g_9_offered = :g_9_offered,\n    g_10_offered = :g_10_offered,\n    g_11_offered = :g_11_offered,\n    g_12_offered = :g_12_offered,\n    g_13_offered = :g_13_offered,\n    g_ug_offered = :g_ug_offered,\n    g_ae_offered = :g_ae_offered,\n    gslo = :gslo,\n    gshi = :gshi,\n    level = :level,\n    total_students = :total_students,\n    is_school_wide_title1 = :is_school_wide_title1,\n    title1_school_status = :title1_school_status,\n    national_school_lunch_program = :national_school_lunch_program,\n    nslp_direct_certification = :nslp_direct_certification,\n    frl_eligible = :frl_eligible\nWHERE\n    school_nces_metadata.school_id = :school_id!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     school_nces_metadata
 * SET
 *     school_year = :school_year!,
 *     st = :st,
 *     sch_name = :sch_name,
 *     lea_name = :lea_name,
 *     lcity = :lcity,
 *     lzip = :lzip,
 *     mcity = :mcity,
 *     mstate = :mstate,
 *     mzip = :mzip,
 *     phone = :phone,
 *     website = :website,
 *     sy_status_text = :sy_status_text,
 *     updated_status_text = :updated_status_text,
 *     effective_date = :effective_date,
 *     sch_type_text = :sch_type_text,
 *     nogrades = :nogrades,
 *     g_pk_offered = :g_pk_offered,
 *     g_kg_offered = :g_kg_offered,
 *     g_1_offered = :g_1_offered,
 *     g_2_offered = :g_2_offered,
 *     g_3_offered = :g_3_offered,
 *     g_4_offered = :g_4_offered,
 *     g_5_offered = :g_5_offered,
 *     g_6_offered = :g_6_offered,
 *     g_7_offered = :g_7_offered,
 *     g_8_offered = :g_8_offered,
 *     g_9_offered = :g_9_offered,
 *     g_10_offered = :g_10_offered,
 *     g_11_offered = :g_11_offered,
 *     g_12_offered = :g_12_offered,
 *     g_13_offered = :g_13_offered,
 *     g_ug_offered = :g_ug_offered,
 *     g_ae_offered = :g_ae_offered,
 *     gslo = :gslo,
 *     gshi = :gshi,
 *     level = :level,
 *     total_students = :total_students,
 *     is_school_wide_title1 = :is_school_wide_title1,
 *     title1_school_status = :title1_school_status,
 *     national_school_lunch_program = :national_school_lunch_program,
 *     nslp_direct_certification = :nslp_direct_certification,
 *     frl_eligible = :frl_eligible
 * WHERE
 *     school_nces_metadata.school_id = :school_id!
 * ```
 */
export const updateSchoolMetadata = new PreparedQuery<IUpdateSchoolMetadataParams,IUpdateSchoolMetadataResult>(updateSchoolMetadataIR);


/** 'GetPartnerSchools' parameters type */
export type IGetPartnerSchoolsParams = void;

/** 'GetPartnerSchools' return type */
export interface IGetPartnerSchoolsResult {
  partnerKey: string;
  partnerSites: stringArray | null;
  schoolId: string;
  schoolName: string;
}

/** 'GetPartnerSchools' query type */
export interface IGetPartnerSchoolsQuery {
  params: IGetPartnerSchoolsParams;
  result: IGetPartnerSchoolsResult;
}

const getPartnerSchoolsIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    schools.name AS school_name,\n    schools.id AS school_id,\n    spo.key AS partner_key,\n    ARRAY_REMOVE(ARRAY_AGG(spos.name), NULL) AS partner_sites\nFROM\n    schools\n    LEFT JOIN student_partner_orgs spo ON schools.id = spo.school_id\n    LEFT JOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id\nWHERE\n    partner = TRUE\nGROUP BY\n    schools.name,\n    schools.id,\n    spo.key"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     schools.name AS school_name,
 *     schools.id AS school_id,
 *     spo.key AS partner_key,
 *     ARRAY_REMOVE(ARRAY_AGG(spos.name), NULL) AS partner_sites
 * FROM
 *     schools
 *     LEFT JOIN student_partner_orgs spo ON schools.id = spo.school_id
 *     LEFT JOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id
 * WHERE
 *     partner = TRUE
 * GROUP BY
 *     schools.name,
 *     schools.id,
 *     spo.key
 * ```
 */
export const getPartnerSchools = new PreparedQuery<IGetPartnerSchoolsParams,IGetPartnerSchoolsResult>(getPartnerSchoolsIR);


