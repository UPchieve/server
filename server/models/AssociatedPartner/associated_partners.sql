/* @name getAssociatedPartners */
SELECT
    ap.key AS KEY,
    vpo.key AS volunteer_partner_org,
    vpo.name AS volunteer_org_display,
    spo.key AS student_partner_org,
    spo.name AS student_org_display,
    so.key AS student_sponsor_org
FROM
    associated_partners ap
    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id
    JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id
    JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id;


/* @name getAssociatedPartnerByKey */
SELECT
    ap.key AS KEY,
    vpo.key AS volunteer_partner_org,
    vpo.name AS volunteer_org_display,
    spo.key AS student_partner_org,
    spo.name AS student_org_display,
    so.key AS student_sponsor_org
FROM
    associated_partners ap
    JOIN volunteer_partner_orgs vpo ON ap.volunteer_partner_org_id = vpo.id
    JOIN student_partner_orgs spo ON ap.student_partner_org_id = spo.id
    JOIN sponsor_orgs so ON ap.student_sponsor_org_id = so.id
WHERE
    ap.key = :key!;

