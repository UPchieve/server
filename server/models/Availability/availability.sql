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

