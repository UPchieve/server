-- migrate:up
SET LOCAL lock_timeout = '5s';

ALTER TABLE upchieve.nths_groups
    ADD COLUMN closed_at timestamp with time zone;

COMMENT ON COLUMN upchieve.nths_groups.closed_at IS 'not_pii: When the chapter closed; null while open';

ALTER TABLE upchieve.nths_group_school_affiliation
    ADD COLUMN released_at timestamp with time zone;

COMMENT ON COLUMN upchieve.nths_group_school_affiliation.released_at IS 'not_pii: When the chapter released the school; null while the chapter holds it';

-- The index keeps the name unique_school_id because NTHSGroupsService matches it in the error message.
ALTER TABLE upchieve.nths_group_school_affiliation
    DROP CONSTRAINT unique_school_id;

CREATE UNIQUE INDEX unique_school_id ON upchieve.nths_group_school_affiliation (school_id)
WHERE
    released_at IS NULL;

CREATE TABLE upchieve.nths_group_renewal_candidates (
    id uuid PRIMARY KEY DEFAULT upchieve.generate_ulid (),
    nths_group_id uuid NOT NULL REFERENCES upchieve.nths_groups (id),
    school_year_starts_on date NOT NULL,
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    named_at timestamp with time zone,
    named_by uuid REFERENCES upchieve.users (id),
    accepted boolean,
    responded_at timestamp with time zone,
    commitments jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp with time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT nths_group_renewal_candidates_group_school_year_user_key UNIQUE (nths_group_id, school_year_starts_on, user_id),
    CONSTRAINT accepted_and_responded_at_together CHECK ((accepted IS NULL) = (responded_at IS NULL))
);

CREATE INDEX nths_group_renewal_candidates_user_id_idx ON upchieve.nths_group_renewal_candidates (user_id);

COMMENT ON COLUMN upchieve.nths_group_renewal_candidates.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.nths_group_renewal_candidates.nths_group_id IS 'not_pii: Foreign key to upchieve.nths_groups';

COMMENT ON COLUMN upchieve.nths_group_renewal_candidates.school_year_starts_on IS 'not_pii: First day of the school year the chapter is renewing for';

COMMENT ON COLUMN upchieve.nths_group_renewal_candidates.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.nths_group_renewal_candidates.named_at IS 'not_pii: When an admin named the user as a successor; null for a member who answers at the member stage';

COMMENT ON COLUMN upchieve.nths_group_renewal_candidates.named_by IS 'not_pii: Foreign key to upchieve.users; the admin who named the user, null for a member who answers at the member stage';

COMMENT ON COLUMN upchieve.nths_group_renewal_candidates.accepted IS 'not_pii: true when the user accepted the presidency, false when they declined or stepped down, null before they answer';

COMMENT ON COLUMN upchieve.nths_group_renewal_candidates.responded_at IS 'not_pii: When the user responded';

COMMENT ON COLUMN upchieve.nths_group_renewal_candidates.commitments IS 'not_pii: Commitment keys agreed at acceptance';

COMMENT ON COLUMN upchieve.nths_group_renewal_candidates.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.nths_group_renewal_candidates.updated_at IS 'not_pii';

-- migrate:down
SET LOCAL lock_timeout = '5s';

DROP TABLE upchieve.nths_group_renewal_candidates;

DROP INDEX upchieve.unique_school_id;

ALTER TABLE upchieve.nths_group_school_affiliation
    ADD CONSTRAINT unique_school_id UNIQUE (school_id);

ALTER TABLE upchieve.nths_group_school_affiliation
    DROP COLUMN released_at;

ALTER TABLE upchieve.nths_groups
    DROP COLUMN closed_at;

