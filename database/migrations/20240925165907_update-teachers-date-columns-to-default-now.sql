-- migrate:up
ALTER TABLE upchieve.teacher_classes
    ALTER COLUMN created_at SET DEFAULT NOW(),
    ALTER COLUMN updated_at SET DEFAULT NOW();

ALTER TABLE upchieve.students_assignments
    ALTER COLUMN created_at SET DEFAULT NOW(),
    ALTER COLUMN updated_at SET DEFAULT NOW();

-- migrate:down
ALTER TABLE upchieve.teacher_classes
    ALTER COLUMN created_at SET DEFAULT NULL,
    ALTER COLUMN updated_at SET DEFAULT NULL;

ALTER TABLE upchieve.students_assignments
    ALTER COLUMN created_at SET DEFAULT NULL,
    ALTER COLUMN updated_at SET DEFAULT NULL;

