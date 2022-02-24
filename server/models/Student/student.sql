/* @name getGatesStudentById */
SELECT
    student_profiles.user_id AS id,
    grade_levels.name AS current_grade,
    student_partner_orgs.name AS student_partner_org,
    schools.partner AS is_partner_school
FROM
    student_profiles
    JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id
    JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id
    JOIN schools ON student_profiles.school_id = schools.id
WHERE
    student_profiles.user_id = :userId!;


/* @name getStudentContactInfoById */
SELECT
    id,
    first_name,
    email
FROM
    users
WHERE
    banned IS FALSE
    AND deactivated IS FALSE
    AND test_user IS FALSE
    AND id = :userId!;


/* @name isTestUser */
SELECT
    test_user
FROM
    users
WHERE
    id = :userId!;


/* @name getTotalFavoriteVolunteers */
SELECT
    COUNT(*)::int AS total
FROM
    student_favorite_volunteers
WHERE
    student_id = :userId!
GROUP BY
    student_id;


/* @name isFavoriteVolunteer */
SELECT
    volunteer_id
FROM
    student_favorite_volunteers
WHERE
    student_id = :studentId!
    AND volunteer_id = :volunteerId!;


/* @name getFavoriteVolunteers */
SELECT 
    student_favorite_volunteers.volunteer_id as volunteer_id,
    first_name,
    COALESCE((SELECT count(*)
           FROM sessions 
           WHERE student_favorite_volunteers.volunteer_id = sessions.volunteer_id
           AND student_favorite_volunteers.student_id = sessions.student_id
           GROUP BY sessions.volunteer_id, sessions.student_id), 0)::int AS num_sessions
  FROM student_favorite_volunteers
LEFT JOIN users ON student_favorite_volunteers.volunteer_id = users.id
WHERE student_favorite_volunteers.student_id = :userId!
ORDER BY student_favorite_volunteers.created_at DESC
LIMIT :limit! offset :offset!;
