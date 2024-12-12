/** Types generated for queries found in "server/models/IneligibleStudent/ineligible_student.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetIneligibleStudentByEmail' parameters type */
export interface IGetIneligibleStudentByEmailParams {
  email: string;
}

/** 'GetIneligibleStudentByEmail' return type */
export interface IGetIneligibleStudentByEmailResult {
  createdAt: Date;
  currentGrade: string;
  email: string;
  id: string;
  ipAddress: string;
  school: string | null;
  updatedAt: Date;
  zipCode: string | null;
}

/** 'GetIneligibleStudentByEmail' query type */
export interface IGetIneligibleStudentByEmailQuery {
  params: IGetIneligibleStudentByEmailParams;
  result: IGetIneligibleStudentByEmailResult;
}

const getIneligibleStudentByEmailIR: any = {"name":"getIneligibleStudentByEmail","params":[{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":499,"b":504,"line":16,"col":13}]}}],"usedParamSet":{"email":true},"statement":{"body":"SELECT\n    ineligible_students.id,\n    email,\n    postal_code AS zip_code,\n    ip_addresses.ip AS ip_address,\n    school_id AS school,\n    grade_levels.name AS current_grade,\n    ineligible_students.created_at,\n    ineligible_students.updated_at\nFROM\n    ineligible_students\n    LEFT JOIN ip_addresses ON ineligible_students.ip_address_id = ip_addresses.id\n    LEFT JOIN grade_levels ON ineligible_students.grade_level_id = grade_levels.id\nWHERE\n    email = :email!","loc":{"a":40,"b":504,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     ineligible_students.id,
 *     email,
 *     postal_code AS zip_code,
 *     ip_addresses.ip AS ip_address,
 *     school_id AS school,
 *     grade_levels.name AS current_grade,
 *     ineligible_students.created_at,
 *     ineligible_students.updated_at
 * FROM
 *     ineligible_students
 *     LEFT JOIN ip_addresses ON ineligible_students.ip_address_id = ip_addresses.id
 *     LEFT JOIN grade_levels ON ineligible_students.grade_level_id = grade_levels.id
 * WHERE
 *     email = :email!
 * ```
 */
export const getIneligibleStudentByEmail = new PreparedQuery<IGetIneligibleStudentByEmailParams,IGetIneligibleStudentByEmailResult>(getIneligibleStudentByEmailIR);


/** 'InsertIneligibleStudent' parameters type */
export interface IInsertIneligibleStudentParams {
  email: string;
  gradeLevel: string | null | void;
  id: string;
  ip: string | null | void;
  postalCode: string | null | void;
  referredBy: string | null | void;
  schoolId: string | null | void;
}

/** 'InsertIneligibleStudent' return type */
export interface IInsertIneligibleStudentResult {
  ok: string;
}

/** 'InsertIneligibleStudent' query type */
export interface IInsertIneligibleStudentQuery {
  params: IInsertIneligibleStudentParams;
  result: IInsertIneligibleStudentResult;
}

const insertIneligibleStudentIR: any = {"name":"insertIneligibleStudent","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":730,"b":732,"line":25,"col":5}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":740,"b":745,"line":26,"col":5}]}},{"name":"postalCode","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":753,"b":762,"line":27,"col":5}]}},{"name":"schoolId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":791,"b":798,"line":29,"col":5},{"a":1047,"b":1054,"line":40,"col":21}]}},{"name":"referredBy","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":827,"b":836,"line":31,"col":5}]}},{"name":"gradeLevel","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":925,"b":934,"line":36,"col":51}]}},{"name":"ip","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":985,"b":986,"line":37,"col":49}]}}],"usedParamSet":{"id":true,"email":true,"postalCode":true,"schoolId":true,"referredBy":true,"gradeLevel":true,"ip":true},"statement":{"body":"WITH TEMP AS (\n    SELECT\n        1)\nINSERT INTO ineligible_students (id, email, postal_code, ip_address_id, school_id, grade_level_id, referred_by, created_at, updated_at)\nSELECT\n    :id!,\n    :email!,\n    :postalCode,\n    ip_addresses.id,\n    :schoolId,\n    grade_levels.id,\n    :referredBy,\n    NOW(),\n    NOW()\nFROM\n    TEMP\n    LEFT JOIN grade_levels ON grade_levels.name = :gradeLevel\n    LEFT JOIN ip_addresses ON ip_addresses.ip = :ip\nON CONFLICT (email)\n    DO UPDATE SET\n        school_id = :schoolId\n    RETURNING\n        id AS ok","loc":{"a":545,"b":1085,"line":20,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH TEMP AS (
 *     SELECT
 *         1)
 * INSERT INTO ineligible_students (id, email, postal_code, ip_address_id, school_id, grade_level_id, referred_by, created_at, updated_at)
 * SELECT
 *     :id!,
 *     :email!,
 *     :postalCode,
 *     ip_addresses.id,
 *     :schoolId,
 *     grade_levels.id,
 *     :referredBy,
 *     NOW(),
 *     NOW()
 * FROM
 *     TEMP
 *     LEFT JOIN grade_levels ON grade_levels.name = :gradeLevel
 *     LEFT JOIN ip_addresses ON ip_addresses.ip = :ip
 * ON CONFLICT (email)
 *     DO UPDATE SET
 *         school_id = :schoolId
 *     RETURNING
 *         id AS ok
 * ```
 */
export const insertIneligibleStudent = new PreparedQuery<IInsertIneligibleStudentParams,IInsertIneligibleStudentResult>(insertIneligibleStudentIR);


/** 'GetIneligibleStudentsPaginated' parameters type */
export interface IGetIneligibleStudentsPaginatedParams {
  limit: number;
  offset: number;
}

/** 'GetIneligibleStudentsPaginated' return type */
export interface IGetIneligibleStudentsPaginatedResult {
  createdAt: Date;
  email: string;
  ipAddress: string;
  isApproved: boolean;
  medianIncome: number | null;
  schoolCity: string;
  schoolId: string | null;
  schoolName: string;
  schoolState: string | null;
  schoolZipCode: string | null;
  updatedAt: Date;
  zipCode: string | null;
}

/** 'GetIneligibleStudentsPaginated' query type */
export interface IGetIneligibleStudentsPaginatedQuery {
  params: IGetIneligibleStudentsPaginatedParams;
  result: IGetIneligibleStudentsPaginatedResult;
}

const getIneligibleStudentsPaginatedIR: any = {"name":"getIneligibleStudentsPaginated","params":[{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1893,"b":1898,"line":67,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1915,"b":1921,"line":67,"col":30}]}}],"usedParamSet":{"limit":true,"offset":true},"statement":{"body":"SELECT\n    email,\n    postal_code AS zip_code,\n    ip_addresses.ip AS ip_address,\n    school_id,\n    schools.name AS school_name,\n    cities.us_state_code AS school_state,\n    cities.name AS school_city,\n    postal_code AS school_zip_code,\n    schools.approved AS is_approved,\n    postal_codes.income AS median_income,\n    ineligible_students.created_at,\n    ineligible_students.updated_at\nFROM\n    ineligible_students\n    LEFT JOIN ip_addresses ON ineligible_students.ip_address_id = ip_addresses.id\n    LEFT JOIN postal_codes ON ineligible_students.postal_code = postal_codes.code\n    LEFT JOIN schools ON ineligible_students.school_id = schools.id\n    LEFT JOIN cities ON schools.city_id = cities.id\nORDER BY\n    ineligible_students.created_at DESC\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":1133,"b":1927,"line":46,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     email,
 *     postal_code AS zip_code,
 *     ip_addresses.ip AS ip_address,
 *     school_id,
 *     schools.name AS school_name,
 *     cities.us_state_code AS school_state,
 *     cities.name AS school_city,
 *     postal_code AS school_zip_code,
 *     schools.approved AS is_approved,
 *     postal_codes.income AS median_income,
 *     ineligible_students.created_at,
 *     ineligible_students.updated_at
 * FROM
 *     ineligible_students
 *     LEFT JOIN ip_addresses ON ineligible_students.ip_address_id = ip_addresses.id
 *     LEFT JOIN postal_codes ON ineligible_students.postal_code = postal_codes.code
 *     LEFT JOIN schools ON ineligible_students.school_id = schools.id
 *     LEFT JOIN cities ON schools.city_id = cities.id
 * ORDER BY
 *     ineligible_students.created_at DESC
 * LIMIT (:limit!)::int OFFSET (:offset!)::int
 * ```
 */
export const getIneligibleStudentsPaginated = new PreparedQuery<IGetIneligibleStudentsPaginatedParams,IGetIneligibleStudentsPaginatedResult>(getIneligibleStudentsPaginatedIR);


/** 'DeleteIneligibleStudent' parameters type */
export interface IDeleteIneligibleStudentParams {
  email: string;
}

/** 'DeleteIneligibleStudent' return type */
export type IDeleteIneligibleStudentResult = void;

/** 'DeleteIneligibleStudent' query type */
export interface IDeleteIneligibleStudentQuery {
  params: IDeleteIneligibleStudentParams;
  result: IDeleteIneligibleStudentResult;
}

const deleteIneligibleStudentIR: any = {"name":"deleteIneligibleStudent","params":[{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2015,"b":2020,"line":72,"col":15}]}}],"usedParamSet":{"email":true},"statement":{"body":"DELETE FROM ineligible_students\nWHERE email = :email!","loc":{"a":1968,"b":2020,"line":71,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM ineligible_students
 * WHERE email = :email!
 * ```
 */
export const deleteIneligibleStudent = new PreparedQuery<IDeleteIneligibleStudentParams,IDeleteIneligibleStudentResult>(deleteIneligibleStudentIR);


