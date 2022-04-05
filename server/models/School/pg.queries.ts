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
  city: string | null | void;
  limit: number;
  name: string | null | void;
  offset: number;
  state: string | null | void;
}

/** 'GetSchools' return type */
export interface IGetSchoolsResult {
  city: string | null;
  createdAt: Date;
  id: string;
  isApproved: boolean;
  isPartner: boolean;
  name: string | null;
  state: string | null;
  updatedAt: Date;
  zipCode: string | null;
}

/** 'GetSchools' query type */
export interface IGetSchoolsQuery {
  params: IGetSchoolsParams;
  result: IGetSchoolsResult;
}

const getSchoolsIR: any = {"name":"getSchools","params":[{"name":"name","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1724,"b":1727,"line":67,"col":8},{"a":1777,"b":1780,"line":68,"col":31},{"a":1824,"b":1827,"line":69,"col":35}]}},{"name":"state","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1843,"b":1847,"line":70,"col":6},{"a":1885,"b":1889,"line":71,"col":19},{"a":1926,"b":1930,"line":72,"col":35}]}},{"name":"city","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1939,"b":1942,"line":73,"col":6},{"a":1990,"b":1993,"line":74,"col":29},{"a":2034,"b":2037,"line":75,"col":32},{"a":2079,"b":2082,"line":76,"col":33}]}},{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2099,"b":2104,"line":77,"col":7}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2119,"b":2125,"line":77,"col":27}]}}],"usedParamSet":{"name":true,"state":true,"city":true,"limit":true,"offset":true},"statement":{"body":"SELECT\n    approved AS is_approved,\n    partner AS is_partner,\n    meta.mzip AS zip_code,\n    COALESCE(meta.sch_name, schools.name) AS name,\n    COALESCE(meta.st, cities.us_state_code) AS state,\n    COALESCE(meta.lcity, cities.name) AS city,\n    schools.id as _id,\n    schools.created_at,\n    schools.updated_at\nFROM\n    schools\n    LEFT JOIN cities ON schools.city_id = cities.id\n    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id\nWHERE (:name::text is null OR\n    schools.name ILIKE '%' || :name || '%'\n    OR meta.sch_name ILIKE '%' || :name || '%')\nAND (:state::text is null OR\n    meta.st ILIKE :state\n    OR cities.us_state_code ILIKE :state)\nAND (:city::text is null OR\n    meta.mcity ILIKE '%' || :city || '%'\n    OR meta.lcity ILIKE '%' || :city || '%'\n    OR cities.name ILIKE '%' || :city || '%')\nLIMIT :limit!::int OFFSET :offset!::int","loc":{"a":1264,"b":2130,"line":53,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     approved AS is_approved,
 *     partner AS is_partner,
 *     meta.mzip AS zip_code,
 *     COALESCE(meta.sch_name, schools.name) AS name,
 *     COALESCE(meta.st, cities.us_state_code) AS state,
 *     COALESCE(meta.lcity, cities.name) AS city,
 *     schools.id as _id,
 *     schools.created_at,
 *     schools.updated_at
 * FROM
 *     schools
 *     LEFT JOIN cities ON schools.city_id = cities.id
 *     LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id
 * WHERE (:name::text is null OR
 *     schools.name ILIKE '%' || :name || '%'
 *     OR meta.sch_name ILIKE '%' || :name || '%')
 * AND (:state::text is null OR
 *     meta.st ILIKE :state
 *     OR cities.us_state_code ILIKE :state)
 * AND (:city::text is null OR
 *     meta.mcity ILIKE '%' || :city || '%'
 *     OR meta.lcity ILIKE '%' || :city || '%'
 *     OR cities.name ILIKE '%' || :city || '%')
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

const createSchoolMetaDataIR: any = {"name":"createSchoolMetaData","params":[{"name":"zipCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2227,"b":2234,"line":82,"col":13},{"a":2238,"b":2245,"line":82,"col":24}]}}],"usedParamSet":{"zipCode":true},"statement":{"body":"INSERT INTO school_nces_metadata (mzip, lzip)\n    VALUES (:zipCode!, :zipCode!)","loc":{"a":2168,"b":2246,"line":81,"col":0}}};

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

const createCityIR: any = {"name":"createCity","params":[{"name":"city","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2337,"b":2341,"line":87,"col":13}]}}],"usedParamSet":{"city":true},"statement":{"body":"INSERT INTO cities (name, created_at, updated_at)\n    VALUES (:city!, NOW(), NOW())\nON CONFLICT\n    DO NOTHING","loc":{"a":2274,"b":2383,"line":86,"col":0}}};

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

const createSchoolIR: any = {"name":"createSchool","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2500,"b":2502,"line":94,"col":13}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2506,"b":2510,"line":94,"col":19}]}},{"name":"isApproved","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2514,"b":2524,"line":94,"col":27}]}},{"name":"cityId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2528,"b":2534,"line":94,"col":41}]}}],"usedParamSet":{"id":true,"name":true,"isApproved":true,"cityId":true},"statement":{"body":"INSERT INTO schools (id, name, approved, city_id, created_at, updated_at)\n    VALUES (:id!, :name!, :isApproved!, :cityId!, NOW(), NOW())\nRETURNING\n    id, approved AS is_approved, partner AS is_partner, name AS name_stored, updated_at, created_at","loc":{"a":2413,"b":2659,"line":93,"col":0}}};

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

const updateApprovalIR: any = {"name":"updateApproval","params":[{"name":"isApproved","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2730,"b":2740,"line":103,"col":16}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2782,"b":2790,"line":106,"col":10}]}}],"usedParamSet":{"isApproved":true,"schoolId":true},"statement":{"body":"UPDATE\n    schools\nSET\n    approved = :isApproved!,\n    updated_at = NOW()\nWHERE\n    id = :schoolId!","loc":{"a":2691,"b":2790,"line":100,"col":0}}};

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

const updateIsPartnerIR: any = {"name":"updateIsPartner","params":[{"name":"isPartner","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2861,"b":2870,"line":113,"col":15}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2912,"b":2920,"line":116,"col":10}]}}],"usedParamSet":{"isPartner":true,"schoolId":true},"statement":{"body":"UPDATE\n    schools\nSET\n    partner = :isPartner!,\n    updated_at = NOW()\nWHERE\n    id = :schoolId!","loc":{"a":2823,"b":2920,"line":110,"col":0}}};

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

const adminUpdateSchoolIR: any = {"name":"adminUpdateSchool","params":[{"name":"name","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2999,"b":3002,"line":123,"col":21}]}},{"name":"isApproved","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3045,"b":3054,"line":124,"col":25}]}},{"name":"cityId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3124,"b":3129,"line":126,"col":24}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3173,"b":3181,"line":128,"col":18}]}}],"usedParamSet":{"name":true,"isApproved":true,"cityId":true,"schoolId":true},"statement":{"body":"UPDATE\n    schools\nSET\n    name = COALESCE(:name, schools.name),\n    approved = COALESCE(:isApproved, schools.approved),\n    updated_at = NOW(),\n    city_id = COALESCE(:cityId, schools.city_id)\nWHERE\n    schools.id = :schoolId!","loc":{"a":2955,"b":3181,"line":120,"col":0}}};

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

const adminUpdateSchoolMetaDataIR: any = {"name":"adminUpdateSchoolMetaData","params":[{"name":"zipCode","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3272,"b":3278,"line":135,"col":12},{"a":3293,"b":3299,"line":136,"col":12}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3348,"b":3356,"line":139,"col":17}]}}],"usedParamSet":{"zipCode":true,"schoolId":true},"statement":{"body":"UPDATE\n    school_nces_metadata\nSET\n    mzip = :zipCode,\n    lzip = :zipCode,\n    updated_at = NOW()\nWHERE\n    school_id = :schoolId!","loc":{"a":3224,"b":3356,"line":132,"col":0}}};

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

const schoolSearchIR: any = {"name":"schoolSearch","params":[{"name":"query","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3910,"b":3915,"line":158,"col":31}]}}],"usedParamSet":{"query":true},"statement":{"body":"SELECT\n    schools.id,\n    COALESCE(meta.sch_name, schools.name) AS name_stored,\n    COALESCE(meta.st, cities.us_state_code) AS state_stored,\n    COALESCE(meta.lcity, cities.name) AS city_name_stored,\n    meta.lea_name AS district_name_stored,\n    schools.created_at,\n    schools.updated_at,\n    approved AS is_approved,\n    partner AS is_partner\nFROM\n    schools\n    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id\n    LEFT JOIN cities ON schools.city_id = cities.id\nWHERE\n    schools.name ILIKE '%' || :query! || '%'\nLIMIT 100","loc":{"a":3386,"b":3932,"line":143,"col":0}}};

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
 *     schools.name ILIKE '%' || :query! || '%'
 * LIMIT 100
 * ```
 */
export const schoolSearch = new PreparedQuery<ISchoolSearchParams,ISchoolSearchResult>(schoolSearchIR);


