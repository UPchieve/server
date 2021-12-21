import VolunteerModel, {
  Certifications,
  CertificationInfo,
} from '../models/Volunteer'
import QuestionModel from '../models/Question'
import { MATH_CERTS } from '../constants'
import mongoose from 'mongoose'
import * as db from '../db'

async function upgrade(): Promise<void> {
  let exitCode = 0
  try {
    await db.connect()

    const deletedQuestions = await QuestionModel.deleteMany({
      category: MATH_CERTS.ALGEBRA,
    })

    const result = await VolunteerModel.updateMany(
      {},
      {
        $unset: {
          'certifications.algebra': '',
        },
        $pull: {
          subjects: 'algebraTwo-temporary',
        },
      }
    )

    console.log('Questions deleted', deletedQuestions)
    console.log(
      'Volunteers with algebra certification and algebraTwo-temporary subject removed',
      result
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

    const addQuestions = await QuestionModel.find(
      { category: MATH_CERTS.ALGEBRA_ONE },
      { _id: 0 }
    )

    for (const question of addQuestions) {
      const doc = {
        ...question,
        category: MATH_CERTS.ALGEBRA,
      }

      await QuestionModel.create(doc)
    }

    const volunteers = await VolunteerModel.find({}, { certifications: 1 })
      .lean()
      .exec()

    for (const volunteer of volunteers) {
      await VolunteerModel.updateOne(
        {
          _id: volunteer._id,
        },
        {
          'certifications.algebra': volunteer.certifications.algebraOne,
        }
      )
    }

    // $push: {
    //   subjects : 'algebraTwo-temporary'
    // }
    const result = await VolunteerModel.find()

    console.log('Questions added', addQuestions)
    console.log(
      'Volunteers with algebra certification changed from algebraOne to algebra',
      volunteers
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
// DOWNGRADE=true npx ts-node dbutils/remove-algebra-subject-and-certification.ts
if (process.env.DOWNGRADE) {
  downgrade()
} else {
  upgrade()
}
