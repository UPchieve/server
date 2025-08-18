/* @name getFederatedCredential */
SELECT
    *
FROM
    federated_credentials
WHERE
    id = :id!
    AND issuer = :issuer!;


/* @name getFederatedCredentialForUser */
SELECT
    *
FROM
    federated_credentials
WHERE
    user_id = :userId!;


/* @name insertFederatedCredential */
INSERT INTO federated_credentials (id, issuer, user_id)
    VALUES (:id!, :issuer!, :userId!)
ON CONFLICT
    DO NOTHING;


/* @name deleteFederatedCredentialsForUser */
DELETE FROM federated_credentials
WHERE user_id = :userId!;

