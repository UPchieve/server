-- migrate:up
SET LOCAL lock_timeout = '5s';

ALTER TABLE upchieve.nths_group_renewal_candidates
    DROP COLUMN named_at,
    DROP COLUMN named_by,
    DROP COLUMN accepted,
    DROP COLUMN responded_at;

-- migrate:down
SET LOCAL lock_timeout = '5s';

ALTER TABLE upchieve.nths_group_renewal_candidates
    ADD COLUMN named_at timestamp with time zone,
    ADD COLUMN named_by uuid,
    ADD COLUMN accepted boolean,
    ADD COLUMN responded_at timestamp with time zone;

ALTER TABLE upchieve.nths_group_renewal_candidates
    ADD CONSTRAINT nths_group_renewal_candidates_named_by_fkey FOREIGN KEY (named_by) REFERENCES upchieve.users (id);

ALTER TABLE upchieve.nths_group_renewal_candidates
    ADD CONSTRAINT accepted_and_responded_at_together CHECK ((accepted IS NULL) = (responded_at IS NULL));

COMMENT ON COLUMN upchieve.nths_group_renewal_candidates.named_at IS 'not_pii: When an admin named the user as a successor; null for a member who answers at the member stage';

COMMENT ON COLUMN upchieve.nths_group_renewal_candidates.named_by IS 'not_pii: Foreign key to upchieve.users; the admin who named the user, null for a member who answers at the member stage';

COMMENT ON COLUMN upchieve.nths_group_renewal_candidates.accepted IS 'not_pii: true when the user accepted the presidency, false when they declined or stepped down, null before they answer';

COMMENT ON COLUMN upchieve.nths_group_renewal_candidates.responded_at IS 'not_pii: When the user responded';

