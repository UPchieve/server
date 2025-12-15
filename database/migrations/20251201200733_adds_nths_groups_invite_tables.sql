-- migrate:up
ALTER TABLE upchieve.nths_groups
    ADD COLUMN invite_code varchar(6) UNIQUE;

CREATE UNIQUE INDEX nths_groups_invite_code_index ON upchieve.nths_groups (invite_code);

-- migrate:down
DROP INDEX upchieve.nths_groups_invite_code_index;

ALTER TABLE upchieve.nths_groups
    DROP COLUMN invite_code;

