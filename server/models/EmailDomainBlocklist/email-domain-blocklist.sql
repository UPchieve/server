/* @name getEmailDomainBlocklistEntry */
SELECT
    id,
    DOMAIN
FROM
    upchieve.email_domain_blocklist
WHERE
    DOMAIN = :domain!;

