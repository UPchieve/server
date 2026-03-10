-- migrate:up
CREATE TABLE upchieve.totp (
    user_id uuid PRIMARY KEY REFERENCES upchieve.users (id),
    secret text NOT NULL,
    verified boolean NOT NULL DEFAULT FALSE,
    last_used_counter integer,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- migrate:down
DROP TABLE upchieve.totp;

