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

const getStudentPartnerOrgForRegistrationByKeyIR: any = {"name":"getStudentPartnerOrgForRegistrationByKey","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":216,"b":219,"line":5,"col":15}]}}],"usedParamSet":{"key":true},"statement":{"body":"SELECT key, ARRAY_AGG(spos.name) AS sites\nFROM student_partner_orgs spo\nJOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id\nWHERE spo.key=:key!\nGROUP BY spo.key","loc":{"a":53,"b":236,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT key, ARRAY_AGG(spos.name) AS sites
 * FROM student_partner_orgs spo
 * JOIN student_partner_org_sites spos ON spo.id = spos.student_partner_org_id
 * WHERE spo.key=:key!
 * GROUP BY spo.key
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

const getFullStudentPartnerOrgByKeyIR: any = {"name":"getFullStudentPartnerOrgByKey","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":682,"b":685,"line":18,"col":11}]}}],"usedParamSet":{"key":true},"statement":{"body":"SELECT\n       key,\n       string_agg(signup_code, null) as signup_code,\n       bool_or(high_school_signup) as high_school_signup,\n       bool_or(college_signup) as college_signup,\n       bool_or(school_signup_required) as school_signup_required,\n       array_agg(spos.name) as sites\nfrom student_partner_orgs spo\njoin student_partner_org_sites spos on spo.id = spos.student_partner_org_id\nwhere key=:key!\ngroup by spo.key","loc":{"a":282,"b":702,"line":9,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *        key,
 *        string_agg(signup_code, null) as signup_code,
 *        bool_or(high_school_signup) as high_school_signup,
 *        bool_or(college_signup) as college_signup,
 *        bool_or(school_signup_required) as school_signup_required,
 *        array_agg(spos.name) as sites
 * from student_partner_orgs spo
 * join student_partner_org_sites spos on spo.id = spos.student_partner_org_id
 * where key=:key!
 * group by spo.key
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
  schoolSignupRequired: boolean | null;
  signupCode: string | null;
  sites: stringArray | null;
}

/** 'GetStudentPartnerOrgs' query type */
export interface IGetStudentPartnerOrgsQuery {
  params: IGetStudentPartnerOrgsParams;
  result: IGetStudentPartnerOrgsResult;
}

const getStudentPartnerOrgsIR: any = {"name":"getStudentPartnerOrgs","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n       key,\n       string_agg(signup_code, null) as signup_code,\n       bool_or(high_school_signup) as high_school_signup,\n       bool_or(college_signup) as college_signup,\n       bool_or(school_signup_required) as school_signup_required,\n       array_agg(spos.name) as sites\nfrom student_partner_orgs spo\njoin student_partner_org_sites spos on spo.id = spos.student_partner_org_id\ngroup by spo.key","loc":{"a":740,"b":1144,"line":22,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *        key,
 *        string_agg(signup_code, null) as signup_code,
 *        bool_or(high_school_signup) as high_school_signup,
 *        bool_or(college_signup) as college_signup,
 *        bool_or(school_signup_required) as school_signup_required,
 *        array_agg(spos.name) as sites
 * from student_partner_orgs spo
 * join student_partner_org_sites spos on spo.id = spos.student_partner_org_id
 * group by spo.key
 * ```
 */
export const getStudentPartnerOrgs = new PreparedQuery<IGetStudentPartnerOrgsParams,IGetStudentPartnerOrgsResult>(getStudentPartnerOrgsIR);


