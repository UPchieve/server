-- migrate:up
ALTER TABLE upchieve.teacher_profiles
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.teacher_classes
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

-- migrate:down
ALTER TABLE upchieve.teacher_profiles
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.teacher_classes
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

