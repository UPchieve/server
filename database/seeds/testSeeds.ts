import { ExpectedErrors } from './utils'
import { volunteers } from './testData/volunteers'
import { students } from './testData/students'
import { schools } from './testData/schools'
import { studentFavoriteVolunteers } from './testData/student-favorite-volunteers'
import * as statics from './testData/lookupStatics'
import { cities } from './testData/cities'

async function seedData(): Promise<void> {
  let exitCode = 0
  try {
    const vpoIds = await statics.getVolunteerPartnerOrgs()
    const spoIds = await statics.getStudentPartnerOrgs()
    const certIds = await statics.getCertifications()
    const quizIds = await statics.getQuizzes()

    const cityIds = await cities()
    const schoolIds = await schools(cityIds)
    await volunteers(vpoIds, certIds, quizIds)
    await students(spoIds, schoolIds)
    // await studentFavoriteVolunteers(certIds, quizIds)

    console.log('All test data is seeded!')
    if (ExpectedErrors.length)
      console.log(
        `Tried to re-seed ${ExpectedErrors.length} objects already in database`
      )
  } catch (err) {
    exitCode = 1
    console.log(err as Error)
  } finally {
    process.exit(exitCode)
  }
}

seedData()
