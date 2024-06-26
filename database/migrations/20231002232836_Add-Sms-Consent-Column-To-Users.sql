-- migrate:up
ALTER TABLE upchieve.users
    ADD COLUMN IF NOT EXISTS sms_consent BOOLEAN NOT NULL DEFAULT FALSE;

WITH student_user_ids AS (
    SELECT
        user_id
    FROM
        upchieve.users_roles
    WHERE
        role_id = 1
),
volunteer_user_ids AS (
    SELECT
        user_id
    FROM
        upchieve.users_roles
    WHERE
        role_id = 2
),
admin_user_ids AS (
    SELECT
        user_id
    FROM
        upchieve.users_roles
    WHERE
        role_id = 3)
UPDATE
    upchieve.users u
SET
    sms_consent = (
        CASE WHEN u.id IN (
            SELECT
                user_id
            FROM
                student_user_ids) THEN
            FALSE
        WHEN u.id IN (
            SELECT
                user_id
            FROM
                volunteer_user_ids) THEN
            TRUE
        WHEN u.id IN (
            SELECT
                user_id
            FROM
                admin_user_ids) THEN
            TRUE
        ELSE
            FALSE
        END);

-- migrate:down
ALTER TABLE upchieve.users
    DROP COLUMN IF EXISTS sms_consent;

