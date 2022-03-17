/* @name createUpfByUserId */
INSERT INTO user_product_flags (user_id, created_at, updated_at)
SELECT
    :userId!,
    NOW()::date,
    NOW()::date
WHERE
    NOT EXISTS (
        SELECT
            1
        FROM
            user_product_flags
        WHERE
            user_id = :userId!)
RETURNING
    user_id,
    sent_ready_to_coach_email,
    sent_hour_summary_intro_email,
    sent_inactive_thirty_day_email,
    sent_inactive_sixty_day_email,
    sent_inactive_ninety_day_email,
    gates_qualified,
    created_at,
    updated_at;


/* @name getUpfByUserId */
SELECT
    user_id,
    sent_ready_to_coach_email,
    sent_hour_summary_intro_email,
    sent_inactive_thirty_day_email,
    sent_inactive_sixty_day_email,
    sent_inactive_ninety_day_email,
    gates_qualified,
    created_at,
    updated_at
FROM
    user_product_flags
WHERE
    user_id = :userId!;


/* @name getPublicUpfByUserId */
SELECT
    user_id,
    gates_qualified
FROM
    user_product_flags
WHERE
    user_id = :userId!;


/* @name getAllUpf */
SELECT
    user_id,
    sent_ready_to_coach_email,
    sent_hour_summary_intro_email,
    sent_inactive_thirty_day_email,
    sent_inactive_sixty_day_email,
    sent_inactive_ninety_day_email,
    gates_qualified,
    created_at,
    updated_at
FROM
    user_product_flags;


/* @name updateUpfGatesQualifiedFlagById */
UPDATE
    user_product_flags
SET
    gates_qualified = :gatesQualified!,
    updated_at = NOW()::date
WHERE
    user_id = :userId!
RETURNING
    user_id,
    gates_qualified;


/* @name updateSentInactiveThirtyDayEmail */
UPDATE
    user_product_flags
SET
    sent_inactive_thirty_day_email = :sentInactiveThirtyDayEmail!,
    updated_at = NOW()::date
WHERE
    user_id = :userId!
RETURNING
    user_id,
    sent_inactive_thirty_day_email;


/* @name updateSentInactiveSixtyDayEmail */
UPDATE
    user_product_flags
SET
    sent_inactive_sixty_day_email = :sentInactiveSixtyDayEmail!,
    updated_at = NOW()::date
WHERE
    user_id = :userId!
RETURNING
    user_id,
    sent_inactive_sixty_day_email;


/* @name updateSentInactiveNinetyDayEmail */
UPDATE
    user_product_flags
SET
    sent_inactive_ninety_day_email = :sentInactiveNinetyDayEmail!,
    updated_at = NOW()::date
WHERE
    user_id = :userId!
RETURNING
    user_id,
    sent_inactive_ninety_day_email;

