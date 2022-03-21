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
  city: string | null;
  isApproved: boolean;
  isPartner: boolean;
  name: string | null;
  state: string | null;
  zipCode: string | null;
}

/** 'GetSchool' query type */
export interface IGetSchoolQuery {
  params: IGetSchoolParams;
  result: IGetSchoolResult;
}

const getSchoolIR: any = {"name":"getSchool","params":[{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1140,"b":1148,"line":46,"col":18}]}}],"usedParamSet":{"schoolId":true},"statement":{"body":"SELECT\n    approved AS is_approved,\n    partner AS is_partner,\n    meta.mzip AS zip_code,\n    COALESCE(meta.sch_name, schools.name) AS name,\n    COALESCE(meta.st, schools.us_state_code) AS state,\n    COALESCE(meta.lcity, cities.name) AS city\nFROM\n    schools\n    LEFT JOIN cities ON schools.city_id = cities.id\n    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id\nWHERE\n    schools.id = :schoolId!","loc":{"a":734,"b":1148,"line":34,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     approved AS is_approved,
 *     partner AS is_partner,
 *     meta.mzip AS zip_code,
 *     COALESCE(meta.sch_name, schools.name) AS name,
 *     COALESCE(meta.st, schools.us_state_code) AS state,
 *     COALESCE(meta.lcity, cities.name) AS city
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
  city: string | null;
  isApproved: boolean;
  name: string | null;
  state: string | null;
  zipCode: string | null;
}

/** 'GetSchools' query type */
export interface IGetSchoolsQuery {
  params: IGetSchoolsParams;
  result: IGetSchoolsResult;
}

const getSchoolsIR: any = {"name":"getSchools","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1554,"b":1558,"line":60,"col":23},{"a":1584,"b":1588,"line":61,"col":24}]}},{"name":"state","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1607,"b":1612,"line":62,"col":16},{"a":1646,"b":1651,"line":63,"col":32}]}},{"name":"city","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1673,"b":1677,"line":64,"col":19},{"a":1700,"b":1704,"line":65,"col":21},{"a":1728,"b":1732,"line":66,"col":22}]}},{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1742,"b":1747,"line":67,"col":7}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1757,"b":1763,"line":67,"col":22}]}}],"usedParamSet":{"name":true,"state":true,"city":true,"limit":true,"offset":true},"statement":{"body":"SELECT\n    approved AS is_approved,\n    meta.mzip AS zip_code,\n    COALESCE(meta.sch_name, schools.name) AS name,\n    COALESCE(meta.st, schools.us_state_code) AS state,\n    COALESCE(meta.lcity, cities.name) AS city\nFROM\n    schools\n    LEFT JOIN cities ON schools.city_id = cities.id\n    LEFT JOIN school_nces_metadata meta ON schools.id = meta.school_id\nWHERE (schools.name = :name!\n    OR meta.sch_name = :name!)\nAND (meta.st = :state!\n    OR schools.us_state_code = :state!)\nAND (meta.mcity = :city!\n    OR meta.lcity = :city!\n    OR cities.name = :city!)\nLIMIT :limit! OFFSET :offset!","loc":{"a":1176,"b":1763,"line":50,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     approved AS is_approved,
 *     meta.mzip AS zip_code,
 *     COALESCE(meta.sch_name, schools.name) AS name,
 *     COALESCE(meta.st, schools.us_state_code) AS state,
 *     COALESCE(meta.lcity, cities.name) AS city
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

const createSchoolMetaDataIR: any = {"name":"createSchoolMetaData","params":[{"name":"zipCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1860,"b":1867,"line":72,"col":13},{"a":1871,"b":1878,"line":72,"col":24}]}}],"usedParamSet":{"zipCode":true},"statement":{"body":"INSERT INTO school_nces_metadata (mzip, lzip)\n    VALUES (:zipCode!, :zipCode!)","loc":{"a":1801,"b":1879,"line":71,"col":0}}};

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
export type ICreateSchoolResult = void;

/** 'CreateSchool' query type */
export interface ICreateSchoolQuery {
  params: ICreateSchoolParams;
  result: ICreateSchoolResult;
}

const createSchoolIR: any = {"name":"createSchool","params":[{"name":"city","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1967,"b":1971,"line":78,"col":17}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2109,"b":2113,"line":83,"col":9}]}},{"name":"isApproved","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2125,"b":2135,"line":84,"col":9}]}},{"name":"state","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2147,"b":2152,"line":85,"col":9}]}}],"usedParamSet":{"city":true,"name":true,"isApproved":true,"state":true},"statement":{"body":"WITH city AS (\nINSERT INTO cities (name)\n        VALUES (:city!)\n    RETURNING\n        id)\n    INSERT INTO schools (name, approved, us_state_code, created_at, updated_at, city_id)\n    SELECT\n        :name!,\n        :isApproved!,\n        :state!,\n        NOW(),\n        NOW(),\n        id\n    FROM\n        city","loc":{"a":1909,"b":2216,"line":76,"col":0}}};

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
 *         id
 *     FROM
 *         city
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

const updateApprovalIR: any = {"name":"updateApproval","params":[{"name":"isApproved","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2287,"b":2297,"line":97,"col":16}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2315,"b":2323,"line":99,"col":10}]}}],"usedParamSet":{"isApproved":true,"schoolId":true},"statement":{"body":"UPDATE\n    schools\nSET\n    approved = :isApproved!\nWHERE\n    id = :schoolId!","loc":{"a":2248,"b":2323,"line":94,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     schools
 * SET
 *     approved = :isApproved!
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

const updateIsPartnerIR: any = {"name":"updateIsPartner","params":[{"name":"isPartner","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2394,"b":2403,"line":106,"col":15}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2421,"b":2429,"line":108,"col":10}]}}],"usedParamSet":{"isPartner":true,"schoolId":true},"statement":{"body":"UPDATE\n    schools\nSET\n    partner = :isPartner!\nWHERE\n    id = :schoolId!","loc":{"a":2356,"b":2429,"line":103,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     schools
 * SET
 *     partner = :isPartner!
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

const adminUpdateSchoolIR: any = {"name":"adminUpdateSchool","params":[{"name":"name","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2540,"b":2543,"line":116,"col":16}]}},{"name":"isApproved","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2566,"b":2575,"line":117,"col":20}]}},{"name":"state","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2603,"b":2607,"line":118,"col":25}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2633,"b":2641,"line":120,"col":14}]}},{"name":"city","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2708,"b":2711,"line":126,"col":12}]}}],"usedParamSet":{"name":true,"isApproved":true,"state":true,"schoolId":true,"city":true},"statement":{"body":"WITH updated_school AS (\n    UPDATE\n        schools\n    SET\n        name = :name,\n        approved = :isApproved,\n        us_state_code = :state\n    WHERE\n        id = :schoolId!\n    RETURNING\n        city_id)\nUPDATE\n    cities\nSET\n    name = :city\nFROM\n    updated_school\nWHERE\n    cities.id = updated_school.city_id","loc":{"a":2464,"b":2780,"line":112,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH updated_school AS (
 *     UPDATE
 *         schools
 *     SET
 *         name = :name,
 *         approved = :isApproved,
 *         us_state_code = :state
 *     WHERE
 *         id = :schoolId!
 *     RETURNING
 *         city_id)
 * UPDATE
 *     cities
 * SET
 *     name = :city
 * FROM
 *     updated_school
 * WHERE
 *     cities.id = updated_school.city_id
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

const adminUpdateSchoolMetaDataIR: any = {"name":"adminUpdateSchoolMetaData","params":[{"name":"zipCode","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2871,"b":2877,"line":137,"col":12},{"a":2892,"b":2898,"line":138,"col":12}]}},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2923,"b":2931,"line":140,"col":17}]}}],"usedParamSet":{"zipCode":true,"schoolId":true},"statement":{"body":"UPDATE\n    school_nces_metadata\nSET\n    mzip = :zipCode,\n    lzip = :zipCode\nWHERE\n    school_id = :schoolId!","loc":{"a":2823,"b":2931,"line":134,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     school_nces_metadata
 * SET
 *     mzip = :zipCode,
 *     lzip = :zipCode
 * WHERE
 *     school_id = :schoolId!
 * ```
 */
export const adminUpdateSchoolMetaData = new PreparedQuery<IAdminUpdateSchoolMetaDataParams,IAdminUpdateSchoolMetaDataResult>(adminUpdateSchoolMetaDataIR);


