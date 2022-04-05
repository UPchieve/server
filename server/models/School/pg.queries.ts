/** Types generated for queries found in "server/models/School/school.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'FindSchoolByUpchieveId' parameters type */
export interface IFindSchoolByUpchieveIdParams {
  schoolId: string;
}

/** 'FindSchoolByUpchieveId' return type */
export interface IFindSchoolByUpchieveIdResult {
  cityNameStored: string;
  createdAt: Date;
  fipst: number | null;
  g_10Offered: string | null;
  g_11Offered: string | null;
  g_12Offered: string | null;
  g_9Offered: string | null;
  id: string;
  isApproved: boolean;
  isPartner: boolean;
  lcity: string | null;
  leaName: string | null;
  lzip: string | null;
  mcity: string | null;
  mzip: string | null;
  nameStored: string;
  schName: string | null;
  schoolYear: string | null;
  st: string | null;
  stateStored: string | null;
  stSchid: string | null;
  updatedAt: Date;
}

/** 'FindSchoolByUpchieveId' query type */
export interface IFindSchoolByUpchieveIdQuery {
  params: IFindSchoolByUpchieveIdParams;
  result: IFindSchoolByUpchieveIdResult;
}

const findSchoolByUpchieveIdIR: any = {"name":"findSchoolByUpchieveId","params":[{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":698,"b":706,"line":30,"col":18}]}}],"usedParamSet":{"schoolId":true},"statement":{"body":"SELECT\n    schools.id,\n    schools.name AS name_stored,\n    cities.us_state_code AS state_stored,\n    approved AS is_approved,\n    partner AS is_partner,\n    schools.created_at,\n    schools.updated_at,\n    cities.name AS city_name_stored,\n    meta.fipst,\n    meta.school_year,\n    meta.sch_name,\n    meta.lea_name,\n    meta.st,\n    meta.st_schid,\n    meta.mcity,\n    meta.mzip,\n    meta.lcity,\n    meta.lzip,\n    meta.g_9_offered,\n    meta.g_10_offered,\n    meta.g_11_offered,\n    meta.g_12_offered\nFROM\n    schools\n    LEFT JOIN cities ON schools.city_id = cities.id\n    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id\nWHERE\n    schools.id = :schoolId!","loc":{"a":35,"b":706,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     schools.id,
 *     schools.name AS name_stored,
 *     cities.us_state_code AS state_stored,
 *     approved AS is_approved,
 *     partner AS is_partner,
 *     schools.created_at,
 *     schools.updated_at,
 *     cities.name AS city_name_stored,
 *     meta.fipst,
 *     meta.school_year,
 *     meta.sch_name,
 *     meta.lea_name,
 *     meta.st,
 *     meta.st_schid,
 *     meta.mcity,
 *     meta.mzip,
 *     meta.lcity,
 *     meta.lzip,
 *     meta.g_9_offered,
 *     meta.g_10_offered,
 *     meta.g_11_offered,
 *     meta.g_12_offered
 * FROM
 *     schools
 *     LEFT JOIN cities ON schools.city_id = cities.id
 *     LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id
 * WHERE
 *     schools.id = :schoolId!
 * ```
 */
export const findSchoolByUpchieveId = new PreparedQuery<IFindSchoolByUpchieveIdParams,IFindSchoolByUpchieveIdResult>(findSchoolByUpchieveIdIR);


/** 'GetSchool' parameters type */
export interface IGetSchoolParams {
  schoolId: string;
}

/** 'GetSchool' return type */
export interface IGetSchoolResult {
  cityNameStored: string | null;
  createdAt: Date;
  id: string;
  isApproved: boolean;
  isPartner: boolean;
  nameStored: string | null;
  stateStored: string | null;
  updatedAt: Date;
  zipCode: string | null;
}

/** 'GetSchool' query type */
export interface IGetSchoolQuery {
  params: IGetSchoolParams;
  result: IGetSchoolResult;
}

const getSchoolIR: any = {"name":"getSchool","params":[{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1228,"b":1236,"line":49,"col":18}]}}],"usedParamSet":{"schoolId":true},"statement":{"body":"SELECT\n    approved AS is_approved,\n    partner AS is_partner,\n    meta.mzip AS zip_code,\n    COALESCE(meta.sch_name, schools.name) AS name_stored,\n    COALESCE(meta.st, cities.us_state_code) AS state_stored,\n    COALESCE(meta.lcity, cities.name) AS city_name_stored,\n    schools.id,\n    schools.created_at,\n    schools.updated_at\nFROM\n    schools\n    LEFT JOIN cities ON schools.city_id = cities.id\n    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id\nWHERE\n    schools.id = :schoolId!","loc":{"a":733,"b":1236,"line":34,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     approved AS is_approved,
 *     partner AS is_partner,
 *     meta.mzip AS zip_code,
 *     COALESCE(meta.sch_name, schools.name) AS name_stored,
 *     COALESCE(meta.st, cities.us_state_code) AS state_stored,
 *     COALESCE(meta.lcity, cities.name) AS city_name_stored,
 *     schools.id,
 *     schools.created_at,
 *     schools.updated_at
 * FROM
 *     schools
 *     LEFT JOIN cities ON schools.city_id = cities.id
 *     LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id
 * WHERE
 *     schools.id = :schoolId!
 * ```
 */
export const getSchool = new PreparedQuery<IGetSchoolParams,IGetSchoolResult>(getSchoolIR);


/** 'GetSchools' parameters type */
export interface IGetSchoolsParams {
  city: string;
  limit: number;
  name: string;
  offset: number;
  state: string;
}

/** 'GetSchools' return type */
export interface IGetSchoolsResult {
  cityNameStored: string | null;
  createdAt: Date;
  id: string;
  isApproved: boolean;
  isPartner: boolean;
  nameStored: string | null;
  stateStored: string | null;
  updatedAt: Date;
  zipCode: string | null;
}

/** 'GetSchools' query type */
export interface IGetSchoolsQuery {
  params: IGetSchoolsParams;
  result: IGetSchoolsResult;
}

const getSchoolsIR: any = {"name":"getSchools","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1758,"b":1762,"line":67,"col":23},{"a":1788,"b":1792,"line":68,"col":24}]}},{"name":"state","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1811,"b":1816,"line":69,"col":16},{"a":1849,"b":1854,"line":70,"col":31}]}},{"name":"city","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1876,"b":1880,"line":71,"col":19},{"a":1903,"b":1907,"line":72,"col":21},{"a":1931,"b":1935,"line":73,"col":22}]}},{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1945,"b":1950,"line":74,"col":7}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1965,"b":1971,"line":74,"col":27}]}}],"usedParamSet":{"name":true,"state":true,"city":true,"limit":true,"offset":true},"statement":{"body":"SELECT\n    approved AS is_approved,\n    partner AS is_partner,\n    meta.mzip AS zip_code,\n    COALESCE(meta.sch_name, schools.name) AS name_stored,\n    COALESCE(meta.st, cities.us_state_code) AS state_stored,\n    COALESCE(meta.lcity, cities.name) AS city_name_stored,\n    schools.id,\n    schools.created_at,\n    schools.updated_at\nFROM\n    schools\n    LEFT JOIN cities ON schools.city_id = cities.id\n    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id\nWHERE (schools.name = :name!\n    OR meta.sch_name = :name!)\nAND (meta.st = :state!\n    OR cities.us_state_code = :state!)\nAND (meta.mcity = :city!\n    OR meta.lcity = :city!\n    OR cities.name = :city!)\nLIMIT :limit!::int OFFSET :offset!::int","loc":{"a":1264,"b":1976,"line":53,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     approved AS is_approved,
 *     partner AS is_partner,
 *     meta.mzip AS zip_code,
 *     COALESCE(meta.sch_name, schools.name) AS name_stored,
 *     COALESCE(meta.st, cities.us_state_code) AS state_stored,
 *     COALESCE(meta.lcity, cities.name) AS city_name_stored,
 *     schools.id,
 *     schools.created_at,
 *     schools.updated_at
 * FROM
 *     schools
 *     LEFT JOIN cities ON schools.city_id = cities.id
 *     LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id
 * WHERE (schools.name = :name!
 *     OR meta.sch_name = :name!)
 * AND (meta.st = :state!
 *     OR cities.us_state_code = :state!)
 * AND (meta.mcity = :city!
 *     OR meta.lcity = :city!
 *     OR cities.name = :city!)
 * LIMIT :limit!::int OFFSET :offset!::int
 * ```
 */
export const getSchools = new PreparedQuery<IGetSchoolsParams,IGetSchoolsResult>(getSchoolsIR);


/** 'CreateSchoolMetaData' parameters type */
export interface ICreateSchoolMetaDataParams {
  zipCode: string;
}

/** 'CreateSchoolMetaData' return type */
export type ICreateSchoolMetaDataResult = void;

/** 'CreateSchoolMetaData' query type */
export interface ICreateSchoolMetaDataQuery {
  params: ICreateSchoolMetaDataParams;
  result: ICreateSchoolMetaDataResult;
}

const createSchoolMetaDataIR: any = {"name":"createSchoolMetaData","params":[{"name":"zipCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2073,"b":2080,"line":79,"col":13},{"a":2084,"b":2091,"line":79,"col":24}]}}],"usedParamSet":{"zipCode":true},"statement":{"body":"INSERT INTO school_nces_metadata (mzip, lzip)\n    VALUES (:zipCode!, :zipCode!)","loc":{"a":2014,"b":2092,"line":78,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO school_nces_metadata (mzip, lzip)
 *     VALUES (:zipCode!, :zipCode!)
 * ```
 */
export const createSchoolMetaData = new PreparedQuery<ICreateSchoolMetaDataParams,ICreateSchoolMetaDataResult>(createSchoolMetaDataIR);


/** 'CreateCity' parameters type */
export interface ICreateCityParams {
  city: string;
}

/** 'CreateCity' return type */
export type ICreateCityResult = void;

/** 'CreateCity' query type */
export interface ICreateCityQuery {
  params: ICreateCityParams;
  result: ICreateCityResult;
}

const createCityIR: any = {"name":"createCity","params":[{"name":"city","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2183,"b":2187,"line":84,"col":13}]}}],"usedParamSet":{"city":true},"statement":{"body":"INSERT INTO cities (name, created_at, updated_at)\n    VALUES (:city!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING","loc":{"a":2120,"b":2229,"line":83,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO cities (name, created_at, updated_at)
 *     VALUES (:city!, NOW(), NOW())
 * ON CONFLICT
 *     DO NOTHING
 * ```
 */
export const createCity = new PreparedQuery<ICreateCityParams,ICreateCityResult>(createCityIR);


/** 'CreateSchool' parameters type */
export interface ICreateSchoolParams {
  cityId: number;
  id: string;
  isApproved: boolean;
  name: string;
}

/** 'CreateSchool' return type */
export interface ICreateSchoolResult {
  createdAt: Date;
  id: string;
  isApproved: boolean;
  isPartner: boolean;
  nameStored: string;
  updatedAt: Date;
}

/** 'CreateSchool' query type */
export interface ICreateSchoolQuery {
  params: ICreateSchoolParams;
  result: ICreateSchoolResult;
}

const createSchoolIR: any = {"name":"createSchool","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2346,"b":2348,"line":91,"col":13}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2352,"b":2356,"line":91,"col":19}]}},{"name":"isApproved","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2360,"b":2370,"line":91,"col":27}]}},{"name":"cityId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2374,"b":2380,"line":91,"col":41}]}}],"usedParamSet":{"id":true,"name":true,"isApproved":true,"cityId":true},"statement":{"body":"INSERT INTO schools (id, name, approved, city_id, created_at, updated_at)\n    VALUES (:id!, :name!, :isApproved!, :cityId!, NOW(), NOW())\nRETURNING\n    id, approved AS is_approved, partner AS is_partner, name AS name_stored, updated_at, created_at","loc":{"a":2259,"b":2505,"line":90,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO schools (id, name, approved, city_id, created_at, updated_at)
 *     VALUES (:id!, :name!, :isApproved!, :cityId!, NOW(), NOW())
 * RETURNING
 *     id, approved AS is_approved, partner AS is_partner, name AS name_stored, updated_at, created_at
 * ```
 */
export const createSchool = new PreparedQuery<ICreateSchoolParams,ICreateSchoolResult>(createSchoolIR);


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

const updateApprovalIR: any = {"name":"updateApproval","params":[{"name":"isApproved","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2576,"b":2586,"line":100,"col":16}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2628,"b":2636,"line":103,"col":10}]}}],"usedParamSet":{"isApproved":true,"schoolId":true},"statement":{"body":"UPDATE\n    schools\nSET\n    approved = :isApproved!,\n    updated_at = NOW()\nWHERE\n    id = :schoolId!","loc":{"a":2537,"b":2636,"line":97,"col":0}}};

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

const updateIsPartnerIR: any = {"name":"updateIsPartner","params":[{"name":"isPartner","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2707,"b":2716,"line":110,"col":15}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2758,"b":2766,"line":113,"col":10}]}}],"usedParamSet":{"isPartner":true,"schoolId":true},"statement":{"body":"UPDATE\n    schools\nSET\n    partner = :isPartner!,\n    updated_at = NOW()\nWHERE\n    id = :schoolId!","loc":{"a":2669,"b":2766,"line":107,"col":0}}};

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

const adminUpdateSchoolIR: any = {"name":"adminUpdateSchool","params":[{"name":"name","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2845,"b":2848,"line":120,"col":21}]}},{"name":"isApproved","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2891,"b":2900,"line":121,"col":25}]}},{"name":"cityId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2970,"b":2975,"line":123,"col":24}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3019,"b":3027,"line":125,"col":18}]}}],"usedParamSet":{"name":true,"isApproved":true,"cityId":true,"schoolId":true},"statement":{"body":"UPDATE\n    schools\nSET\n    name = COALESCE(:name, schools.name),\n    approved = COALESCE(:isApproved, schools.approved),\n    updated_at = NOW(),\n    city_id = COALESCE(:cityId, schools.city_id)\nWHERE\n    schools.id = :schoolId!","loc":{"a":2801,"b":3027,"line":117,"col":0}}};

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
  zipCode: string | null | void;
}

/** 'AdminUpdateSchoolMetaData' return type */
export type IAdminUpdateSchoolMetaDataResult = void;

/** 'AdminUpdateSchoolMetaData' query type */
export interface IAdminUpdateSchoolMetaDataQuery {
  params: IAdminUpdateSchoolMetaDataParams;
  result: IAdminUpdateSchoolMetaDataResult;
}

const adminUpdateSchoolMetaDataIR: any = {"name":"adminUpdateSchoolMetaData","params":[{"name":"zipCode","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3118,"b":3124,"line":132,"col":12},{"a":3139,"b":3145,"line":133,"col":12}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3194,"b":3202,"line":136,"col":17}]}}],"usedParamSet":{"zipCode":true,"schoolId":true},"statement":{"body":"UPDATE\n    school_nces_metadata\nSET\n    mzip = :zipCode,\n    lzip = :zipCode,\n    updated_at = NOW()\nWHERE\n    school_id = :schoolId!","loc":{"a":3070,"b":3202,"line":129,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     school_nces_metadata
 * SET
 *     mzip = :zipCode,
 *     lzip = :zipCode,
 *     updated_at = NOW()
 * WHERE
 *     school_id = :schoolId!
 * ```
 */
export const adminUpdateSchoolMetaData = new PreparedQuery<IAdminUpdateSchoolMetaDataParams,IAdminUpdateSchoolMetaDataResult>(adminUpdateSchoolMetaDataIR);


/** 'SchoolSearch' parameters type */
export interface ISchoolSearchParams {
  query: string;
}

/** 'SchoolSearch' return type */
export interface ISchoolSearchResult {
  cityNameStored: string | null;
  createdAt: Date;
  districtNameStored: string | null;
  id: string;
  isApproved: boolean;
  isPartner: boolean;
  nameStored: string | null;
  stateStored: string | null;
  updatedAt: Date;
}

/** 'SchoolSearch' query type */
export interface ISchoolSearchQuery {
  params: ISchoolSearchParams;
  result: ISchoolSearchResult;
}

const schoolSearchIR: any = {"name":"schoolSearch","params":[{"name":"query","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3755,"b":3760,"line":155,"col":30}]}}],"usedParamSet":{"query":true},"statement":{"body":"SELECT\n    schools.id,\n    COALESCE(meta.sch_name, schools.name) AS name_stored,\n    COALESCE(meta.st, cities.us_state_code) AS state_stored,\n    COALESCE(meta.lcity, cities.name) AS city_name_stored,\n    meta.lea_name AS district_name_stored,\n    schools.created_at,\n    schools.updated_at,\n    approved AS is_approved,\n    partner AS is_partner\nFROM\n    schools\n    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id\n    LEFT JOIN cities ON schools.city_id = cities.id\nWHERE\n    schools.name LIKE '%' || :query! || '%'\nLIMIT 100","loc":{"a":3232,"b":3777,"line":140,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     schools.id,
 *     COALESCE(meta.sch_name, schools.name) AS name_stored,
 *     COALESCE(meta.st, cities.us_state_code) AS state_stored,
 *     COALESCE(meta.lcity, cities.name) AS city_name_stored,
 *     meta.lea_name AS district_name_stored,
 *     schools.created_at,
 *     schools.updated_at,
 *     approved AS is_approved,
 *     partner AS is_partner
 * FROM
 *     schools
 *     LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id
 *     LEFT JOIN cities ON schools.city_id = cities.id
 * WHERE
 *     schools.name LIKE '%' || :query! || '%'
 * LIMIT 100
 * ```
 */
export const schoolSearch = new PreparedQuery<ISchoolSearchParams,ISchoolSearchResult>(schoolSearchIR);


