/* @name getSponsorOrgs */
SELECT
    so.key,
    max(so.name) AS name,
    array_agg(sso.school_id) AS school_ids,
    array_agg(spo.key) AS student_partner_org_keys
FROM
    sponsor_orgs so
    JOIN schools_sponsor_orgs sso ON so.id = sso.sponsor_org_id
    JOIN student_partner_orgs_sponsor_orgs sposo ON so.id = sposo.sponsor_org_id
    JOIN student_partner_orgs spo ON sposo.student_partner_org_id = spo.id
GROUP BY
    so.key;


/* @name getSponsorOrgsByKey */
SELECT
    so.key,
    max(so.name) AS name,
    array_agg(sso.school_id) AS school_ids,
    array_agg(spo.key) AS student_partner_org_keys
FROM
    sponsor_orgs so
    JOIN schools_sponsor_orgs sso ON so.id = sso.sponsor_org_id
    JOIN student_partner_orgs_sponsor_orgs sposo ON so.id = sposo.sponsor_org_id
    JOIN student_partner_orgs spo ON sposo.student_partner_org_id = spo.id
WHERE
    so.key = :sponsorOrg!
GROUP BY
    so.key;

