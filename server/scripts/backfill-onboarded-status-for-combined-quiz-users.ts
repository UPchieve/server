// Users who are approved but not onboarded
// Who have completed both an UPchieve 101 quiz and a subject quiz since April 11, 2025
// And have completed those quizzes within 1 minute of each other (would imply a combined quiz).

import { User } from '../models/User'
import { getRoClient } from '../db'
import { camelCaseKeys } from '../tests/db-utils'
import { UserQuiz } from '../models/Volunteer'
const client = getRoClient()

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
    console.error(
      err,
      `Failed to get users who are approved but not onboarded: ${err}`
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
    `,
      [userIds]
    )
    return result.rows.map((row) => camelCaseKeys(row))
  } catch (err) {
    console.error(err, `Failed to get users_quizzes for users: ${err}`)
    throw err
  }
}

async function main() {
  // Get approved but not onboarded users
  const users = await getUsersWhoAreApprovedButNotOnboarded()
  const distinctUserIds = new Set<string>(users.map((u) => u.id))
  console.log(
    'Total number of users who are approved but not onboarded',
    distinctUserIds.size
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
  console.log(
    'Mapped user ID to their passed quizzes',
    Object.keys(userQuizMap).length
  )

  // Now pull out the users who have passed UPchieve101 AND some subject quiz
  // @TODO

  // Now filter those down to people who have passed at least one of those since April 11, 2025 (combined quiz launch)
  // @TODO

  // @TODO Here's the main thing: Mark these users as onboarded = true,
  //  @TODO AND enqueue the onboarding emails.
}

main()
