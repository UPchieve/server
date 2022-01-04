/** Types generated for queries found in "server/models/Volunteer/volunteer.sql" */
import { PreparedQuery } from '@pgtyped/query'

/** 'GetSubjectsForVolunteer' parameters type */
export interface IGetSubjectsForVolunteerParams {
  userId: string
}

/** 'GetSubjectsForVolunteer' return type */
export interface IGetSubjectsForVolunteerResult {
  subject: string
}

/** 'GetSubjectsForVolunteer' query type */
export interface IGetSubjectsForVolunteerQuery {
  params: IGetSubjectsForVolunteerParams
  result: IGetSubjectsForVolunteerResult
}

const getSubjectsForVolunteerIR: any = {
  name: 'getSubjectsForVolunteer',
  params: [
    {
      name: 'userId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 705, b: 711, line: 27, col: 18 }] },
    },
  ],
  usedParamSet: { userId: true },
  statement: {
    body:
      'WITH CTE AS (\n  SELECT\n    subjects.name,\n    COUNT(*):: int as total\n  FROM\n    certification_subject_unlocks\n    JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n  GROUP BY\n    subjects.name\n)\nSELECT\n  subjects_unlocked.subject\nFROM\n  (\n    SELECT\n      subjects.name as subject,\n      COUNT(*):: int as earned_certs,\n      CTE.total\n    FROM\n      users_certifications\n      JOIN certification_subject_unlocks USING(certification_id)\n      JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n      JOIN users ON users.id = users_certifications.user_id\n      JOIN CTE ON CTE.name = subjects.name\n    WHERE\n      users.id = :userId!\n    GROUP BY\n      subjects.name,\n      CTE.total\n    HAVING\n      COUNT(*):: int >= CTE.total\n  ) AS subjects_unlocked',
    loc: { a: 36, b: 831, line: 2, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * WITH CTE AS (
 *   SELECT
 *     subjects.name,
 *     COUNT(*):: int as total
 *   FROM
 *     certification_subject_unlocks
 *     JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
 *   GROUP BY
 *     subjects.name
 * )
 * SELECT
 *   subjects_unlocked.subject
 * FROM
 *   (
 *     SELECT
 *       subjects.name as subject,
 *       COUNT(*):: int as earned_certs,
 *       CTE.total
 *     FROM
 *       users_certifications
 *       JOIN certification_subject_unlocks USING(certification_id)
 *       JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *       JOIN users ON users.id = users_certifications.user_id
 *       JOIN CTE ON CTE.name = subjects.name
 *     WHERE
 *       users.id = :userId!
 *     GROUP BY
 *       subjects.name,
 *       CTE.total
 *     HAVING
 *       COUNT(*):: int >= CTE.total
 *   ) AS subjects_unlocked
 * ```
 */
export const getSubjectsForVolunteer = new PreparedQuery<
  IGetSubjectsForVolunteerParams,
  IGetSubjectsForVolunteerResult
>(getSubjectsForVolunteerIR)
