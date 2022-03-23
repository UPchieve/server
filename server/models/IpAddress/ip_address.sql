/* @name getIpByRawString */
SELECT
    id,
    ip,
    status,
    created_at,
    updated_at
FROM
    ip_addresses
WHERE
    ip = :ip!;


/* @name insertIpByRawString */
INSERT INTO ip_addresses (id, ip, created_at, updated_at)
    VALUES (:id!, :ip!, NOW(), NOW())
RETURNING
    id, ip, status, created_at, updated_at;


/* @name insertUsersIpById */
INSERT INTO users_ip_addresses (id, ip_address_id, user_id, created_at, updated_at)
    VALUES (:id!, :ipId!, :userId!, NOW(), NOW())
RETURNING
    id AS ok;


/* @name updateIpStatusById */
UPDATE
    ONLY ip_addresses
SET
    status = :status!,
    updated_at = NOW()
WHERE
    id = :id!
RETURNING
    id AS ok;

