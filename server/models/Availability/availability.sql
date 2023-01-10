/* @name getAvailabilityForVolunteer */
SELECT
    availabilities.id,
    availabilities.available_start,
    availabilities.available_end,
    availabilities.timezone,
    weekdays.day AS weekday
FROM
    availabilities
    LEFT JOIN weekdays ON availabilities.weekday_id = weekdays.id
    LEFT JOIN users ON availabilities.user_id = users.id
WHERE
    availabilities.user_id::uuid = :userId
    OR users.mongo_id::text = :mongoUserId;


/* 
 @name getAvailabilityForVolunteerHeatmap
 */
WITH certs_for_subject AS (
    SELECT
        COUNT(*)::int AS total
    FROM
        certification_subject_unlocks
        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
    WHERE
        subjects.name = :subject!
),
certs_for_computed_subject AS (
    SELECT
        COUNT(*)::int AS total
    FROM
        computed_subject_unlocks
        JOIN subjects ON subjects.id = computed_subject_unlocks.subject_id
    WHERE
        subjects.name = :subject!
)
SELECT
    availabilities.id,
    availabilities.available_start,
    availabilities.available_end,
    availabilities.timezone,
    availabilities.user_id,
    weekdays.day AS weekday
FROM
    availabilities
    LEFT JOIN weekdays ON availabilities.weekday_id = weekdays.id
    JOIN users ON users.id = availabilities.user_id
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN (
        SELECT
            users_certifications.user_id,
            COUNT(*)::int AS earned_certs,
            certs_for_subject.total
        FROM
            users_certifications
            JOIN certification_subject_unlocks USING (certification_id)
            JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
            JOIN certs_for_subject ON TRUE
        WHERE
            subjects.name = :subject!
        GROUP BY
            users_certifications.user_id, subjects.name, certs_for_subject.total) user_certs ON user_certs.user_id = users.id
    LEFT JOIN (
        SELECT
            users_certifications.user_id,
            COUNT(*)::int AS earned_certs,
            certs_for_computed_subject.total
        FROM
            users_certifications
            JOIN computed_subject_unlocks USING (certification_id)
            JOIN subjects ON computed_subject_unlocks.subject_id = subjects.id
            JOIN certs_for_computed_subject ON TRUE
        WHERE
            subjects.name = :subject!
        GROUP BY
            users_certifications.user_id, subjects.name, certs_for_computed_subject.total
        HAVING
            COUNT(*)::int >= certs_for_computed_subject.total) user_computed_subjects ON user_computed_subjects.user_id = users.id
WHERE
    users.test_user IS FALSE
    AND volunteer_profiles.onboarded IS TRUE
    AND users.deactivated IS FALSE
    AND users.banned IS FALSE
    AND (user_certs.total IS NOT NULL
        OR user_computed_subjects.total IS NOT NULL);


/* @name getAvailabilityHistoryForDatesByVolunteerId */
SELECT
    availability_histories.id,
    availability_histories.recorded_at,
    availability_histories.available_start,
    availability_histories.available_end,
    availability_histories.timezone,
    weekdays.day AS weekday
FROM
    availability_histories
    LEFT JOIN weekdays ON availability_histories.weekday_id = weekdays.id
WHERE
    user_id = :userId!
    AND recorded_at >= :start!
    AND recorded_at <= :end!
ORDER BY
    recorded_at;


/* @name getLegacyAvailabilityHistoryForDatesByVolunteerId */
SELECT
    legacy_availability_histories.id,
    legacy_availability_histories.recorded_at,
    legacy_availability_histories.legacy_availability,
    legacy_availability_histories.timezone
FROM
    legacy_availability_histories
WHERE
    user_id = :userId!
    AND recorded_at >= :start!
    AND recorded_at <= :end!
ORDER BY
    recorded_at;


/* @name saveCurrentAvailabilityAsHistory */
INSERT INTO availability_histories (id, recorded_at, user_id, available_start, available_end, timezone, weekday_id, created_at, updated_at)
SELECT
    generate_ulid (),
    NOW(),
    user_id,
    available_start,
    available_end,
    timezone,
    weekday_id,
    NOW(),
    NOW()
FROM
    availabilities
WHERE
    user_id = :userId!
RETURNING
    id AS ok;


/* @name saveAvailabilityAsHistoryByDate */
INSERT INTO availability_histories (id, recorded_at, user_id, available_start, available_end, timezone, weekday_id, created_at, updated_at)
SELECT
    generate_ulid (),
    :recordedAt!,
    user_id,
    available_start,
    available_end,
    timezone,
    weekday_id,
    NOW(),
    NOW()
FROM
    availability_histories
WHERE
    recorded_at = (
        SELECT
            MAX(recorded_at)
        FROM
            availability_histories
        WHERE
            recorded_at <= :recordedAt!
            AND user_id = :userId!)
RETURNING
    id AS ok;


/* @name insertNewAvailability */
INSERT INTO availabilities (id, user_id, weekday_id, available_start, available_end, timezone, created_at, updated_at)
SELECT
    :id!,
    :userId!,
    id,
    :availableStart!,
    :availableEnd!,
    :timezone!,
    NOW(),
    NOW()
FROM
    weekdays
WHERE
    day = :day!
RETURNING
    id AS ok;


/* @name clearAvailabilityForVolunteer */
DELETE FROM availabilities
WHERE user_id = :userId!
RETURNING
    user_id AS ok;


/* @name saveLegacyAvailability */
INSERT INTO legacy_availability_histories (id, user_id, timezone, recorded_at, legacy_availability, created_at, updated_at)
SELECT
    :id!,
    :userId!,
    availabilities.timezone,
    NOW(),
    :availability!,
    NOW(),
    NOW()
FROM
    availabilities
WHERE
    user_id = :userId!
LIMIT 1
RETURNING
    id AS ok;


/* @name getAvailabilityForVolunteerByDate */
SELECT
    availability_histories.id,
    availability_histories.available_start,
    availability_histories.available_end,
    availability_histories.timezone,
    availability_histories.recorded_at,
    weekdays.day AS weekday
FROM
    availability_histories
    LEFT JOIN weekdays ON availability_histories.weekday_id = weekdays.id
    LEFT JOIN users ON availability_histories.user_id = users.id
WHERE
    recorded_at = (
        SELECT
            MAX(recorded_at)
        FROM
            availability_histories
        WHERE
            recorded_at <= :recordedAt!
            AND user_id = :userId!)
    AND user_id = :userId!;

