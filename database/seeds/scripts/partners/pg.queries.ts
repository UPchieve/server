/** Types generated for queries found in "database/seeds/scripts/partners/partners.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type stringArray = (string)[];

/** 'InsertVolunteerPartnerOrg' parameters type */
export interface IInsertVolunteerPartnerOrgParams {
  id: string;
  key: string;
  name: string;
  receiveWeeklyHourSummaryEmail: boolean;
}

/** 'InsertVolunteerPartnerOrg' return type */
export interface IInsertVolunteerPartnerOrgResult {
  ok: string;
}

/** 'InsertVolunteerPartnerOrg' query type */
export interface IInsertVolunteerPartnerOrgQuery {
  params: IInsertVolunteerPartnerOrgParams;
  result: IInsertVolunteerPartnerOrgResult;
}

const insertVolunteerPartnerOrgIR: any = {"name":"insertVolunteerPartnerOrg","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":157,"b":159,"line":2,"col":119}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":163,"b":167,"line":2,"col":125}]}},{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":171,"b":174,"line":2,"col":133}]}},{"name":"receiveWeeklyHourSummaryEmail","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":178,"b":207,"line":2,"col":140}]}}],"usedParamSet":{"id":true,"name":true,"key":true,"receiveWeeklyHourSummaryEmail":true},"statement":{"body":"INSERT INTO volunteer_partner_orgs (id, name, key, receive_weekly_hour_summary_email, created_at, updated_at) VALUES (:id!, :name!, :key!, :receiveWeeklyHourSummaryEmail!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":38,"b":264,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO volunteer_partner_orgs (id, name, key, receive_weekly_hour_summary_email, created_at, updated_at) VALUES (:id!, :name!, :key!, :receiveWeeklyHourSummaryEmail!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
 * ```
 */
export const insertVolunteerPartnerOrg = new PreparedQuery<IInsertVolunteerPartnerOrgParams,IInsertVolunteerPartnerOrgResult>(insertVolunteerPartnerOrgIR);


/** 'InsertStudentPartnerOrg' parameters type */
export interface IInsertStudentPartnerOrgParams {
  collegeSignup: boolean | null | void;
  highSchoolSignup: boolean;
  id: string;
  key: string;
  name: string;
  schoolSignupRequired: boolean;
  signupCode: string | null | void;
}

/** 'InsertStudentPartnerOrg' return type */
export interface IInsertStudentPartnerOrgResult {
  ok: string;
}

/** 'InsertStudentPartnerOrg' query type */
export interface IInsertStudentPartnerOrgQuery {
  params: IInsertStudentPartnerOrgParams;
  result: IInsertStudentPartnerOrgResult;
}

const insertStudentPartnerOrgIR: any = {"name":"insertStudentPartnerOrg","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":459,"b":461,"line":5,"col":155}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":465,"b":469,"line":5,"col":161}]}},{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":473,"b":476,"line":5,"col":169}]}},{"name":"highSchoolSignup","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":480,"b":496,"line":5,"col":176}]}},{"name":"collegeSignup","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":500,"b":512,"line":5,"col":196}]}},{"name":"schoolSignupRequired","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":516,"b":536,"line":5,"col":212}]}},{"name":"signupCode","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":540,"b":549,"line":5,"col":236}]}}],"usedParamSet":{"id":true,"name":true,"key":true,"highSchoolSignup":true,"collegeSignup":true,"schoolSignupRequired":true,"signupCode":true},"statement":{"body":"INSERT INTO student_partner_orgs (id, name, key, high_school_signup, college_signup, school_signup_required, signup_code, created_at, updated_at) VALUES (:id!, :name!, :key!, :highSchoolSignup!, :collegeSignup, :schoolSignupRequired!, :signupCode, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":304,"b":606,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_partner_orgs (id, name, key, high_school_signup, college_signup, school_signup_required, signup_code, created_at, updated_at) VALUES (:id!, :name!, :key!, :highSchoolSignup!, :collegeSignup, :schoolSignupRequired!, :signupCode, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
 * ```
 */
export const insertStudentPartnerOrg = new PreparedQuery<IInsertStudentPartnerOrgParams,IInsertStudentPartnerOrgResult>(insertStudentPartnerOrgIR);


/** 'InsertStudentPartnerOrgSite' parameters type */
export interface IInsertStudentPartnerOrgSiteParams {
  id: string;
  name: string;
  studentPartnerOrgId: string;
}

/** 'InsertStudentPartnerOrgSite' return type */
export interface IInsertStudentPartnerOrgSiteResult {
  ok: string;
}

/** 'InsertStudentPartnerOrgSite' query type */
export interface IInsertStudentPartnerOrgSiteQuery {
  params: IInsertStudentPartnerOrgSiteParams;
  result: IInsertStudentPartnerOrgSiteResult;
}

const insertStudentPartnerOrgSiteIR: any = {"name":"insertStudentPartnerOrgSite","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":756,"b":758,"line":8,"col":106}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":762,"b":766,"line":8,"col":112}]}},{"name":"studentPartnerOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":770,"b":789,"line":8,"col":120}]}}],"usedParamSet":{"id":true,"name":true,"studentPartnerOrgId":true},"statement":{"body":"INSERT INTO student_partner_org_sites (id, name, student_partner_org_id, created_at, updated_at) VALUES (:id!, :name!, :studentPartnerOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":650,"b":846,"line":8,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_partner_org_sites (id, name, student_partner_org_id, created_at, updated_at) VALUES (:id!, :name!, :studentPartnerOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
 * ```
 */
export const insertStudentPartnerOrgSite = new PreparedQuery<IInsertStudentPartnerOrgSiteParams,IInsertStudentPartnerOrgSiteResult>(insertStudentPartnerOrgSiteIR);


/** 'InsertRequiredEmailDomain' parameters type */
export interface IInsertRequiredEmailDomainParams {
  domain: string;
  id: string;
  volunteerPartnerOrgId: string;
}

/** 'InsertRequiredEmailDomain' return type */
export interface IInsertRequiredEmailDomainResult {
  ok: string;
}

/** 'InsertRequiredEmailDomain' query type */
export interface IInsertRequiredEmailDomainQuery {
  params: IInsertRequiredEmailDomainParams;
  result: IInsertRequiredEmailDomainResult;
}

const insertRequiredEmailDomainIR: any = {"name":"insertRequiredEmailDomain","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":995,"b":997,"line":11,"col":107}]}},{"name":"domain","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1001,"b":1007,"line":11,"col":113}]}},{"name":"volunteerPartnerOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1011,"b":1032,"line":11,"col":123}]}}],"usedParamSet":{"id":true,"domain":true,"volunteerPartnerOrgId":true},"statement":{"body":"INSERT INTO required_email_domains (id, domain, volunteer_partner_org_id, created_at, updated_at) VALUES (:id!, :domain!, :volunteerPartnerOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":888,"b":1089,"line":11,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO required_email_domains (id, domain, volunteer_partner_org_id, created_at, updated_at) VALUES (:id!, :domain!, :volunteerPartnerOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
 * ```
 */
export const insertRequiredEmailDomain = new PreparedQuery<IInsertRequiredEmailDomainParams,IInsertRequiredEmailDomainResult>(insertRequiredEmailDomainIR);


/** 'InsertAssociatedPartner' parameters type */
export interface IInsertAssociatedPartnerParams {
  id: string;
  key: string;
  studentPartnerOrgId: string | null | void;
  studentSponsorOrgId: string | null | void;
  volunteerPartnerOrgId: string;
}

/** 'InsertAssociatedPartner' return type */
export interface IInsertAssociatedPartnerResult {
  ok: string;
}

/** 'InsertAssociatedPartner' query type */
export interface IInsertAssociatedPartnerQuery {
  params: IInsertAssociatedPartnerParams;
  result: IInsertAssociatedPartnerResult;
}

const insertAssociatedPartnerIR: any = {"name":"insertAssociatedPartner","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1278,"b":1280,"line":14,"col":149}]}},{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1284,"b":1287,"line":14,"col":155}]}},{"name":"volunteerPartnerOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1291,"b":1312,"line":14,"col":162}]}},{"name":"studentPartnerOrgId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1316,"b":1334,"line":14,"col":187}]}},{"name":"studentSponsorOrgId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1338,"b":1356,"line":14,"col":209}]}}],"usedParamSet":{"id":true,"key":true,"volunteerPartnerOrgId":true,"studentPartnerOrgId":true,"studentSponsorOrgId":true},"statement":{"body":"INSERT INTO associated_partners (id, key, volunteer_partner_org_id, student_partner_org_id, student_sponsor_org_id, created_at, updated_at) VALUES (:id!, :key!, :volunteerPartnerOrgId!, :studentPartnerOrgId, :studentSponsorOrgId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":1129,"b":1413,"line":14,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO associated_partners (id, key, volunteer_partner_org_id, student_partner_org_id, student_sponsor_org_id, created_at, updated_at) VALUES (:id!, :key!, :volunteerPartnerOrgId!, :studentPartnerOrgId, :studentSponsorOrgId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
 * ```
 */
export const insertAssociatedPartner = new PreparedQuery<IInsertAssociatedPartnerParams,IInsertAssociatedPartnerResult>(insertAssociatedPartnerIR);


/** 'InsertSponsorOrg' parameters type */
export interface IInsertSponsorOrgParams {
  id: string;
  key: string;
  name: string;
}

/** 'InsertSponsorOrg' return type */
export interface IInsertSponsorOrgResult {
  ok: string;
}

/** 'InsertSponsorOrg' query type */
export interface IInsertSponsorOrgQuery {
  params: IInsertSponsorOrgParams;
  result: IInsertSponsorOrgResult;
}

const insertSponsorOrgIR: any = {"name":"insertSponsorOrg","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1520,"b":1522,"line":17,"col":74}]}},{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1526,"b":1529,"line":17,"col":80}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1533,"b":1537,"line":17,"col":87}]}}],"usedParamSet":{"id":true,"key":true,"name":true},"statement":{"body":"INSERT INTO sponsor_orgs (id, key, name, created_at, updated_at) VALUES (:id!, :key!, :name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":1446,"b":1594,"line":17,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO sponsor_orgs (id, key, name, created_at, updated_at) VALUES (:id!, :key!, :name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
 * ```
 */
export const insertSponsorOrg = new PreparedQuery<IInsertSponsorOrgParams,IInsertSponsorOrgResult>(insertSponsorOrgIR);


/** 'GetSchoolIdByMongoId' parameters type */
export interface IGetSchoolIdByMongoIdParams {
  mongoId: string;
}

/** 'GetSchoolIdByMongoId' return type */
export interface IGetSchoolIdByMongoIdResult {
  id: string;
}

/** 'GetSchoolIdByMongoId' query type */
export interface IGetSchoolIdByMongoIdQuery {
  params: IGetSchoolIdByMongoIdParams;
  result: IGetSchoolIdByMongoIdResult;
}

const getSchoolIdByMongoIdIR: any = {"name":"getSchoolIdByMongoId","params":[{"name":"mongoId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1672,"b":1679,"line":20,"col":41}]}}],"usedParamSet":{"mongoId":true},"statement":{"body":"SELECT id from schools WHERE mongo_id = :mongoId!","loc":{"a":1631,"b":1679,"line":20,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT id from schools WHERE mongo_id = :mongoId!
 * ```
 */
export const getSchoolIdByMongoId = new PreparedQuery<IGetSchoolIdByMongoIdParams,IGetSchoolIdByMongoIdResult>(getSchoolIdByMongoIdIR);


/** 'InsertSchoolsSponsorOrgs' parameters type */
export interface IInsertSchoolsSponsorOrgsParams {
  schoolId: string;
  sponsorOrgId: string;
}

/** 'InsertSchoolsSponsorOrgs' return type */
export interface IInsertSchoolsSponsorOrgsResult {
  ok: string;
  schoolId: string;
}

/** 'InsertSchoolsSponsorOrgs' query type */
export interface IInsertSchoolsSponsorOrgsQuery {
  params: IInsertSchoolsSponsorOrgsParams;
  result: IInsertSchoolsSponsorOrgsResult;
}

const insertSchoolsSponsorOrgsIR: any = {"name":"insertSchoolsSponsorOrgs","params":[{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1814,"b":1822,"line":23,"col":94}]}},{"name":"sponsorOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1826,"b":1838,"line":23,"col":106}]}}],"usedParamSet":{"schoolId":true,"sponsorOrgId":true},"statement":{"body":"INSERT INTO schools_sponsor_orgs (school_id, sponsor_org_id, created_at, updated_at) VALUES (:schoolId!, :sponsorOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING school_id, sponsor_org_id AS ok","loc":{"a":1720,"b":1918,"line":23,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO schools_sponsor_orgs (school_id, sponsor_org_id, created_at, updated_at) VALUES (:schoolId!, :sponsorOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING school_id, sponsor_org_id AS ok
 * ```
 */
export const insertSchoolsSponsorOrgs = new PreparedQuery<IInsertSchoolsSponsorOrgsParams,IInsertSchoolsSponsorOrgsResult>(insertSchoolsSponsorOrgsIR);


/** 'InsertStudentPartnerOrgsSponsorOrgs' parameters type */
export interface IInsertStudentPartnerOrgsSponsorOrgsParams {
  sponsorOrgId: string;
  studentPartnerOrgId: string;
}

/** 'InsertStudentPartnerOrgsSponsorOrgs' return type */
export interface IInsertStudentPartnerOrgsSponsorOrgsResult {
  ok: string;
  studentPartnerOrgId: string;
}

/** 'InsertStudentPartnerOrgsSponsorOrgs' query type */
export interface IInsertStudentPartnerOrgsSponsorOrgsQuery {
  params: IInsertStudentPartnerOrgsSponsorOrgsParams;
  result: IInsertStudentPartnerOrgsSponsorOrgsResult;
}

const insertStudentPartnerOrgsSponsorOrgsIR: any = {"name":"insertStudentPartnerOrgsSponsorOrgs","params":[{"name":"studentPartnerOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2090,"b":2109,"line":26,"col":120}]}},{"name":"sponsorOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2113,"b":2125,"line":26,"col":143}]}}],"usedParamSet":{"studentPartnerOrgId":true,"sponsorOrgId":true},"statement":{"body":"INSERT INTO student_partner_orgs_sponsor_orgs (student_partner_org_id, sponsor_org_id, created_at, updated_at) VALUES (:studentPartnerOrgId!, :sponsorOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING student_partner_org_id, sponsor_org_id AS ok","loc":{"a":1970,"b":2218,"line":26,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_partner_orgs_sponsor_orgs (student_partner_org_id, sponsor_org_id, created_at, updated_at) VALUES (:studentPartnerOrgId!, :sponsorOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING student_partner_org_id, sponsor_org_id AS ok
 * ```
 */
export const insertStudentPartnerOrgsSponsorOrgs = new PreparedQuery<IInsertStudentPartnerOrgsSponsorOrgsParams,IInsertStudentPartnerOrgsSponsorOrgsResult>(insertStudentPartnerOrgsSponsorOrgsIR);


/** 'GetStudentPartnerOrgs' parameters type */
export type IGetStudentPartnerOrgsParams = void;

/** 'GetStudentPartnerOrgs' return type */
export interface IGetStudentPartnerOrgsResult {
  id: string;
  key: string;
}

/** 'GetStudentPartnerOrgs' query type */
export interface IGetStudentPartnerOrgsQuery {
  params: IGetStudentPartnerOrgsParams;
  result: IGetStudentPartnerOrgsResult;
}

const getStudentPartnerOrgsIR: any = {"name":"getStudentPartnerOrgs","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n  id,\n  key\nFROM student_partner_orgs","loc":{"a":2256,"b":2299,"line":29,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   id,
 *   key
 * FROM student_partner_orgs
 * ```
 */
export const getStudentPartnerOrgs = new PreparedQuery<IGetStudentPartnerOrgsParams,IGetStudentPartnerOrgsResult>(getStudentPartnerOrgsIR);


/** 'GetSponsorOrgs' parameters type */
export type IGetSponsorOrgsParams = void;

/** 'GetSponsorOrgs' return type */
export interface IGetSponsorOrgsResult {
  id: string;
  key: string;
}

/** 'GetSponsorOrgs' query type */
export interface IGetSponsorOrgsQuery {
  params: IGetSponsorOrgsParams;
  result: IGetSponsorOrgsResult;
}

const getSponsorOrgsIR: any = {"name":"getSponsorOrgs","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n  id, key\nFROM sponsor_orgs","loc":{"a":2330,"b":2363,"line":35,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   id, key
 * FROM sponsor_orgs
 * ```
 */
export const getSponsorOrgs = new PreparedQuery<IGetSponsorOrgsParams,IGetSponsorOrgsResult>(getSponsorOrgsIR);


/** 'InsertAdminUser' parameters type */
export interface IInsertAdminUserParams {
  mongoIds: stringArray;
}

/** 'InsertAdminUser' return type */
export interface IInsertAdminUserResult {
  ok: string;
}

/** 'InsertAdminUser' query type */
export interface IInsertAdminUserQuery {
  params: IInsertAdminUserParams;
  result: IInsertAdminUserResult;
}

const insertAdminUserIR: any = {"name":"insertAdminUser","params":[{"name":"mongoIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2525,"b":2533,"line":46,"col":22}]}}],"usedParamSet":{"mongoIds":true},"statement":{"body":"INSERT INTO admin_profiles (user_id, created_at, updated_at)\nSELECT\n  users.id,\n  NOW(),\n  NOW()\nFROM users\nWHERE mongo_id = ANY(:mongoIds!)\nON CONFLICT DO NOTHING\nRETURNING user_id AS ok","loc":{"a":2395,"b":2581,"line":40,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO admin_profiles (user_id, created_at, updated_at)
 * SELECT
 *   users.id,
 *   NOW(),
 *   NOW()
 * FROM users
 * WHERE mongo_id = ANY(:mongoIds!)
 * ON CONFLICT DO NOTHING
 * RETURNING user_id AS ok
 * ```
 */
export const insertAdminUser = new PreparedQuery<IInsertAdminUserParams,IInsertAdminUserResult>(insertAdminUserIR);


/** 'UpdateSchoolPartner' parameters type */
export interface IUpdateSchoolPartnerParams {
  mongoIds: stringArray;
}

/** 'UpdateSchoolPartner' return type */
export interface IUpdateSchoolPartnerResult {
  ok: string | null;
}

/** 'UpdateSchoolPartner' query type */
export interface IUpdateSchoolPartnerQuery {
  params: IUpdateSchoolPartnerParams;
  result: IUpdateSchoolPartnerResult;
}

const updateSchoolPartnerIR: any = {"name":"updateSchoolPartner","params":[{"name":"mongoIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2677,"b":2685,"line":55,"col":18}]}}],"usedParamSet":{"mongoIds":true},"statement":{"body":"UPDATE schools\nSET\n  partner = TRUE\nWHERE\n  mongo_id = ANY(:mongoIds!)\nRETURNING mongo_id AS ok","loc":{"a":2617,"b":2711,"line":51,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE schools
 * SET
 *   partner = TRUE
 * WHERE
 *   mongo_id = ANY(:mongoIds!)
 * RETURNING mongo_id AS ok
 * ```
 */
export const updateSchoolPartner = new PreparedQuery<IUpdateSchoolPartnerParams,IUpdateSchoolPartnerResult>(updateSchoolPartnerIR);


/** 'UpdateInGatesStudy' parameters type */
export interface IUpdateInGatesStudyParams {
  mongoIds: stringArray;
}

/** 'UpdateInGatesStudy' return type */
export interface IUpdateInGatesStudyResult {
  ok: string | null;
}

/** 'UpdateInGatesStudy' query type */
export interface IUpdateInGatesStudyQuery {
  params: IUpdateInGatesStudyParams;
  result: IUpdateInGatesStudyResult;
}

const updateInGatesStudyIR: any = {"name":"updateInGatesStudy","params":[{"name":"mongoIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2864,"b":2872,"line":64,"col":24}]}}],"usedParamSet":{"mongoIds":true},"statement":{"body":"UPDATE user_product_flags\nSET in_gates_study = TRUE\nFROM users\nWHERE\n  user_id = users.id AND\n  users.mongo_id = ANY(:mongoIds!)\nRETURNING users.mongo_id AS ok","loc":{"a":2746,"b":2904,"line":59,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE user_product_flags
 * SET in_gates_study = TRUE
 * FROM users
 * WHERE
 *   user_id = users.id AND
 *   users.mongo_id = ANY(:mongoIds!)
 * RETURNING users.mongo_id AS ok
 * ```
 */
export const updateInGatesStudy = new PreparedQuery<IUpdateInGatesStudyParams,IUpdateInGatesStudyResult>(updateInGatesStudyIR);


/** 'CountBadFeedbacks' parameters type */
export type ICountBadFeedbacksParams = void;

/** 'CountBadFeedbacks' return type */
export interface ICountBadFeedbacksResult {
  count: number | null;
}

/** 'CountBadFeedbacks' query type */
export interface ICountBadFeedbacksQuery {
  params: ICountBadFeedbacksParams;
  result: ICountBadFeedbacksResult;
}

const countBadFeedbacksIR: any = {"name":"countBadFeedbacks","params":[],"usedParamSet":{},"statement":{"body":"select\n\tcount(*)::int as count\nfrom feedbacks\njoin sessions on sessions.id = feedbacks.session_id\njoin user_roles ur on ur.id = feedbacks.user_role_id\nwhere\n\tfeedbacks.user_id <> sessions.volunteer_id AND\n    ur.name = 'volunteer'","loc":{"a":2938,"b":3167,"line":68,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * select
 * 	count(*)::int as count
 * from feedbacks
 * join sessions on sessions.id = feedbacks.session_id
 * join user_roles ur on ur.id = feedbacks.user_role_id
 * where
 * 	feedbacks.user_id <> sessions.volunteer_id AND
 *     ur.name = 'volunteer'
 * ```
 */
export const countBadFeedbacks = new PreparedQuery<ICountBadFeedbacksParams,ICountBadFeedbacksResult>(countBadFeedbacksIR);


/** 'FixVolunteerFeedbacks' parameters type */
export type IFixVolunteerFeedbacksParams = void;

/** 'FixVolunteerFeedbacks' return type */
export interface IFixVolunteerFeedbacksResult {
  ok: string;
}

/** 'FixVolunteerFeedbacks' query type */
export interface IFixVolunteerFeedbacksQuery {
  params: IFixVolunteerFeedbacksParams;
  result: IFixVolunteerFeedbacksResult;
}

const fixVolunteerFeedbacksIR: any = {"name":"fixVolunteerFeedbacks","params":[],"usedParamSet":{},"statement":{"body":"UPDATE feedbacks origin\nSET\n  user_id = subquery.user_id,\n  updated_at = NOW()\nFROM (\n  SELECT\n    sessions.volunteer_id AS user_id,\n    feedbacks.id AS feedback_id\n  FROM feedbacks\n  JOIN sessions on sessions.id = feedbacks.session_id\n  JOIN user_roles ON user_roles.id = feedbacks.user_role_id\n  WHERE\n    feedbacks.user_id <> sessions.volunteer_id AND\n    user_roles.name = 'volunteer'\n) AS subquery\nWHERE\n  origin.id = subquery.feedback_id\nRETURNING id AS ok","loc":{"a":3205,"b":3666,"line":78,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE feedbacks origin
 * SET
 *   user_id = subquery.user_id,
 *   updated_at = NOW()
 * FROM (
 *   SELECT
 *     sessions.volunteer_id AS user_id,
 *     feedbacks.id AS feedback_id
 *   FROM feedbacks
 *   JOIN sessions on sessions.id = feedbacks.session_id
 *   JOIN user_roles ON user_roles.id = feedbacks.user_role_id
 *   WHERE
 *     feedbacks.user_id <> sessions.volunteer_id AND
 *     user_roles.name = 'volunteer'
 * ) AS subquery
 * WHERE
 *   origin.id = subquery.feedback_id
 * RETURNING id AS ok
 * ```
 */
export const fixVolunteerFeedbacks = new PreparedQuery<IFixVolunteerFeedbacksParams,IFixVolunteerFeedbacksResult>(fixVolunteerFeedbacksIR);


