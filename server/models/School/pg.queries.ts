/** Types generated for queries found in "server/models/School/school.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** Query 'FindSchoolById' is invalid, so its result is assigned type 'never' */
export type IFindSchoolByIdResult = never;

/** Query 'FindSchoolById' is invalid, so its parameters are assigned type 'never' */
export type IFindSchoolByIdParams = never;

const findSchoolByIdIR: any = {"name":"findSchoolById","params":[{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":310,"b":318,"line":15,"col":10}]}}],"usedParamSet":{"schoolId":true},"statement":{"body":"SELECT\n    id,\n    name AS name_stored,\n    approved AS is_approved,\n    partner AS is_partner,\n    us_state_code AS state_stored,\n    created_at,\n    updated_at\n    cities.name AS city_name_stored\nFROM\n    schools\n    LEFT JOIN cities ON cities.id = schools.city_id\nWHERE\n    id = :schoolId!","loc":{"a":27,"b":318,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     name AS name_stored,
 *     approved AS is_approved,
 *     partner AS is_partner,
 *     us_state_code AS state_stored,
 *     created_at,
 *     updated_at
 *     cities.name AS city_name_stored
 * FROM
 *     schools
 *     LEFT JOIN cities ON cities.id = schools.city_id
 * WHERE
 *     id = :schoolId!
 * ```
 */
export const findSchoolById = new PreparedQuery<IFindSchoolByIdParams,IFindSchoolByIdResult>(findSchoolByIdIR);


