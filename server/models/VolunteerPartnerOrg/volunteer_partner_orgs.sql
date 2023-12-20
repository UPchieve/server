/* @name getVolunteerPartnerOrgForRegistrationByKey */
SELECT
    KEY,
    COALESCE(domains.domains, '{}'::text[]) AS domains
FROM
    volunteer_partner_orgs vpo
    LEFT JOIN LATERAL (
        SELECT
            ARRAY_AGG(DOMAIN) AS domains
        FROM
            required_email_domains
        WHERE
            required_email_domains.volunteer_partner_org_id = vpo.id) AS domains ON TRUE
WHERE
    KEY = :key!;


/* @name getFullVolunteerPartnerOrgByKey */
SELECT
    KEY,
    max(name) AS name,
    bool_or(receive_weekly_hour_summary_email) AS receive_weekly_hour_summary_email,
    array_agg(DOMAIN) AS domains,
    CASE WHEN vpoui.deactivated_on IS NULL THEN
        FALSE
    ELSE
        TRUE
    END AS deactivated
FROM
    volunteer_partner_orgs vpo
    LEFT JOIN required_email_domains red ON vpo.id = red.volunteer_partner_org_id
    JOIN ( SELECT DISTINCT ON (volunteer_partner_org_id)
            volunteer_partner_org_id,
            deactivated_on
        FROM
            volunteer_partner_orgs_upchieve_instances
        ORDER BY
            volunteer_partner_org_id,
            created_at DESC) AS vpoui ON vpo.id = vpoui.volunteer_partner_org_id
WHERE
    KEY = :key!
GROUP BY
    vpo.key,
    vpoui.deactivated_on;


/* @name getVolunteerPartnerOrgs */
SELECT
    KEY,
    max(name) AS name,
    bool_or(receive_weekly_hour_summary_email) AS receive_weekly_hour_summary_email,
    array_agg(DOMAIN) AS domains,
    CASE WHEN vpoui.deactivated_on IS NULL THEN
        FALSE
    ELSE
        TRUE
    END AS deactivated
FROM
    volunteer_partner_orgs vpo
    LEFT JOIN required_email_domains red ON vpo.id = red.volunteer_partner_org_id
    JOIN ( SELECT DISTINCT ON (volunteer_partner_org_id)
            volunteer_partner_org_id,
            deactivated_on
        FROM
            volunteer_partner_orgs_upchieve_instances
        ORDER BY
            volunteer_partner_org_id,
            created_at DESC) AS vpoui ON vpo.id = vpoui.volunteer_partner_org_id
GROUP BY
    vpo.key,
    vpoui.deactivated_on;


/* @name migrateExistingVolunteerPartnerOrgs */
INSERT INTO volunteer_partner_orgs_upchieve_instances (id, volunteer_partner_org_id, created_at, updated_at)
SELECT
    generate_ulid (),
    vpo.id,
    vpo.created_at,
    NOW()
FROM
    volunteer_partner_orgs vpo;


/* @name getVolunteerPartnerOrgIdByKey */
SELECT
    id
FROM
    volunteer_partner_orgs
WHERE
    KEY = :volunteerPartnerOrg!;


/* @name migrateExistingvolunteerPartnerOrgRelationships */
INSERT INTO users_volunteer_partner_orgs_instances (user_id, volunteer_partner_org_id, created_at, updated_at)
SELECT
    users.id,
    vp.volunteer_partner_org_id,
    vp.created_at,
    NOW()
FROM
    users
    JOIN volunteer_profiles vp ON vp.user_id = users.id
WHERE
    vp.volunteer_partner_org_id IS NOT NULL;


/* @name backfillVolunteerPartnerOrgStartDates */
UPDATE
    volunteer_partner_orgs_upchieve_instances
SET
    created_at = :createdAt!,
    deactivated_on = :endedAt,
    updated_at = NOW()
FROM
    volunteer_partner_orgs vpo
WHERE
    vpo.id = volunteer_partner_orgs_upchieve_instances.volunteer_partner_org_id
    AND vpo.name = :vpoName!
RETURNING
    volunteer_partner_orgs_upchieve_instances.id AS ok;

