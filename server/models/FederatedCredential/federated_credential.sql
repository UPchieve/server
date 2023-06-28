/* @name getFederatedCredential */
SELECT
    *
FROM
    federated_credentials
WHERE
    id = :id!
    AND issuer = :issuer!;


/* @name insertFederatedCredential */
INSERT INTO federated_credentials (id, issuer, user_id)
    VALUES (:id!, :issuer!, :userId!);

