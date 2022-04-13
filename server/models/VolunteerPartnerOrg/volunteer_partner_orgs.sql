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
    array_agg(DOMAIN) AS domains
FROM
    volunteer_partner_orgs vpo
    LEFT JOIN required_email_domains red ON vpo.id = red.volunteer_partner_org_id
WHERE
    KEY = :key!
GROUP BY
    vpo.key;


/* @name getVolunteerPartnerOrgs */
SELECT
    KEY,
    max(name) AS name,
    bool_or(receive_weekly_hour_summary_email) AS receive_weekly_hour_summary_email,
    array_agg(DOMAIN) AS domains
FROM
    volunteer_partner_orgs vpo
    LEFT JOIN required_email_domains red ON vpo.id = red.volunteer_partner_org_id
GROUP BY
    vpo.key;

