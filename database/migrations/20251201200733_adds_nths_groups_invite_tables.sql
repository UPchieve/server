-- migrate:up
ALTER TABLE upchieve.nths_groups
    ADD COLUMN invite_code uuid UNIQUE NOT NULL DEFAULT gen_random_uuid ();

CREATE INDEX nths_groups_invite_code_index ON upchieve.nths_groups (invite_code);

-- migrate:down
DROP INDEX upchieve.nths_groups_invite_code_index;

ALTER TABLE upchieve.nths_groups
    DROP COLUMN invite_code;

