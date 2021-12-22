import mongoose from 'mongoose'
import { SUBJECTS } from '../constants'
import VolunteerModel from '../models/Volunteer'

async function upgrade(): Promise<void> {
  let exitCode = 0
  try {
    const result = await VolunteerModel.updateMany(
      {
        // all volunteers who do not have at least one precalculus, calculus ab and calculus bc in their subjects and have algebraTwo
        // should only be able to take temporary algebra 2 requests till 3/1/22
        subjects: {
          $in: [SUBJECTS.ALGEBRA_TWO],
          $nin: [SUBJECTS.PRECALCULUS],
        },
      },
      {
        $pull: {
          subjects: SUBJECTS.ALGEBRA_TWO,
        },
        $push: {
          subjects: SUBJECTS.ALGEBRA_TWO_TEMP,
        },
      }
    )

    const certifiedVolunteers = await VolunteerModel.find({
      'certifications.algebra.passed': true,
    })

    for (const volunteer of certifiedVolunteers) {
      await VolunteerModel.updateOne(
        {
          _id: volunteer._id,
        },
        {
          'certifications.algebraOne': volunteer.certifications.algebra,
        }
      )
    }
  } catch (error) {
    console.error('Unhandled error: ', error)
    exitCode = 1
  } finally {
    mongoose.disconnect()
    process.exit(exitCode)
  }
}

upgrade()
