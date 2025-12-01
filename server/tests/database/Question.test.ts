/**
 * @group database/parallel
 */
import { getClient } from '../../db'
import { getQuizCertUnlocksByQuizName } from '../../models/Question'

const client = getClient()

describe('getQuizCertUnlocksByQuizName', () => {
  test('returns the correct fields for an unlocked subject certification', async () => {
    const quizName = 'algebraOne'
    const result = await getQuizCertUnlocksByQuizName(quizName, client)
    expect(result.length).toEqual(2)
    expect(result[0]).toEqual({
      quizName,
      isSubjectCertification: true,
      quizDisplayName: 'Algebra 1',
      quizDisplayOrder: 2,
      unlockedCertName: 'algebraOne',
      unlockedCertDisplayName: 'Algebra 1',
      unlockedCertDisplayOrder: 2,
      topicName: 'math',
      topicDisplayName: 'Math',
      topicDashboardOrder: 1,
      topicTrainingOrder: 1,
    })
    expect(result[1]).toEqual({
      quizName,
      isSubjectCertification: true,
      quizDisplayName: 'Algebra 1',
      quizDisplayOrder: 2,
      unlockedCertName: 'prealgebra',
      unlockedCertDisplayName: 'Prealgebra',
      unlockedCertDisplayOrder: 1,
      topicName: 'math',
      topicDisplayName: 'Math',
      topicDashboardOrder: 1,
      topicTrainingOrder: 1,
    })
  })

  test('returns the correct fields for a training certification', async () => {
    const quizName = 'dei'
    const result = await getQuizCertUnlocksByQuizName(quizName, client)
    expect(result.length).toEqual(1)
    expect(result[0]).toEqual({
      quizName,
      unlockedCertName: 'dei',
      isSubjectCertification: false,
    })
  })
})
