import * as db from 'zapatos/db'
import * as schema from 'zapatos/schema'
import _ from 'lodash'
import moment from 'moment'

import pool from '../../pg'
import * as pgUtils from '../pgUtils'
import { Volunteer } from './index'
import { Availability, DAYS, HOURS } from '../Availability/types'
import { RepoReadError } from '../Errors'
import createNewAvailability from '../../utils/create-new-availability'

export async function getSubjectsForVolunteer(userId: pgUtils.Ulid): Promise<string[]> {
  try {
    type sql =
      | schema.users.SQL
      | schema.users_certifications.SQL
      | schema.certifications.SQL
      | schema.subjects.SQL
      | schema.certification_subject_unlocks.SQL
    type selectable = schema.subjects.Selectable['name'][]
    const result = await db.sql<sql, selectable>`
      ;WITH CTE AS (
        SELECT
          ${"subjects"}.${"name"},
          COUNT(*) as total
        FROM
          ${"certification_subject_unlocks"}
        JOIN ${"subjects"} ON ${"subjects"}.${"id"} = ${"certification_subject_unlocks"}.${"subject_id"}
        GROUP BY
          ${"subjects"}.${"name"}
      )
      
      SELECT
        subjects_unlocked.${"name"}
      FROM (
        SELECT
          ${"subjects"}.${"name"} as subjects,
          COUNT(*) as earned_certs,
          CTE.total
        FROM
          ${"users_certifications"}
        JOIN ${"certification_subject_unlocks"} USING(${"certification_id"})
        JOIN ${"subjects"} ON ${"certification_subject_unlocks"}.${"subject_id"} = ${"subjects"}.${"id"}
        JOIN ${"users"} ON ${"users"}.${"id"} = ${"users_certifications"}.${"user_id"}
        JOIN CTE ON CTE.name = ${"subjects"}.${"name"}
        WHERE
          ${"users"}.${"id"} = ${db.param(userId)}
        GROUP BY
          ${"subjects"}.${"name"}, CTE.total
        HAVING
          COUNT(*) >= CTE.total
      ) subjects_unlocked
    `.run(pool)
    return result
  } catch (err) {
    throw new RepoReadError(err)
  }
}
