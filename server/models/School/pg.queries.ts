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


