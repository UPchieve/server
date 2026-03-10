import { backfillStudentAndTeacherSchools } from '../../models/UsersSchools'
import logger from '../../logger'

export default async function () {
  try {
    logger.info(
      'Beginning student and teacher school backfill into users_schools'
    )
    await backfillStudentAndTeacherSchools()
  } catch (err) {
    logger.error(
      { error: err },
      'Error occurred during student and teacher backfill into users_schools'
    )
  } finally {
    logger.info('End student and teacher school backfill')
  }
}
