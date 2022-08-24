/** Types generated for queries found in "server/models/VolunteerPartnerOrg/volunteer_partner_orgs.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type stringArray = (string)[];

/** 'GetVolunteerPartnerOrgForRegistrationByKey' parameters type */
export interface IGetVolunteerPartnerOrgForRegistrationByKeyParams {
  key: string;
}

/** 'GetVolunteerPartnerOrgForRegistrationByKey' return type */
export interface IGetVolunteerPartnerOrgForRegistrationByKeyResult {
  domains: stringArray | null;
  key: string;
}

/** 'GetVolunteerPartnerOrgForRegistrationByKey' query type */
export interface IGetVolunteerPartnerOrgForRegistrationByKeyQuery {
  params: IGetVolunteerPartnerOrgForRegistrationByKeyParams;
  result: IGetVolunteerPartnerOrgForRegistrationByKeyResult;
}

const getVolunteerPartnerOrgForRegistrationByKeyIR: any = {"name":"getVolunteerPartnerOrgForRegistrationByKey","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":410,"b":413,"line":15,"col":11}]}}],"usedParamSet":{"key":true},"statement":{"body":"SELECT\n    KEY,\n    COALESCE(domains.domains, '{}'::text[]) AS domains\nFROM\n    volunteer_partner_orgs vpo\n    LEFT JOIN LATERAL (\n        SELECT\n            ARRAY_AGG(DOMAIN) AS domains\n        FROM\n            required_email_domains\n        WHERE\n            required_email_domains.volunteer_partner_org_id = vpo.id) AS domains ON TRUE\nWHERE\n    KEY = :key!","loc":{"a":55,"b":413,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     KEY,
 *     COALESCE(domains.domains, '{}'::text[]) AS domains
 * FROM
 *     volunteer_partner_orgs vpo
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             ARRAY_AGG(DOMAIN) AS domains
 *         FROM
 *             required_email_domains
 *         WHERE
 *             required_email_domains.volunteer_partner_org_id = vpo.id) AS domains ON TRUE
 * WHERE
 *     KEY = :key!
 * ```
 */
export const getVolunteerPartnerOrgForRegistrationByKey = new PreparedQuery<IGetVolunteerPartnerOrgForRegistrationByKeyParams,IGetVolunteerPartnerOrgForRegistrationByKeyResult>(getVolunteerPartnerOrgForRegistrationByKeyIR);


/** 'GetFullVolunteerPartnerOrgByKey' parameters type */
export interface IGetFullVolunteerPartnerOrgByKeyParams {
  key: string;
}

/** 'GetFullVolunteerPartnerOrgByKey' return type */
export interface IGetFullVolunteerPartnerOrgByKeyResult {
  domains: stringArray | null;
  key: string;
  name: string | null;
  receiveWeeklyHourSummaryEmail: boolean | null;
}

/** 'GetFullVolunteerPartnerOrgByKey' query type */
export interface IGetFullVolunteerPartnerOrgByKeyQuery {
  params: IGetFullVolunteerPartnerOrgByKeyParams;
  result: IGetFullVolunteerPartnerOrgByKeyResult;
}

const getFullVolunteerPartnerOrgByKeyIR: any = {"name":"getFullVolunteerPartnerOrgByKey","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":754,"b":757,"line":28,"col":11}]}}],"usedParamSet":{"key":true},"statement":{"body":"SELECT\n    KEY,\n    max(name) AS name,\n    bool_or(receive_weekly_hour_summary_email) AS receive_weekly_hour_summary_email,\n    array_agg(DOMAIN) AS domains\nFROM\n    volunteer_partner_orgs vpo\n    LEFT JOIN required_email_domains red ON vpo.id = red.volunteer_partner_org_id\nWHERE\n    KEY = :key!\nGROUP BY\n    vpo.key","loc":{"a":462,"b":778,"line":19,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     KEY,
 *     max(name) AS name,
 *     bool_or(receive_weekly_hour_summary_email) AS receive_weekly_hour_summary_email,
 *     array_agg(DOMAIN) AS domains
 * FROM
 *     volunteer_partner_orgs vpo
 *     LEFT JOIN required_email_domains red ON vpo.id = red.volunteer_partner_org_id
 * WHERE
 *     KEY = :key!
 * GROUP BY
 *     vpo.key
 * ```
 */
export const getFullVolunteerPartnerOrgByKey = new PreparedQuery<IGetFullVolunteerPartnerOrgByKeyParams,IGetFullVolunteerPartnerOrgByKeyResult>(getFullVolunteerPartnerOrgByKeyIR);


/** 'GetVolunteerPartnerOrgs' parameters type */
export type IGetVolunteerPartnerOrgsParams = void;

/** 'GetVolunteerPartnerOrgs' return type */
export interface IGetVolunteerPartnerOrgsResult {
  domains: stringArray | null;
  key: string;
  name: string | null;
  receiveWeeklyHourSummaryEmail: boolean | null;
}

/** 'GetVolunteerPartnerOrgs' query type */
export interface IGetVolunteerPartnerOrgsQuery {
  params: IGetVolunteerPartnerOrgsParams;
  result: IGetVolunteerPartnerOrgsResult;
}

const getVolunteerPartnerOrgsIR: any = {"name":"getVolunteerPartnerOrgs","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    KEY,\n    max(name) AS name,\n    bool_or(receive_weekly_hour_summary_email) AS receive_weekly_hour_summary_email,\n    array_agg(DOMAIN) AS domains\nFROM\n    volunteer_partner_orgs vpo\n    LEFT JOIN required_email_domains red ON vpo.id = red.volunteer_partner_org_id\nGROUP BY\n    vpo.key","loc":{"a":819,"b":1113,"line":34,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     KEY,
 *     max(name) AS name,
 *     bool_or(receive_weekly_hour_summary_email) AS receive_weekly_hour_summary_email,
 *     array_agg(DOMAIN) AS domains
 * FROM
 *     volunteer_partner_orgs vpo
 *     LEFT JOIN required_email_domains red ON vpo.id = red.volunteer_partner_org_id
 * GROUP BY
 *     vpo.key
 * ```
 */
export const getVolunteerPartnerOrgs = new PreparedQuery<IGetVolunteerPartnerOrgsParams,IGetVolunteerPartnerOrgsResult>(getVolunteerPartnerOrgsIR);


/** 'MigrateExistingVolunteerPartnerOrgs' parameters type */
export type IMigrateExistingVolunteerPartnerOrgsParams = void;

/** 'MigrateExistingVolunteerPartnerOrgs' return type */
export type IMigrateExistingVolunteerPartnerOrgsResult = void;

/** 'MigrateExistingVolunteerPartnerOrgs' query type */
export interface IMigrateExistingVolunteerPartnerOrgsQuery {
  params: IMigrateExistingVolunteerPartnerOrgsParams;
  result: IMigrateExistingVolunteerPartnerOrgsResult;
}

const migrateExistingVolunteerPartnerOrgsIR: any = {"name":"migrateExistingVolunteerPartnerOrgs","params":[],"usedParamSet":{},"statement":{"body":"INSERT INTO volunteer_partner_orgs_upchieve_instances (id, volunteer_partner_org_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    vpo.id,\n    vpo.created_at,\n    NOW()\nFROM\n    volunteer_partner_orgs vpo","loc":{"a":1166,"b":1380,"line":47,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO volunteer_partner_orgs_upchieve_instances (id, volunteer_partner_org_id, created_at, updated_at)
 * SELECT
 *     generate_ulid (),
 *     vpo.id,
 *     vpo.created_at,
 *     NOW()
 * FROM
 *     volunteer_partner_orgs vpo
 * ```
 */
export const migrateExistingVolunteerPartnerOrgs = new PreparedQuery<IMigrateExistingVolunteerPartnerOrgsParams,IMigrateExistingVolunteerPartnerOrgsResult>(migrateExistingVolunteerPartnerOrgsIR);


/** 'MigrateExistingvolunteerPartnerOrgRelationships' parameters type */
export type IMigrateExistingvolunteerPartnerOrgRelationshipsParams = void;

/** 'MigrateExistingvolunteerPartnerOrgRelationships' return type */
export type IMigrateExistingvolunteerPartnerOrgRelationshipsResult = void;

/** 'MigrateExistingvolunteerPartnerOrgRelationships' query type */
export interface IMigrateExistingvolunteerPartnerOrgRelationshipsQuery {
  params: IMigrateExistingvolunteerPartnerOrgRelationshipsParams;
  result: IMigrateExistingvolunteerPartnerOrgRelationshipsResult;
}

const migrateExistingvolunteerPartnerOrgRelationshipsIR: any = {"name":"migrateExistingvolunteerPartnerOrgRelationships","params":[],"usedParamSet":{},"statement":{"body":"INSERT INTO users_volunteer_partner_orgs_instances (user_id, volunteer_partner_org_id, created_at, updated_at)\nSELECT\n    users.id,\n    vp.volunteer_partner_org_id,\n    vp.created_at,\n    NOW()\nFROM\n    users\n    JOIN volunteer_profiles vp ON vp.user_id = users.id\nWHERE\n    vp.volunteer_partner_org_id IS NOT NULL","loc":{"a":1445,"b":1758,"line":58,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_volunteer_partner_orgs_instances (user_id, volunteer_partner_org_id, created_at, updated_at)
 * SELECT
 *     users.id,
 *     vp.volunteer_partner_org_id,
 *     vp.created_at,
 *     NOW()
 * FROM
 *     users
 *     JOIN volunteer_profiles vp ON vp.user_id = users.id
 * WHERE
 *     vp.volunteer_partner_org_id IS NOT NULL
 * ```
 */
export const migrateExistingvolunteerPartnerOrgRelationships = new PreparedQuery<IMigrateExistingvolunteerPartnerOrgRelationshipsParams,IMigrateExistingvolunteerPartnerOrgRelationshipsResult>(migrateExistingvolunteerPartnerOrgRelationshipsIR);


