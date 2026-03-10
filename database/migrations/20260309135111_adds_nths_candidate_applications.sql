-- migrate:up
CREATE TYPE upchieve.nths_candidate_application_status AS ENUM (
    'applied',
    'approved',
    'denied'
);

CREATE TABLE upchieve.nths_candidate_applications (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id uuid REFERENCES upchieve.users (id) NOT NULL,
    status upchieve.nths_candidate_application_status NOT NULL,
    denied_notes text,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW() CONSTRAINT reason_required_when_denied CHECK (
    CASE WHEN status = 'denied' THEN
        denied_notes IS NOT NULL
    ELSE
        TRUE
    END),
    CONSTRAINT reason_must_be_null_when_not_denied CHECK (
    CASE WHEN status <> 'denied' THEN
        denied_notes IS NULL
    ELSE
        TRUE
    END)
);

CREATE INDEX nths_candidate_app_created_at_idx ON upchieve.nths_candidate_applications (user_id, created_at DESC);

-- migrate:down
DROP INDEX upchieve.nths_candidate_app_created_at_idx;

DROP TABLE upchieve.nths_candidate_applications;

DROP TYPE upchieve.nths_candidate_application_status;

