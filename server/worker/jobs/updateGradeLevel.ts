import { Jobs } from '.'
import 'moment-timezone'
import { log } from '../logger'
import * as db from '../../db'
import QueueService from '../../services/QueueService'

export default async (): Promise<void> => {
  try {
    await db
      .getClient()
      .query(`REFRESH MATERIALIZED VIEW upchieve.current_grade_levels_mview;`)
    log(
      `Executed ${
        Jobs.UpdateGradeLevel
      } on ${Date.toString()} - Material view refreshed`
    )

    await QueueService.add(Jobs.UpdateSendGridGradeLevels)
  } catch (error) {
    throw new Error(`Failed to ${Jobs.UpdateGradeLevel}: ${error}`)
  }
}
