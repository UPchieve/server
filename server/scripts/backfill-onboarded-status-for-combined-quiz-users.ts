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
      AND uq.updated_at >= '2025-04-11 00:00:00 EST'
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
  try {
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
    const userQuizMapForUsersWhoPassedAllRequiredQuizzes: {
      [userId: string]: UserQuiz[]
    } = {}
    const UPCHIEVE_101_QUIZ_ID = 22
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
    console.log(
      'Got users who passed both UPC101 and a subject quiz',
      Object.keys(userQuizMapForUsersWhoPassedAllRequiredQuizzes).length
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
          console.log('Found combined quiz user', {
            userId,
            subjectQuizId: combinedSubjectQuiz.quizId,
            passedUpchieve101At,
            passedSubjectAt: combinedSubjectQuiz.updatedAt,
          })
        }
      }
    )
    console.log(`Found ${combinedQuizUsers.length} combined quiz users`)

    // @TODO Here's the main thing: Mark these users as onboarded = true (and updated_at),
    //  @TODO AND enqueue the onboarding emails.

    process.exit(0)
  } catch (err) {
    console.error(err, `Error! ${err}`)
    process.exit(1)
  }
}

function isWithin10Seconds(date1: Date, date2: Date): boolean {
  return Math.abs(date1.getTime() - date2.getTime()) <= 10 * 1000
}

main()
