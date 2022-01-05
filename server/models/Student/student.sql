/* @name getGatesStudentById */
SELECT
  student_profiles.user_id as id,
  grade_levels.name as current_grade,
  student_partner_orgs.name as student_partner_org,
  schools.partner as is_partner_school
FROM
  student_profiles
  JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id
  JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id
  JOIN schools ON student_profiles.school_id = schools.id
 WHERE
  	student_profiles.user_id = :userId!;

/* @name getStudentContactInfoById */
SELECT id, first_name, email FROM users WHERE banned is false AND deactivated is FALSE AND test_user is FALSE AND id = :userId!;

/* @name isTestUser */
SELECT test_user FROM users WHERE id = :userId!;