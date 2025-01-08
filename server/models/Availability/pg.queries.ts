/** Types generated for queries found in "server/models/Availability/availability.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** Query 'GetAvailabilityForVolunteer' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetAvailabilityForVolunteerResult = never;

/** Query 'GetAvailabilityForVolunteer' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetAvailabilityForVolunteerParams = never;

const getAvailabilityForVolunteerIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":345,"b":351}]}],"statement":"SELECT\n    availabilities.id,\n    availabilities.available_start,\n    availabilities.available_end,\n    availabilities.timezone,\n    weekdays.day AS weekday\nFROM\n    availabilities\n    LEFT JOIN weekdays ON availabilities.weekday_id = weekdays.id\n    LEFT JOIN users ON availabilities.user_id = users.id\nWHERE\n    availabilities.user_id::uuid = :userId"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     availabilities.id,
 *     availabilities.available_start,
 *     availabilities.available_end,
 *     availabilities.timezone,
 *     weekdays.day AS weekday
 * FROM
 *     availabilities
 *     LEFT JOIN weekdays ON availabilities.weekday_id = weekdays.id
 *     LEFT JOIN users ON availabilities.user_id = users.id
 * WHERE
 *     availabilities.user_id::uuid = :userId
 * ```
 */
export const getAvailabilityForVolunteer = new PreparedQuery<IGetAvailabilityForVolunteerParams,IGetAvailabilityForVolunteerResult>(getAvailabilityForVolunteerIR);


/** Query 'GetAvailabilityForLegacyVolunteer' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetAvailabilityForLegacyVolunteerResult = never;

/** Query 'GetAvailabilityForLegacyVolunteer' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetAvailabilityForLegacyVolunteerParams = never;

const getAvailabilityForLegacyVolunteerIR: any = {"usedParamSet":{"mongoUserId":true},"params":[{"name":"mongoUserId","required":false,"transform":{"type":"scalar"},"locs":[{"a":337,"b":348}]}],"statement":"SELECT\n    availabilities.id,\n    availabilities.available_start,\n    availabilities.available_end,\n    availabilities.timezone,\n    weekdays.day AS weekday\nFROM\n    availabilities\n    LEFT JOIN weekdays ON availabilities.weekday_id = weekdays.id\n    LEFT JOIN users ON availabilities.user_id = users.id\nWHERE\n    users.mongo_id::text = :mongoUserId"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     availabilities.id,
 *     availabilities.available_start,
 *     availabilities.available_end,
 *     availabilities.timezone,
 *     weekdays.day AS weekday
 * FROM
 *     availabilities
 *     LEFT JOIN weekdays ON availabilities.weekday_id = weekdays.id
 *     LEFT JOIN users ON availabilities.user_id = users.id
 * WHERE
 *     users.mongo_id::text = :mongoUserId
 * ```
 */
export const getAvailabilityForLegacyVolunteer = new PreparedQuery<IGetAvailabilityForLegacyVolunteerParams,IGetAvailabilityForLegacyVolunteerResult>(getAvailabilityForLegacyVolunteerIR);


/** Query 'GetAvailabilityForVolunteerHeatmap' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetAvailabilityForVolunteerHeatmapResult = never;

/** Query 'GetAvailabilityForVolunteerHeatmap' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetAvailabilityForVolunteerHeatmapParams = never;

const getAvailabilityForVolunteerHeatmapIR: any = {"usedParamSet":{"subject":true},"params":[{"name":"subject","required":true,"transform":{"type":"scalar"},"locs":[{"a":231,"b":239},{"a":469,"b":477},{"a":1316,"b":1324},{"a":1916,"b":1924}]}],"statement":"WITH certs_for_subject AS (\n    SELECT\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    WHERE\n        subjects.name = :subject!\n),\ncerts_for_computed_subject AS (\n    SELECT\n        COUNT(*)::int AS total\n    FROM\n        computed_subject_unlocks\n        JOIN subjects ON subjects.id = computed_subject_unlocks.subject_id\n    WHERE\n        subjects.name = :subject!\n)\nSELECT\n    availabilities.id,\n    availabilities.available_start,\n    availabilities.available_end,\n    availabilities.timezone,\n    availabilities.user_id,\n    weekdays.day AS weekday\nFROM\n    availabilities\n    LEFT JOIN weekdays ON availabilities.weekday_id = weekdays.id\n    JOIN users ON users.id = availabilities.user_id\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN (\n        SELECT\n            users_certifications.user_id,\n            COUNT(*)::int AS earned_certs,\n            certs_for_subject.total\n        FROM\n            users_certifications\n            JOIN certification_subject_unlocks USING (certification_id)\n            JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n            JOIN certs_for_subject ON TRUE\n        WHERE\n            subjects.name = :subject!\n        GROUP BY\n            users_certifications.user_id, subjects.name, certs_for_subject.total) user_certs ON user_certs.user_id = users.id\n    LEFT JOIN (\n        SELECT\n            users_certifications.user_id,\n            COUNT(*)::int AS earned_certs,\n            certs_for_computed_subject.total\n        FROM\n            users_certifications\n            JOIN computed_subject_unlocks USING (certification_id)\n            JOIN subjects ON computed_subject_unlocks.subject_id = subjects.id\n            JOIN certs_for_computed_subject ON TRUE\n        WHERE\n            subjects.name = :subject!\n        GROUP BY\n            users_certifications.user_id, subjects.name, certs_for_computed_subject.total\n        HAVING\n            COUNT(*)::int >= certs_for_computed_subject.total) user_computed_subjects ON user_computed_subjects.user_id = users.id\nWHERE\n    users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE\n    AND users.deactivated IS FALSE\n    AND users.ban_type IS DISTINCT FROM 'complete'\n    AND (user_certs.total IS NOT NULL\n        OR user_computed_subjects.total IS NOT NULL)"};

/**
 * Query generated from SQL:
 * ```
 * WITH certs_for_subject AS (
 *     SELECT
 *         COUNT(*)::int AS total
 *     FROM
 *         certification_subject_unlocks
 *         JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
 *     WHERE
 *         subjects.name = :subject!
 * ),
 * certs_for_computed_subject AS (
 *     SELECT
 *         COUNT(*)::int AS total
 *     FROM
 *         computed_subject_unlocks
 *         JOIN subjects ON subjects.id = computed_subject_unlocks.subject_id
 *     WHERE
 *         subjects.name = :subject!
 * )
 * SELECT
 *     availabilities.id,
 *     availabilities.available_start,
 *     availabilities.available_end,
 *     availabilities.timezone,
 *     availabilities.user_id,
 *     weekdays.day AS weekday
 * FROM
 *     availabilities
 *     LEFT JOIN weekdays ON availabilities.weekday_id = weekdays.id
 *     JOIN users ON users.id = availabilities.user_id
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN (
 *         SELECT
 *             users_certifications.user_id,
 *             COUNT(*)::int AS earned_certs,
 *             certs_for_subject.total
 *         FROM
 *             users_certifications
 *             JOIN certification_subject_unlocks USING (certification_id)
 *             JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *             JOIN certs_for_subject ON TRUE
 *         WHERE
 *             subjects.name = :subject!
 *         GROUP BY
 *             users_certifications.user_id, subjects.name, certs_for_subject.total) user_certs ON user_certs.user_id = users.id
 *     LEFT JOIN (
 *         SELECT
 *             users_certifications.user_id,
 *             COUNT(*)::int AS earned_certs,
 *             certs_for_computed_subject.total
 *         FROM
 *             users_certifications
 *             JOIN computed_subject_unlocks USING (certification_id)
 *             JOIN subjects ON computed_subject_unlocks.subject_id = subjects.id
 *             JOIN certs_for_computed_subject ON TRUE
 *         WHERE
 *             subjects.name = :subject!
 *         GROUP BY
 *             users_certifications.user_id, subjects.name, certs_for_computed_subject.total
 *         HAVING
 *             COUNT(*)::int >= certs_for_computed_subject.total) user_computed_subjects ON user_computed_subjects.user_id = users.id
 * WHERE
 *     users.test_user IS FALSE
 *     AND volunteer_profiles.onboarded IS TRUE
 *     AND users.deactivated IS FALSE
 *     AND users.ban_type IS DISTINCT FROM 'complete'
 *     AND (user_certs.total IS NOT NULL
 *         OR user_computed_subjects.total IS NOT NULL)
 * ```
 */
export const getAvailabilityForVolunteerHeatmap = new PreparedQuery<IGetAvailabilityForVolunteerHeatmapParams,IGetAvailabilityForVolunteerHeatmapResult>(getAvailabilityForVolunteerHeatmapIR);


/** Query 'GetAvailabilityHistoryForDatesByVolunteerId' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetAvailabilityHistoryForDatesByVolunteerIdResult = never;

/** Query 'GetAvailabilityHistoryForDatesByVolunteerId' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetAvailabilityHistoryForDatesByVolunteerIdParams = never;

const getAvailabilityHistoryForDatesByVolunteerIdIR: any = {"usedParamSet":{"userId":true,"start":true,"end":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":355,"b":362}]},{"name":"start","required":true,"transform":{"type":"scalar"},"locs":[{"a":387,"b":393}]},{"name":"end","required":true,"transform":{"type":"scalar"},"locs":[{"a":418,"b":422}]}],"statement":"SELECT\n    availability_histories.id,\n    availability_histories.recorded_at,\n    availability_histories.available_start,\n    availability_histories.available_end,\n    availability_histories.timezone,\n    weekdays.day AS weekday\nFROM\n    availability_histories\n    LEFT JOIN weekdays ON availability_histories.weekday_id = weekdays.id\nWHERE\n    user_id = :userId!\n    AND recorded_at >= :start!\n    AND recorded_at <= :end!\nORDER BY\n    recorded_at"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     availability_histories.id,
 *     availability_histories.recorded_at,
 *     availability_histories.available_start,
 *     availability_histories.available_end,
 *     availability_histories.timezone,
 *     weekdays.day AS weekday
 * FROM
 *     availability_histories
 *     LEFT JOIN weekdays ON availability_histories.weekday_id = weekdays.id
 * WHERE
 *     user_id = :userId!
 *     AND recorded_at >= :start!
 *     AND recorded_at <= :end!
 * ORDER BY
 *     recorded_at
 * ```
 */
export const getAvailabilityHistoryForDatesByVolunteerId = new PreparedQuery<IGetAvailabilityHistoryForDatesByVolunteerIdParams,IGetAvailabilityHistoryForDatesByVolunteerIdResult>(getAvailabilityHistoryForDatesByVolunteerIdIR);


/** Query 'GetLegacyAvailabilityHistoryForDatesByVolunteerId' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetLegacyAvailabilityHistoryForDatesByVolunteerIdResult = never;

/** Query 'GetLegacyAvailabilityHistoryForDatesByVolunteerId' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetLegacyAvailabilityHistoryForDatesByVolunteerIdParams = never;

const getLegacyAvailabilityHistoryForDatesByVolunteerIdIR: any = {"usedParamSet":{"userId":true,"start":true,"end":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":249,"b":256}]},{"name":"start","required":true,"transform":{"type":"scalar"},"locs":[{"a":281,"b":287}]},{"name":"end","required":true,"transform":{"type":"scalar"},"locs":[{"a":312,"b":316}]}],"statement":"SELECT\n    legacy_availability_histories.id,\n    legacy_availability_histories.recorded_at,\n    legacy_availability_histories.legacy_availability,\n    legacy_availability_histories.timezone\nFROM\n    legacy_availability_histories\nWHERE\n    user_id = :userId!\n    AND recorded_at >= :start!\n    AND recorded_at <= :end!\nORDER BY\n    recorded_at"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     legacy_availability_histories.id,
 *     legacy_availability_histories.recorded_at,
 *     legacy_availability_histories.legacy_availability,
 *     legacy_availability_histories.timezone
 * FROM
 *     legacy_availability_histories
 * WHERE
 *     user_id = :userId!
 *     AND recorded_at >= :start!
 *     AND recorded_at <= :end!
 * ORDER BY
 *     recorded_at
 * ```
 */
export const getLegacyAvailabilityHistoryForDatesByVolunteerId = new PreparedQuery<IGetLegacyAvailabilityHistoryForDatesByVolunteerIdParams,IGetLegacyAvailabilityHistoryForDatesByVolunteerIdResult>(getLegacyAvailabilityHistoryForDatesByVolunteerIdIR);


/** Query 'SaveCurrentAvailabilityAsHistory' is invalid, so its result is assigned type 'never'.
 *  */
export type ISaveCurrentAvailabilityAsHistoryResult = never;

/** Query 'SaveCurrentAvailabilityAsHistory' is invalid, so its parameters are assigned type 'never'.
 *  */
export type ISaveCurrentAvailabilityAsHistoryParams = never;

const saveCurrentAvailabilityAsHistoryIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":328,"b":335}]}],"statement":"INSERT INTO availability_histories (id, recorded_at, user_id, available_start, available_end, timezone, weekday_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    NOW(),\n    user_id,\n    available_start,\n    available_end,\n    timezone,\n    weekday_id,\n    NOW(),\n    NOW()\nFROM\n    availabilities\nWHERE\n    user_id = :userId!\nRETURNING\n    id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO availability_histories (id, recorded_at, user_id, available_start, available_end, timezone, weekday_id, created_at, updated_at)
 * SELECT
 *     generate_ulid (),
 *     NOW(),
 *     user_id,
 *     available_start,
 *     available_end,
 *     timezone,
 *     weekday_id,
 *     NOW(),
 *     NOW()
 * FROM
 *     availabilities
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const saveCurrentAvailabilityAsHistory = new PreparedQuery<ISaveCurrentAvailabilityAsHistoryParams,ISaveCurrentAvailabilityAsHistoryResult>(saveCurrentAvailabilityAsHistoryIR);


/** Query 'SaveAvailabilityAsHistoryByDate' is invalid, so its result is assigned type 'never'.
 *  */
export type ISaveAvailabilityAsHistoryByDateResult = never;

/** Query 'SaveAvailabilityAsHistoryByDate' is invalid, so its parameters are assigned type 'never'.
 *  */
export type ISaveAvailabilityAsHistoryByDateParams = never;

const saveAvailabilityAsHistoryByDateIR: any = {"usedParamSet":{"recordedAt":true,"userId":true},"params":[{"name":"recordedAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":173,"b":184},{"a":482,"b":493}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":521,"b":528}]}],"statement":"INSERT INTO availability_histories (id, recorded_at, user_id, available_start, available_end, timezone, weekday_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    :recordedAt!,\n    user_id,\n    available_start,\n    available_end,\n    timezone,\n    weekday_id,\n    NOW(),\n    NOW()\nFROM\n    availability_histories\nWHERE\n    recorded_at = (\n        SELECT\n            MAX(recorded_at)\n        FROM\n            availability_histories\n        WHERE\n            recorded_at <= :recordedAt!\n            AND user_id = :userId!)\nRETURNING\n    id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO availability_histories (id, recorded_at, user_id, available_start, available_end, timezone, weekday_id, created_at, updated_at)
 * SELECT
 *     generate_ulid (),
 *     :recordedAt!,
 *     user_id,
 *     available_start,
 *     available_end,
 *     timezone,
 *     weekday_id,
 *     NOW(),
 *     NOW()
 * FROM
 *     availability_histories
 * WHERE
 *     recorded_at = (
 *         SELECT
 *             MAX(recorded_at)
 *         FROM
 *             availability_histories
 *         WHERE
 *             recorded_at <= :recordedAt!
 *             AND user_id = :userId!)
 * RETURNING
 *     id AS ok
 * ```
 */
export const saveAvailabilityAsHistoryByDate = new PreparedQuery<ISaveAvailabilityAsHistoryByDateParams,ISaveAvailabilityAsHistoryByDateResult>(saveAvailabilityAsHistoryByDateIR);


/** Query 'InsertNewAvailability' is invalid, so its result is assigned type 'never'.
 *  */
export type IInsertNewAvailabilityResult = never;

/** Query 'InsertNewAvailability' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IInsertNewAvailabilityParams = never;

const insertNewAvailabilityIR: any = {"usedParamSet":{"id":true,"userId":true,"availableStart":true,"availableEnd":true,"timezone":true,"day":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":130,"b":133}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":140,"b":147}]},{"name":"availableStart","required":true,"transform":{"type":"scalar"},"locs":[{"a":162,"b":177}]},{"name":"availableEnd","required":true,"transform":{"type":"scalar"},"locs":[{"a":184,"b":197}]},{"name":"timezone","required":true,"transform":{"type":"scalar"},"locs":[{"a":204,"b":213}]},{"name":"day","required":true,"transform":{"type":"scalar"},"locs":[{"a":271,"b":275}]}],"statement":"INSERT INTO availabilities (id, user_id, weekday_id, available_start, available_end, timezone, created_at, updated_at)\nSELECT\n    :id!,\n    :userId!,\n    id,\n    :availableStart!,\n    :availableEnd!,\n    :timezone!,\n    NOW(),\n    NOW()\nFROM\n    weekdays\nWHERE\n    day = :day!\nRETURNING\n    id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO availabilities (id, user_id, weekday_id, available_start, available_end, timezone, created_at, updated_at)
 * SELECT
 *     :id!,
 *     :userId!,
 *     id,
 *     :availableStart!,
 *     :availableEnd!,
 *     :timezone!,
 *     NOW(),
 *     NOW()
 * FROM
 *     weekdays
 * WHERE
 *     day = :day!
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertNewAvailability = new PreparedQuery<IInsertNewAvailabilityParams,IInsertNewAvailabilityResult>(insertNewAvailabilityIR);


/** Query 'ClearAvailabilityForVolunteer' is invalid, so its result is assigned type 'never'.
 *  */
export type IClearAvailabilityForVolunteerResult = never;

/** Query 'ClearAvailabilityForVolunteer' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IClearAvailabilityForVolunteerParams = never;

const clearAvailabilityForVolunteerIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":43,"b":50}]}],"statement":"DELETE FROM availabilities\nWHERE user_id = :userId!\nRETURNING\n    user_id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM availabilities
 * WHERE user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const clearAvailabilityForVolunteer = new PreparedQuery<IClearAvailabilityForVolunteerParams,IClearAvailabilityForVolunteerResult>(clearAvailabilityForVolunteerIR);


/** Query 'DeleteAvailabilityHistoriesForUser' is invalid, so its result is assigned type 'never'.
 *  */
export type IDeleteAvailabilityHistoriesForUserResult = never;

/** Query 'DeleteAvailabilityHistoriesForUser' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IDeleteAvailabilityHistoriesForUserParams = never;

const deleteAvailabilityHistoriesForUserIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":51,"b":58}]}],"statement":"DELETE FROM availability_histories\nWHERE user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM availability_histories
 * WHERE user_id = :userId!
 * ```
 */
export const deleteAvailabilityHistoriesForUser = new PreparedQuery<IDeleteAvailabilityHistoriesForUserParams,IDeleteAvailabilityHistoriesForUserResult>(deleteAvailabilityHistoriesForUserIR);


/** Query 'DeleteLegacyAvailabilityHistoriesForUser' is invalid, so its result is assigned type 'never'.
 *  */
export type IDeleteLegacyAvailabilityHistoriesForUserResult = never;

/** Query 'DeleteLegacyAvailabilityHistoriesForUser' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IDeleteLegacyAvailabilityHistoriesForUserParams = never;

const deleteLegacyAvailabilityHistoriesForUserIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":58,"b":65}]}],"statement":"DELETE FROM legacy_availability_histories\nWHERE user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM legacy_availability_histories
 * WHERE user_id = :userId!
 * ```
 */
export const deleteLegacyAvailabilityHistoriesForUser = new PreparedQuery<IDeleteLegacyAvailabilityHistoriesForUserParams,IDeleteLegacyAvailabilityHistoriesForUserResult>(deleteLegacyAvailabilityHistoriesForUserIR);


/** Query 'GetAvailabilityForVolunteerByDate' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetAvailabilityForVolunteerByDateResult = never;

/** Query 'GetAvailabilityForVolunteerByDate' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetAvailabilityForVolunteerByDateParams = never;

const getAvailabilityForVolunteerByDateIR: any = {"usedParamSet":{"recordedAt":true,"userId":true},"params":[{"name":"recordedAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":559,"b":570}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":598,"b":605},{"a":626,"b":633}]}],"statement":"SELECT\n    availability_histories.id,\n    availability_histories.available_start,\n    availability_histories.available_end,\n    availability_histories.timezone,\n    availability_histories.recorded_at,\n    weekdays.day AS weekday\nFROM\n    availability_histories\n    LEFT JOIN weekdays ON availability_histories.weekday_id = weekdays.id\n    LEFT JOIN users ON availability_histories.user_id = users.id\nWHERE\n    recorded_at = (\n        SELECT\n            MAX(recorded_at)\n        FROM\n            availability_histories\n        WHERE\n            recorded_at <= :recordedAt!\n            AND user_id = :userId!)\n    AND user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     availability_histories.id,
 *     availability_histories.available_start,
 *     availability_histories.available_end,
 *     availability_histories.timezone,
 *     availability_histories.recorded_at,
 *     weekdays.day AS weekday
 * FROM
 *     availability_histories
 *     LEFT JOIN weekdays ON availability_histories.weekday_id = weekdays.id
 *     LEFT JOIN users ON availability_histories.user_id = users.id
 * WHERE
 *     recorded_at = (
 *         SELECT
 *             MAX(recorded_at)
 *         FROM
 *             availability_histories
 *         WHERE
 *             recorded_at <= :recordedAt!
 *             AND user_id = :userId!)
 *     AND user_id = :userId!
 * ```
 */
export const getAvailabilityForVolunteerByDate = new PreparedQuery<IGetAvailabilityForVolunteerByDateParams,IGetAvailabilityForVolunteerByDateResult>(getAvailabilityForVolunteerByDateIR);


