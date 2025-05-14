// Users who are approved but not onboarded
// Who have completed both an UPchieve 101 quiz and a subject quiz since April 11, 2025
// And have completed those quizzes within 10s of each other (would imply a combined quiz).

import { User } from '../../models/User'
import { getClient, runInTransaction, TransactionClient } from '../../db'
import { camelCaseKeys } from '../../tests/db-utils'
import { VolunteerContactInfo } from '../../models/Volunteer'
import {
  ACCOUNT_USER_ACTIONS,
  EVENTS,
  USER_ACTION_TYPES,
} from '../../constants'
import * as AnalyticsService from '../../services/AnalyticsService'
import { queueOnboardingEventEmails } from '../../services/VolunteerService'
import * as VolunteerRepo from '../../models/Volunteer'
import logger from '../../logger'

const client = getClient()
const logPrefix = 'backfillOnboardedStatus: '
async function getUsers(): Promise<User[]> {
  try {
    const result = await client.query(`
    with onboarded_not_approved_users as (select u.created_at, u.last_activity_at, u.*, uq.updated_at as upchieve_101_passed_at
from users u
join volunteer_profiles vp on vp.user_id = u.id
left join users_quizzes uq on uq.user_id = u.id
where vp.approved is true and vp.onboarded is false
and exists (select * from user_actions where vp.user_id = u.id and action = 'COMPLETED BACKGROUND INFORMATION')
and exists (select * from user_actions where vp.user_id = u.id and action = 'UNLOCKED SUBJECT')
and exists (select * from user_actions where vp.user_id = u.id and action = 'ADDED PHOTO ID')
and exists (select * from user_actions where vp.user_id = u.id and action = 'UPDATED AVAILABILITY')
and exists (select * from users_quizzes where quiz_id = 22 and user_id = u.id and passed is true)
and exists (select * from users_quizzes where quiz_id <> 22 and user_id = u.id and passed is true)
and u.ban_type is null and u.banned is false and u.deactivated is false
and uq.passed is true and uq.quiz_id = 22
order by u.created_at)
SELECT distinct id
FROM onboarded_not_approved_users onau
WHERE EXISTS (
    SELECT 1
    FROM users_quizzes uq2
    WHERE
        uq2.user_id = onau.id
        AND uq2.passed IS TRUE
        AND uq2.quiz_id <> 22
        AND uq2.updated_at >= '2025-04-11 00:00:00 EST'
        AND ABS(EXTRACT(EPOCH FROM (uq2.updated_at - onau.upchieve_101_passed_at))) <= 10
);
    `)
    return result.rows.map((row) => camelCaseKeys(row))
  } catch (err) {
    logger.error(
      err,
      `${logPrefix}Failed to get users who are approved but not onboarded: ${err}`
    )
    throw err
  }
}

export default async function backfillCombinedQuizUsersOnboardedStatus() {
  try {
    // Get approved but not onboarded users
    const users = await getUsers()
    const userIds = users.map((u) => u.id)
    logger.info(
      { userIds },
      `${logPrefix}Found ${userIds.length} users to update`
    )
    await updateOnboardedAndSendEmails(userIds, client)
    logger.info(`${logPrefix}Finished updating.`)
  } catch (err) {
    logger.error(
      err,
      `${logPrefix}Error backfilling onboarded status for combined quiz users: ${err}`
    )
  }
}

async function updateOnboardedAndSendEmails(
  userIds: string[],
  writeClient: TransactionClient
): Promise<void> {
  logger.info({ userIds }, `${logPrefix}Updating onboarded status for users`)
  await runInTransaction(async (tc) => {
    // Get volunteer contact info (for the VPO key) in one batch.
    const volunteerContactInfosRaw =
      await VolunteerRepo.getVolunteerContactInfoByIds(userIds, tc)
    const volunteerContactInfoMap: { [userId: string]: VolunteerContactInfo } =
      {}
    volunteerContactInfosRaw.forEach((contactInfo) => {
      volunteerContactInfoMap[contactInfo.id] = contactInfo
    })

    // Set onboarded = true in one batch
    const updateResults = await tc.query(
      'UPDATE volunteer_profiles SET onboarded = TRUE, updated_at = NOW() where user_id = ANY($1) RETURNING user_id',
      [userIds]
    )
    if (updateResults.rows.length !== userIds.length) {
      logger.error(
        `${logPrefix}Could not update all ${userIds.length} to onboarded`
      )
      throw new Error(`Failed to update all users to onboarded`)
    }

    const userActionResults = await tc.query(
      `
      WITH user_ids AS (
          SELECT UNNEST($3::uuid[]) as user_id
      )
      INSERT INTO user_actions (user_id, action_type, action)
      SELECT user_id, $1, $2
      FROM user_ids
      RETURNING user_id
`,
      [USER_ACTION_TYPES.ACCOUNT, ACCOUNT_USER_ACTIONS.ONBOARDED, userIds]
    )
    if (userActionResults.rows.length !== userIds.length) {
      const insertedUserIds = userActionResults.rows.map((row) => row.id)
      const notInsertedUserIds = _.difference(userIds, insertedUserIds)
      logger.error(
        { insertedUserIds, notInsertedUserIds },
        `${logPrefix}Failed to insert user action for some users`
      )
    }

    // Enqueue onboarding emails and emit analytics event
    for (const userId of userIds) {
      const volunteerContactInfo = volunteerContactInfoMap[userId]
      await queueOnboardingEventEmails(
        userId,
        !!volunteerContactInfo.volunteerPartnerOrg
      )
      AnalyticsService.captureEvent(userId, EVENTS.ACCOUNT_ONBOARDED, {
        event: EVENTS.ACCOUNT_ONBOARDED,
      })
    }
  }, writeClient)
}
