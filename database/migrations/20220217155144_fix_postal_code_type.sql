-- migrate:up
ALTER TABLE upchieve.student_profiles
    ALTER COLUMN postal_code TYPE text;

ALTER TABLE upchieve.ineligible_students
    ALTER COLUMN postal_code TYPE text;

-- migrate:down
ALTER TABLE upchieve.student_profiles
    ALTER COLUMN postal_code TYPE VARCHAR(2);

ALTER TABLE upchieve.ineligible_students
    ALTER COLUMN postal_code TYPE VARCHAR(2);

