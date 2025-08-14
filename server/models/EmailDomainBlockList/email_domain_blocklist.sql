/* @name getBlockedEmailDomainByDomain */
SELECT
    DOMAIN
FROM
    email_domain_blocklist
WHERE
    DOMAIN = :email_domain!;

