/** Types generated for queries found in "server/models/School/school.sql" */
import { PreparedQuery } from '@pgtyped/query';

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
  isPartner: boolean;
  isSchoolWideTitle1: boolean;
  isTitle1Eligible: boolean;
  name: string | null;
  nationalSchoolLunchProgram: string | null;
  nslpDirectCertification: number | null;
  schoolYear: string | null;
  state: string | null;
  totalStudents: number | null;
  zip: string | null;
}

/** 'GetSchoolById' query type */
export interface IGetSchoolByIdQuery {
  params: IGetSchoolByIdParams;
  result: IGetSchoolByIdResult;
}

const getSchoolByIdIR: any = {"name":"getSchoolById","params":[{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":686,"b":694,"line":23,"col":18}]}}],"usedParamSet":{"schoolId":true},"statement":{"body":"SELECT\n    schools.id,\n    COALESCE(schools.name, meta.sch_name) AS name,\n    COALESCE(cities.name, meta.lcity) AS city,\n    COALESCE(cities.us_state_code, meta.st) AS state,\n    meta.lzip AS zip,\n    meta.lea_name AS district,\n    meta.school_year,\n    approved AS is_admin_approved,\n    partner AS is_partner,\n    meta.is_school_wide_title1,\n    meta.is_title1_eligible,\n    meta.national_school_lunch_program,\n    meta.total_students,\n    meta.nslp_direct_certification,\n    meta.frl_eligible\nFROM\n    schools\n    LEFT JOIN cities ON schools.city_id = cities.id\n    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id\nWHERE\n    schools.id = :schoolId!","loc":{"a":26,"b":694,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     schools.id,
 *     COALESCE(schools.name, meta.sch_name) AS name,
 *     COALESCE(cities.name, meta.lcity) AS city,
 *     COALESCE(cities.us_state_code, meta.st) AS state,
 *     meta.lzip AS zip,
 *     meta.lea_name AS district,
 *     meta.school_year,
 *     approved AS is_admin_approved,
 *     partner AS is_partner,
 *     meta.is_school_wide_title1,
 *     meta.is_title1_eligible,
 *     meta.national_school_lunch_program,
 *     meta.total_students,
 *     meta.nslp_direct_certification,
 *     meta.frl_eligible
 * FROM
 *     schools
 *     LEFT JOIN cities ON schools.city_id = cities.id
 *     LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id
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

const getSchoolByNcesIdIR: any = {"name":"getSchoolByNcesId","params":[{"name":"ncessch","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":828,"b":835,"line":32,"col":36}]}}],"usedParamSet":{"ncessch":true},"statement":{"body":"SELECT\n    school_id AS id\nFROM\n    school_nces_metadata\nWHERE\n    school_nces_metadata.ncessch = :ncessch!","loc":{"a":729,"b":835,"line":27,"col":0}}};

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


/** 'GetSchools' parameters type */
export interface IGetSchoolsParams {
  city: string | null | void;
  limit: number;
  name: string | null | void;
  offset: number;
  state: string | null | void;
}

/** 'GetSchools' return type */
export interface IGetSchoolsResult {
  city: string | null;
  district: string | null;
  id: string;
  isAdminApproved: boolean;
  isPartner: boolean;
  name: string | null;
  state: string | null;
  zip: string | null;
}

/** 'GetSchools' query type */
export interface IGetSchoolsQuery {
  params: IGetSchoolsParams;
  result: IGetSchoolsResult;
}

const getSchoolsIR: any = {"name":"getSchools","params":[{"name":"name","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1300,"b":1303,"line":49,"col":8},{"a":1353,"b":1356,"line":50,"col":34},{"a":1400,"b":1403,"line":51,"col":35}]}},{"name":"state","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1419,"b":1423,"line":52,"col":6},{"a":1461,"b":1465,"line":53,"col":22},{"a":1502,"b":1506,"line":54,"col":35}]}},{"name":"city","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1515,"b":1518,"line":55,"col":6},{"a":1566,"b":1569,"line":56,"col":32},{"a":1610,"b":1613,"line":57,"col":32},{"a":1655,"b":1658,"line":58,"col":33}]}},{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1675,"b":1680,"line":59,"col":7}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1695,"b":1701,"line":59,"col":27}]}}],"usedParamSet":{"name":true,"state":true,"city":true,"limit":true,"offset":true},"statement":{"body":"SELECT\n    schools.id,\n    COALESCE(schools.name, meta.sch_name) AS name,\n    COALESCE(cities.name, meta.lcity) AS city,\n    COALESCE(cities.us_state_code, meta.st) AS state,\n    meta.lzip AS zip,\n    meta.lea_name AS district,\n    approved AS is_admin_approved,\n    partner AS is_partner\nFROM\n    schools\n    LEFT JOIN cities ON schools.city_id = cities.id\n    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id\nWHERE (:name::text IS NULL\n    OR schools.name ILIKE '%' || :name || '%'\n    OR meta.sch_name ILIKE '%' || :name || '%')\nAND (:state::text IS NULL\n    OR meta.st ILIKE :state\n    OR cities.us_state_code ILIKE :state)\nAND (:city::text IS NULL\n    OR meta.mcity ILIKE '%' || :city || '%'\n    OR meta.lcity ILIKE '%' || :city || '%'\n    OR cities.name ILIKE '%' || :city || '%')\nLIMIT :limit!::int OFFSET :offset!::int","loc":{"a":863,"b":1706,"line":36,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     schools.id,
 *     COALESCE(schools.name, meta.sch_name) AS name,
 *     COALESCE(cities.name, meta.lcity) AS city,
 *     COALESCE(cities.us_state_code, meta.st) AS state,
 *     meta.lzip AS zip,
 *     meta.lea_name AS district,
 *     approved AS is_admin_approved,
 *     partner AS is_partner
 * FROM
 *     schools
 *     LEFT JOIN cities ON schools.city_id = cities.id
 *     LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id
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
 * LIMIT :limit!::int OFFSET :offset!::int
 * ```
 */
export const getSchools = new PreparedQuery<IGetSchoolsParams,IGetSchoolsResult>(getSchoolsIR);


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
  state: string | null;
}

/** 'SchoolSearch' query type */
export interface ISchoolSearchQuery {
  params: ISchoolSearchParams;
  result: ISchoolSearchResult;
}

const schoolSearchIR: any = {"name":"schoolSearch","params":[{"name":"query","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2118,"b":2123,"line":74,"col":31}]}}],"usedParamSet":{"query":true},"statement":{"body":"SELECT\n    schools.id,\n    COALESCE(schools.name, meta.sch_name) AS name,\n    COALESCE(cities.us_state_code, meta.st) AS state,\n    COALESCE(cities.name, meta.lcity) AS city,\n    meta.lea_name AS district\nFROM\n    schools\n    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id\n    LEFT JOIN cities ON schools.city_id = cities.id\nWHERE\n    schools.name ILIKE '%' || :query! || '%'\nLIMIT 100","loc":{"a":1736,"b":2140,"line":63,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     schools.id,
 *     COALESCE(schools.name, meta.sch_name) AS name,
 *     COALESCE(cities.us_state_code, meta.st) AS state,
 *     COALESCE(cities.name, meta.lcity) AS city,
 *     meta.lea_name AS district
 * FROM
 *     schools
 *     LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id
 *     LEFT JOIN cities ON schools.city_id = cities.id
 * WHERE
 *     schools.name ILIKE '%' || :query! || '%'
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

const updateApprovalIR: any = {"name":"updateApproval","params":[{"name":"isApproved","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2211,"b":2221,"line":82,"col":16}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2263,"b":2271,"line":85,"col":10}]}}],"usedParamSet":{"isApproved":true,"schoolId":true},"statement":{"body":"UPDATE\n    schools\nSET\n    approved = :isApproved!,\n    updated_at = NOW()\nWHERE\n    id = :schoolId!","loc":{"a":2172,"b":2271,"line":79,"col":0}}};

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

const updateIsPartnerIR: any = {"name":"updateIsPartner","params":[{"name":"isPartner","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2342,"b":2351,"line":92,"col":15}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2393,"b":2401,"line":95,"col":10}]}}],"usedParamSet":{"isPartner":true,"schoolId":true},"statement":{"body":"UPDATE\n    schools\nSET\n    partner = :isPartner!,\n    updated_at = NOW()\nWHERE\n    id = :schoolId!","loc":{"a":2304,"b":2401,"line":89,"col":0}}};

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
  cityId: number | null | void;
  isApproved: boolean | null | void;
  name: string | null | void;
  schoolId: string;
}

/** 'AdminUpdateSchool' return type */
export type IAdminUpdateSchoolResult = void;

/** 'AdminUpdateSchool' query type */
export interface IAdminUpdateSchoolQuery {
  params: IAdminUpdateSchoolParams;
  result: IAdminUpdateSchoolResult;
}

const adminUpdateSchoolIR: any = {"name":"adminUpdateSchool","params":[{"name":"name","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2480,"b":2483,"line":102,"col":21}]}},{"name":"isApproved","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2526,"b":2535,"line":103,"col":25}]}},{"name":"cityId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2605,"b":2610,"line":105,"col":24}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2654,"b":2662,"line":107,"col":18}]}}],"usedParamSet":{"name":true,"isApproved":true,"cityId":true,"schoolId":true},"statement":{"body":"UPDATE\n    schools\nSET\n    name = COALESCE(:name, schools.name),\n    approved = COALESCE(:isApproved, schools.approved),\n    updated_at = NOW(),\n    city_id = COALESCE(:cityId, schools.city_id)\nWHERE\n    schools.id = :schoolId!","loc":{"a":2436,"b":2662,"line":99,"col":0}}};

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
  zip: string | null | void;
}

/** 'AdminUpdateSchoolMetaData' return type */
export type IAdminUpdateSchoolMetaDataResult = void;

/** 'AdminUpdateSchoolMetaData' query type */
export interface IAdminUpdateSchoolMetaDataQuery {
  params: IAdminUpdateSchoolMetaDataParams;
  result: IAdminUpdateSchoolMetaDataResult;
}

const adminUpdateSchoolMetaDataIR: any = {"name":"adminUpdateSchoolMetaData","params":[{"name":"zip","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2762,"b":2764,"line":114,"col":21},{"a":2816,"b":2818,"line":115,"col":21}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2895,"b":2903,"line":118,"col":17}]}}],"usedParamSet":{"zip":true,"schoolId":true},"statement":{"body":"UPDATE\n    school_nces_metadata\nSET\n    mzip = COALESCE(:zip, school_nces_metadata.mzip),\n    lzip = COALESCE(:zip, school_nces_metadata.lzip),\n    updated_at = NOW()\nWHERE\n    school_id = :schoolId!","loc":{"a":2705,"b":2903,"line":111,"col":0}}};

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

const titlecaseSchoolNamesIR: any = {"name":"titlecaseSchoolNames","params":[],"usedParamSet":{},"statement":{"body":"UPDATE\n    schools\nSET\n    name = INITCAP(name)\nWHERE\n    name ~ '^[A-Z\\s\\d]*$'","loc":{"a":2941,"b":3019,"line":122,"col":0}}};

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

const titlecaseMetadataSchoolNamesIR: any = {"name":"titlecaseMetadataSchoolNames","params":[],"usedParamSet":{},"statement":{"body":"UPDATE\n    school_nces_metadata\nSET\n    sch_name = INITCAP(sch_name)\nWHERE\n    sch_name ~ '^[A-Z\\s\\d]*$'","loc":{"a":3065,"b":3168,"line":131,"col":0}}};

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
  city_id: number | null | void;
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

const createSchoolIR: any = {"name":"createSchool","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3251,"b":3253,"line":141,"col":13}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3257,"b":3261,"line":141,"col":19}]}},{"name":"city_id","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3265,"b":3271,"line":141,"col":27}]}}],"usedParamSet":{"id":true,"name":true,"city_id":true},"statement":{"body":"INSERT INTO schools (id, name, city_id)\n    VALUES (:id!, :name!, :city_id)\nRETURNING\n    id","loc":{"a":3198,"b":3289,"line":140,"col":0}}};

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
  effective_date: string | null | void;
  frl_eligible: number | null | void;
  g_1_offered: string | null | void;
  g_10_offered: string | null | void;
  g_11_offered: string | null | void;
  g_12_offered: string | null | void;
  g_13_offered: string | null | void;
  g_2_offered: string | null | void;
  g_3_offered: string | null | void;
  g_4_offered: string | null | void;
  g_5_offered: string | null | void;
  g_6_offered: string | null | void;
  g_7_offered: string | null | void;
  g_8_offered: string | null | void;
  g_9_offered: string | null | void;
  g_ae_offered: string | null | void;
  g_kg_offered: string | null | void;
  g_pk_offered: string | null | void;
  g_ug_offered: string | null | void;
  gshi: string | null | void;
  gslo: string | null | void;
  is_school_wide_title1: boolean | null | void;
  is_title1_eligible: boolean | null | void;
  lcity: string | null | void;
  lea_name: string | null | void;
  level: string | null | void;
  lzip: string | null | void;
  mcity: string | null | void;
  mstate: string | null | void;
  mzip: string | null | void;
  national_school_lunch_program: string | null | void;
  ncessch: string | null | void;
  nogrades: string | null | void;
  nslp_direct_certification: number | null | void;
  phone: string | null | void;
  sch_name: string | null | void;
  sch_type_text: string | null | void;
  school_id: string | null | void;
  school_year: string | null | void;
  st: string | null | void;
  sy_status_text: string | null | void;
  total_students: number | null | void;
  updated_status_text: string | null | void;
  website: string | null | void;
}

/** 'CreateSchoolMetadata' return type */
export type ICreateSchoolMetadataResult = void;

/** 'CreateSchoolMetadata' query type */
export interface ICreateSchoolMetadataQuery {
  params: ICreateSchoolMetadataParams;
  result: ICreateSchoolMetadataResult;
}

const createSchoolMetadataIR: any = {"name":"createSchoolMetadata","params":[{"name":"school_id","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3938,"b":3946,"line":148,"col":13}]}},{"name":"ncessch","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3950,"b":3956,"line":148,"col":25}]}},{"name":"school_year","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3960,"b":3970,"line":148,"col":35}]}},{"name":"st","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3974,"b":3975,"line":148,"col":49}]}},{"name":"sch_name","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3979,"b":3986,"line":148,"col":54}]}},{"name":"lea_name","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3990,"b":3997,"line":148,"col":65}]}},{"name":"lcity","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4001,"b":4005,"line":148,"col":76}]}},{"name":"lzip","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4009,"b":4012,"line":148,"col":84}]}},{"name":"mcity","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4016,"b":4020,"line":148,"col":91}]}},{"name":"mstate","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4024,"b":4029,"line":148,"col":99}]}},{"name":"mzip","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4033,"b":4036,"line":148,"col":108}]}},{"name":"phone","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4040,"b":4044,"line":148,"col":115}]}},{"name":"website","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4048,"b":4054,"line":148,"col":123}]}},{"name":"sy_status_text","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4058,"b":4071,"line":148,"col":133}]}},{"name":"updated_status_text","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4075,"b":4093,"line":148,"col":150}]}},{"name":"effective_date","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4097,"b":4110,"line":148,"col":172}]}},{"name":"sch_type_text","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4114,"b":4126,"line":148,"col":189}]}},{"name":"nogrades","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4130,"b":4137,"line":148,"col":205}]}},{"name":"g_pk_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4141,"b":4152,"line":148,"col":216}]}},{"name":"g_kg_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4156,"b":4167,"line":148,"col":231}]}},{"name":"g_1_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4171,"b":4181,"line":148,"col":246}]}},{"name":"g_2_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4185,"b":4195,"line":148,"col":260}]}},{"name":"g_3_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4199,"b":4209,"line":148,"col":274}]}},{"name":"g_4_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4213,"b":4223,"line":148,"col":288}]}},{"name":"g_5_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4227,"b":4237,"line":148,"col":302}]}},{"name":"g_6_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4241,"b":4251,"line":148,"col":316}]}},{"name":"g_7_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4255,"b":4265,"line":148,"col":330}]}},{"name":"g_8_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4269,"b":4279,"line":148,"col":344}]}},{"name":"g_9_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4283,"b":4293,"line":148,"col":358}]}},{"name":"g_10_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4297,"b":4308,"line":148,"col":372}]}},{"name":"g_11_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4312,"b":4323,"line":148,"col":387}]}},{"name":"g_12_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4327,"b":4338,"line":148,"col":402}]}},{"name":"g_13_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4342,"b":4353,"line":148,"col":417}]}},{"name":"g_ug_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4357,"b":4368,"line":148,"col":432}]}},{"name":"g_ae_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4372,"b":4383,"line":148,"col":447}]}},{"name":"gslo","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4387,"b":4390,"line":148,"col":462}]}},{"name":"gshi","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4394,"b":4397,"line":148,"col":469}]}},{"name":"level","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4401,"b":4405,"line":148,"col":476}]}},{"name":"total_students","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4409,"b":4422,"line":148,"col":484}]}},{"name":"is_school_wide_title1","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4426,"b":4446,"line":148,"col":501}]}},{"name":"is_title1_eligible","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4450,"b":4467,"line":148,"col":525}]}},{"name":"national_school_lunch_program","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4471,"b":4499,"line":148,"col":546}]}},{"name":"nslp_direct_certification","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4503,"b":4527,"line":148,"col":578}]}},{"name":"frl_eligible","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4531,"b":4542,"line":148,"col":606}]}}],"usedParamSet":{"school_id":true,"ncessch":true,"school_year":true,"st":true,"sch_name":true,"lea_name":true,"lcity":true,"lzip":true,"mcity":true,"mstate":true,"mzip":true,"phone":true,"website":true,"sy_status_text":true,"updated_status_text":true,"effective_date":true,"sch_type_text":true,"nogrades":true,"g_pk_offered":true,"g_kg_offered":true,"g_1_offered":true,"g_2_offered":true,"g_3_offered":true,"g_4_offered":true,"g_5_offered":true,"g_6_offered":true,"g_7_offered":true,"g_8_offered":true,"g_9_offered":true,"g_10_offered":true,"g_11_offered":true,"g_12_offered":true,"g_13_offered":true,"g_ug_offered":true,"g_ae_offered":true,"gslo":true,"gshi":true,"level":true,"total_students":true,"is_school_wide_title1":true,"is_title1_eligible":true,"national_school_lunch_program":true,"nslp_direct_certification":true,"frl_eligible":true},"statement":{"body":"INSERT INTO school_nces_metadata (school_id, ncessch, school_year, st, sch_name, lea_name, lcity, lzip, mcity, mstate, mzip, phone, website, sy_status_text, updated_status_text, effective_date, sch_type_text, nogrades, g_pk_offered, g_kg_offered, g_1_offered, g_2_offered, g_3_offered, g_4_offered, g_5_offered, g_6_offered, g_7_offered, g_8_offered, g_9_offered, g_10_offered, g_11_offered, g_12_offered, g_13_offered, g_ug_offered, g_ae_offered, gslo, gshi, level, total_students, is_school_wide_title1, is_title1_eligible, national_school_lunch_program, nslp_direct_certification, frl_eligible)\n    VALUES (:school_id, :ncessch, :school_year, :st, :sch_name, :lea_name, :lcity, :lzip, :mcity, :mstate, :mzip, :phone, :website, :sy_status_text, :updated_status_text, :effective_date, :sch_type_text, :nogrades, :g_pk_offered, :g_kg_offered, :g_1_offered, :g_2_offered, :g_3_offered, :g_4_offered, :g_5_offered, :g_6_offered, :g_7_offered, :g_8_offered, :g_9_offered, :g_10_offered, :g_11_offered, :g_12_offered, :g_13_offered, :g_ug_offered, :g_ae_offered, :gslo, :gshi, :level, :total_students, :is_school_wide_title1, :is_title1_eligible, :national_school_lunch_program, :nslp_direct_certification, :frl_eligible)","loc":{"a":3327,"b":4543,"line":147,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO school_nces_metadata (school_id, ncessch, school_year, st, sch_name, lea_name, lcity, lzip, mcity, mstate, mzip, phone, website, sy_status_text, updated_status_text, effective_date, sch_type_text, nogrades, g_pk_offered, g_kg_offered, g_1_offered, g_2_offered, g_3_offered, g_4_offered, g_5_offered, g_6_offered, g_7_offered, g_8_offered, g_9_offered, g_10_offered, g_11_offered, g_12_offered, g_13_offered, g_ug_offered, g_ae_offered, gslo, gshi, level, total_students, is_school_wide_title1, is_title1_eligible, national_school_lunch_program, nslp_direct_certification, frl_eligible)
 *     VALUES (:school_id, :ncessch, :school_year, :st, :sch_name, :lea_name, :lcity, :lzip, :mcity, :mstate, :mzip, :phone, :website, :sy_status_text, :updated_status_text, :effective_date, :sch_type_text, :nogrades, :g_pk_offered, :g_kg_offered, :g_1_offered, :g_2_offered, :g_3_offered, :g_4_offered, :g_5_offered, :g_6_offered, :g_7_offered, :g_8_offered, :g_9_offered, :g_10_offered, :g_11_offered, :g_12_offered, :g_13_offered, :g_ug_offered, :g_ae_offered, :gslo, :gshi, :level, :total_students, :is_school_wide_title1, :is_title1_eligible, :national_school_lunch_program, :nslp_direct_certification, :frl_eligible)
 * ```
 */
export const createSchoolMetadata = new PreparedQuery<ICreateSchoolMetadataParams,ICreateSchoolMetadataResult>(createSchoolMetadataIR);


/** 'UpdateSchoolMetadata' parameters type */
export interface IUpdateSchoolMetadataParams {
  effective_date: string | null | void;
  frl_eligible: number | null | void;
  g_1_offered: string | null | void;
  g_10_offered: string | null | void;
  g_11_offered: string | null | void;
  g_12_offered: string | null | void;
  g_13_offered: string | null | void;
  g_2_offered: string | null | void;
  g_3_offered: string | null | void;
  g_4_offered: string | null | void;
  g_5_offered: string | null | void;
  g_6_offered: string | null | void;
  g_7_offered: string | null | void;
  g_8_offered: string | null | void;
  g_9_offered: string | null | void;
  g_ae_offered: string | null | void;
  g_kg_offered: string | null | void;
  g_pk_offered: string | null | void;
  g_ug_offered: string | null | void;
  gshi: string | null | void;
  gslo: string | null | void;
  is_school_wide_title1: boolean | null | void;
  is_title1_eligible: boolean | null | void;
  lcity: string | null | void;
  lea_name: string | null | void;
  level: string | null | void;
  lzip: string | null | void;
  mcity: string | null | void;
  mstate: string | null | void;
  mzip: string | null | void;
  national_school_lunch_program: string | null | void;
  nogrades: string | null | void;
  nslp_direct_certification: number | null | void;
  phone: string | null | void;
  sch_name: string | null | void;
  sch_type_text: string | null | void;
  school_id: string;
  school_year: string;
  st: string | null | void;
  sy_status_text: string | null | void;
  total_students: number | null | void;
  updated_status_text: string | null | void;
  website: string | null | void;
}

/** 'UpdateSchoolMetadata' return type */
export type IUpdateSchoolMetadataResult = void;

/** 'UpdateSchoolMetadata' query type */
export interface IUpdateSchoolMetadataQuery {
  params: IUpdateSchoolMetadataParams;
  result: IUpdateSchoolMetadataResult;
}

const updateSchoolMetadataIR: any = {"name":"updateSchoolMetadata","params":[{"name":"school_year","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4636,"b":4647,"line":155,"col":19}]}},{"name":"st","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4660,"b":4661,"line":156,"col":10}]}},{"name":"sch_name","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4680,"b":4687,"line":157,"col":16}]}},{"name":"lea_name","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4706,"b":4713,"line":158,"col":16}]}},{"name":"lcity","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4729,"b":4733,"line":159,"col":13}]}},{"name":"lzip","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4748,"b":4751,"line":160,"col":12}]}},{"name":"mcity","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4767,"b":4771,"line":161,"col":13}]}},{"name":"mstate","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4788,"b":4793,"line":162,"col":14}]}},{"name":"mzip","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4808,"b":4811,"line":163,"col":12}]}},{"name":"phone","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4827,"b":4831,"line":164,"col":13}]}},{"name":"website","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4849,"b":4855,"line":165,"col":15}]}},{"name":"sy_status_text","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4880,"b":4893,"line":166,"col":22}]}},{"name":"updated_status_text","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4923,"b":4941,"line":167,"col":27}]}},{"name":"effective_date","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4966,"b":4979,"line":168,"col":22}]}},{"name":"sch_type_text","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5003,"b":5015,"line":169,"col":21}]}},{"name":"nogrades","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5034,"b":5041,"line":170,"col":16}]}},{"name":"g_pk_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5064,"b":5075,"line":171,"col":20}]}},{"name":"g_kg_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5098,"b":5109,"line":172,"col":20}]}},{"name":"g_1_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5131,"b":5141,"line":173,"col":19}]}},{"name":"g_2_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5163,"b":5173,"line":174,"col":19}]}},{"name":"g_3_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5195,"b":5205,"line":175,"col":19}]}},{"name":"g_4_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5227,"b":5237,"line":176,"col":19}]}},{"name":"g_5_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5259,"b":5269,"line":177,"col":19}]}},{"name":"g_6_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5291,"b":5301,"line":178,"col":19}]}},{"name":"g_7_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5323,"b":5333,"line":179,"col":19}]}},{"name":"g_8_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5355,"b":5365,"line":180,"col":19}]}},{"name":"g_9_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5387,"b":5397,"line":181,"col":19}]}},{"name":"g_10_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5420,"b":5431,"line":182,"col":20}]}},{"name":"g_11_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5454,"b":5465,"line":183,"col":20}]}},{"name":"g_12_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5488,"b":5499,"line":184,"col":20}]}},{"name":"g_13_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5522,"b":5533,"line":185,"col":20}]}},{"name":"g_ug_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5556,"b":5567,"line":186,"col":20}]}},{"name":"g_ae_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5590,"b":5601,"line":187,"col":20}]}},{"name":"gslo","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5616,"b":5619,"line":188,"col":12}]}},{"name":"gshi","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5634,"b":5637,"line":189,"col":12}]}},{"name":"level","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5653,"b":5657,"line":190,"col":13}]}},{"name":"total_students","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5682,"b":5695,"line":191,"col":22}]}},{"name":"is_school_wide_title1","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5727,"b":5747,"line":192,"col":29}]}},{"name":"is_title1_eligible","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5776,"b":5793,"line":193,"col":26}]}},{"name":"national_school_lunch_program","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5833,"b":5861,"line":194,"col":37}]}},{"name":"nslp_direct_certification","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5897,"b":5921,"line":195,"col":33}]}},{"name":"frl_eligible","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5944,"b":5955,"line":196,"col":20}]}},{"name":"school_id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6001,"b":6010,"line":198,"col":38}]}}],"usedParamSet":{"school_year":true,"st":true,"sch_name":true,"lea_name":true,"lcity":true,"lzip":true,"mcity":true,"mstate":true,"mzip":true,"phone":true,"website":true,"sy_status_text":true,"updated_status_text":true,"effective_date":true,"sch_type_text":true,"nogrades":true,"g_pk_offered":true,"g_kg_offered":true,"g_1_offered":true,"g_2_offered":true,"g_3_offered":true,"g_4_offered":true,"g_5_offered":true,"g_6_offered":true,"g_7_offered":true,"g_8_offered":true,"g_9_offered":true,"g_10_offered":true,"g_11_offered":true,"g_12_offered":true,"g_13_offered":true,"g_ug_offered":true,"g_ae_offered":true,"gslo":true,"gshi":true,"level":true,"total_students":true,"is_school_wide_title1":true,"is_title1_eligible":true,"national_school_lunch_program":true,"nslp_direct_certification":true,"frl_eligible":true,"school_id":true},"statement":{"body":"UPDATE\n    school_nces_metadata\nSET\n    school_year = :school_year!,\n    st = :st,\n    sch_name = :sch_name,\n    lea_name = :lea_name,\n    lcity = :lcity,\n    lzip = :lzip,\n    mcity = :mcity,\n    mstate = :mstate,\n    mzip = :mzip,\n    phone = :phone,\n    website = :website,\n    sy_status_text = :sy_status_text,\n    updated_status_text = :updated_status_text,\n    effective_date = :effective_date,\n    sch_type_text = :sch_type_text,\n    nogrades = :nogrades,\n    g_pk_offered = :g_pk_offered,\n    g_kg_offered = :g_kg_offered,\n    g_1_offered = :g_1_offered,\n    g_2_offered = :g_2_offered,\n    g_3_offered = :g_3_offered,\n    g_4_offered = :g_4_offered,\n    g_5_offered = :g_5_offered,\n    g_6_offered = :g_6_offered,\n    g_7_offered = :g_7_offered,\n    g_8_offered = :g_8_offered,\n    g_9_offered = :g_9_offered,\n    g_10_offered = :g_10_offered,\n    g_11_offered = :g_11_offered,\n    g_12_offered = :g_12_offered,\n    g_13_offered = :g_13_offered,\n    g_ug_offered = :g_ug_offered,\n    g_ae_offered = :g_ae_offered,\n    gslo = :gslo,\n    gshi = :gshi,\n    level = :level,\n    total_students = :total_students,\n    is_school_wide_title1 = :is_school_wide_title1,\n    is_title1_eligible = :is_title1_eligible,\n    national_school_lunch_program = :national_school_lunch_program,\n    nslp_direct_certification = :nslp_direct_certification,\n    frl_eligible = :frl_eligible\nWHERE\n    school_nces_metadata.school_id = :school_id!","loc":{"a":4581,"b":6010,"line":152,"col":0}}};

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
 *     is_title1_eligible = :is_title1_eligible,
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

const getPartnerSchoolsIR: any = {"name":"getPartnerSchools","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    schools.name AS school_name,\n    schools.id AS school_id,\n    spo.key AS partner_key,\n    ARRAY_REMOVE(ARRAY_AGG(spos.name), NULL) AS partner_sites\nFROM\n    schools\n    LEFT JOIN student_partner_orgs spo ON schools.id = spo.school_id\n    LEFT JOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id\nWHERE\n    partner = TRUE\nGROUP BY\n    schools.name,\n    schools.id,\n    spo.key","loc":{"a":6045,"b":6453,"line":202,"col":0}}};

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


