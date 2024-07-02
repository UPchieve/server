/* @name getAssociatedPartners */
SELECT
    ap.key AS KEY,
    vpo.id AS volunteer_partner_org_id,
    vpo.key AS volunteer_partner_org,
    vpo.name AS volunteer_org_display,
    spo.id AS student_partner_org_id,
    spo.key AS student_partner_org,
    coalesce(spo.name, so.name) AS student_org_display,
    so.id AS student_sponsor_org_id,
    so.key AS student_sponsor_org
FROM
    associated_partners ap
    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id
    JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id
    JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id;


/* @name getAssociatedPartnerByKey */
SELECT
    ap.key AS KEY,
    vpo.id AS volunteer_partner_org_id,
    vpo.key AS volunteer_partner_org,
    vpo.name AS volunteer_org_display,
    spo.id AS student_partner_org_id,
    spo.key AS student_partner_org,
    coalesce(spo.name, so.name) AS student_org_display,
    so.id AS student_sponsor_org_id,
    so.key AS student_sponsor_org
FROM
    associated_partners ap
    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id
    LEFT JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id
    LEFT JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id
WHERE
    ap.key = :key!;


/* @name getAssociatedPartnerBySponsorOrgKey */
SELECT
    ap.key AS KEY,
    vpo.id AS volunteer_partner_org_id,
    vpo.key AS volunteer_partner_org,
    vpo.name AS volunteer_org_display,
    spo.id AS student_partner_org_id,
    spo.key AS student_partner_org,
    coalesce(spo.name, so.name) AS student_org_display,
    so.id AS student_sponsor_org_id,
    so.key AS student_sponsor_org
FROM
    associated_partners ap
    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id
    LEFT JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id
    LEFT JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id
WHERE
    so.key = :key!;


/* @name getAssociatedPartnerByPartnerOrgKey */
SELECT
    ap.key AS KEY,
    vpo.id AS volunteer_partner_org_id,
    vpo.key AS volunteer_partner_org,
    vpo.name AS volunteer_org_display,
    spo.id AS student_partner_org_id,
    spo.key AS student_partner_org,
    coalesce(spo.name, so.name) AS student_org_display,
    so.id AS student_sponsor_org_id,
    so.key AS student_sponsor_org
FROM
    associated_partners ap
    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id
    LEFT JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id
    LEFT JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id
WHERE
    spo.key = :key!;


/* @name getAssociatedPartnerByVolunteerPartnerKey */
SELECT
    ap.key AS KEY,
    vpo.id AS volunteer_partner_org_id,
    vpo.key AS volunteer_partner_org,
    vpo.name AS volunteer_org_display,
    spo.id AS student_partner_org_id,
    spo.key AS student_partner_org,
    coalesce(spo.name, so.name) AS student_org_display,
    so.id AS student_sponsor_org_id,
    so.key AS student_sponsor_org
FROM
    associated_partners ap
    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id
    LEFT JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id
    LEFT JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id
WHERE
    vpo.key = :key!;


/* @name migrateStudentPartnerOrgAssociatedPartners */
INSERT INTO student_partner_orgs_volunteer_partner_orgs_instances (student_partner_org_id, volunteer_partner_org_id, created_at, updated_at)
SELECT
    ap.student_partner_org_id,
    ap.volunteer_partner_org_id,
    ap.created_at,
    NOW()
FROM
    associated_partners ap
WHERE
    ap.student_partner_org_id IS NOT NULL;


/* @name migrateSponsorOrgAssociatedPartners */
INSERT INTO sponsor_orgs_volunteer_partner_orgs_instances (sponsor_org_id, volunteer_partner_org_id, created_at, updated_at)
SELECT
    ap.student_sponsor_org_id,
    ap.volunteer_partner_org_id,
    ap.created_at,
    NOW()
FROM
    associated_partners ap
WHERE
    ap.student_sponsor_org_id IS NOT NULL;

