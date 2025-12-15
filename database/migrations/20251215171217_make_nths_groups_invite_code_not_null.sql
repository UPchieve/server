-- migrate:up
ALTER TABLE upchieve.nths_groups
    ALTER COLUMN invite_code SET NOT NULL;

-- migrate:down
ALTER TABLE upchieve.nths_groups
    ALTER COLUMN invite_code DROP NOT NULL;

