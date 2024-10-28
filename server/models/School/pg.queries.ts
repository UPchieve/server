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
  frlEligible: number | null;
  id: string;
  isAdminApproved: boolean;
  isPartner: boolean;
  isSchoolWideTitle1: boolean;
  isTitle1Eligible: boolean;
  name: string | null;
  nationalSchoolLunchProgram: string | null;
  nslpDirectCertification: number | null;
  state: string | null;
  totalStudents: number | null;
  zip: string | null;
}

/** 'GetSchools' query type */
export interface IGetSchoolsQuery {
  params: IGetSchoolsParams;
  result: IGetSchoolsResult;
}

const getSchoolsIR: any = {"name":"getSchools","params":[{"name":"name","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1485,"b":1488,"line":55,"col":8},{"a":1538,"b":1541,"line":56,"col":34},{"a":1585,"b":1588,"line":57,"col":35}]}},{"name":"state","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1604,"b":1608,"line":58,"col":6},{"a":1646,"b":1650,"line":59,"col":22},{"a":1687,"b":1691,"line":60,"col":35}]}},{"name":"city","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1700,"b":1703,"line":61,"col":6},{"a":1751,"b":1754,"line":62,"col":32},{"a":1795,"b":1798,"line":63,"col":32},{"a":1840,"b":1843,"line":64,"col":33}]}},{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1860,"b":1865,"line":65,"col":7}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1880,"b":1886,"line":65,"col":27}]}}],"usedParamSet":{"name":true,"state":true,"city":true,"limit":true,"offset":true},"statement":{"body":"SELECT\n    schools.id,\n    COALESCE(schools.name, meta.sch_name) AS name,\n    COALESCE(cities.name, meta.lcity) AS city,\n    COALESCE(cities.us_state_code, meta.st) AS state,\n    meta.lzip AS zip,\n    meta.lea_name AS district,\n    approved AS is_admin_approved,\n    partner AS is_partner,\n    meta.is_school_wide_title1,\n    meta.is_title1_eligible,\n    meta.national_school_lunch_program,\n    meta.total_students,\n    meta.nslp_direct_certification,\n    meta.frl_eligible\nFROM\n    schools\n    LEFT JOIN cities ON schools.city_id = cities.id\n    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id\nWHERE (:name::text IS NULL\n    OR schools.name ILIKE '%' || :name || '%'\n    OR meta.sch_name ILIKE '%' || :name || '%')\nAND (:state::text IS NULL\n    OR meta.st ILIKE :state\n    OR cities.us_state_code ILIKE :state)\nAND (:city::text IS NULL\n    OR meta.mcity ILIKE '%' || :city || '%'\n    OR meta.lcity ILIKE '%' || :city || '%'\n    OR cities.name ILIKE '%' || :city || '%')\nLIMIT :limit!::int OFFSET :offset!::int","loc":{"a":863,"b":1891,"line":36,"col":0}}};

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

const schoolSearchIR: any = {"name":"schoolSearch","params":[{"name":"query","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2303,"b":2308,"line":80,"col":31}]}}],"usedParamSet":{"query":true},"statement":{"body":"SELECT\n    schools.id,\n    COALESCE(schools.name, meta.sch_name) AS name,\n    COALESCE(cities.us_state_code, meta.st) AS state,\n    COALESCE(cities.name, meta.lcity) AS city,\n    meta.lea_name AS district\nFROM\n    schools\n    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id\n    LEFT JOIN cities ON schools.city_id = cities.id\nWHERE\n    schools.name ILIKE '%' || :query! || '%'\nLIMIT 100","loc":{"a":1921,"b":2325,"line":69,"col":0}}};

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

const updateApprovalIR: any = {"name":"updateApproval","params":[{"name":"isApproved","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2396,"b":2406,"line":88,"col":16}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2448,"b":2456,"line":91,"col":10}]}}],"usedParamSet":{"isApproved":true,"schoolId":true},"statement":{"body":"UPDATE\n    schools\nSET\n    approved = :isApproved!,\n    updated_at = NOW()\nWHERE\n    id = :schoolId!","loc":{"a":2357,"b":2456,"line":85,"col":0}}};

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

const updateIsPartnerIR: any = {"name":"updateIsPartner","params":[{"name":"isPartner","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2527,"b":2536,"line":98,"col":15}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2578,"b":2586,"line":101,"col":10}]}}],"usedParamSet":{"isPartner":true,"schoolId":true},"statement":{"body":"UPDATE\n    schools\nSET\n    partner = :isPartner!,\n    updated_at = NOW()\nWHERE\n    id = :schoolId!","loc":{"a":2489,"b":2586,"line":95,"col":0}}};

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

const adminUpdateSchoolIR: any = {"name":"adminUpdateSchool","params":[{"name":"name","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2665,"b":2668,"line":108,"col":21}]}},{"name":"isApproved","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2711,"b":2720,"line":109,"col":25}]}},{"name":"cityId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2790,"b":2795,"line":111,"col":24}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2839,"b":2847,"line":113,"col":18}]}}],"usedParamSet":{"name":true,"isApproved":true,"cityId":true,"schoolId":true},"statement":{"body":"UPDATE\n    schools\nSET\n    name = COALESCE(:name, schools.name),\n    approved = COALESCE(:isApproved, schools.approved),\n    updated_at = NOW(),\n    city_id = COALESCE(:cityId, schools.city_id)\nWHERE\n    schools.id = :schoolId!","loc":{"a":2621,"b":2847,"line":105,"col":0}}};

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

const adminUpdateSchoolMetaDataIR: any = {"name":"adminUpdateSchoolMetaData","params":[{"name":"zip","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2947,"b":2949,"line":120,"col":21},{"a":3001,"b":3003,"line":121,"col":21}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3080,"b":3088,"line":124,"col":17}]}}],"usedParamSet":{"zip":true,"schoolId":true},"statement":{"body":"UPDATE\n    school_nces_metadata\nSET\n    mzip = COALESCE(:zip, school_nces_metadata.mzip),\n    lzip = COALESCE(:zip, school_nces_metadata.lzip),\n    updated_at = NOW()\nWHERE\n    school_id = :schoolId!","loc":{"a":2890,"b":3088,"line":117,"col":0}}};

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

const titlecaseSchoolNamesIR: any = {"name":"titlecaseSchoolNames","params":[],"usedParamSet":{},"statement":{"body":"UPDATE\n    schools\nSET\n    name = INITCAP(name)\nWHERE\n    name ~ '^[A-Z\\s\\d]*$'","loc":{"a":3126,"b":3204,"line":128,"col":0}}};

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

const titlecaseMetadataSchoolNamesIR: any = {"name":"titlecaseMetadataSchoolNames","params":[],"usedParamSet":{},"statement":{"body":"UPDATE\n    school_nces_metadata\nSET\n    sch_name = INITCAP(sch_name)\nWHERE\n    sch_name ~ '^[A-Z\\s\\d]*$'","loc":{"a":3250,"b":3353,"line":137,"col":0}}};

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

const createSchoolIR: any = {"name":"createSchool","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3436,"b":3438,"line":147,"col":13}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3442,"b":3446,"line":147,"col":19}]}},{"name":"city_id","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3450,"b":3456,"line":147,"col":27}]}}],"usedParamSet":{"id":true,"name":true,"city_id":true},"statement":{"body":"INSERT INTO schools (id, name, city_id)\n    VALUES (:id!, :name!, :city_id)\nRETURNING\n    id","loc":{"a":3383,"b":3474,"line":146,"col":0}}};

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
  lcity: string | null | void;
  lea_name: string | null | void;
  level: string | null | void;
  lzip: string | null | void;
  mcity: string | null | void;
  mstate: string | null | void;
  mzip: string | null | void;
  national_school_lunch_program: string | null | void;
  ncessch: string;
  nogrades: string | null | void;
  nslp_direct_certification: number | null | void;
  phone: string | null | void;
  sch_name: string | null | void;
  sch_type_text: string | null | void;
  school_id: string;
  school_year: string | null | void;
  st: string | null | void;
  sy_status_text: string | null | void;
  title1_school_status: string | null | void;
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

const createSchoolMetadataIR: any = {"name":"createSchoolMetadata","params":[{"name":"school_id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4125,"b":4134,"line":154,"col":13}]}},{"name":"ncessch","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4138,"b":4145,"line":154,"col":26}]}},{"name":"school_year","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4149,"b":4159,"line":154,"col":37}]}},{"name":"st","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4163,"b":4164,"line":154,"col":51}]}},{"name":"sch_name","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4168,"b":4175,"line":154,"col":56}]}},{"name":"lea_name","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4179,"b":4186,"line":154,"col":67}]}},{"name":"lcity","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4190,"b":4194,"line":154,"col":78}]}},{"name":"lzip","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4198,"b":4201,"line":154,"col":86}]}},{"name":"mcity","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4205,"b":4209,"line":154,"col":93}]}},{"name":"mstate","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4213,"b":4218,"line":154,"col":101}]}},{"name":"mzip","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4222,"b":4225,"line":154,"col":110}]}},{"name":"phone","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4229,"b":4233,"line":154,"col":117}]}},{"name":"website","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4237,"b":4243,"line":154,"col":125}]}},{"name":"sy_status_text","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4247,"b":4260,"line":154,"col":135}]}},{"name":"updated_status_text","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4264,"b":4282,"line":154,"col":152}]}},{"name":"effective_date","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4286,"b":4299,"line":154,"col":174}]}},{"name":"sch_type_text","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4303,"b":4315,"line":154,"col":191}]}},{"name":"nogrades","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4319,"b":4326,"line":154,"col":207}]}},{"name":"g_pk_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4330,"b":4341,"line":154,"col":218}]}},{"name":"g_kg_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4345,"b":4356,"line":154,"col":233}]}},{"name":"g_1_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4360,"b":4370,"line":154,"col":248}]}},{"name":"g_2_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4374,"b":4384,"line":154,"col":262}]}},{"name":"g_3_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4388,"b":4398,"line":154,"col":276}]}},{"name":"g_4_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4402,"b":4412,"line":154,"col":290}]}},{"name":"g_5_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4416,"b":4426,"line":154,"col":304}]}},{"name":"g_6_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4430,"b":4440,"line":154,"col":318}]}},{"name":"g_7_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4444,"b":4454,"line":154,"col":332}]}},{"name":"g_8_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4458,"b":4468,"line":154,"col":346}]}},{"name":"g_9_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4472,"b":4482,"line":154,"col":360}]}},{"name":"g_10_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4486,"b":4497,"line":154,"col":374}]}},{"name":"g_11_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4501,"b":4512,"line":154,"col":389}]}},{"name":"g_12_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4516,"b":4527,"line":154,"col":404}]}},{"name":"g_13_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4531,"b":4542,"line":154,"col":419}]}},{"name":"g_ug_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4546,"b":4557,"line":154,"col":434}]}},{"name":"g_ae_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4561,"b":4572,"line":154,"col":449}]}},{"name":"gslo","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4576,"b":4579,"line":154,"col":464}]}},{"name":"gshi","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4583,"b":4586,"line":154,"col":471}]}},{"name":"level","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4590,"b":4594,"line":154,"col":478}]}},{"name":"total_students","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4598,"b":4611,"line":154,"col":486}]}},{"name":"is_school_wide_title1","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4615,"b":4635,"line":154,"col":503}]}},{"name":"title1_school_status","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4639,"b":4658,"line":154,"col":527}]}},{"name":"national_school_lunch_program","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4662,"b":4690,"line":154,"col":550}]}},{"name":"nslp_direct_certification","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4694,"b":4718,"line":154,"col":582}]}},{"name":"frl_eligible","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4722,"b":4733,"line":154,"col":610}]}}],"usedParamSet":{"school_id":true,"ncessch":true,"school_year":true,"st":true,"sch_name":true,"lea_name":true,"lcity":true,"lzip":true,"mcity":true,"mstate":true,"mzip":true,"phone":true,"website":true,"sy_status_text":true,"updated_status_text":true,"effective_date":true,"sch_type_text":true,"nogrades":true,"g_pk_offered":true,"g_kg_offered":true,"g_1_offered":true,"g_2_offered":true,"g_3_offered":true,"g_4_offered":true,"g_5_offered":true,"g_6_offered":true,"g_7_offered":true,"g_8_offered":true,"g_9_offered":true,"g_10_offered":true,"g_11_offered":true,"g_12_offered":true,"g_13_offered":true,"g_ug_offered":true,"g_ae_offered":true,"gslo":true,"gshi":true,"level":true,"total_students":true,"is_school_wide_title1":true,"title1_school_status":true,"national_school_lunch_program":true,"nslp_direct_certification":true,"frl_eligible":true},"statement":{"body":"INSERT INTO school_nces_metadata (school_id, ncessch, school_year, st, sch_name, lea_name, lcity, lzip, mcity, mstate, mzip, phone, website, sy_status_text, updated_status_text, effective_date, sch_type_text, nogrades, g_pk_offered, g_kg_offered, g_1_offered, g_2_offered, g_3_offered, g_4_offered, g_5_offered, g_6_offered, g_7_offered, g_8_offered, g_9_offered, g_10_offered, g_11_offered, g_12_offered, g_13_offered, g_ug_offered, g_ae_offered, gslo, gshi, level, total_students, is_school_wide_title1, title1_school_status, national_school_lunch_program, nslp_direct_certification, frl_eligible)\n    VALUES (:school_id!, :ncessch!, :school_year, :st, :sch_name, :lea_name, :lcity, :lzip, :mcity, :mstate, :mzip, :phone, :website, :sy_status_text, :updated_status_text, :effective_date, :sch_type_text, :nogrades, :g_pk_offered, :g_kg_offered, :g_1_offered, :g_2_offered, :g_3_offered, :g_4_offered, :g_5_offered, :g_6_offered, :g_7_offered, :g_8_offered, :g_9_offered, :g_10_offered, :g_11_offered, :g_12_offered, :g_13_offered, :g_ug_offered, :g_ae_offered, :gslo, :gshi, :level, :total_students, :is_school_wide_title1, :title1_school_status, :national_school_lunch_program, :nslp_direct_certification, :frl_eligible)","loc":{"a":3512,"b":4734,"line":153,"col":0}}};

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
  title1_school_status: string | null | void;
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

const updateSchoolMetadataIR: any = {"name":"updateSchoolMetadata","params":[{"name":"school_year","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4827,"b":4838,"line":161,"col":19}]}},{"name":"st","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4851,"b":4852,"line":162,"col":10}]}},{"name":"sch_name","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4871,"b":4878,"line":163,"col":16}]}},{"name":"lea_name","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4897,"b":4904,"line":164,"col":16}]}},{"name":"lcity","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4920,"b":4924,"line":165,"col":13}]}},{"name":"lzip","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4939,"b":4942,"line":166,"col":12}]}},{"name":"mcity","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4958,"b":4962,"line":167,"col":13}]}},{"name":"mstate","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4979,"b":4984,"line":168,"col":14}]}},{"name":"mzip","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4999,"b":5002,"line":169,"col":12}]}},{"name":"phone","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5018,"b":5022,"line":170,"col":13}]}},{"name":"website","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5040,"b":5046,"line":171,"col":15}]}},{"name":"sy_status_text","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5071,"b":5084,"line":172,"col":22}]}},{"name":"updated_status_text","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5114,"b":5132,"line":173,"col":27}]}},{"name":"effective_date","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5157,"b":5170,"line":174,"col":22}]}},{"name":"sch_type_text","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5194,"b":5206,"line":175,"col":21}]}},{"name":"nogrades","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5225,"b":5232,"line":176,"col":16}]}},{"name":"g_pk_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5255,"b":5266,"line":177,"col":20}]}},{"name":"g_kg_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5289,"b":5300,"line":178,"col":20}]}},{"name":"g_1_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5322,"b":5332,"line":179,"col":19}]}},{"name":"g_2_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5354,"b":5364,"line":180,"col":19}]}},{"name":"g_3_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5386,"b":5396,"line":181,"col":19}]}},{"name":"g_4_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5418,"b":5428,"line":182,"col":19}]}},{"name":"g_5_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5450,"b":5460,"line":183,"col":19}]}},{"name":"g_6_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5482,"b":5492,"line":184,"col":19}]}},{"name":"g_7_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5514,"b":5524,"line":185,"col":19}]}},{"name":"g_8_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5546,"b":5556,"line":186,"col":19}]}},{"name":"g_9_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5578,"b":5588,"line":187,"col":19}]}},{"name":"g_10_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5611,"b":5622,"line":188,"col":20}]}},{"name":"g_11_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5645,"b":5656,"line":189,"col":20}]}},{"name":"g_12_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5679,"b":5690,"line":190,"col":20}]}},{"name":"g_13_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5713,"b":5724,"line":191,"col":20}]}},{"name":"g_ug_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5747,"b":5758,"line":192,"col":20}]}},{"name":"g_ae_offered","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5781,"b":5792,"line":193,"col":20}]}},{"name":"gslo","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5807,"b":5810,"line":194,"col":12}]}},{"name":"gshi","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5825,"b":5828,"line":195,"col":12}]}},{"name":"level","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5844,"b":5848,"line":196,"col":13}]}},{"name":"total_students","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5873,"b":5886,"line":197,"col":22}]}},{"name":"is_school_wide_title1","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5918,"b":5938,"line":198,"col":29}]}},{"name":"title1_school_status","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5969,"b":5988,"line":199,"col":28}]}},{"name":"national_school_lunch_program","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6028,"b":6056,"line":200,"col":37}]}},{"name":"nslp_direct_certification","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6092,"b":6116,"line":201,"col":33}]}},{"name":"frl_eligible","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6139,"b":6150,"line":202,"col":20}]}},{"name":"school_id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6196,"b":6205,"line":204,"col":38}]}}],"usedParamSet":{"school_year":true,"st":true,"sch_name":true,"lea_name":true,"lcity":true,"lzip":true,"mcity":true,"mstate":true,"mzip":true,"phone":true,"website":true,"sy_status_text":true,"updated_status_text":true,"effective_date":true,"sch_type_text":true,"nogrades":true,"g_pk_offered":true,"g_kg_offered":true,"g_1_offered":true,"g_2_offered":true,"g_3_offered":true,"g_4_offered":true,"g_5_offered":true,"g_6_offered":true,"g_7_offered":true,"g_8_offered":true,"g_9_offered":true,"g_10_offered":true,"g_11_offered":true,"g_12_offered":true,"g_13_offered":true,"g_ug_offered":true,"g_ae_offered":true,"gslo":true,"gshi":true,"level":true,"total_students":true,"is_school_wide_title1":true,"title1_school_status":true,"national_school_lunch_program":true,"nslp_direct_certification":true,"frl_eligible":true,"school_id":true},"statement":{"body":"UPDATE\n    school_nces_metadata\nSET\n    school_year = :school_year!,\n    st = :st,\n    sch_name = :sch_name,\n    lea_name = :lea_name,\n    lcity = :lcity,\n    lzip = :lzip,\n    mcity = :mcity,\n    mstate = :mstate,\n    mzip = :mzip,\n    phone = :phone,\n    website = :website,\n    sy_status_text = :sy_status_text,\n    updated_status_text = :updated_status_text,\n    effective_date = :effective_date,\n    sch_type_text = :sch_type_text,\n    nogrades = :nogrades,\n    g_pk_offered = :g_pk_offered,\n    g_kg_offered = :g_kg_offered,\n    g_1_offered = :g_1_offered,\n    g_2_offered = :g_2_offered,\n    g_3_offered = :g_3_offered,\n    g_4_offered = :g_4_offered,\n    g_5_offered = :g_5_offered,\n    g_6_offered = :g_6_offered,\n    g_7_offered = :g_7_offered,\n    g_8_offered = :g_8_offered,\n    g_9_offered = :g_9_offered,\n    g_10_offered = :g_10_offered,\n    g_11_offered = :g_11_offered,\n    g_12_offered = :g_12_offered,\n    g_13_offered = :g_13_offered,\n    g_ug_offered = :g_ug_offered,\n    g_ae_offered = :g_ae_offered,\n    gslo = :gslo,\n    gshi = :gshi,\n    level = :level,\n    total_students = :total_students,\n    is_school_wide_title1 = :is_school_wide_title1,\n    title1_school_status = :title1_school_status,\n    national_school_lunch_program = :national_school_lunch_program,\n    nslp_direct_certification = :nslp_direct_certification,\n    frl_eligible = :frl_eligible\nWHERE\n    school_nces_metadata.school_id = :school_id!","loc":{"a":4772,"b":6205,"line":158,"col":0}}};

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

const getPartnerSchoolsIR: any = {"name":"getPartnerSchools","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    schools.name AS school_name,\n    schools.id AS school_id,\n    spo.key AS partner_key,\n    ARRAY_REMOVE(ARRAY_AGG(spos.name), NULL) AS partner_sites\nFROM\n    schools\n    LEFT JOIN student_partner_orgs spo ON schools.id = spo.school_id\n    LEFT JOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id\nWHERE\n    partner = TRUE\nGROUP BY\n    schools.name,\n    schools.id,\n    spo.key","loc":{"a":6240,"b":6648,"line":208,"col":0}}};

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


