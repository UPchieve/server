-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.contact_form_submissions (
    id uuid PRIMARY KEY,
    user_id uuid REFERENCES upchieve.users (id),
    user_email text,
    message text NOT NULL,
    topic text NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

-- migrate:down
DROP TABLE upchieve.contact_form_submissions CASCADE;

