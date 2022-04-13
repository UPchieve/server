/** Types generated for queries found in "server/models/StudentPartnerOrg/student_partner_orgs.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type stringArray = (string)[];

/** 'GetStudentPartnerOrgForRegistrationByKey' parameters type */
export interface IGetStudentPartnerOrgForRegistrationByKeyParams {
  key: string;
}

/** 'GetStudentPartnerOrgForRegistrationByKey' return type */
export interface IGetStudentPartnerOrgForRegistrationByKeyResult {
  key: string;
  sites: stringArray | null;
}

/** 'GetStudentPartnerOrgForRegistrationByKey' query type */
export interface IGetStudentPartnerOrgForRegistrationByKeyQuery {
  params: IGetStudentPartnerOrgForRegistrationByKeyParams;
  result: IGetStudentPartnerOrgForRegistrationByKeyResult;
}

const getStudentPartnerOrgForRegistrationByKeyIR: any = {"name":"getStudentPartnerOrgForRegistrationByKey","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":243,"b":246,"line":9,"col":15}]}}],"usedParamSet":{"key":true},"statement":{"body":"SELECT\n    KEY,\n    ARRAY_AGG(spos.name) AS sites\nFROM\n    student_partner_orgs spo\n    LEFT JOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id\nWHERE\n    spo.key = :key!\nGROUP BY\n    spo.key","loc":{"a":53,"b":267,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     KEY,
 *     ARRAY_AGG(spos.name) AS sites
 * FROM
 *     student_partner_orgs spo
 *     LEFT JOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id
 * WHERE
 *     spo.key = :key!
 * GROUP BY
 *     spo.key
 * ```
 */
export const getStudentPartnerOrgForRegistrationByKey = new PreparedQuery<IGetStudentPartnerOrgForRegistrationByKeyParams,IGetStudentPartnerOrgForRegistrationByKeyResult>(getStudentPartnerOrgForRegistrationByKeyIR);


/** 'GetFullStudentPartnerOrgByKey' parameters type */
export interface IGetFullStudentPartnerOrgByKeyParams {
  key: string;
}

/** 'GetFullStudentPartnerOrgByKey' return type */
export interface IGetFullStudentPartnerOrgByKeyResult {
  collegeSignup: boolean | null;
  highSchoolSignup: boolean | null;
  key: string;
  schoolSignupRequired: boolean | null;
  signupCode: string | null;
  sites: stringArray | null;
}

/** 'GetFullStudentPartnerOrgByKey' query type */
export interface IGetFullStudentPartnerOrgByKeyQuery {
  params: IGetFullStudentPartnerOrgByKeyParams;
  result: IGetFullStudentPartnerOrgByKeyResult;
}

const getFullStudentPartnerOrgByKeyIR: any = {"name":"getFullStudentPartnerOrgByKey","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":715,"b":718,"line":26,"col":11}]}}],"usedParamSet":{"key":true},"statement":{"body":"SELECT\n    KEY,\n    string_agg(signup_code, NULL) AS signup_code,\n    bool_or(high_school_signup) AS high_school_signup,\n    bool_or(college_signup) AS college_signup,\n    bool_or(school_signup_required) AS school_signup_required,\n    array_agg(spos.name) AS sites\nFROM\n    student_partner_orgs spo\n    LEFT JOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id\nWHERE\n    KEY = :key!\nGROUP BY\n    spo.key","loc":{"a":314,"b":739,"line":15,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     KEY,
 *     string_agg(signup_code, NULL) AS signup_code,
 *     bool_or(high_school_signup) AS high_school_signup,
 *     bool_or(college_signup) AS college_signup,
 *     bool_or(school_signup_required) AS school_signup_required,
 *     array_agg(spos.name) AS sites
 * FROM
 *     student_partner_orgs spo
 *     LEFT JOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id
 * WHERE
 *     KEY = :key!
 * GROUP BY
 *     spo.key
 * ```
 */
export const getFullStudentPartnerOrgByKey = new PreparedQuery<IGetFullStudentPartnerOrgByKeyParams,IGetFullStudentPartnerOrgByKeyResult>(getFullStudentPartnerOrgByKeyIR);


/** 'GetStudentPartnerOrgs' parameters type */
export type IGetStudentPartnerOrgsParams = void;

/** 'GetStudentPartnerOrgs' return type */
export interface IGetStudentPartnerOrgsResult {
  collegeSignup: boolean | null;
  highSchoolSignup: boolean | null;
  key: string;
  name: string;
  schoolSignupRequired: boolean | null;
  signupCode: string | null;
  sites: stringArray | null;
}

/** 'GetStudentPartnerOrgs' query type */
export interface IGetStudentPartnerOrgsQuery {
  params: IGetStudentPartnerOrgsParams;
  result: IGetStudentPartnerOrgsResult;
}

const getStudentPartnerOrgsIR: any = {"name":"getStudentPartnerOrgs","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    KEY,\n    spo.name AS name,\n    max(signup_code) AS signup_code,\n    bool_or(high_school_signup) AS high_school_signup,\n    bool_or(college_signup) AS college_signup,\n    bool_or(school_signup_required) AS school_signup_required,\n    array_agg(spos.name) AS sites\nFROM\n    student_partner_orgs spo\n    LEFT JOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id\nGROUP BY\n    spo.key,\n    spo.name","loc":{"a":778,"b":1204,"line":32,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     KEY,
 *     spo.name AS name,
 *     max(signup_code) AS signup_code,
 *     bool_or(high_school_signup) AS high_school_signup,
 *     bool_or(college_signup) AS college_signup,
 *     bool_or(school_signup_required) AS school_signup_required,
 *     array_agg(spos.name) AS sites
 * FROM
 *     student_partner_orgs spo
 *     LEFT JOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id
 * GROUP BY
 *     spo.key,
 *     spo.name
 * ```
 */
export const getStudentPartnerOrgs = new PreparedQuery<IGetStudentPartnerOrgsParams,IGetStudentPartnerOrgsResult>(getStudentPartnerOrgsIR);


/** 'GetStudentPartnerOrgKeyByCode' parameters type */
export interface IGetStudentPartnerOrgKeyByCodeParams {
  signupCode: string;
}

/** 'GetStudentPartnerOrgKeyByCode' return type */
export interface IGetStudentPartnerOrgKeyByCodeResult {
  key: string;
}

/** 'GetStudentPartnerOrgKeyByCode' query type */
export interface IGetStudentPartnerOrgKeyByCodeQuery {
  params: IGetStudentPartnerOrgKeyByCodeParams;
  result: IGetStudentPartnerOrgKeyByCodeResult;
}

const getStudentPartnerOrgKeyByCodeIR: any = {"name":"getStudentPartnerOrgKeyByCode","params":[{"name":"signupCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1321,"b":1331,"line":54,"col":19}]}}],"usedParamSet":{"signupCode":true},"statement":{"body":"SELECT\n    KEY\nFROM\n    student_partner_orgs\nWHERE\n    signup_code = :signupCode!","loc":{"a":1251,"b":1331,"line":49,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     KEY
 * FROM
 *     student_partner_orgs
 * WHERE
 *     signup_code = :signupCode!
 * ```
 */
export const getStudentPartnerOrgKeyByCode = new PreparedQuery<IGetStudentPartnerOrgKeyByCodeParams,IGetStudentPartnerOrgKeyByCodeResult>(getStudentPartnerOrgKeyByCodeIR);


