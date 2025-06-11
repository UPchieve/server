/* @name createUpfByUserId */
INSERT INTO user_product_flags (user_id, created_at, updated_at)
SELECT
    :userId!,
    NOW(),
    NOW()
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
    fall_incentive_enrollment_at,
    impact_study_enrollment_at,
    tell_them_college_prep_modal_seen_at,
    impact_study_campaigns,
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
    fall_incentive_enrollment_at,
    impact_study_enrollment_at,
    tell_them_college_prep_modal_seen_at,
    impact_study_campaigns,
    created_at,
    updated_at
FROM
    user_product_flags
WHERE
    user_id = :userId!;


/* @name getPublicUpfByUserId */
SELECT
    user_id,
    gates_qualified,
    fall_incentive_enrollment_at,
    impact_study_enrollment_at,
    tell_them_college_prep_modal_seen_at,
    impact_study_campaigns
FROM
    user_product_flags
WHERE
    user_id = :userId!;


/* @name updateSentInactiveThirtyDayEmail */
UPDATE
    user_product_flags
SET
    sent_inactive_thirty_day_email = :sentInactiveThirtyDayEmail!,
    updated_at = NOW()
WHERE
    user_id = :userId!
RETURNING
    user_id AS ok;


/* @name updateSentInactiveSixtyDayEmail */
UPDATE
    user_product_flags
SET
    sent_inactive_sixty_day_email = :sentInactiveSixtyDayEmail!,
    updated_at = NOW()
WHERE
    user_id = :userId!
RETURNING
    user_id AS ok;


/* @name updateSentInactiveNinetyDayEmail */
UPDATE
    user_product_flags
SET
    sent_inactive_ninety_day_email = :sentInactiveNinetyDayEmail!,
    updated_at = NOW()
WHERE
    user_id = :userId!
RETURNING
    user_id AS ok;


/* @name enrollStudentToFallIncentiveProgram */
UPDATE
    user_product_flags
SET
    fall_incentive_enrollment_at = NOW(),
    updated_at = NOW()
WHERE
    user_id = :userId!
RETURNING
    fall_incentive_enrollment_at;


/* @name enrollStudentToImpactStudy */
UPDATE
    user_product_flags
SET
    impact_study_enrollment_at = NOW(),
    updated_at = NOW()
WHERE
    user_id = :userId!
RETURNING
    impact_study_enrollment_at;


/* @name tellThemCollegePrepModalSeenAt */
UPDATE
    user_product_flags
SET
    tell_them_college_prep_modal_seen_at = NOW(),
    updated_at = NOW()
WHERE
    user_id = :userId!
RETURNING
    tell_them_college_prep_modal_seen_at;


/* @name upsertImpactStudyCampaign */
UPDATE
    user_product_flags
SET
    impact_study_campaigns = jsonb_set(COALESCE(impact_study_campaigns, '{}'), ARRAY[:campaignId], to_jsonb (:campaignData::jsonb), TRUE),
    updated_at = NOW()
WHERE
    user_id = :userId!
RETURNING
    user_id AS ok;

