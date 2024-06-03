-- migrate:up
ALTER TABLE upchieve.sessions
    ADD COLUMN IF NOT EXISTS student_ban_type upchieve.ban_types;

UPDATE
    upchieve.sessions
SET
    student_ban_type = CASE WHEN student_banned THEN
        'complete'::upchieve.ban_types
    ELSE
        NULL
    END;

-- migrate:down
ALTER TABLE upchieve.sessions
    DROP COLUMN IF EXISTS student_ban_type;

