/* @name latestCandidateApplicationStatus */
SELECT
    status
FROM
    nths_candidate_applications
WHERE
    user_id = :userId!
ORDER BY
    created_at DESC,
    id DESC
LIMIT 1;


/* Separate from latestCandidateApplicationStatus because the groups page reads
 the status for every user without a chapter and has no use for the responses
 blob. */
/* @name latestCandidateApplication */
SELECT
    id,
    user_id,
    status,
    school_id,
    unlisted_school,
    form_version,
    responses,
    denied_notes,
    decided_at,
    activated_at,
    created_at
FROM
    nths_candidate_applications
WHERE
    user_id = :userId!
ORDER BY
    created_at DESC,
    id DESC
LIMIT 1;


/* The inner join to volunteer_profiles is what excludes students: they have no
 row, so the query returns nothing. current_grade_name comes from a view that
 advances the stored grade by academic year, so it is the value to show an
 applicant rather than the raw users_grade_levels row. */
/* @name candidateApplicationEligibility */
SELECT
    users.ban_type,
    volunteer_profiles.onboarded,
    volunteer_profiles.approved,
    current_grade_levels.current_grade_name,
    EXISTS (
        SELECT
            1
        FROM
            volunteer_occupations
        WHERE
            volunteer_occupations.user_id = users.id
            AND volunteer_occupations.occupation = :highSchoolOccupation!) AS is_high_school_student,
    EXISTS (
        SELECT
            1
        FROM
            sessions
        WHERE
            sessions.volunteer_id = users.id
            AND sessions.time_tutored > 0) AS has_completed_session
FROM
    users
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN current_grade_levels ON current_grade_levels.user_id = users.id
WHERE
    users.id = :userId!;


/* Dedup is the partial unique index on (user_id) WHERE status = 'applied'; a
 duplicate raises 23505. The returned columns match latestCandidateApplication so
 both feed the same mapper. */
/* @name createCandidateApplication */
INSERT INTO nths_candidate_applications (user_id, status, school_id, unlisted_school, form_version, responses)
    VALUES (:userId!, 'applied', :schoolId, :unlistedSchool, :formVersion!, :responses!)
RETURNING
    id, user_id, status, school_id, unlisted_school, form_version, responses, denied_notes, decided_at, activated_at, created_at;


/* Deciding in place rather than inserting a second row; an 'applied' row left
 behind would hold nths_one_pending_application_per_user forever and lock the
 applicant out of reapplying. The outer status check is rechecked after the row
 lock, so of two concurrent decisions the loser updates nothing instead of
 overwriting the winner.

 activated_at is stamped with the approval, which makes the reveal delay zero for
 now. Introducing the real delay means leaving it null here and letting a job set
 it later, rather than another schema change. The CASE keeps
 activation_requires_approval satisfied on a denial. */
/* @name decideCandidateApplication */
UPDATE
    nths_candidate_applications
SET
    status = :status!,
    denied_notes = :deniedNotes,
    decided_at = NOW(),
    activated_at = CASE WHEN :status!::nths_candidate_application_status = 'approved' THEN
        NOW()
    END,
    updated_at = NOW()
WHERE
    id = (
        SELECT
            id
        FROM
            nths_candidate_applications
        WHERE
            user_id = :userId!
            AND status = 'applied'
        ORDER BY
            created_at DESC,
            id DESC
        LIMIT 1)
AND status = 'applied'
RETURNING
    id,
    user_id,
    status,
    school_id,
    unlisted_school,
    form_version,
    responses,
    denied_notes,
    decided_at,
    activated_at,
    created_at;


/* Founding needs the school off the approval it is acting on. Ordered by
 activation so a later approval wins if a user somehow holds two. */
/* @name activatedCandidateApplication */
SELECT
    id,
    school_id
FROM
    nths_candidate_applications
WHERE
    user_id = :userId!
    AND activated_at IS NOT NULL
ORDER BY
    activated_at DESC,
    id DESC
LIMIT 1;


/* A school can be claimed in 2 ways, it can either have a corresponding
 nths_group_school_affiliation record for an existing nths_groups entry
 or there can already be an approved application where the applicant
 hasn't yet finished setting up the chapter. */
/* @name isSchoolClaimedForNthsChapter */
SELECT
    (EXISTS (
            SELECT
                1
            FROM
                nths_group_school_affiliation
            WHERE
                school_id = :schoolId!)
            OR EXISTS (
                SELECT
                    1
                FROM
                    nths_candidate_applications
                WHERE
                    school_id = :schoolId!
                    AND activated_at IS NOT NULL
                    AND user_id <> :userId!)) AS claimed;

