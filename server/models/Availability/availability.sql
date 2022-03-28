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
WHERE
    user_id = :userId!;


/* 
 @name getAvailabilityForVolunteers 
 @param userIds -> (...)
 */
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
WHERE
    user_id IN :userIds!;


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
    AND recorded_at <= :end!
    AND recorded_at >= (
        SELECT
            MAX(recorded_at)
        FROM
            availability_histories
        WHERE
            recorded_at <= :start!
            AND user_id = :userId!)
ORDER BY
    recorded_at;


/* @name saveCurrentAvailabilityAsHistory */
INSERT INTO availability_histories (id, recorded_at, user_id, available_start, available_end, timezone, weekday_id, created_at, updated_at)
SELECT
    :id!,
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
    day = :day!;


/* @name clearAvailabilityForVolunteer */
DELETE FROM availabilities
WHERE user_id = :userId!
RETURNING user_id AS ok;

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
FROM availabilities
WHERE user_id = :userId!
LIMIT 1
RETURNING id AS ok;