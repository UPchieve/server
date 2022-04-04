/** Types generated for queries found in "database/seeds/scripts/partners/partners.sql" */
import { PreparedQuery } from '@pgtyped/query';

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
  mongo_id: string;
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

const getSchoolIdByMongoIdIR: any = {"name":"getSchoolIdByMongoId","params":[{"name":"mongo_id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1672,"b":1680,"line":20,"col":41}]}}],"usedParamSet":{"mongo_id":true},"statement":{"body":"SELECT id from schools WHERE mongo_id = :mongo_id!","loc":{"a":1631,"b":1680,"line":20,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT id from schools WHERE mongo_id = :mongo_id!
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

const insertSchoolsSponsorOrgsIR: any = {"name":"insertSchoolsSponsorOrgs","params":[{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1815,"b":1823,"line":23,"col":94}]}},{"name":"sponsorOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1827,"b":1839,"line":23,"col":106}]}}],"usedParamSet":{"schoolId":true,"sponsorOrgId":true},"statement":{"body":"INSERT INTO schools_sponsor_orgs (school_id, sponsor_org_id, created_at, updated_at) VALUES (:schoolId!, :sponsorOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING school_id, sponsor_org_id AS ok","loc":{"a":1721,"b":1919,"line":23,"col":0}}};

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

const insertStudentPartnerOrgsSponsorOrgsIR: any = {"name":"insertStudentPartnerOrgsSponsorOrgs","params":[{"name":"studentPartnerOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2091,"b":2110,"line":26,"col":120}]}},{"name":"sponsorOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2114,"b":2126,"line":26,"col":143}]}}],"usedParamSet":{"studentPartnerOrgId":true,"sponsorOrgId":true},"statement":{"body":"INSERT INTO student_partner_orgs_sponsor_orgs (student_partner_org_id, sponsor_org_id, created_at, updated_at) VALUES (:studentPartnerOrgId!, :sponsorOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING student_partner_org_id, sponsor_org_id AS ok","loc":{"a":1971,"b":2219,"line":26,"col":0}}};

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

const getStudentPartnerOrgsIR: any = {"name":"getStudentPartnerOrgs","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n  id,\n  key\nFROM student_partner_orgs","loc":{"a":2257,"b":2300,"line":29,"col":0}}};

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

const getSponsorOrgsIR: any = {"name":"getSponsorOrgs","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n  id, key\nFROM sponsor_orgs","loc":{"a":2331,"b":2364,"line":35,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   id, key
 * FROM sponsor_orgs
 * ```
 */
export const getSponsorOrgs = new PreparedQuery<IGetSponsorOrgsParams,IGetSponsorOrgsResult>(getSponsorOrgsIR);


