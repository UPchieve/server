-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.users (
    id uuid PRIMARY KEY,
    verified boolean NOT NULL DEFAULT FALSE,
    email_verified boolean NOT NULL DEFAULT FALSE,
    phone_verified boolean NOT NULL DEFAULT FALSE,
    email text NOT NULL UNIQUE,
    password text NOT NULL,
    password_reset_token text,
    first_name text NOT NULL,
    last_name text NOT NULL,
    deactivated boolean NOT NULL DEFAULT FALSE,
    last_activity_at timestamp,
    referral_code text NOT NULL UNIQUE,
    referred_by uuid,
    test_user boolean NOT NULL DEFAULT FALSE,
    banned boolean NOT NULL DEFAULT FALSE,
    ban_reason_id int REFERENCES upchieve.ban_reasons (id),
    time_tutored bigint,
    signup_source_id int REFERENCES upchieve.signup_sources (id),
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.users CASCADE;

