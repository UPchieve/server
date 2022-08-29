-- migrate:up
ALTER TABLE upchieve.ineligible_students
    ADD COLUMN referred_by uuid;

-- migrate:down
ALTER TABLE upchieve.ineligible_students
    DROP COLUMN referred_by;

