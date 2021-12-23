import VolunteerModel from '../models/Volunteer'
import QuestionModel from '../models/Question'
import { MATH_CERTS, SUBJECTS } from '../constants'
import mongoose from 'mongoose'
import * as db from '../db'

async function upgrade(): Promise<void> {
  let exitCode = 0
  try {
    await db.connect()

    const deletedQuestions = await QuestionModel.deleteMany({
      category: MATH_CERTS.ALGEBRA,
    })

    const modifiedVolunteers = await VolunteerModel.updateMany(
      {},
      {
        $unset: {
          'certifications.algebra': '',
        },
        $pull: {
          subjects: SUBJECTS.ALGEBRA_TWO_TEMP,
        },
      }
    )

    console.log(`Questions deleted: ${deletedQuestions.deletedCount}`)
    console.log(
      `Volunteers with algebra certification and algebraTwo-temporary subject removed
      ${modifiedVolunteers.nModified}`
    )
  } catch (err) {
    console.log('Unhandled error: ', err)
    exitCode = 1
  } finally {
    mongoose.disconnect()
    process.exit(exitCode)
  }
}

async function downgrade(): Promise<void> {
  let exitCode = 0
  try {
    await db.connect()

    // adding back algebra questions by cloning algebraOne questions
    const addQuestions = await QuestionModel.find(
      { category: MATH_CERTS.ALGEBRA_ONE },
      { _id: 0 }
    )
    .lean()
    .exec()

    for (const question of addQuestions) {
      const doc = {
        ...question,
        category: MATH_CERTS.ALGEBRA,
      }

      await QuestionModel.create(doc)
    }

    console.log(`Questions added: ${addQuestions}`)

    const modifiedCertificationVolunteers = await VolunteerModel.find(
      {},
      { certifications: 1 }
    )
      .lean()
      .exec()

    let certifiedVolunteersUpdated = 0
    for (const volunteer of modifiedCertificationVolunteers) {
      await VolunteerModel.updateOne(
        {
          _id: volunteer._id,
        },
        {
          'certifications.algebra': volunteer.certifications.algebraOne,
        }
      )
      certifiedVolunteersUpdated += 1
    }

    console.log(
      `Algebra certification changed from algebraOne to algebra for 
      ${certifiedVolunteersUpdated}/${modifiedCertificationVolunteers} volunteers`
    )

    const modifiedSubjectVolunteers = await VolunteerModel.updateMany(
      {
        // all volunteers certified in algebraOne and not certified in algebraTwo,
        // and who do not have at least one precalculus, calculus ab and calculus bc in their subjects and have algebraTwo
        // should be able to take temporary algebra 2 requests till 3/1/22
        'certifications.algebraOne.passed': true,
        'certifications.algebraTwo.passed': false,
        subjects: {
          $nin: [SUBJECTS.PRECALCULUS],
        },
      },
      {
        $addToSet: {
          subjects: SUBJECTS.ALGEBRA_TWO_TEMP,
        },
      }
    )

    console.log(
      `Volunteers with algebra certification changed from algebraOne to algebra: 
      ${modifiedSubjectVolunteers.nModified}`
    )
  } catch (err) {
    console.log('Unhandled error: ', err)
    exitCode = 1
  } finally {
    mongoose.disconnect()
    process.exit(exitCode)
  }
}

// To downgrade the migration run:
// DOWNGRADE=true npx ts-node server/dbutils/remove-algebra-subject-and-certification.ts
if (process.env.DOWNGRADE) {
  downgrade()
} else {
  upgrade()
}
