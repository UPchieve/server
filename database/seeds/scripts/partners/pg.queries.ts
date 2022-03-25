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
  collegeSignup: boolean;
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

const insertStudentPartnerOrgIR: any = {"name":"insertStudentPartnerOrg","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":459,"b":461,"line":5,"col":155}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":465,"b":469,"line":5,"col":161}]}},{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":473,"b":476,"line":5,"col":169}]}},{"name":"highSchoolSignup","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":480,"b":496,"line":5,"col":176}]}},{"name":"collegeSignup","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":500,"b":513,"line":5,"col":196}]}},{"name":"schoolSignupRequired","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":517,"b":537,"line":5,"col":213}]}},{"name":"signupCode","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":541,"b":550,"line":5,"col":237}]}}],"usedParamSet":{"id":true,"name":true,"key":true,"highSchoolSignup":true,"collegeSignup":true,"schoolSignupRequired":true,"signupCode":true},"statement":{"body":"INSERT INTO student_partner_orgs (id, name, key, high_school_signup, college_signup, school_signup_required, signup_code, created_at, updated_at) VALUES (:id!, :name!, :key!, :highSchoolSignup!, :collegeSignup!, :schoolSignupRequired!, :signupCode, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":304,"b":607,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_partner_orgs (id, name, key, high_school_signup, college_signup, school_signup_required, signup_code, created_at, updated_at) VALUES (:id!, :name!, :key!, :highSchoolSignup!, :collegeSignup!, :schoolSignupRequired!, :signupCode, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
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

const insertStudentPartnerOrgSiteIR: any = {"name":"insertStudentPartnerOrgSite","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":757,"b":759,"line":8,"col":106}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":763,"b":767,"line":8,"col":112}]}},{"name":"studentPartnerOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":771,"b":790,"line":8,"col":120}]}}],"usedParamSet":{"id":true,"name":true,"studentPartnerOrgId":true},"statement":{"body":"INSERT INTO student_partner_org_sites (id, name, student_partner_org_id, created_at, updated_at) VALUES (:id!, :name!, :studentPartnerOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":651,"b":847,"line":8,"col":0}}};

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

const insertRequiredEmailDomainIR: any = {"name":"insertRequiredEmailDomain","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":996,"b":998,"line":11,"col":107}]}},{"name":"domain","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1002,"b":1008,"line":11,"col":113}]}},{"name":"volunteerPartnerOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1012,"b":1033,"line":11,"col":123}]}}],"usedParamSet":{"id":true,"domain":true,"volunteerPartnerOrgId":true},"statement":{"body":"INSERT INTO required_email_domains (id, domain, volunteer_partner_org_id, created_at, updated_at) VALUES (:id!, :domain!, :volunteerPartnerOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":889,"b":1090,"line":11,"col":0}}};

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
  name: string;
  studentPartnerOrgId: string | null | void;
  studentSponsorOrgId: string | null | void;
  volunteerPartnerOrgd: string;
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

const insertAssociatedPartnerIR: any = {"name":"insertAssociatedPartner","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1285,"b":1287,"line":14,"col":155}]}},{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1291,"b":1294,"line":14,"col":161}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1298,"b":1302,"line":14,"col":168}]}},{"name":"volunteerPartnerOrgd","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1306,"b":1326,"line":14,"col":176}]}},{"name":"studentPartnerOrgId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1330,"b":1348,"line":14,"col":200}]}},{"name":"studentSponsorOrgId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1352,"b":1370,"line":14,"col":222}]}}],"usedParamSet":{"id":true,"key":true,"name":true,"volunteerPartnerOrgd":true,"studentPartnerOrgId":true,"studentSponsorOrgId":true},"statement":{"body":"INSERT INTO associated_partners (id, key, name, volunteer_partner_org_id, student_partner_org_id, student_sponsor_org_id, created_at, updated_at) VALUES (:id!, :key!, :name!, :volunteerPartnerOrgd!, :studentPartnerOrgId, :studentSponsorOrgId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":1130,"b":1427,"line":14,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO associated_partners (id, key, name, volunteer_partner_org_id, student_partner_org_id, student_sponsor_org_id, created_at, updated_at) VALUES (:id!, :key!, :name!, :volunteerPartnerOrgd!, :studentPartnerOrgId, :studentSponsorOrgId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
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

const insertSponsorOrgIR: any = {"name":"insertSponsorOrg","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1534,"b":1536,"line":17,"col":74}]}},{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1540,"b":1543,"line":17,"col":80}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1547,"b":1551,"line":17,"col":87}]}}],"usedParamSet":{"id":true,"key":true,"name":true},"statement":{"body":"INSERT INTO sponsor_orgs (id, key, name, created_at, updated_at) VALUES (:id!, :key!, :name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":1460,"b":1608,"line":17,"col":0}}};

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

const getSchoolIdByMongoIdIR: any = {"name":"getSchoolIdByMongoId","params":[{"name":"mongo_id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1686,"b":1694,"line":20,"col":41}]}}],"usedParamSet":{"mongo_id":true},"statement":{"body":"SELECT id from schools WHERE mongo_id = :mongo_id!","loc":{"a":1645,"b":1694,"line":20,"col":0}}};

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

const insertSchoolsSponsorOrgsIR: any = {"name":"insertSchoolsSponsorOrgs","params":[{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1829,"b":1837,"line":23,"col":94}]}},{"name":"sponsorOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1841,"b":1853,"line":23,"col":106}]}}],"usedParamSet":{"schoolId":true,"sponsorOrgId":true},"statement":{"body":"INSERT INTO schools_sponsor_orgs (school_id, sponsor_org_id, created_at, updated_at) VALUES (:schoolId!, :sponsorOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING school_id, sponsor_org_id AS ok","loc":{"a":1735,"b":1933,"line":23,"col":0}}};

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

const insertStudentPartnerOrgsSponsorOrgsIR: any = {"name":"insertStudentPartnerOrgsSponsorOrgs","params":[{"name":"studentPartnerOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2105,"b":2124,"line":26,"col":120}]}},{"name":"sponsorOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2128,"b":2140,"line":26,"col":143}]}}],"usedParamSet":{"studentPartnerOrgId":true,"sponsorOrgId":true},"statement":{"body":"INSERT INTO student_partner_orgs_sponsor_orgs (student_partner_org_id, sponsor_org_id, created_at, updated_at) VALUES (:studentPartnerOrgId!, :sponsorOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING student_partner_org_id, sponsor_org_id AS ok","loc":{"a":1985,"b":2233,"line":26,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_partner_orgs_sponsor_orgs (student_partner_org_id, sponsor_org_id, created_at, updated_at) VALUES (:studentPartnerOrgId!, :sponsorOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING student_partner_org_id, sponsor_org_id AS ok
 * ```
 */
export const insertStudentPartnerOrgsSponsorOrgs = new PreparedQuery<IInsertStudentPartnerOrgsSponsorOrgsParams,IInsertStudentPartnerOrgsSponsorOrgsResult>(insertStudentPartnerOrgsSponsorOrgsIR);


