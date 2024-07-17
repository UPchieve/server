-- migrate:up
CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE auth.session (
    "sid" varchar NOT NULL COLLATE "default",
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL
)
WITH (
    OIDS = FALSE
);

ALTER TABLE auth.session
    ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON auth.session ("expire");

-- migrate:down
DROP TABLE auth.session CASCADE;

DROP SCHEMA IF EXISTS auth;

