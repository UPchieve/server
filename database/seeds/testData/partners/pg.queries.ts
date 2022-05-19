/** Types generated for queries found in "database/seeds/testData/partners/partners.sql" */
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
  highSchoolSignup: boolean;
  id: string;
  key: string;
  name: string;
  schoolSignupRequired: boolean;
  signupCode: string;
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

const insertStudentPartnerOrgIR: any = {"name":"insertStudentPartnerOrg","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":443,"b":445,"line":5,"col":139}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":449,"b":453,"line":5,"col":145}]}},{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":457,"b":460,"line":5,"col":153}]}},{"name":"highSchoolSignup","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":464,"b":480,"line":5,"col":160}]}},{"name":"schoolSignupRequired","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":484,"b":504,"line":5,"col":180}]}},{"name":"signupCode","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":508,"b":518,"line":5,"col":204}]}}],"usedParamSet":{"id":true,"name":true,"key":true,"highSchoolSignup":true,"schoolSignupRequired":true,"signupCode":true},"statement":{"body":"INSERT INTO student_partner_orgs (id, name, key, high_school_signup, school_signup_required, signup_code, created_at, updated_at) VALUES (:id!, :name!, :key!, :highSchoolSignup!, :schoolSignupRequired!, :signupCode!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":304,"b":575,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_partner_orgs (id, name, key, high_school_signup, school_signup_required, signup_code, created_at, updated_at) VALUES (:id!, :name!, :key!, :highSchoolSignup!, :schoolSignupRequired!, :signupCode!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
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

const insertStudentPartnerOrgSiteIR: any = {"name":"insertStudentPartnerOrgSite","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":725,"b":727,"line":8,"col":106}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":731,"b":735,"line":8,"col":112}]}},{"name":"studentPartnerOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":739,"b":758,"line":8,"col":120}]}}],"usedParamSet":{"id":true,"name":true,"studentPartnerOrgId":true},"statement":{"body":"INSERT INTO student_partner_org_sites (id, name, student_partner_org_id, created_at, updated_at) VALUES (:id!, :name!, :studentPartnerOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":619,"b":815,"line":8,"col":0}}};

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

const insertRequiredEmailDomainIR: any = {"name":"insertRequiredEmailDomain","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":964,"b":966,"line":11,"col":107}]}},{"name":"domain","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":970,"b":976,"line":11,"col":113}]}},{"name":"volunteerPartnerOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":980,"b":1001,"line":11,"col":123}]}}],"usedParamSet":{"id":true,"domain":true,"volunteerPartnerOrgId":true},"statement":{"body":"INSERT INTO required_email_domains (id, domain, volunteer_partner_org_id, created_at, updated_at) VALUES (:id!, :domain!, :volunteerPartnerOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":857,"b":1058,"line":11,"col":0}}};

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
  soId: string | null | void;
  spoId: string | null | void;
  vpoId: string;
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

const insertAssociatedPartnerIR: any = {"name":"insertAssociatedPartner","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1247,"b":1249,"line":14,"col":149}]}},{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1253,"b":1256,"line":14,"col":155}]}},{"name":"vpoId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1260,"b":1265,"line":14,"col":162}]}},{"name":"spoId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1269,"b":1273,"line":14,"col":171}]}},{"name":"soId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1277,"b":1280,"line":14,"col":179}]}}],"usedParamSet":{"id":true,"key":true,"vpoId":true,"spoId":true,"soId":true},"statement":{"body":"INSERT INTO associated_partners (id, key, volunteer_partner_org_id, student_partner_org_id, student_sponsor_org_id, created_at, updated_at) VALUES (:id!, :key!, :vpoId!, :spoId, :soId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":1098,"b":1337,"line":14,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO associated_partners (id, key, volunteer_partner_org_id, student_partner_org_id, student_sponsor_org_id, created_at, updated_at) VALUES (:id!, :key!, :vpoId!, :spoId, :soId, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
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

const insertSponsorOrgIR: any = {"name":"insertSponsorOrg","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1444,"b":1446,"line":17,"col":74}]}},{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1450,"b":1453,"line":17,"col":80}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1457,"b":1461,"line":17,"col":87}]}}],"usedParamSet":{"id":true,"key":true,"name":true},"statement":{"body":"INSERT INTO sponsor_orgs (id, key, name, created_at, updated_at) VALUES (:id!, :key!, :name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok","loc":{"a":1370,"b":1518,"line":17,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO sponsor_orgs (id, key, name, created_at, updated_at) VALUES (:id!, :key!, :name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
 * ```
 */
export const insertSponsorOrg = new PreparedQuery<IInsertSponsorOrgParams,IInsertSponsorOrgResult>(insertSponsorOrgIR);


/** 'InsertSchoolsSponsorOrg' parameters type */
export interface IInsertSchoolsSponsorOrgParams {
  schoolId: string;
  sponsorOrgId: string;
}

/** 'InsertSchoolsSponsorOrg' return type */
export interface IInsertSchoolsSponsorOrgResult {
  ok: string;
}

/** 'InsertSchoolsSponsorOrg' query type */
export interface IInsertSchoolsSponsorOrgQuery {
  params: IInsertSchoolsSponsorOrgParams;
  result: IInsertSchoolsSponsorOrgResult;
}

const insertSchoolsSponsorOrgIR: any = {"name":"insertSchoolsSponsorOrg","params":[{"name":"schoolId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1652,"b":1660,"line":20,"col":94}]}},{"name":"sponsorOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1664,"b":1676,"line":20,"col":106}]}}],"usedParamSet":{"schoolId":true,"sponsorOrgId":true},"statement":{"body":"INSERT INTO schools_sponsor_orgs (school_id, sponsor_org_id, created_at, updated_at) VALUES (:schoolId!, :sponsorOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING school_id AS ok","loc":{"a":1558,"b":1740,"line":20,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO schools_sponsor_orgs (school_id, sponsor_org_id, created_at, updated_at) VALUES (:schoolId!, :sponsorOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING school_id AS ok
 * ```
 */
export const insertSchoolsSponsorOrg = new PreparedQuery<IInsertSchoolsSponsorOrgParams,IInsertSchoolsSponsorOrgResult>(insertSchoolsSponsorOrgIR);


/** 'InsertStudentPartnerSponsorOrg' parameters type */
export interface IInsertStudentPartnerSponsorOrgParams {
  spoId: string;
  sponsorOrgId: string;
}

/** 'InsertStudentPartnerSponsorOrg' return type */
export interface IInsertStudentPartnerSponsorOrgResult {
  ok: string;
}

/** 'InsertStudentPartnerSponsorOrg' query type */
export interface IInsertStudentPartnerSponsorOrgQuery {
  params: IInsertStudentPartnerSponsorOrgParams;
  result: IInsertStudentPartnerSponsorOrgResult;
}

const insertStudentPartnerSponsorOrgIR: any = {"name":"insertStudentPartnerSponsorOrg","params":[{"name":"spoId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1907,"b":1912,"line":23,"col":120}]}},{"name":"sponsorOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1916,"b":1928,"line":23,"col":129}]}}],"usedParamSet":{"spoId":true,"sponsorOrgId":true},"statement":{"body":"INSERT INTO student_partner_orgs_sponsor_orgs (student_partner_org_id, sponsor_org_id, created_at, updated_at) VALUES (:spoId!, :sponsorOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING student_partner_org_id AS ok","loc":{"a":1787,"b":2005,"line":23,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO student_partner_orgs_sponsor_orgs (student_partner_org_id, sponsor_org_id, created_at, updated_at) VALUES (:spoId!, :sponsorOrgId!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING student_partner_org_id AS ok
 * ```
 */
export const insertStudentPartnerSponsorOrg = new PreparedQuery<IInsertStudentPartnerSponsorOrgParams,IInsertStudentPartnerSponsorOrgResult>(insertStudentPartnerSponsorOrgIR);


