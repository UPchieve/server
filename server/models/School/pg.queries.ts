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

const findSchoolByUpchieveIdIR: any = {"name":"findSchoolByUpchieveId","params":[{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":699,"b":707,"line":30,"col":18}]}}],"usedParamSet":{"schoolId":true},"statement":{"body":"SELECT\n    schools.id,\n    schools.name AS name_stored,\n    schools.us_state_code AS state_stored,\n    approved AS is_approved,\n    partner AS is_partner,\n    schools.created_at,\n    schools.updated_at,\n    cities.name AS city_name_stored,\n    meta.fipst,\n    meta.school_year,\n    meta.sch_name,\n    meta.lea_name,\n    meta.st,\n    meta.st_schid,\n    meta.mcity,\n    meta.mzip,\n    meta.lcity,\n    meta.lzip,\n    meta.g_9_offered,\n    meta.g_10_offered,\n    meta.g_11_offered,\n    meta.g_12_offered\nFROM\n    schools\n    LEFT JOIN cities ON schools.city_id = cities.id\n    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id\nWHERE\n    schools.id = :schoolId!","loc":{"a":35,"b":707,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     schools.id,
 *     schools.name AS name_stored,
 *     schools.us_state_code AS state_stored,
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

const getSchoolIR: any = {"name":"getSchool","params":[{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1230,"b":1238,"line":49,"col":18}]}}],"usedParamSet":{"schoolId":true},"statement":{"body":"SELECT\n    approved AS is_approved,\n    partner AS is_partner,\n    meta.mzip AS zip_code,\n    COALESCE(meta.sch_name, schools.name) AS name_stored,\n    COALESCE(meta.st, schools.us_state_code) AS state_stored,\n    COALESCE(meta.lcity, cities.name) AS city_name_stored,\n    schools.id,\n    schools.created_at,\n    schools.updated_at\nFROM\n    schools\n    LEFT JOIN cities ON schools.city_id = cities.id\n    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id\nWHERE\n    schools.id = :schoolId!","loc":{"a":734,"b":1238,"line":34,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     approved AS is_approved,
 *     partner AS is_partner,
 *     meta.mzip AS zip_code,
 *     COALESCE(meta.sch_name, schools.name) AS name_stored,
 *     COALESCE(meta.st, schools.us_state_code) AS state_stored,
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
  limit: string;
  name: string;
  offset: string;
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

const getSchoolsIR: any = {"name":"getSchools","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1761,"b":1765,"line":67,"col":23},{"a":1791,"b":1795,"line":68,"col":24}]}},{"name":"state","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1814,"b":1819,"line":69,"col":16},{"a":1853,"b":1858,"line":70,"col":32}]}},{"name":"city","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1880,"b":1884,"line":71,"col":19},{"a":1907,"b":1911,"line":72,"col":21},{"a":1935,"b":1939,"line":73,"col":22}]}},{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1949,"b":1954,"line":74,"col":7}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1964,"b":1970,"line":74,"col":22}]}}],"usedParamSet":{"name":true,"state":true,"city":true,"limit":true,"offset":true},"statement":{"body":"SELECT\n    approved AS is_approved,\n    partner AS is_partner,\n    meta.mzip AS zip_code,\n    COALESCE(meta.sch_name, schools.name) AS name_stored,\n    COALESCE(meta.st, schools.us_state_code) AS state_stored,\n    COALESCE(meta.lcity, cities.name) AS city_name_stored,\n    schools.id,\n    schools.created_at,\n    schools.updated_at\nFROM\n    schools\n    LEFT JOIN cities ON schools.city_id = cities.id\n    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id\nWHERE (schools.name = :name!\n    OR meta.sch_name = :name!)\nAND (meta.st = :state!\n    OR schools.us_state_code = :state!)\nAND (meta.mcity = :city!\n    OR meta.lcity = :city!\n    OR cities.name = :city!)\nLIMIT :limit! OFFSET :offset!","loc":{"a":1266,"b":1970,"line":53,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     approved AS is_approved,
 *     partner AS is_partner,
 *     meta.mzip AS zip_code,
 *     COALESCE(meta.sch_name, schools.name) AS name_stored,
 *     COALESCE(meta.st, schools.us_state_code) AS state_stored,
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
 *     OR schools.us_state_code = :state!)
 * AND (meta.mcity = :city!
 *     OR meta.lcity = :city!
 *     OR cities.name = :city!)
 * LIMIT :limit! OFFSET :offset!
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

const createSchoolMetaDataIR: any = {"name":"createSchoolMetaData","params":[{"name":"zipCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2067,"b":2074,"line":79,"col":13},{"a":2078,"b":2085,"line":79,"col":24}]}}],"usedParamSet":{"zipCode":true},"statement":{"body":"INSERT INTO school_nces_metadata (mzip, lzip)\n    VALUES (:zipCode!, :zipCode!)","loc":{"a":2008,"b":2086,"line":78,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO school_nces_metadata (mzip, lzip)
 *     VALUES (:zipCode!, :zipCode!)
 * ```
 */
export const createSchoolMetaData = new PreparedQuery<ICreateSchoolMetaDataParams,ICreateSchoolMetaDataResult>(createSchoolMetaDataIR);


/** 'CreateSchool' parameters type */
export interface ICreateSchoolParams {
  city: string;
  isApproved: boolean;
  name: string;
  state: string;
}

/** 'CreateSchool' return type */
export interface ICreateSchoolResult {
  createdAt: Date;
  id: string;
  isApproved: boolean;
  isPartner: boolean;
  nameStored: string;
  stateStored: string | null;
  updatedAt: Date;
}

/** 'CreateSchool' query type */
export interface ICreateSchoolQuery {
  params: ICreateSchoolParams;
  result: ICreateSchoolResult;
}

const createSchoolIR: any = {"name":"createSchool","params":[{"name":"city","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2174,"b":2178,"line":85,"col":17}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2316,"b":2320,"line":90,"col":9}]}},{"name":"isApproved","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2332,"b":2342,"line":91,"col":9}]}},{"name":"state","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2354,"b":2359,"line":92,"col":9}]}}],"usedParamSet":{"city":true,"name":true,"isApproved":true,"state":true},"statement":{"body":"WITH city AS (\nINSERT INTO cities (name)\n        VALUES (:city!)\n    RETURNING\n        id)\n    INSERT INTO schools (name, approved, us_state_code, created_at, updated_at, city_id)\n    SELECT\n        :name!,\n        :isApproved!,\n        :state!,\n        NOW(),\n        NOW(),\n        city.id\n    FROM\n        city\n    RETURNING\n        id,\n        approved AS is_approved,\n        partner AS is_partner,\n        name AS name_stored,\n        updated_at,\n        created_at,\n        us_state_code AS state_stored","loc":{"a":2116,"b":2625,"line":83,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH city AS (
 * INSERT INTO cities (name)
 *         VALUES (:city!)
 *     RETURNING
 *         id)
 *     INSERT INTO schools (name, approved, us_state_code, created_at, updated_at, city_id)
 *     SELECT
 *         :name!,
 *         :isApproved!,
 *         :state!,
 *         NOW(),
 *         NOW(),
 *         city.id
 *     FROM
 *         city
 *     RETURNING
 *         id,
 *         approved AS is_approved,
 *         partner AS is_partner,
 *         name AS name_stored,
 *         updated_at,
 *         created_at,
 *         us_state_code AS state_stored
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

const updateApprovalIR: any = {"name":"updateApproval","params":[{"name":"isApproved","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2696,"b":2706,"line":112,"col":16}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2748,"b":2756,"line":115,"col":10}]}}],"usedParamSet":{"isApproved":true,"schoolId":true},"statement":{"body":"UPDATE\n    schools\nSET\n    approved = :isApproved!,\n    updated_at = NOW()\nWHERE\n    id = :schoolId!","loc":{"a":2657,"b":2756,"line":109,"col":0}}};

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

const updateIsPartnerIR: any = {"name":"updateIsPartner","params":[{"name":"isPartner","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2827,"b":2836,"line":122,"col":15}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2878,"b":2886,"line":125,"col":10}]}}],"usedParamSet":{"isPartner":true,"schoolId":true},"statement":{"body":"UPDATE\n    schools\nSET\n    partner = :isPartner!,\n    updated_at = NOW()\nWHERE\n    id = :schoolId!","loc":{"a":2789,"b":2886,"line":119,"col":0}}};

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
  city: string | null | void;
  isApproved: boolean | null | void;
  name: string | null | void;
  schoolId: string;
  state: string | null | void;
}

/** 'AdminUpdateSchool' return type */
export type IAdminUpdateSchoolResult = void;

/** 'AdminUpdateSchool' query type */
export interface IAdminUpdateSchoolQuery {
  params: IAdminUpdateSchoolParams;
  result: IAdminUpdateSchoolResult;
}

const adminUpdateSchoolIR: any = {"name":"adminUpdateSchool","params":[{"name":"city","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2981,"b":2984,"line":132,"col":9},{"a":3144,"b":3147,"line":140,"col":31},{"a":3454,"b":3457,"line":153,"col":23}]}},{"name":"name","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3195,"b":3198,"line":144,"col":21}]}},{"name":"isApproved","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3241,"b":3250,"line":145,"col":25}]}},{"name":"state","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3302,"b":3306,"line":146,"col":30}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3421,"b":3429,"line":152,"col":18}]}}],"usedParamSet":{"city":true,"name":true,"isApproved":true,"state":true,"schoolId":true},"statement":{"body":"WITH ins AS (\nINSERT INTO cities (name)\n    SELECT\n        :city\n    WHERE\n        NOT EXISTS (\n            SELECT\n                id\n            FROM\n                cities\n            WHERE\n                cities.name = :city))\nUPDATE\n    schools\nSET\n    name = COALESCE(:name, schools.name),\n    approved = COALESCE(:isApproved, schools.approved),\n    us_state_code = COALESCE(:state, schools.us_state_code),\n    updated_at = NOW(),\n    city_id = cities.id\nFROM\n    cities\nWHERE\n    schools.id = :schoolId!\n    AND cities.name = :city","loc":{"a":2921,"b":3457,"line":129,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS (
 * INSERT INTO cities (name)
 *     SELECT
 *         :city
 *     WHERE
 *         NOT EXISTS (
 *             SELECT
 *                 id
 *             FROM
 *                 cities
 *             WHERE
 *                 cities.name = :city))
 * UPDATE
 *     schools
 * SET
 *     name = COALESCE(:name, schools.name),
 *     approved = COALESCE(:isApproved, schools.approved),
 *     us_state_code = COALESCE(:state, schools.us_state_code),
 *     updated_at = NOW(),
 *     city_id = cities.id
 * FROM
 *     cities
 * WHERE
 *     schools.id = :schoolId!
 *     AND cities.name = :city
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

const adminUpdateSchoolMetaDataIR: any = {"name":"adminUpdateSchoolMetaData","params":[{"name":"zipCode","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3548,"b":3554,"line":160,"col":12},{"a":3569,"b":3575,"line":161,"col":12}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3624,"b":3632,"line":164,"col":17}]}}],"usedParamSet":{"zipCode":true,"schoolId":true},"statement":{"body":"UPDATE\n    school_nces_metadata\nSET\n    mzip = :zipCode,\n    lzip = :zipCode,\n    updated_at = NOW()\nWHERE\n    school_id = :schoolId!","loc":{"a":3500,"b":3632,"line":157,"col":0}}};

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


