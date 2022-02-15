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
  ok: string | null;
}

/** 'InsertVolunteerPartnerOrg' query type */
export interface IInsertVolunteerPartnerOrgQuery {
  params: IInsertVolunteerPartnerOrgParams;
  result: IInsertVolunteerPartnerOrgResult;
}

const insertVolunteerPartnerOrgIR: any = {"name":"insertVolunteerPartnerOrg","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":182,"b":184,"line":4,"col":17}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":188,"b":192,"line":4,"col":23}]}},{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":196,"b":199,"line":4,"col":31},{"a":400,"b":403,"line":12,"col":59}]}},{"name":"receiveWeeklyHourSummaryEmail","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":203,"b":232,"line":4,"col":38}]}}],"usedParamSet":{"id":true,"name":true,"key":true,"receiveWeeklyHourSummaryEmail":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO volunteer_partner_orgs (id, name, key, receive_weekly_hour_summary_email, created_at, updated_at)\n        VALUES (:id!, :name!, :key!, :receiveWeeklyHourSummaryEmail!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM volunteer_partner_orgs WHERE key=:key!","loc":{"a":38,"b":403,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO volunteer_partner_orgs (id, name, key, receive_weekly_hour_summary_email, created_at, updated_at)
 *         VALUES (:id!, :name!, :key!, :receiveWeeklyHourSummaryEmail!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM volunteer_partner_orgs WHERE key=:key!
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
}

/** 'InsertStudentPartnerOrg' return type */
export interface IInsertStudentPartnerOrgResult {
  ok: string | null;
}

/** 'InsertStudentPartnerOrg' query type */
export interface IInsertStudentPartnerOrgQuery {
  params: IInsertStudentPartnerOrgParams;
  result: IInsertStudentPartnerOrgResult;
}

const insertStudentPartnerOrgIR: any = {"name":"insertStudentPartnerOrg","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":595,"b":597,"line":18,"col":17}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":601,"b":605,"line":18,"col":23}]}},{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":609,"b":612,"line":18,"col":31},{"a":822,"b":825,"line":26,"col":57}]}},{"name":"highSchoolSignup","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":616,"b":632,"line":18,"col":38}]}},{"name":"schoolSignupRequired","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":636,"b":656,"line":18,"col":58}]}}],"usedParamSet":{"id":true,"name":true,"key":true,"highSchoolSignup":true,"schoolSignupRequired":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO student_partner_orgs (id, name, key, high_school_signup, school_signup_required, created_at, updated_at)\n        VALUES (:id!, :name!, :key!, :highSchoolSignup!, :schoolSignupRequired!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM student_partner_orgs WHERE key=:key!","loc":{"a":444,"b":825,"line":16,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO student_partner_orgs (id, name, key, high_school_signup, school_signup_required, created_at, updated_at)
 *         VALUES (:id!, :name!, :key!, :highSchoolSignup!, :schoolSignupRequired!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM student_partner_orgs WHERE key=:key!
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
  ok: string | null;
}

/** 'InsertStudentPartnerOrgSite' query type */
export interface IInsertStudentPartnerOrgSiteQuery {
  params: IInsertStudentPartnerOrgSiteParams;
  result: IInsertStudentPartnerOrgSiteResult;
}

const insertStudentPartnerOrgSiteIR: any = {"name":"insertStudentPartnerOrgSite","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1001,"b":1003,"line":32,"col":17}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1007,"b":1011,"line":32,"col":23},{"a":1206,"b":1210,"line":40,"col":63}]}},{"name":"studentPartnerOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1015,"b":1034,"line":32,"col":31},{"a":1240,"b":1259,"line":40,"col":97}]}}],"usedParamSet":{"id":true,"name":true,"studentPartnerOrgId":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO student_partner_org_sites (id, name, student_partner_org_id, created_at, updated_at)\n        VALUES (:id!, :name!, :studentPartnerOrgId!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM student_partner_org_sites WHERE name=:name! AND student_partner_org_id=:studentPartnerOrgId!","loc":{"a":870,"b":1259,"line":30,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO student_partner_org_sites (id, name, student_partner_org_id, created_at, updated_at)
 *         VALUES (:id!, :name!, :studentPartnerOrgId!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM student_partner_org_sites WHERE name=:name! AND student_partner_org_id=:studentPartnerOrgId!
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
  ok: string | null;
}

/** 'InsertRequiredEmailDomain' query type */
export interface IInsertRequiredEmailDomainQuery {
  params: IInsertRequiredEmailDomainParams;
  result: IInsertRequiredEmailDomainResult;
}

const insertRequiredEmailDomainIR: any = {"name":"insertRequiredEmailDomain","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1434,"b":1436,"line":46,"col":17},{"a":1638,"b":1640,"line":54,"col":58}]}},{"name":"domain","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1440,"b":1446,"line":46,"col":23}]}},{"name":"volunteerPartnerOrgId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1450,"b":1471,"line":46,"col":33}]}}],"usedParamSet":{"id":true,"domain":true,"volunteerPartnerOrgId":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO required_email_domains (id, domain, volunteer_partner_org_id, created_at, updated_at)\n        VALUES (:id!, :domain!, :volunteerPartnerOrgId!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM required_email_domains WHERE id=:id!","loc":{"a":1302,"b":1640,"line":44,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO required_email_domains (id, domain, volunteer_partner_org_id, created_at, updated_at)
 *         VALUES (:id!, :domain!, :volunteerPartnerOrgId!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM required_email_domains WHERE id=:id!
 * ```
 */
export const insertRequiredEmailDomain = new PreparedQuery<IInsertRequiredEmailDomainParams,IInsertRequiredEmailDomainResult>(insertRequiredEmailDomainIR);


