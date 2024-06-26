-- migrate:up
DROP TABLE IF EXISTS upchieve.references CASCADE;

CREATE TABLE IF NOT EXISTS upchieve.volunteer_references (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    status_id int REFERENCES upchieve.volunteer_reference_statuses (id),
    sent_at timestamp,
    affiliation text,
    relationship_length text,
    patient smallint,
    positive_role_model smallint,
    agreeable_and_approachable smallint,
    communicates_effectively smallint,
    rejection_reason text,
    additional_info text,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

ALTER TABLE upchieve.volunteer_references
    ADD CONSTRAINT user_id_ref_email_unique UNIQUE (user_id, email);

-- migrate:down
CREATE TABLE IF NOT EXISTS upchieve.references (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    status_id int REFERENCES upchieve.volunteer_reference_statuses (id),
    sent_at timestamp,
    affiliation text,
    relationship_length text,
    patient smallint,
    positive_role_model smallint,
    agreeable_and_approachable smallint,
    communicates_effectively smallint,
    rejection_reason text,
    additional_info text,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

DROP TABLE IF EXISTS upchieve.volunteer_references CASCADE;

