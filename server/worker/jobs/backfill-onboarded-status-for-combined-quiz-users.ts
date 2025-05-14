// Users who are approved but not onboarded
// Who have completed both an UPchieve 101 quiz and a subject quiz since April 11, 2025
// And have completed those quizzes within 10s of each other (would imply a combined quiz).

import { User } from '../../models/User'
import { getClient, runInTransaction, TransactionClient } from '../../db'
import { camelCaseKeys } from '../../tests/db-utils'
import { UserQuiz, VolunteerContactInfo } from '../../models/Volunteer'
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
async function getUsersWhoAreApprovedButNotOnboarded(): Promise<User[]> {
  try {
    const result = await client.query(`
    SELECT u.*
    FROM users u
    JOIN volunteer_profiles vp on vp.user_id = u.id
    WHERE vp.approved IS TRUE AND vp.onboarded IS FALSE
    AND u.ban_type IS NULL AND u.banned IS FALSE AND u.deactivated IS FALSE
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

async function getUsersQuizzesForUsers(userIds: string[]): Promise<UserQuiz[]> {
  try {
    const result = await client.query(
      `
      SELECT uq.*
      FROM users_quizzes uq
      WHERE uq.user_id = ANY($1)
      AND uq.passed IS TRUE
      AND uq.updated_at >= '2025-04-11 00:00:00 EST'
    `,
      [userIds]
    )
    return result.rows.map((row) => camelCaseKeys(row))
  } catch (err) {
    logger.error(
      err,
      `${logPrefix}Failed to get users_quizzes for users: ${err}`
    )
    throw err
  }
}

export default async function backfillCombinedQuizUsersOnboardedStatus() {
  try {
    // Get approved but not onboarded users
    const users = await getUsersWhoAreApprovedButNotOnboarded()
    const distinctUserIds = new Set<string>(users.map((u) => u.id))
    logger.info(
      `${logPrefix}Total number of users who are approved but not onboarded: ${distinctUserIds.size}`
    )

    // Pull users_quizzes for those users. Map the quiz results by user id.
    const usersQuizzes = await getUsersQuizzesForUsers(
      Array.from(distinctUserIds)
    )
    const userQuizMap: { [userId: string]: UserQuiz[] } = {}
    usersQuizzes.forEach((quiz) => {
      if (userQuizMap.hasOwnProperty(quiz.userId)) {
        // Existing key
        const existingValue = userQuizMap[quiz.userId] // { id to UserQuiz[] }
        const updatedValue = [...existingValue, quiz]
        userQuizMap[quiz.userId] = updatedValue
      } else {
        // New key
        userQuizMap[quiz.userId] = [quiz]
      }
    })
    logger.info(
      `${logPrefix}Mapped user ID to their passed quizzes. Total users: ${Object.keys(userQuizMap).length}`
    )

    // Now pull out the users who have passed UPchieve101 AND some subject quiz
    const UPCHIEVE_101_QUIZ_ID = 22
    const userQuizMapForUsersWhoPassedAllRequiredQuizzes: {
      [userId: string]: UserQuiz[]
    } = {}
    Object.entries(userQuizMap).forEach(([userId, quizList]) => {
      const passedUpchieve101 = quizList.some(
        (quiz) => quiz.quizId === UPCHIEVE_101_QUIZ_ID
      )
      const passedSubject = quizList.some(
        (quiz) => quiz.quizId !== UPCHIEVE_101_QUIZ_ID
      )
      if (passedUpchieve101 && passedSubject)
        userQuizMapForUsersWhoPassedAllRequiredQuizzes[userId] = quizList
    })
    logger.info(
      `${logPrefix}Total users who passed both UPC101 and a subject quiz: ${Object.keys(userQuizMapForUsersWhoPassedAllRequiredQuizzes).length}`
    )

    // Now filter those down to people who went through the combined quiz flow (passed UPC101 and some other quiz within 10s of each other)
    const combinedQuizUsers: string[] = []
    Object.entries(userQuizMapForUsersWhoPassedAllRequiredQuizzes).forEach(
      ([userId, quizList]) => {
        const upchieve101QuizResult = quizList.find(
          (quiz) => quiz.quizId === UPCHIEVE_101_QUIZ_ID
        )
        if (!upchieve101QuizResult)
          throw new Error('User has not passed UPchieve 101!')
        const passedUpchieve101At = upchieve101QuizResult.updatedAt
        const combinedSubjectQuiz = quizList.find(
          (quiz) =>
            quiz.quizId !== UPCHIEVE_101_QUIZ_ID &&
            isWithin10Seconds(quiz.updatedAt, passedUpchieve101At)
        )
        if (combinedSubjectQuiz) {
          combinedQuizUsers.push(userId)
        }
      }
    )
    logger.info(
      `${logPrefix}Found ${combinedQuizUsers.length} combined quiz users`
    )

    await updateOnboardedAndSendEmails(combinedQuizUsers, client)
    logger.info(`${logPrefix}Finished updating.`)
  } catch (err) {
    logger.error(
      err,
      `${logPrefix}Error backfilling onboarded status for combined quiz users: ${err}`
    )
  }
}

function isWithin10Seconds(date1: Date, date2: Date): boolean {
  return Math.abs(date1.getTime() - date2.getTime()) <= 10 * 1000
}

async function updateOnboardedAndSendEmails(
  userIds: string[],
  writeClient: TransactionClient
): Promise<void> {
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
