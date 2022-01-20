/* @name getSubjectsForVolunteer */
WITH CTE AS (
    SELECT
        subjects.name,
        COUNT(*)::int AS total
    FROM
        certification_subject_unlocks
        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
    GROUP BY
        subjects.name
)
SELECT
    subjects_unlocked.subject
FROM (
    SELECT
        subjects.name AS subject,
        COUNT(*)::int AS earned_certs,
        CTE.total
    FROM
        users_certifications
        JOIN certification_subject_unlocks USING (certification_id)
        JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
        JOIN users ON users.id = users_certifications.user_id
        JOIN CTE ON CTE.name = subjects.name
    WHERE
        users.id = :userId!
    GROUP BY
        subjects.name, CTE.total
    HAVING
        COUNT(*)::int >= CTE.total) AS subjects_unlocked;


/* @name getNextOpenVolunteerToNotify */
SELECT
    email,
    first_name,
    volunteer_partner_orgs.name AS volunteer_partner_org
FROM
    users
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    JOIN availabilities ON users.id = availabilities.user_id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    JOIN (
        SELECT
            sub_unlocked.user_id,
            subjects.name AS subject
        FROM (
            SELECT
                users.id AS user_id,
                subjects.name AS subject,
                COUNT(*)::int AS earned_certs,
                subject_total.total
            FROM
                users_certifications
                JOIN certification_subject_unlocks USING (certification_id)
                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
                JOIN users ON users.id = users_certifications.user_id
                JOIN (
                    SELECT
                        subjects.name, COUNT(*)::int AS total
                    FROM
                        certification_subject_unlocks
                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
                    GROUP BY
                        subjects.name) AS subject_total ON subject_total.name = subjects.name
                GROUP BY
                    users.id,
                    subjects.name,
                    subject_total.total
                HAVING
                    COUNT(*)::int >= subject_total.total) AS sub_unlocked
                JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id
WHERE
    test_user IS FALSE
    AND banned IS FALSE
    AND deactivated IS FALSE
    AND extract(isodow FROM (now() at time zone availabilities.timezone)) = availabilities.weekday_id
    AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start
    AND extract(hour FROM (now() at time zone availabilities.timezone)) + 1 < availabilities.available_end
    AND subjects_unlocked.subject = :subject!
    AND NOT EXISTS (
        SELECT
            user_id
        FROM
            notifications
        WHERE
            user_id = users.id
            AND sent_at >= DATE(:lastNotified!))
LIMIT 1;


/* @name getNextAnyPartnerVolunteerToNotify */
SELECT
    email,
    first_name,
    volunteer_partner_orgs.name AS volunteer_partner_org
FROM
    users
    JOIN availabilities ON users.id = availabilities.user_id
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    JOIN (
        SELECT
            sub_unlocked.user_id,
            subjects.name AS subject
        FROM (
            SELECT
                users.id AS user_id,
                subjects.name AS subject,
                COUNT(*)::int AS earned_certs,
                subject_total.total
            FROM
                users_certifications
                JOIN certification_subject_unlocks USING (certification_id)
                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
                JOIN users ON users.id = users_certifications.user_id
                JOIN (
                    SELECT
                        subjects.name, COUNT(*)::int AS total
                    FROM
                        certification_subject_unlocks
                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
                    GROUP BY
                        subjects.name) AS subject_total ON subject_total.name = subjects.name
                GROUP BY
                    users.id,
                    subjects.name,
                    subject_total.total
                HAVING
                    COUNT(*)::int >= subject_total.total) AS sub_unlocked
                JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id
WHERE
    test_user IS FALSE
    AND banned IS FALSE
    AND deactivated IS FALSE
    AND extract(isodow FROM (now() at time zone availabilities.timezone)) = availabilities.weekday_id
    AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start
    AND extract(hour FROM (now() at time zone availabilities.timezone)) + 1 < availabilities.available_end
    AND subjects_unlocked.subject = :subject!
    AND NOT EXISTS (
        SELECT
            user_id
        FROM
            notifications
        WHERE
            user_id = users.id
            AND sent_at >= DATE(:lastNotified!))
LIMIT 1;


/* @name getNextSpecificPartnerVolunteerToNotify */
SELECT
    email,
    first_name,
    volunteer_partner_orgs.name AS volunteer_partner_org
FROM
    users
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    JOIN availabilities ON users.id = availabilities.user_id
    JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    JOIN (
        SELECT
            sub_unlocked.user_id,
            subjects.name AS subject
        FROM (
            SELECT
                users.id AS user_id,
                subjects.name AS subject,
                COUNT(*)::int AS earned_certs,
                subject_total.total
            FROM
                users_certifications
                JOIN certification_subject_unlocks USING (certification_id)
                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
                JOIN users ON users.id = users_certifications.user_id
                JOIN (
                    SELECT
                        subjects.name, COUNT(*)::int AS total
                    FROM
                        certification_subject_unlocks
                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
                    GROUP BY
                        subjects.name) AS subject_total ON subject_total.name = subjects.name
                GROUP BY
                    users.id,
                    subjects.name,
                    subject_total.total
                HAVING
                    COUNT(*)::int >= subject_total.total) AS sub_unlocked
                JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id
WHERE
    test_user IS FALSE
    AND banned IS FALSE
    AND deactivated IS FALSE
    AND extract(isodow FROM (now() at time zone availabilities.timezone)) = availabilities.weekday_id
    AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start
    AND extract(hour FROM (now() at time zone availabilities.timezone)) + 1 < availabilities.available_end
    AND subjects_unlocked.subject = :subject!
    AND volunteer_partner_orgs.name = :volunteerPartnerOrg!
    AND NOT EXISTS (
        SELECT
            user_id
        FROM
            notifications
        WHERE
            user_id = users.id
            AND sent_at >= DATE(:lastNotified!))
LIMIT 1;

