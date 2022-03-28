/* @name getSponsorOrgs */
SELECT
       so.key,
       max(so.name) as name,
       array_agg(sso.school_id) as school_ids,
       array_agg(spo.key) as student_partner_org_keys
from sponsor_orgs so
join schools_sponsor_orgs sso on so.id = sso.sponsor_org_id
join student_partner_orgs_sponsor_orgs sposo on so.id = sposo.sponsor_org_id
join student_partner_orgs spo on sposo.student_partner_org_id = spo.id
group by so.key;
