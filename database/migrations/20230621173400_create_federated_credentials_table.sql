-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.federated_credentials (
    id text NOT NULL,
    issuer text NOT NULL,
    user_id uuid REFERENCES upchieve.users (id),
    PRIMARY KEY (id, issuer)
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.federated_credentials;

