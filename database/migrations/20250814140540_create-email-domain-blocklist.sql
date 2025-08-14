-- migrate:up
CREATE TABLE upchieve.email_domain_blocklist (
    id serial PRIMARY KEY,
    domain character varying(255) NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX "IDX_email_domain_blocklist_domain" ON upchieve.email_domain_blocklist ("domain");

-- migrate:down
DROP TABLE IF EXISTS upchieve.email_domain_blocklist CASCADE;

