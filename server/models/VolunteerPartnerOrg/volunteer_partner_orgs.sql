/* @name getVolunteerPartnerOrgForRegistrationByKey */
SELECT key, ARRAY_AGG(domain) AS domains
FROM volunteer_partner_orgs vpo
JOIN required_email_domains red ON vpo.id = red.volunteer_partner_org_id
WHERE key=:key!
GROUP BY key;

/* @name getFullVolunteerPartnerOrgByKey */
select 
       key,
       max(name) as name,
       bool_or(receive_weekly_hour_summary_email) as receive_weekly_hour_summary_email,
       array_agg(domain) as domains
from volunteer_partner_orgs vpo
join required_email_domains red on vpo.id = red.volunteer_partner_org_id
where key=:key!
group by vpo.key;

/* @name getVolunteerPartnerOrgs */
select 
       key,
       max(name) as name,
       bool_or(receive_weekly_hour_summary_email) as receive_weekly_hour_summary_email,
       array_agg(domain) as domains
from volunteer_partner_orgs vpo
join required_email_domains red on vpo.id = red.volunteer_partner_org_id
group by vpo.key;
