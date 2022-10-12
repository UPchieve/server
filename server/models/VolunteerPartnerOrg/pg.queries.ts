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
  deactivated: boolean | null;
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

const getFullVolunteerPartnerOrgByKeyIR: any = {"name":"getFullVolunteerPartnerOrgByKey","params":[{"name":"key","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":962,"b":965,"line":34,"col":11}]}}],"usedParamSet":{"key":true},"statement":{"body":"SELECT\n    KEY,\n    max(name) AS name,\n    bool_or(receive_weekly_hour_summary_email) AS receive_weekly_hour_summary_email,\n    array_agg(DOMAIN) AS domains,\n    CASE WHEN vpoui.deactivated_on IS NULL THEN\n        FALSE\n    ELSE\n        TRUE\n    END AS deactivated\nFROM\n    volunteer_partner_orgs vpo\n    LEFT JOIN required_email_domains red ON vpo.id = red.volunteer_partner_org_id\n    JOIN volunteer_partner_orgs_upchieve_instances vpoui ON vpo.id = vpoui.volunteer_partner_org_id\nWHERE\n    KEY = :key!\nGROUP BY\n    vpo.key,\n    vpoui.deactivated_on","loc":{"a":462,"b":1012,"line":19,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     KEY,
 *     max(name) AS name,
 *     bool_or(receive_weekly_hour_summary_email) AS receive_weekly_hour_summary_email,
 *     array_agg(DOMAIN) AS domains,
 *     CASE WHEN vpoui.deactivated_on IS NULL THEN
 *         FALSE
 *     ELSE
 *         TRUE
 *     END AS deactivated
 * FROM
 *     volunteer_partner_orgs vpo
 *     LEFT JOIN required_email_domains red ON vpo.id = red.volunteer_partner_org_id
 *     JOIN volunteer_partner_orgs_upchieve_instances vpoui ON vpo.id = vpoui.volunteer_partner_org_id
 * WHERE
 *     KEY = :key!
 * GROUP BY
 *     vpo.key,
 *     vpoui.deactivated_on
 * ```
 */
export const getFullVolunteerPartnerOrgByKey = new PreparedQuery<IGetFullVolunteerPartnerOrgByKeyParams,IGetFullVolunteerPartnerOrgByKeyResult>(getFullVolunteerPartnerOrgByKeyIR);


/** 'GetVolunteerPartnerOrgs' parameters type */
export type IGetVolunteerPartnerOrgsParams = void;

/** 'GetVolunteerPartnerOrgs' return type */
export interface IGetVolunteerPartnerOrgsResult {
  deactivated: boolean | null;
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

const getVolunteerPartnerOrgsIR: any = {"name":"getVolunteerPartnerOrgs","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    KEY,\n    max(name) AS name,\n    bool_or(receive_weekly_hour_summary_email) AS receive_weekly_hour_summary_email,\n    array_agg(DOMAIN) AS domains,\n    CASE WHEN vpoui.deactivated_on IS NULL THEN\n        FALSE\n    ELSE\n        TRUE\n    END AS deactivated\nFROM\n    volunteer_partner_orgs vpo\n    LEFT JOIN required_email_domains red ON vpo.id = red.volunteer_partner_org_id\n    JOIN volunteer_partner_orgs_upchieve_instances vpoui ON vpo.id = vpoui.volunteer_partner_org_id\nGROUP BY\n    vpo.key,\n    vpoui.deactivated_on","loc":{"a":1053,"b":1581,"line":41,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     KEY,
 *     max(name) AS name,
 *     bool_or(receive_weekly_hour_summary_email) AS receive_weekly_hour_summary_email,
 *     array_agg(DOMAIN) AS domains,
 *     CASE WHEN vpoui.deactivated_on IS NULL THEN
 *         FALSE
 *     ELSE
 *         TRUE
 *     END AS deactivated
 * FROM
 *     volunteer_partner_orgs vpo
 *     LEFT JOIN required_email_domains red ON vpo.id = red.volunteer_partner_org_id
 *     JOIN volunteer_partner_orgs_upchieve_instances vpoui ON vpo.id = vpoui.volunteer_partner_org_id
 * GROUP BY
 *     vpo.key,
 *     vpoui.deactivated_on
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

const migrateExistingVolunteerPartnerOrgsIR: any = {"name":"migrateExistingVolunteerPartnerOrgs","params":[],"usedParamSet":{},"statement":{"body":"INSERT INTO volunteer_partner_orgs_upchieve_instances (id, volunteer_partner_org_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    vpo.id,\n    vpo.created_at,\n    NOW()\nFROM\n    volunteer_partner_orgs vpo","loc":{"a":1634,"b":1848,"line":61,"col":0}}};

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

const migrateExistingvolunteerPartnerOrgRelationshipsIR: any = {"name":"migrateExistingvolunteerPartnerOrgRelationships","params":[],"usedParamSet":{},"statement":{"body":"INSERT INTO users_volunteer_partner_orgs_instances (user_id, volunteer_partner_org_id, created_at, updated_at)\nSELECT\n    users.id,\n    vp.volunteer_partner_org_id,\n    vp.created_at,\n    NOW()\nFROM\n    users\n    JOIN volunteer_profiles vp ON vp.user_id = users.id\nWHERE\n    vp.volunteer_partner_org_id IS NOT NULL","loc":{"a":1913,"b":2226,"line":72,"col":0}}};

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


/** 'BackfillVolunteerPartnerOrgStartDates' parameters type */
export interface IBackfillVolunteerPartnerOrgStartDatesParams {
  createdAt: Date;
  endedAt: Date | null | void;
  vpoName: string;
}

/** 'BackfillVolunteerPartnerOrgStartDates' return type */
export interface IBackfillVolunteerPartnerOrgStartDatesResult {
  ok: string;
}

/** 'BackfillVolunteerPartnerOrgStartDates' query type */
export interface IBackfillVolunteerPartnerOrgStartDatesQuery {
  params: IBackfillVolunteerPartnerOrgStartDatesParams;
  result: IBackfillVolunteerPartnerOrgStartDatesResult;
}

const backfillVolunteerPartnerOrgStartDatesIR: any = {"name":"backfillVolunteerPartnerOrgStartDates","params":[{"name":"createdAt","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2356,"b":2365,"line":89,"col":18}]}},{"name":"endedAt","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2390,"b":2396,"line":90,"col":22}]}},{"name":"vpoName","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2564,"b":2571,"line":96,"col":20}]}}],"usedParamSet":{"createdAt":true,"endedAt":true,"vpoName":true},"statement":{"body":"UPDATE\n    volunteer_partner_orgs_upchieve_instances\nSET\n    created_at = :createdAt!,\n    deactivated_on = :endedAt,\n    updated_at = NOW()\nFROM\n    volunteer_partner_orgs vpo\nWHERE\n    vpo.id = volunteer_partner_orgs_upchieve_instances.volunteer_partner_org_id\n    AND vpo.name = :vpoName!\nRETURNING\n    volunteer_partner_orgs_upchieve_instances.id AS ok","loc":{"a":2281,"b":2636,"line":86,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_partner_orgs_upchieve_instances
 * SET
 *     created_at = :createdAt!,
 *     deactivated_on = :endedAt,
 *     updated_at = NOW()
 * FROM
 *     volunteer_partner_orgs vpo
 * WHERE
 *     vpo.id = volunteer_partner_orgs_upchieve_instances.volunteer_partner_org_id
 *     AND vpo.name = :vpoName!
 * RETURNING
 *     volunteer_partner_orgs_upchieve_instances.id AS ok
 * ```
 */
export const backfillVolunteerPartnerOrgStartDates = new PreparedQuery<IBackfillVolunteerPartnerOrgStartDatesParams,IBackfillVolunteerPartnerOrgStartDatesResult>(backfillVolunteerPartnerOrgStartDatesIR);


