/* @name getSponsorOrgs */
SELECT
    so.key,
    max(so.name) AS name,
    COALESCE(array_agg(sso.school_id) FILTER (WHERE sso.school_id IS NOT NULL), '{}') AS school_ids,
    COALESCE(array_agg(spo.key) FILTER (WHERE spo.key IS NOT NULL), '{}') AS student_partner_org_keys,
    COALESCE(array_agg(spo.id) FILTER (WHERE spo.id IS NOT NULL), '{}') AS student_partner_org_ids
FROM
    sponsor_orgs so
    LEFT JOIN schools_sponsor_orgs sso ON so.id = sso.sponsor_org_id
    LEFT JOIN student_partner_orgs_sponsor_orgs sposo ON so.id = sposo.sponsor_org_id
    LEFT JOIN student_partner_orgs spo ON sposo.student_partner_org_id = spo.id
GROUP BY
    so.key;


/* @name getSponsorOrgsByKey */
SELECT
    so.key,
    max(so.name) AS name,
    COALESCE(array_agg(sso.school_id) FILTER (WHERE sso.school_id IS NOT NULL), '{}') AS school_ids,
    COALESCE(array_agg(spo.key) FILTER (WHERE spo.key IS NOT NULL), '{}') AS student_partner_org_keys,
    COALESCE(array_agg(spo.id) FILTER (WHERE spo.id IS NOT NULL), '{}') AS student_partner_org_ids
FROM
    sponsor_orgs so
    LEFT JOIN schools_sponsor_orgs sso ON so.id = sso.sponsor_org_id
    LEFT JOIN student_partner_orgs_sponsor_orgs sposo ON so.id = sposo.sponsor_org_id
    LEFT JOIN student_partner_orgs spo ON sposo.student_partner_org_id = spo.id
WHERE
    so.key = :sponsorOrg!
GROUP BY
    so.key;

