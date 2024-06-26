/* @name getSponsorOrgs */
SELECT
    so.key,
    so.name,
    COALESCE(array_agg(sso.school_id) FILTER (WHERE sso.school_id IS NOT NULL), '{}') AS school_ids,
    COALESCE(array_agg(spo.key) FILTER (WHERE spo.key IS NOT NULL), '{}') AS student_partner_org_keys,
    COALESCE(array_agg(spo.id) FILTER (WHERE spo.id IS NOT NULL), '{}') AS student_partner_org_ids
FROM
    sponsor_orgs so
    LEFT JOIN schools_sponsor_orgs sso ON so.id = sso.sponsor_org_id
    LEFT JOIN student_partner_orgs_sponsor_orgs sposo ON so.id = sposo.sponsor_org_id
    LEFT JOIN student_partner_orgs spo ON sposo.student_partner_org_id = spo.id
GROUP BY
    so.key,
    so.name;


/* @name getSponsorOrgsByKey */
SELECT
    so.key,
    so.name,
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
    so.key,
    so.name;


/* @name migrateExistingSponsorOrgs */
INSERT INTO sponsor_orgs_upchieve_instances (id, sponsor_org_id, created_at, updated_at)
SELECT
    generate_ulid (),
    so.id,
    so.created_at,
    NOW()
FROM
    sponsor_orgs so;


/* @name migrateExistingPartnerOrgSponsorOrgRelationships */
INSERT INTO student_partner_orgs_sponsor_orgs_instances (student_partner_org_id, sponsor_org_id, created_at, updated_at)
SELECT
    sposo.student_partner_org_id,
    sposo.sponsor_org_id,
    sposo.created_at,
    NOW()
FROM
    student_partner_orgs_sponsor_orgs sposo;


/* @name migrateExistingSchoolsSponsorOrgRelationships */
INSERT INTO schools_sponsor_orgs_instances (school_id, sponsor_org_id, created_at, updated_at)
SELECT
    sso.school_id,
    sso.sponsor_org_id,
    sso.created_at,
    NOW()
FROM
    schools_sponsor_orgs sso;

