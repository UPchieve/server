/* @name getSubjectsForVolunteer */
WITH CTE AS (
  SELECT
    subjects.name,
    COUNT(*):: int as total
  FROM
    certification_subject_unlocks
    JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
  GROUP BY
    subjects.name
)
SELECT
  subjects_unlocked.subject
FROM
  (
    SELECT
      subjects.name as subject,
      COUNT(*):: int as earned_certs,
      CTE.total
    FROM
      users_certifications
      JOIN certification_subject_unlocks USING(certification_id)
      JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
      JOIN users ON users.id = users_certifications.user_id
      JOIN CTE ON CTE.name = subjects.name
    WHERE
      users.id = :userId!
    GROUP BY
      subjects.name,
      CTE.total
    HAVING
      COUNT(*):: int >= CTE.total
  ) AS subjects_unlocked;